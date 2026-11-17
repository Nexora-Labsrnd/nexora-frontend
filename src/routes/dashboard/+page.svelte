<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, isAuthenticated, currentUser } from '$lib/stores/auth';
  import { fetchApi, type Specimen, type DashboardMetrics, getDetectionsFromSpecimen, parseRawOutput, type Detection, type RawOutput } from '$lib/api/client';
  import { goto } from '$app/navigation';
  import NavBar from '$lib/components/NavBar.svelte';
  import BoundingBoxOverlay from '$lib/components/BoundingBoxOverlay.svelte';
  import { greetingFor, roleInfo, initials } from '$lib/greeting';
  import { spotlight } from '$lib/actions';

  // Active Tab: 'dashboard' | 'analyze' | 'history' | 'settings'
  let activeTab = $state<'dashboard' | 'analyze' | 'history' | 'settings'>('dashboard');

  // Dashboard Metrics State
  let metrics = $state<DashboardMetrics | null>(null);
  let metricsLoading = $state(false);

  // Analyze Tab State
  let selectedType = $state<'blood' | 'urine' | 'stool'>('urine');
  let selectedFile = $state<File | null>(null);
  let imagePreview = $state<string | null>(null);
  let patientName = $state('');
  let patientAge = $state<number | undefined>(undefined);
  let isUploading = $state(false);
  let isAnalyzing = $state(false);
  let currentSpecimen = $state<Specimen | null>(null);
  let feedbackRating = $state<'correct' | 'incorrect' | null>(null);
  let feedbackNotes = $state('');
  let feedbackSubmitted = $state(false);
  let analyzeError = $state<string | null>(null);
  let imageDimensions = $state<{ width: number; height: number } | null>(null);

  // History Tab State
  let historySpecimens = $state<Specimen[]>([]);
  let historyFilter = $state<'blood' | 'urine' | 'stool'>('urine');
  let historyLoading = $state(false);

  // Detector modules. Only modules the server lists in ENABLED_SPECIMENS are
  // live; the others stay visible as "coming soon" openings for later models.
  const MODULES = [
    { type: 'urine', name: 'Schistosoma', specimen: 'Urine', target: 'Schistosoma haematobium ova', icon: '🧫' },
    { type: 'blood', name: 'Malaria', specimen: 'Blood', target: 'Plasmodium parasites', icon: '🩸' },
    { type: 'stool', name: 'Intestinal parasites', specimen: 'Stool', target: 'S. mansoni ova · Entamoeba cysts', icon: '🦠' }
  ] as const;
  let enabledTypes = $state<string[]>(['urine']);
  const isLive = (type: string) => enabledTypes.includes(type);
  const liveHistory = $derived(historySpecimens.filter((s) => isLive(s.specimen_type)));
  const hiddenHistoryCount = $derived(historySpecimens.length - liveHistory.length);

  async function loadEnabledModules() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (Array.isArray(data.enabled_specimens) && data.enabled_specimens.length) {
        enabledTypes = data.enabled_specimens;
        if (!isLive(selectedType)) selectedType = enabledTypes[0] as typeof selectedType;
        if (!isLive(historyFilter)) historyFilter = enabledTypes[0] as typeof historyFilter;
      }
    } catch {
      /* keep the default: urine only */
    }
  }

  onMount(() => {
    authStore.init();
    loadEnabledModules();
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
    loadDashboardData();
    loadHistory();
  });

  $effect(() => {
    if (!$authStore.isLoading && !$isAuthenticated) {
      goto('/login');
    }
  });

  async function loadDashboardData() {
    if (!$authStore.token) return;
    metricsLoading = true;
    try {
      metrics = await fetchApi<DashboardMetrics>('/api/v1/telemetry/dashboard', { method: 'GET' }, $authStore.token);
    } catch (e) {
      console.warn('Failed to load dashboard metrics:', e);
    } finally {
      metricsLoading = false;
    }
  }

  async function loadHistory() {
    if (!$authStore.token) return;
    historyLoading = true;
    try {
      historySpecimens = await fetchApi<Specimen[]>('/api/v1/specimens/history', { method: 'GET' }, $authStore.token);
    } catch (e) {
      console.warn('Failed to load history:', e);
    } finally {
      historyLoading = false;
    }
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      selectedFile = target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        imagePreview = reader.result as string;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  let isDragging = $state(false);

  function acceptFile(file: File | undefined | null) {
    if (!file || !file.type.startsWith('image/')) return;
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    acceptFile(e.dataTransfer?.files?.[0]);
  }

  function handleImageLoad(e: Event) {
    const img = e.target as HTMLImageElement;
    imageDimensions = { width: img.naturalWidth, height: img.naturalHeight };
  }

  async function handleUploadAndAnalyze() {
    if (!selectedFile || !$authStore.token) return;
    isUploading = true;
    analyzeError = null;
    currentSpecimen = null;
    feedbackSubmitted = false;
    imageDimensions = null;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload specimen
      const uploaded = await fetchApi<Specimen>(
        `/api/v1/${selectedType}/upload`,
        {
          method: 'POST',
          body: formData,
        },
        $authStore.token
      );

      isUploading = false;
      isAnalyzing = true;

      // Run Quality Check & Model Analysis
      const analyzed = await fetchApi<Specimen>(
        `/api/v1/${selectedType}/${uploaded.uid}/analyze`,
        { method: 'POST' },
        $authStore.token
      );

      currentSpecimen = analyzed;
      await loadDashboardData();
      await loadHistory();
    } catch (err: any) {
      analyzeError = err.message || 'Failed to analyze specimen';
    } finally {
      isUploading = false;
      isAnalyzing = false;
    }
  }

  async function handleFeedbackSubmit() {
    if (!currentSpecimen || !feedbackRating || !$authStore.token) return;
    try {
      const updated = await fetchApi<Specimen>(
        `/api/v1/${currentSpecimen.specimen_type}/${currentSpecimen.uid}/feedback`,
        {
          method: 'POST',
          body: JSON.stringify({
            feedback: feedbackRating,
            notes: feedbackNotes,
          }),
        },
        $authStore.token
      );
      currentSpecimen = updated;
      feedbackSubmitted = true;
      await loadDashboardData();
      await loadHistory();
    } catch (err: any) {
      alert('Failed to submit feedback: ' + err.message);
    }
  }

  function getDetections(): Detection[] {
    if (!currentSpecimen) return [];
    return getDetectionsFromSpecimen(currentSpecimen);
  }

  function getRawOutput(): RawOutput | null {
    if (!currentSpecimen) return null;
    return parseRawOutput(currentSpecimen.raw_output);
  }

  function getQualityStatus(): string {
    const raw = getRawOutput();
    return raw?.quality_check || 'UNKNOWN';
  }

  const SPECIMEN_TYPES = ['blood', 'urine', 'stool'] as const;
  type SpecimenType = (typeof SPECIMEN_TYPES)[number];

  /** Per-type mean detection confidence, or null when the type has no scored predictions. */
  function typeConfidence(type: SpecimenType): number | null {
    return metrics?.avg_confidence?.[type] ?? null;
  }

  /** Volume-weighted mean confidence across every type that actually has predictions. */
  function overallConfidence(): number | null {
    if (!metrics) return null;
    let weighted = 0;
    let weight = 0;
    for (const type of SPECIMEN_TYPES) {
      const conf = metrics.avg_confidence?.[type];
      if (conf == null) continue;
      const n = metrics.uploads_by_type?.[type] ?? 0;
      weighted += conf * n;
      weight += n;
    }
    return weight > 0 ? weighted / weight : null;
  }

  /** Busiest specimen type by upload count, or null when nothing has been uploaded. */
  function topModule(): SpecimenType | null {
    if (!metrics) return null;
    let best: SpecimenType | null = null;
    let bestCount = 0;
    for (const type of SPECIMEN_TYPES) {
      const n = metrics.uploads_by_type?.[type] ?? 0;
      if (n > bestCount) {
        best = type;
        bestCount = n;
      }
    }
    return best;
  }

  function feedbackAccuracy(): number | null {
    if (!metrics) return null;
    const values = SPECIMEN_TYPES.map((t) => metrics?.feedback_accuracy?.[t]).filter(
      (v): v is number => v != null
    );
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /** Percent string, or an em dash when the metric is genuinely unavailable. */
  function pct(value: number | null): string {
    return value == null ? '—' : `${(value * 100).toFixed(1)}%`;
  }
</script>

<svelte:head>
  <title>Nexora — Lab Workspace</title>
</svelte:head>

<NavBar />

<div class="min-h-screen bg-slate-50 pt-20 flex flex-col">
  <div class="flex-1 flex flex-col lg:flex-row">
    
    <!-- Sidebar Tabs (as required by PHASE1.md) -->
    <aside class="w-full lg:w-64 bg-white/90 backdrop-blur border-b lg:border-b-0 lg:border-r border-slate-200 px-3 py-2.5 lg:p-5 flex flex-col justify-between shrink-0 sticky top-[60px] lg:top-20 z-30 lg:h-[calc(100vh-5rem)]">
      <div class="lg:space-y-6">
        <div class="hidden lg:block px-2 pt-2">
          <span class="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">Phase One Workspace</span>
          <h2 class="text-lg font-bold text-navy-900 tracking-tight">Nexora Controls</h2>
        </div>

        <nav class="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible [scrollbar-width:none]">
          <button
            onclick={() => (activeTab = 'dashboard')}
            class="btn-fx shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-3.5 py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-xs font-semibold uppercase tracking-wider whitespace-nowrap {activeTab === 'dashboard' ? 'bg-blue-600/20 text-blue-700 border border-blue-500/30 shadow-md shadow-blue-500/10' : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-transparent'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            1. Dashboard
          </button>

          <button
            onclick={() => (activeTab = 'analyze')}
            class="btn-fx shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-3.5 py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-xs font-semibold uppercase tracking-wider whitespace-nowrap {activeTab === 'analyze' ? 'bg-blue-600/20 text-blue-700 border border-blue-500/30 shadow-md shadow-blue-500/10' : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-transparent'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            2. Analyze Tab
          </button>

          <button
            onclick={() => (activeTab = 'history')}
            class="btn-fx shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-3.5 py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-xs font-semibold uppercase tracking-wider whitespace-nowrap {activeTab === 'history' ? 'bg-blue-600/20 text-blue-700 border border-blue-500/30 shadow-md shadow-blue-500/10' : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-transparent'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            3. History Tab
          </button>

          <button
            onclick={() => (activeTab = 'settings')}
            class="btn-fx shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-3.5 py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-xs font-semibold uppercase tracking-wider whitespace-nowrap {activeTab === 'settings' ? 'bg-blue-600/20 text-blue-700 border border-blue-500/30 shadow-md shadow-blue-500/10' : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-transparent'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            4. Settings Tab
          </button>
        </nav>
      </div>

      <!-- Current User Badge -->
      {#if $currentUser}
        <div class="hidden lg:flex bg-slate-50 border border-slate-200 rounded-xl p-3.5 items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-blue-400/40">
            {initials($currentUser)}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold text-navy-900 truncate">{$currentUser.full_name || $currentUser.username}</p>
            <p class="text-[10px] text-blue-700 uppercase font-semibold">{roleInfo($currentUser.role).label}</p>
          </div>
        </div>
      {/if}
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-transparent">
      
      <!-- TAB 1: DASHBOARD -->
      {#if activeTab === 'dashboard'}
        <div class="space-y-8 max-w-6xl">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              {#if $currentUser}
                <p class="text-[11px] font-bold uppercase tracking-widest text-blue-700">{roleInfo($currentUser.role).icon} {roleInfo($currentUser.role).label} workspace</p>
                <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold text-navy-900">{greetingFor($currentUser)}</h1>
              {:else}
                <h1 class="text-2xl font-extrabold text-navy-900">Metrics & Analytics Overview</h1>
              {/if}
              <p class="text-xs text-slate-500 mt-1">Real-time lab operations metrics and module performance statistics</p>
            </div>
            <button
              type="button"
              onclick={() => (activeTab = 'analyze')}
              class="btn-fx btn-shine rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-indigo-500"
            >
              + Analyze a specimen
            </button>
          </div>

          <!-- Top Metric Cards -->
          <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
            <div use:spotlight class="card-fx bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Urine samples</span>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-2xl sm:text-3xl font-black text-navy-900">{metrics?.uploads_by_type?.urine ?? 0}</span>
                <span class="text-xs text-slate-500">today</span>
              </div>
            </div>

            <div use:spotlight class="card-fx bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Users</span>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-2xl sm:text-3xl font-black text-blue-700">{metrics?.active_users ?? 0}</span>
                <span class="text-xs text-slate-500">today</span>
              </div>
            </div>

            <div use:spotlight class="card-fx bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avg Confidence</span>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-2xl sm:text-3xl font-black text-emerald-600">{pct(typeConfidence('urine'))}</span>
                <span class="text-xs text-slate-500">AI detection</span>
              </div>
            </div>

            <div use:spotlight class="card-fx bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Live detector</span>
              <div class="flex items-center gap-2 mt-2">
                <span class="relative flex h-2.5 w-2.5 shrink-0"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span></span>
                <span class="text-lg sm:text-xl font-black text-navy-900 truncate">Schistosoma</span>
              </div>
              <span class="text-xs text-slate-500">S. haematobium · urine</span>
            </div>
          </div>

          <!-- Detector modules: live today + openings for upcoming models -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {#each MODULES as mod (mod.type)}
              {#if isLive(mod.type)}
                <div use:spotlight class="card-fx group bg-white border border-blue-200 rounded-2xl p-6 shadow-sm ring-1 ring-blue-500/10">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2.5">
                      <span class="pop text-xl" aria-hidden="true">{mod.icon}</span>
                      <h3 class="text-sm font-bold text-navy-900 uppercase tracking-wider">{mod.name}</h3>
                    </div>
                    <span class="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Live
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mb-4">{mod.specimen} · {mod.target}</p>
                  <div class="space-y-2 text-xs">
                    <div class="flex justify-between text-slate-600">
                      <span>Samples processed</span>
                      <span class="font-bold text-navy-900">{metrics?.uploads_by_type?.[mod.type] ?? 0}</span>
                    </div>
                    <div class="flex justify-between text-slate-600">
                      <span>Avg. confidence</span>
                      <span class="font-bold text-emerald-600">{pct(typeConfidence(mod.type))}</span>
                    </div>
                  </div>
                  <button type="button" onclick={() => { selectedType = mod.type; activeTab = 'analyze'; }} class="btn-fx btn-shine group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700">
                    Analyze a sample
                    <svg class="nudge h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              {:else}
                <div class="relative rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2.5 opacity-60">
                      <span class="text-xl grayscale" aria-hidden="true">{mod.icon}</span>
                      <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider">{mod.name}</h3>
                    </div>
                    <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold border border-slate-200">Coming soon</span>
                  </div>
                  <p class="text-xs text-slate-400 mb-4">{mod.specimen} · {mod.target}</p>
                  <div class="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                    Model in training. This module unlocks automatically once its validated detector is released.
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- TAB 2: ANALYZE TAB (User Flow: Select type -> Upload -> Quality Checks -> Model Inference -> Feedback) -->
      {#if activeTab === 'analyze'}
        <div class="space-y-8 max-w-4xl">
          <div>
            <h1 class="text-2xl font-extrabold text-navy-900">Schistosoma Egg Detection</h1>
            <p class="text-xs text-slate-500 mt-1">Upload a urine microscopy image for quality checks and AI detection of <em>S. haematobium</em> ova. Blood and stool detectors are coming soon.</p>
          </div>

          <!-- Step 1: Select Specimen Type -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 class="text-sm font-bold text-slate-600 uppercase tracking-wider">1. Select Specimen Type</h2>
            <div class="grid grid-cols-3 gap-4">
              {#each MODULES as mod (mod.type)}
                {@const live = isLive(mod.type)}
                <button
                  type="button"
                  disabled={!live}
                  title={live ? `Analyze ${mod.specimen.toLowerCase()} for ${mod.target}` : `${mod.name} detector coming soon`}
                  onclick={() => (selectedType = mod.type)}
                  class="relative p-3 sm:p-4 rounded-xl border text-center flex flex-col items-center gap-1 {live ? 'btn-fx cursor-pointer' : 'cursor-not-allowed border-dashed opacity-60'} {selectedType === mod.type && live ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-md shadow-blue-500/15 ring-4 ring-blue-500/10' : 'bg-slate-50 border-slate-200 text-slate-500'} {live && selectedType !== mod.type ? 'hover:border-blue-300 hover:text-navy-900' : ''}"
                >
                  <span class="text-xl {live ? '' : 'grayscale'}" aria-hidden="true">{mod.icon}</span>
                  <span class="text-xs sm:text-sm font-bold">{mod.name}</span>
                  <span class="text-[10px] font-semibold uppercase tracking-wider {live ? 'text-emerald-600' : 'text-slate-400'}">{live ? `● Live · ${mod.specimen}` : 'Coming soon'}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Step 2: Upload Image -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 class="text-sm font-bold text-slate-600 uppercase tracking-wider">2. Upload Specimen Microscopic Image</h2>
            
            <label
              for="specimen-file"
              ondragover={(e) => { e.preventDefault(); isDragging = true; }}
              ondragleave={() => (isDragging = false)}
              ondrop={handleDrop}
              class="group block cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all {isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}">
              {#if imagePreview}
                <div class="flex flex-col items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Specimen Preview"
                    class="max-h-64 rounded-xl border border-slate-300 shadow-lg object-contain"
                    onload={handleImageLoad}
                  />
                  <span class="text-xs text-slate-500">{selectedFile?.name} ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)</span>
                </div>
              {:else}
                <div class="flex flex-col items-center gap-3">
                  <svg class="pop w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm font-semibold text-slate-600">Drag &amp; drop a microscope image here, or click to browse</p>
                  <p class="text-xs text-slate-500">Supports PNG, JPG, JPEG, TIFF</p>
                </div>
              {/if}
              <input id="specimen-file" type="file" accept="image/*" onchange={handleFileSelect} class="sr-only" />
              <span class="btn-fx mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-navy-900 shadow-sm group-hover:border-blue-400 group-hover:text-blue-700">
                {selectedFile ? 'Choose a different image' : 'Browse files'}
              </span>
            </label>

            <button
              onclick={handleUploadAndAnalyze}
              disabled={!selectedFile || isUploading || isAnalyzing}
              class="btn-fx btn-shine w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:hover:shadow-none flex items-center justify-center gap-2 text-sm"
            >
              {#if isUploading}
                <span>Uploading Specimen Image...</span>
              {:else if isAnalyzing}
                <span>Running Quality Checks & AI Segmentation...</span>
              {:else}
                <span>Run Quality Check & Model Analysis</span>
              {/if}
            </button>
          </div>

          <!-- Analysis Results & Feedback -->
          {#if currentSpecimen}
            <div class="bg-white border border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-xl">
              <div class="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span
                    class="text-[10px] font-extrabold uppercase tracking-widest block {getQualityStatus() === 'PASSED'
                      ? 'text-emerald-600'
                      : getQualityStatus() === 'REVIEW'
                        ? 'text-amber-600'
                        : 'text-slate-500'}"
                  >
                    Quality Check: {getQualityStatus()}
                  </span>
                  <h3 class="text-lg font-extrabold text-navy-900 mt-0.5">Model Findings & Diagnosis</h3>
                </div>
                <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/40">
                  Confidence: {pct(currentSpecimen.confidence ?? null)}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span class="text-slate-500 block mb-1">Detected Microbe Target:</span>
                  <span class="text-base font-bold text-navy-900">{currentSpecimen.prediction}</span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span class="text-slate-500 block mb-1">Specimen ID:</span>
                  <span class="text-sm font-mono text-blue-700">{currentSpecimen.uid}</span>
                </div>
              </div>

              <!-- Accuracy Feedback Section (PHASE1.md requirement 3) -->
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 class="text-xs font-bold text-slate-600 uppercase tracking-wider">Provide Accuracy Feedback</h4>

                {#if feedbackSubmitted}
                  <div class="bg-emerald-950/60 border border-emerald-500/40 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Feedback submitted successfully! Thank you for improving model performance.
                  </div>
                {:else}
                  <div class="flex gap-4">
                    <button
                      type="button"
                      onclick={() => (feedbackRating = 'correct')}
                      class="btn-fx flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 {feedbackRating === 'correct' ? 'bg-emerald-600/30 border-emerald-500 text-emerald-700' : 'bg-white border-slate-300 text-slate-600'}"
                    >
                      Correct Diagnosis
                    </button>
                    <button
                      type="button"
                      onclick={() => (feedbackRating = 'incorrect')}
                      class="btn-fx flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 {feedbackRating === 'incorrect' ? 'bg-rose-600/30 border-rose-500 text-rose-700' : 'bg-white border-slate-300 text-slate-600'}"
                    >
                      Incorrect Diagnosis
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      bind:value={feedbackNotes}
                      placeholder="Optional notes or fine-grained feedback..."
                      class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-navy-900 placeholder-slate-400 outline-none"
                    />
                  </div>

                  <button
                    onclick={handleFeedbackSubmit}
                    disabled={!feedbackRating}
                    class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all disabled:opacity-40"
                  >
                    Submit Feedback
                  </button>
                {/if}
              </div>
            </div>

            <!-- Bounding Box Visualization -->
            {#if currentSpecimen && getDetections().length > 0 && imagePreview && imageDimensions}
              <div class="bg-white border border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                <div class="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span class="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest block">Microscopy Canvas Annotation</span>
                    <h3 class="text-lg font-extrabold text-navy-900 mt-0.5">Detection Overlay</h3>
                  </div>
                  <span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 border border-blue-500/40">
                    {getDetections().length} detection(s)
                  </span>
                </div>

                <div class="relative max-w-full mx-auto">
                  <BoundingBoxOverlay
                    imageSrc={imagePreview}
                    detections={getDetections()}
                    imageWidth={imageDimensions.width}
                    imageHeight={imageDimensions.height}
                    showLabels={true}
                    showConfidence={true}
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {#each getDetections() as detection}
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="px-2 py-1 rounded bg-emerald-500/20 text-emerald-700 text-[10px] font-bold border border-emerald-500/30">
                          {detection.class_name}
                        </span>
                        <span class="text-emerald-600 font-mono">{Math.round(detection.confidence * 100)}%</span>
                      </div>
                      <div class="text-slate-500 font-mono text-[10px] space-y-1">
                        <div>x1: {detection.box.x1.toFixed(1)}  y1: {detection.box.y1.toFixed(1)}</div>
                        <div>x2: {detection.box.x2.toFixed(1)}  y2: {detection.box.y2.toFixed(1)}</div>
                        <div>Width: {(detection.box.x2 - detection.box.x1).toFixed(1)}  Height: {(detection.box.y2 - detection.box.y1).toFixed(1)}</div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {:else if currentSpecimen && getDetections().length === 0 && imagePreview}
              <div class="bg-white border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                <div class="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span class="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block">Microscopy Canvas Annotation</span>
                    <h3 class="text-lg font-extrabold text-navy-900 mt-0.5">Detection Overlay</h3>
                  </div>
                  <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/40">
                    No detections
                  </span>
                </div>

                <div class="relative max-w-full mx-auto">
                  <img
                    src={imagePreview}
                    alt="Specimen Preview"
                    class="max-w-full max-h-[480px] h-auto rounded-xl border border-slate-300 shadow-lg object-contain mx-auto"
                    onload={handleImageLoad}
                  />
                </div>

                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  {#if getRawOutput()?.model?.available}
                    <svg class="w-12 h-12 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-slate-500">No suspected ova detected in this image.</p>
                    <p class="text-xs text-slate-500 mt-1">The model analyzed the image but found no objects above the confidence threshold.</p>
                  {:else}
                    <svg class="w-12 h-12 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                    </svg>
                    <p class="text-slate-500">No detector is configured for {currentSpecimen?.specimen_type} specimens yet.</p>
                    <p class="text-xs text-slate-500 mt-1">
                      {getRawOutput()?.model?.error ?? 'model_unavailable'} — the egg detector is currently urine-only.
                    </p>
                  {/if}
                </div>
              </div>
            {/if}

          {/if}
        </div>
      {/if}

      <!-- TAB 3: HISTORY TAB (View sample history across Blood, Urine, Stool) -->
      {#if activeTab === 'history'}
        <div class="space-y-6 max-w-6xl">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-navy-900">Specimen History Log</h1>
              <p class="text-xs text-slate-500 mt-1">Processed samples and feedback status{#if hiddenHistoryCount > 0}{' · '}{hiddenHistoryCount} earlier test record{hiddenHistoryCount === 1 ? '' : 's'} from unreleased modules hidden{/if}</p>
            </div>

            <div class="flex flex-wrap gap-2">
              {#each MODULES as mod (mod.type)}
                {@const live = isLive(mod.type)}
                <button
                  disabled={!live}
                  title={live ? '' : `${mod.name} detector coming soon`}
                  onclick={() => (historyFilter = mod.type)}
                  class="px-3.5 py-1.5 rounded-lg text-xs font-bold border {live ? 'btn-fx' : 'cursor-not-allowed border-dashed opacity-60'} {historyFilter === mod.type && live ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25' : 'bg-white text-slate-500 border-slate-200'} {live && historyFilter !== mod.type ? 'hover:text-navy-900 hover:border-blue-300' : ''}"
                >
                  {mod.name}{live ? '' : ' · soon'}
                </button>
              {/each}
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-lg">
            <table class="w-full min-w-[640px] text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="p-4">UID</th>
                  <th class="p-4">Specimen Type</th>
                  <th class="p-4">Diagnosis Finding</th>
                  <th class="p-4">Confidence</th>
                  <th class="p-4">User Feedback</th>
                  <th class="p-4">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {#each liveHistory.filter((s) => s.specimen_type === historyFilter) as item}
                  <tr class="hover:bg-slate-100 transition-colors">
                    <td class="p-4 font-mono text-blue-700">{item.uid.substring(0, 8)}...</td>
                    <td class="p-4 uppercase font-bold text-navy-900">{item.specimen_type}</td>
                    <td class="p-4 text-slate-700">{item.prediction || 'Pending Analysis'}</td>
                    <td class="p-4 font-bold text-emerald-600">
                      {item.confidence ? `${Math.round(item.confidence * 100)}%` : '—'}
                    </td>
                    <td class="p-4">
                      {#if item.user_feedback === 'correct'}
                        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[10px] font-bold border border-emerald-500/30">Correct</span>
                      {:else if item.user_feedback === 'incorrect'}
                        <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 text-[10px] font-bold border border-rose-500/30">Incorrect</span>
                      {:else}
                        <span class="text-slate-500">None</span>
                      {/if}
                    </td>
                    <td class="p-4 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="6" class="p-8 text-center text-slate-500">No specimen records found yet. Upload one in the Analyze tab!</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <!-- TAB 4: SETTINGS TAB -->
      {#if activeTab === 'settings'}
        <div class="space-y-6 max-w-3xl">
          <div>
            <h1 class="text-2xl font-extrabold text-navy-900">System & Profile Settings</h1>
            <p class="text-xs text-slate-500 mt-1">Manage user preferences, data privacy controls, and role permissions</p>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-bold text-navy-900">Authenticated Profile</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-slate-500 block mb-1">Username:</span>
                <span class="font-bold text-navy-900">{$currentUser?.username}</span>
              </div>
              <div>
                <span class="text-slate-500 block mb-1">Email:</span>
                <span class="font-bold text-navy-900">{$currentUser?.email}</span>
              </div>
              <div>
                <span class="text-slate-500 block mb-1">System Role:</span>
                <span class="font-bold text-blue-700 uppercase">{$currentUser?.role}</span>
              </div>
              <div>
                <span class="text-slate-500 block mb-1">User Identifier:</span>
                <span class="font-mono text-slate-600">{$currentUser?.uid}</span>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-6 space-y-2 text-xs text-slate-500">
            <h3 class="text-sm font-bold text-navy-900 mb-2">Data Privacy & Security</h3>
            <p>All telemetry events (usage_events) are keyed solely by user_uid to preserve strict patient data privacy without joining PII.</p>
            <p>JWT Session tokens are valid for 30 minutes and scoped according to user roles.</p>
          </div>
        </div>
      {/if}

    </main>
  </div>
</div>

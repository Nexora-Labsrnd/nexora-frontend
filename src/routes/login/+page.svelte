<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import NavBar from '$lib/components/NavBar.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';

  let username = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let localError = $state<string | null>(null);

  onMount(() => {
    authStore.clearError();
    authStore.init();
  });

  $effect(() => {
    if ($isAuthenticated) goto('/dashboard');
  });

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    localError = null;
    if (!username.trim() || !password) {
      localError = 'Please enter your username (or email) and password';
      return;
    }
    if (await authStore.login(username.trim(), password)) goto('/dashboard');
  }

  const DEMO_ACCOUNTS = [
    { key: 'doctor', label: 'Doctor', icon: '🩺', username: 'doctor1', password: 'doctor123' },
    { key: 'technician', label: 'Lab Scientist', icon: '🔬', username: 'tech1', password: 'tech123' },
    { key: 'lab_director', label: 'Lab Director', icon: '🧪', username: 'director1', password: 'director123' },
    { key: 'admin', label: 'Admin', icon: '🛡️', username: 'admin', password: 'admin123' }
  ] as const;

  function fillDemoAccount(account: (typeof DEMO_ACCOUNTS)[number]) {
    authStore.clearError();
    localError = null;
    username = account.username;
    password = account.password;
  }
</script>

<svelte:head>
  <title>Nexora — Sign in</title>
</svelte:head>

<NavBar />

<AuthShell title="Welcome back" subtitle="Sign in to your Nexora lab workspace.">
  <!-- Demo accounts -->
  <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <p class="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Try a demo account</p>
    <div class="grid grid-cols-2 gap-2">
      {#each DEMO_ACCOUNTS as account (account.key)}
        <button
          type="button"
          onclick={() => fillDemoAccount(account)}
          class="btn-fx flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold {username === account.username
            ? 'border-blue-400 bg-blue-50 text-blue-800 shadow-sm'
            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60'}"
        >
          <span aria-hidden="true">{account.icon}</span>
          {account.label}
        </button>
      {/each}
    </div>
  </div>

  {#if localError || $authStore.error}
    <div class="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700" role="alert">
      <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{localError || $authStore.error}</span>
    </div>
  {/if}

  <form onsubmit={handleLogin} class="mt-6 space-y-5">
    <div>
      <label for="username" class="mb-1.5 block text-sm font-semibold text-navy-900">Username or email</label>
      <input
        id="username"
        type="text"
        autocomplete="username"
        bind:value={username}
        placeholder="e.g. doctor1"
        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
      />
    </div>

    <div>
      <label for="password" class="mb-1.5 block text-sm font-semibold text-navy-900">Password</label>
      <div class="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autocomplete="current-password"
          bind:value={password}
          placeholder="••••••••"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-16 text-sm text-navy-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
        />
        <button
          type="button"
          onclick={() => (showPassword = !showPassword)}
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-navy-900"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>

    <button
      type="submit"
      disabled={$authStore.isLoading}
      class="btn-fx btn-shine group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-60"
    >
      {#if $authStore.isLoading}
        <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        Signing in…
      {:else}
        Sign in
        <svg class="nudge h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      {/if}
    </button>
  </form>

  <p class="mt-8 text-center text-sm text-slate-500">
    New to Nexora?
    <a href="/signup" class="link-fx font-semibold text-blue-700 hover:text-blue-800">Create an account</a>
  </p>
</AuthShell>

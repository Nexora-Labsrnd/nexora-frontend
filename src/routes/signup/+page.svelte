<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import NavBar from '$lib/components/NavBar.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';

  const ROLES = [
    { value: 'doctor', label: 'Doctor', icon: '🩺', hint: 'Review results & patient history' },
    { value: 'technician', label: 'Lab Scientist', icon: '🔬', hint: 'Run specimens through the AI' },
    { value: 'lab_director', label: 'Lab Director', icon: '🧪', hint: 'Oversee quality & throughput' }
  ] as const;

  let role = $state<string>('doctor');
  let fullName = $state('');
  let username = $state('');
  let email = $state('');
  let password = $state('');
  let confirm = $state('');
  let showPassword = $state(false);
  let agree = $state(false);
  let touched = $state(false);
  let usernameEdited = $state(false);

  onMount(() => {
    authStore.clearError();
    authStore.init();
  });

  $effect(() => {
    if ($isAuthenticated) goto('/dashboard');
  });

  // Suggest a username from the full name until the user edits it themselves.
  $effect(() => {
    if (usernameEdited) return;
    const parts = fullName.trim().toLowerCase().split(/\s+/).filter(Boolean);
    username = parts.length ? (parts.length > 1 ? parts[0][0] + parts[parts.length - 1] : parts[0]).replace(/[^a-z0-9._-]/g, '') : '';
  });

  const errors = $derived({
    fullName: fullName.trim().length < 3 ? 'Enter your full name' : '',
    username: !/^[a-zA-Z0-9._-]{3,32}$/.test(username.trim()) ? '3–32 letters, numbers, dots, dashes or underscores' : '',
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? 'Enter a valid email address' : '',
    password: password.length < 8 ? 'At least 8 characters' : '',
    confirm: confirm !== password || !confirm ? 'Passwords do not match' : '',
    agree: !agree ? 'Please confirm to continue' : ''
  });
  const valid = $derived(Object.values(errors).every((e) => !e));

  const strength = $derived.by(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  });
  const strengthLabel = $derived(['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength]);
  const strengthColor = $derived(['bg-slate-300', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'][strength]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    touched = true;
    if (!valid) return;
    const ok = await authStore.register({
      full_name: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      role
    });
    if (ok) goto('/dashboard');
  }

  const inputClass =
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-navy-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15';
  const border = (err: string) => (touched && err ? 'border-rose-400' : 'border-slate-300');
</script>

<svelte:head>
  <title>Nexora — Create your account</title>
</svelte:head>

<NavBar />

<AuthShell title="Create your account" subtitle="Join Nexora in under a minute. You'll be signed in straight away.">
  {#if $authStore.error}
    <div class="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700" role="alert">
      <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{$authStore.error}</span>
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="space-y-5" novalidate>
    <!-- Role -->
    <fieldset>
      <legend class="mb-2 block text-sm font-semibold text-navy-900">I am a…</legend>
      <div class="grid grid-cols-3 gap-2">
        {#each ROLES as r (r.value)}
          <label
            class="btn-fx group relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-center {role === r.value
              ? 'border-blue-500 bg-blue-50 shadow-sm ring-4 ring-blue-500/10'
              : 'border-slate-200 bg-white hover:border-blue-300'}"
          >
            <input type="radio" name="role" value={r.value} bind:group={role} class="sr-only" />
            <span class="pop text-2xl" aria-hidden="true">{r.icon}</span>
            <span class="text-xs font-bold text-navy-900">{r.label}</span>
            <span class="hidden text-[10px] leading-tight text-slate-500 sm:block">{r.hint}</span>
          </label>
        {/each}
      </div>
    </fieldset>

    <!-- Name -->
    <div>
      <label for="fullName" class="mb-1.5 block text-sm font-semibold text-navy-900">Full name</label>
      <input id="fullName" type="text" autocomplete="name" bind:value={fullName} placeholder="e.g. Amina Wanjiku" class="{inputClass} {border(errors.fullName)}" />
      {#if touched && errors.fullName}<p class="mt-1 text-xs text-rose-600">{errors.fullName}</p>{/if}
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label for="username" class="mb-1.5 block text-sm font-semibold text-navy-900">Username</label>
        <input
          id="username"
          type="text"
          autocomplete="username"
          bind:value={username}
          oninput={() => (usernameEdited = true)}
          placeholder="awanjiku"
          class="{inputClass} {border(errors.username)}"
        />
        {#if touched && errors.username}<p class="mt-1 text-xs text-rose-600">{errors.username}</p>{/if}
      </div>
      <div>
        <label for="email" class="mb-1.5 block text-sm font-semibold text-navy-900">Work email</label>
        <input id="email" type="email" autocomplete="email" bind:value={email} placeholder="you@hospital.co.ke" class="{inputClass} {border(errors.email)}" />
        {#if touched && errors.email}<p class="mt-1 text-xs text-rose-600">{errors.email}</p>{/if}
      </div>
    </div>

    <!-- Password -->
    <div>
      <label for="password" class="mb-1.5 block text-sm font-semibold text-navy-900">Password</label>
      <div class="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autocomplete="new-password"
          bind:value={password}
          placeholder="At least 8 characters"
          class="{inputClass} {border(errors.password)} pr-16"
        />
        <button type="button" onclick={() => (showPassword = !showPassword)} class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-navy-900">
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {#if password}
        <div class="mt-2 flex items-center gap-3">
          <div class="flex flex-1 gap-1">
            {#each [1, 2, 3, 4] as i}
              <span class="h-1.5 flex-1 rounded-full transition-colors {i <= strength ? strengthColor : 'bg-slate-200'}"></span>
            {/each}
          </div>
          <span class="w-16 text-right text-xs font-semibold text-slate-500">{strengthLabel}</span>
        </div>
      {/if}
      {#if touched && errors.password}<p class="mt-1 text-xs text-rose-600">{errors.password}</p>{/if}
    </div>

    <div>
      <label for="confirm" class="mb-1.5 block text-sm font-semibold text-navy-900">Confirm password</label>
      <input id="confirm" type={showPassword ? 'text' : 'password'} autocomplete="new-password" bind:value={confirm} placeholder="Repeat your password" class="{inputClass} {border(errors.confirm)}" />
      {#if touched && errors.confirm}<p class="mt-1 text-xs text-rose-600">{errors.confirm}</p>{/if}
    </div>

    <label class="flex items-start gap-3 text-sm text-slate-600">
      <input type="checkbox" bind:checked={agree} class="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
      <span>I understand Nexora is a research prototype and every result must be confirmed by qualified laboratory personnel.</span>
    </label>
    {#if touched && errors.agree}<p class="-mt-3 text-xs text-rose-600">{errors.agree}</p>{/if}

    <button
      type="submit"
      disabled={$authStore.isLoading}
      class="btn-fx btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-60"
    >
      {#if $authStore.isLoading}
        <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        Creating your account…
      {:else}
        Create account
      {/if}
    </button>
  </form>

  <p class="mt-8 text-center text-sm text-slate-500">
    Already have an account?
    <a href="/login" class="link-fx font-semibold text-blue-700 hover:text-blue-800">Sign in</a>
  </p>
</AuthShell>

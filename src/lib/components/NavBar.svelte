<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, isAuthenticated, currentUser } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { roleInfo, initials, addressName } from '$lib/greeting';

  onMount(() => {
    authStore.init();
  });

  function handleLogout() {
    authStore.logout();
    goto('/');
  }
</script>

<nav class="fixed z-50 w-full border-b border-slate-200/80 bg-white/80 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl transition-all duration-300">
  <div class="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
    <!-- Brand logo (same artwork as the investor deck) -->
    <a href="/" class="group flex items-center" aria-label="Nexora home">
      <img
        src="/nexora-wordmark.png"
        alt="Nexora"
        class="h-8 w-auto shrink-0 sm:h-9 transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span class="ml-3 hidden border-l border-slate-200 pl-3 text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-blue-700 md:block">
        Lab Intelligence<br />Platform
      </span>
    </a>

    <!-- Nav Links -->
    <div class="flex items-center gap-3 sm:gap-6">
      <a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined} class="link-fx hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors duration-200 hover:text-navy-900">
        Home
      </a>

      {#if $isAuthenticated}
        <a href="/dashboard" aria-current={page.url.pathname.startsWith('/dashboard') ? 'page' : undefined} class="link-fx group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors duration-200 hover:text-navy-900">
          <svg class="pop h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="hidden sm:inline">Dashboard</span>
        </a>
      {/if}

      {#if $isAuthenticated && $currentUser}
        {@const info = roleInfo($currentUser.role)}
        <div class="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-3 sm:pl-4">
          <!-- User chip with hover card: tells everyone which member type is signed in -->
          <div class="group relative">
            <button
              type="button"
              class="btn-fx flex items-center gap-2 rounded-full border border-slate-300 bg-white p-1 sm:px-2.5 sm:py-1 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/10"
              aria-describedby="user-hovercard"
            >
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white ring-2 ring-white">
                {initials($currentUser)}
              </span>
              <span class="hidden sm:flex flex-col pr-1 text-left">
                <span class="text-xs font-semibold leading-tight text-slate-800">{addressName($currentUser)}</span>
                <span class="text-[9px] font-bold uppercase tracking-wider text-blue-700">{info.label}</span>
              </span>
            </button>

            <div
              id="user-hovercard"
              role="tooltip"
              class="pointer-events-none invisible absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] translate-y-1 rounded-xl border border-slate-300 bg-white p-4 opacity-0 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
            >
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signed in as</p>
              <div class="mt-2 flex items-center gap-3">
                <span class="text-2xl">{info.icon}</span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-extrabold text-navy-900">{$currentUser.full_name || $currentUser.username}</p>
                  <span class="mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider {info.badge}">{info.label}</span>
                </div>
              </div>
              <p class="mt-3 text-xs text-slate-500">{info.blurb}</p>
              <p class="mt-2 truncate font-mono text-[10px] text-slate-500">{$currentUser.email}</p>
            </div>
          </div>

          <button
            onclick={handleLogout}
            class="btn-fx flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            title="Sign out"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      {:else}
        <div class="flex items-center gap-2">
          <a
            href="/login"
            class="btn-fx whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-navy-900 transition-colors duration-200 hover:bg-slate-100"
          >
            Sign in
          </a>
          <a
            href="/signup"
            class="btn-fx btn-shine whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs sm:px-4 font-semibold uppercase tracking-wider text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-600/30"
          >
            Sign up
          </a>
        </div>
      {/if}
    </div>
  </div>
</nav>

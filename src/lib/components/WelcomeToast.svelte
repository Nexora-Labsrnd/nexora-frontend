<script lang="ts">
  // Flash welcome message shown once right after sign-in:
  //   "🩺 Hello Dr. Wanjiku — signed in as Doctor"
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { currentUser } from '$lib/stores/auth';
  import { greetingFor, roleInfo } from '$lib/greeting';

  let visible = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function dismiss() {
    visible = false;
    if (timer) clearTimeout(timer);
  }

  onMount(() => {
    return () => timer && clearTimeout(timer);
  });

  // Show as soon as the user is known and the login flow set the flag.
  $effect(() => {
    if (typeof window === 'undefined' || !$currentUser) return;
    if (sessionStorage.getItem('nexora_show_welcome') !== '1') return;
    sessionStorage.removeItem('nexora_show_welcome');
    visible = true;
    timer = setTimeout(() => (visible = false), 6000);
  });
</script>

{#if visible && $currentUser}
  {@const info = roleInfo($currentUser.role)}
  <div
    class="fixed bottom-6 right-6 z-[60] w-[22rem] max-w-[calc(100vw-3rem)]"
    role="status"
    aria-live="polite"
    in:fly={{ y: 30, duration: 350 }}
    out:fade={{ duration: 250 }}
  >
    <div class="relative overflow-hidden rounded-2xl border border-blue-400/40 bg-white p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
      <div class="flex items-start gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl shadow-lg shadow-blue-500/30">
          {info.icon}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-extrabold text-navy-900">{greetingFor($currentUser)} 👋</p>
          <p class="mt-0.5 text-xs text-slate-600">
            Signed in as
            <span class="ml-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider {info.badge}">{info.label}</span>
          </p>
          <p class="mt-1.5 text-[11px] text-slate-500">{info.blurb}</p>
        </div>
        <button
          type="button"
          onclick={dismiss}
          class="text-slate-500 transition-colors hover:text-navy-900"
          aria-label="Dismiss welcome message"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <!-- countdown bar -->
      <div class="absolute bottom-0 left-0 h-0.5 w-full origin-left animate-[shrink_6s_linear_forwards] bg-gradient-to-r from-orange-500 to-blue-500"></div>
    </div>
  </div>
{/if}

<style>
  @keyframes -global-shrink {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle: string;
    children: Snippet;
  }

  let { title, subtitle, children }: Props = $props();

  const points = [
    { icon: '🔬', title: 'Sees', text: 'AI reads microscope images and flags suspected parasites and ova.' },
    { icon: '🛡️', title: 'Verifies', text: 'Cross-checks findings with CBC and urinalysis before sign-off.' },
    { icon: '🧬', title: 'Remembers', text: 'Links results into patient timelines to catch recurrence.' }
  ];
</script>

<div class="min-h-screen pt-16 lg:grid lg:grid-cols-[1.05fr_1fr]">
  <!-- Brand panel -->
  <aside class="brand-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14">
    <div class="relative z-10">
      <img src="/nexora-logo-light.png" alt="Nexora — Shaping smarter health systems" class="h-24 w-auto" />
    </div>

    <div class="relative z-10 max-w-md">
      <h2 class="text-4xl font-extrabold leading-tight text-white">One lab.<br />One reasoning system.</h2>
      <p class="mt-4 text-base leading-relaxed text-white/80">
        Turn the microscopes and analyzers your lab already owns into one intelligent, connected system.
      </p>
      <ul class="mt-10 space-y-5">
        {#each points as point}
          <li class="group flex gap-4">
            <span class="pop flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl ring-1 ring-white/25 backdrop-blur group-hover:bg-white/25">{point.icon}</span>
            <div>
              <p class="font-bold text-white">{point.title}</p>
              <p class="text-sm text-white/75">{point.text}</p>
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <p class="relative z-10 text-xs text-white/60">Research prototype · results always reviewed by qualified lab personnel</p>
  </aside>

  <!-- Form panel -->
  <main class="flex items-center justify-center px-5 py-12 sm:px-10">
    <div class="page-in w-full max-w-md">
      <img src="/nexora-wordmark.png" alt="Nexora" class="mx-auto mb-8 h-10 w-auto lg:hidden" />
      <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">{title}</h1>
      <p class="mt-2 text-sm text-slate-500">{subtitle}</p>
      <div class="mt-8">
        {@render children()}
      </div>
    </div>
  </main>
</div>

<style>
  .brand-panel {
    background:
      radial-gradient(40rem 30rem at 110% 0%, rgba(46, 230, 182, 0.45), transparent 60%),
      radial-gradient(35rem 30rem at -20% 110%, rgba(56, 189, 248, 0.35), transparent 60%),
      linear-gradient(150deg, #0c7670 0%, #13a89e 45%, #0e7490 100%);
  }
  .brand-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
    background-size: 22px 22px;
    pointer-events: none;
  }
</style>

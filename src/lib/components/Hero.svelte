<script lang="ts">
  import { spotlight } from '$lib/actions';
</script>

<section class="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
  <div class="container mx-auto px-6">
    <div class="grid items-center gap-14 lg:grid-cols-2">
      <!-- Copy -->
      <div class="page-in text-center lg:text-left">
        <span class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
          </span>
          AI lab intelligence for Africa
        </span>

        <h1 class="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-navy-900 lg:text-6xl">
          One lab.<br />
          <span class="text-brand-gradient">One reasoning system.</span>
        </h1>

        <p class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0">
          Hardware-agnostic AI that <strong class="text-navy-900">sees</strong>, <strong class="text-navy-900">verifies</strong> and
          <strong class="text-navy-900">remembers</strong>, on the microscopes and analyzers labs already own.
        </p>

        <div class="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
          <a href="/signup" class="btn-fx btn-shine group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
            Create free account
            <svg class="nudge h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
          <a href="/login" class="btn-fx inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-navy-900 shadow-sm hover:border-blue-400 hover:text-blue-700 hover:shadow-md">
            Sign in
          </a>
        </div>

        <dl class="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 sm:gap-6 text-left lg:mx-0">
          <div>
            <dt class="text-xs font-medium text-slate-500">New hardware</dt>
            <dd class="mt-1 text-2xl font-extrabold text-navy-900">$0</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-slate-500">Specimen types</dt>
            <dd class="mt-1 text-2xl font-extrabold text-navy-900">3</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-slate-500">Human sign-off</dt>
            <dd class="mt-1 text-2xl font-extrabold text-navy-900">Always</dd>
          </div>
        </dl>
      </div>

      <!-- Product preview -->
      <div class="relative mx-auto w-full max-w-md lg:max-w-lg">
        <div class="bg-dots absolute -inset-6 rounded-[2.5rem] opacity-70"></div>

        <div use:spotlight={{ tilt: true, max: 4 }} class="card-fx card-elevated relative rounded-3xl p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sample KE-0412 · Urine</p>
              <p class="mt-0.5 text-sm font-bold text-navy-900">AI Vision Engine</p>
            </div>
            <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">Quality: passed</span>
          </div>

          <div class="relative mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <img src="/hero-smear.png" alt="Microscope field with AI detection boxes" class="aspect-square w-full object-cover" />
            <div class="scan-line pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-orange-500/25 to-transparent"></div>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="rounded-xl bg-blue-50 px-2 py-2.5 transition-transform duration-200 hover:-translate-y-0.5">
              <p class="text-lg font-extrabold text-blue-700">94%</p>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Confidence</p>
            </div>
            <div class="rounded-xl bg-sky-50 px-2 py-2.5 transition-transform duration-200 hover:-translate-y-0.5">
              <p class="text-lg font-extrabold text-sky-700">CBC ✓</p>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cross-check</p>
            </div>
            <div class="rounded-xl bg-amber-50 px-2 py-2.5 transition-transform duration-200 hover:-translate-y-0.5">
              <p class="text-lg font-extrabold text-amber-600">12 d</p>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Last positive</p>
            </div>
          </div>
        </div>

        <!-- floating chips -->
        <div class="float-a card-elevated absolute -left-6 top-24 hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">AI</span>
          <span class="text-xs font-semibold text-navy-900">5 suspected ova flagged</span>
        </div>
        <div class="float-b card-elevated absolute -right-4 bottom-28 hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-white">!</span>
          <span class="text-xs font-semibold text-navy-900">Possible treatment failure</span>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes scan {
    0% { top: -15%; }
    100% { top: 100%; }
  }
  .scan-line {
    animation: scan 3.2s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .float-a { animation: float 5s ease-in-out infinite; }
  .float-b { animation: float 6s ease-in-out infinite 1s; }
</style>

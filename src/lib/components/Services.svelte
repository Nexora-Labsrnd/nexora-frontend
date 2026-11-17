<script lang="ts">
  import { spotlight } from '$lib/actions';
  const pillars = [
    {
      step: 'Phase 1',
      name: 'Sees',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      description: 'The AI Vision Engine reads microscope images for schistosome ova (live today), malaria parasites and amoebae, with a confidence score for every finding.'
    },
    {
      step: 'Phase 2',
      name: 'Verifies',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      description: 'Cross-bench intelligence checks each microscopy finding against the same patient\'s CBC, urinalysis and culture before sign-off, flagging discordant results.'
    },
    {
      step: 'Phase 3',
      name: 'Remembers',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'RecurrenceGuard links samples into anonymized patient timelines to flag recurrence and possible treatment failure, with a tamper-evident audit trail.'
    }
  ];
</script>

<section id="how-it-works" class="py-20 px-6">
  <div class="container mx-auto max-w-6xl">
    <p class="mb-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-blue-700">How it works</p>
    <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 text-center mb-4">One intelligence layer across every bench</h2>
    <p class="text-slate-500 text-center max-w-2xl mx-auto mb-12">Zero new hardware. Nexora connects the equipment a lab already owns and reasons across all of it.</p>
    <ul class="grid md:grid-cols-3 gap-8">
      {#each pillars as pillar}
        <li use:spotlight class="card-fx group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <div class="pop flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-colors duration-300 group-hover:bg-blue-600 [&>svg]:transition-colors group-hover:[&>svg]:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={pillar.icon} />
              </svg>
            </div>
            <span class="rounded-full border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{pillar.step}</span>
          </div>
          <h3 class="mb-3 text-xl font-semibold text-navy-900">{pillar.name}</h3>
          <p class="leading-relaxed text-slate-500">{pillar.description}</p>
        </li>
      {/each}
    </ul>
  </div>
</section>

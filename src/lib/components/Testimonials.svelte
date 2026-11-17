<script lang="ts">
  import { spotlight } from '$lib/actions';
</script>

<section class="bg-white py-20 px-6">
  <div class="container mx-auto max-w-6xl">
    <h2 class="text-3xl lg:text-4xl font-bold text-navy-900 text-center mb-4">What the platform records</h2>
    <p class="text-slate-500 text-center max-w-2xl mx-auto mb-12">
      Every figure below comes from the analysis pipeline and is stored per specimen. Nothing here is
      pre-filled or illustrative.
    </p>
    <div class="grid md:grid-cols-3 gap-8">
      <div use:spotlight class="card-fx group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center">
            <span class="text-accent-blue font-bold text-sm">QC</span>
          </div>
        </div>
        <p class="text-slate-500 leading-relaxed mb-4">
          Each upload is measured for sharpness, contrast and exposure before inference. Images that
          fail the gate are flagged for review rather than scored.
        </p>
        <p class="text-navy-900 font-semibold text-sm">- Pre-analytical quality gate</p>
      </div>
      <div use:spotlight class="card-fx group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-accent-orange/20 rounded-full flex items-center justify-center">
            <span class="text-accent-orange font-bold text-sm">AI</span>
          </div>
        </div>
        <p class="text-slate-500 leading-relaxed mb-4">
          Detections are produced by the trained object detector, with per-object confidence and
          bounding boxes stored against the specimen record.
        </p>
        <p class="text-navy-900 font-semibold text-sm">- Egg detector (urine)</p>
      </div>
      <div use:spotlight class="card-fx group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center">
            <span class="text-accent-blue font-bold text-sm">DB</span>
          </div>
        </div>
        <p class="text-slate-500 leading-relaxed mb-4">
          Uploads, predictions and technician feedback are written to an append-only usage log, and
          rolled up into the dashboard aggregates you see after signing in.
        </p>
        <p class="text-navy-900 font-semibold text-sm">- Usage telemetry</p>
      </div>
    </div>
  </div>
</section>
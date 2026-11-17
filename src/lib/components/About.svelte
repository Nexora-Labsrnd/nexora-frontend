<script>
</script>

<section class="bg-white py-20 px-6">
  <div class="container mx-auto max-w-6xl">
    <!-- Introduction -->
    <div class="text-center mb-20">
      <h3 class="text-3xl lg:text-4xl font-bold text-navy-900 mb-6">Africa's labs still diagnose by eye</h3>
      <div class="flex justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-accent-blue">
          <path d="M12 2L12 22M12 22L5 15M12 22L19 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-90 12 12)"/>
        </svg>
      </div>
      <p class="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed">
        Microscopy is still the reference test for malaria and schistosomiasis, but one technician reading one slide at a time leads to misclassification, isolated results and no memory of the patient. Nexora turns the machines a lab already owns into one reasoning system.
      </p>
    </div>

    <!-- About Nexora -->
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <!-- Morphed microbe image with animated border -->
      <div class="flex justify-center">
        <div class="relative w-72 h-72 lg:w-80 lg:h-80">
          <!-- Animated gradient border (behind the blob) -->
          <svg viewBox="0 0 300 300" class="absolute inset-0 w-full h-full morphing-border">
            <defs>
              <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#13a89e" />
                <stop offset="25%" stop-color="#2ee6b6" />
                <stop offset="50%" stop-color="#3cc9b9" />
                <stop offset="75%" stop-color="#16304f" />
                <stop offset="100%" stop-color="#13a89e" />
              </linearGradient>
              <linearGradient id="borderGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#3cc9b9" />
                <stop offset="33%" stop-color="#13a89e" />
                <stop offset="66%" stop-color="#2ee6b6" />
                <stop offset="100%" stop-color="#3cc9b9" />
              </linearGradient>
            </defs>
            <!-- Organic blob path for the border -->
            <path d="M 150 20 
                     C 200 15, 250 50, 260 100 
                     C 275 150, 270 200, 240 240 
                     C 210 275, 170 290, 130 280 
                     C 80 270, 40 240, 30 190 
                     C 15 140, 30 80, 70 50 
                     C 100 20, 120 25, 150 20 Z" 
                  fill="none" stroke="url(#borderGrad)" stroke-width="4" class="border-path" />
            <path d="M 150 20 
                     C 200 15, 250 50, 260 100 
                     C 275 150, 270 200, 240 240 
                     C 210 275, 170 290, 130 280 
                     C 80 270, 40 240, 30 190 
                     C 15 140, 30 80, 70 50 
                     C 100 20, 120 25, 150 20 Z" 
                  fill="none" stroke="url(#borderGrad2)" stroke-width="2" class="border-path-2" opacity="0.7" />
          </svg>

          <!-- Blob shape content area -->
          <svg viewBox="0 0 300 300" class="w-full h-full relative z-10">
            <defs>
              <clipPath id="blobClip">
                <path d="M 150 20 
                         C 200 15, 250 50, 260 100 
                         C 275 150, 270 200, 240 240 
                         C 210 275, 170 290, 130 280 
                         C 80 270, 40 240, 30 190 
                         C 15 140, 30 80, 70 50 
                         C 100 20, 120 25, 150 20 Z" />
              </clipPath>
              <radialGradient id="blobBg" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#e8faf7" />
                <stop offset="100%" stop-color="#9be8dc" />
              </radialGradient>
            </defs>
            <!-- Blob background -->
            <path d="M 150 20 
                     C 200 15, 250 50, 260 100 
                     C 275 150, 270 200, 240 240 
                     C 210 275, 170 290, 130 280 
                     C 80 270, 40 240, 30 190 
                     C 15 140, 30 80, 70 50 
                     C 100 20, 120 25, 150 20 Z" 
                  fill="url(#blobBg)" />
            <!-- Microbe inner details -->
            <g clip-path="url(#blobClip)" opacity="0.6">
              <!-- DNA/helix inside -->
              <path d="M 80 120 Q 110 100, 130 130 Q 150 160, 180 140 Q 210 120, 220 150" fill="none" stroke="#2ee6b6" stroke-width="2" opacity="0.4" class="dna-1" />
              <path d="M 80 140 Q 110 120, 130 150 Q 150 180, 180 160 Q 210 140, 220 170" fill="none" stroke="#3cc9b9" stroke-width="1.5" opacity="0.3" class="dna-2" />
              <!-- Inner glow spots -->
              <circle cx="120" cy="140" r="15" fill="#13a89e" opacity="0.15" class="glow-spot-1" />
              <circle cx="170" cy="160" r="10" fill="#3cc9b9" opacity="0.1" class="glow-spot-2" />
              <!-- Cell structures -->
              <circle cx="130" cy="130" r="4" fill="#2ee6b6" opacity="0.3" />
              <circle cx="160" cy="170" r="3" fill="#2ee6b6" opacity="0.25" />
              <circle cx="100" cy="160" r="2.5" fill="#2ee6b6" opacity="0.2" />
              <circle cx="180" cy="130" r="2" fill="#2ee6b6" opacity="0.2" />
            </g>
          </svg>

          <!-- Orange accent dots around the blob -->
          <div class="absolute -top-2 -right-2 w-4 h-4 bg-accent-orange rounded-full opacity-60 animate-pulse"></div>
          <div class="absolute -bottom-1 -left-3 w-3 h-3 bg-accent-orange rounded-full opacity-40 animate-pulse" style="animation-delay: 1s;"></div>
          <div class="absolute top-1/2 -right-4 w-2 h-2 bg-accent-blue rounded-full opacity-50 animate-pulse" style="animation-delay: 0.5s;"></div>
        </div>
      </div>

      <!-- Content -->
      <div>
        <h3 class="text-3xl lg:text-4xl font-bold text-navy-900 mb-6">About Nexora</h3>
        <div class="space-y-4 text-slate-500 leading-relaxed">
          <p>
            Nexora Healthtech is a Kenyan founding team spanning machine learning, data fusion, platform engineering and laboratory science. We build a software layer, not another machine.
          </p>
          <ul class="space-y-3">
            <li><strong class="text-navy-900">AI Vision Engine:</strong> detects parasites and ova in microscope images, with confidence scores and bounding boxes.</li>
            <li><strong class="text-navy-900">Cross-Bench Intelligence:</strong> checks microscopy against CBC, urinalysis and culture before results are released.</li>
            <li><strong class="text-navy-900">RecurrenceGuard &amp; ChainGuard:</strong> anonymized patient timelines plus a tamper-evident audit trail for quality and compliance.</li>
          </ul>
          <p>
            Every result keeps the lab scientist in control: Nexora flags, explains and remembers, and a qualified professional always signs off.
          </p>
        </div>
        <a href="#how-it-works" class="btn-fx btn-shine group mt-8 inline-flex items-center gap-2 bg-accent-blue hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
          See how it works
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes morph-border {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 200; }
  }
  @keyframes rotate-border {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes dna-float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-4px) scale(1.02); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.1; transform: scale(1); }
    50% { opacity: 0.25; transform: scale(1.2); }
  }
  .morphing-border {
    animation: rotate-border 12s linear infinite;
  }
  .border-path {
    stroke-dasharray: 800;
    animation: morph-border 4s ease-in-out infinite alternate;
  }
  .border-path-2 {
    stroke-dasharray: 800;
    animation: morph-border 4s ease-in-out infinite alternate-reverse;
  }
  .dna-1 {
    animation: dna-float 6s ease-in-out infinite;
  }
  .dna-2 {
    animation: dna-float 6s ease-in-out infinite 0.5s;
  }
  .glow-spot-1 {
    animation: glow-pulse 3s ease-in-out infinite;
  }
  .glow-spot-2 {
    animation: glow-pulse 4s ease-in-out infinite 1s;
  }
</style>

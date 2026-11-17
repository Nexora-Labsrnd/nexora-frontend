<script lang="ts">
  import type { Detection } from '$lib/api/client';

  interface Props {
    imageSrc: string;
    detections: Detection[];
    /** Natural (original) image size — detection boxes are in these pixel coordinates. */
    imageWidth: number;
    imageHeight: number;
    showLabels?: boolean;
    showConfidence?: boolean;
  }

  let { imageSrc, detections, imageWidth, imageHeight, showLabels = true, showConfidence = true }: Props = $props();

  // Boxes are positioned as percentages of the natural image size, so the
  // overlay stays aligned at any display size (large microscope images are
  // scaled down to fit the card instead of overflowing it).
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
</script>

<div class="overlay" style="aspect-ratio: {imageWidth} / {imageHeight};">
  <img src={imageSrc} alt="Specimen with AI detections" />

  {#each detections as detection, i (i)}
    <div
      class="box"
      style="left: {pct(detection.box.x1, imageWidth)}; top: {pct(detection.box.y1, imageHeight)}; width: {pct(detection.box.x2 - detection.box.x1, imageWidth)}; height: {pct(detection.box.y2 - detection.box.y1, imageHeight)};"
    >
      {#if showLabels}
        <div class="label">
          #{i + 1}
          {#if showConfidence}
            <span class="conf">{Math.round(detection.confidence * 100)}%</span>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .overlay {
    position: relative;
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
  }

  .overlay img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 10px;
  }

  .box {
    position: absolute;
    border: 2px solid #2ee6b6;
    border-radius: 4px;
    background: rgba(46, 230, 182, 0.12);
    pointer-events: none;
    animation: pulse 2s infinite;
  }

  .label {
    position: absolute;
    top: -20px;
    left: -2px;
    background: #13a89e;
    color: #fff;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
    font-family: ui-monospace, monospace;
  }

  .conf {
    margin-left: 4px;
    opacity: 0.9;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(46, 230, 182, 0.45);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(46, 230, 182, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(46, 230, 182, 0);
    }
  }
</style>

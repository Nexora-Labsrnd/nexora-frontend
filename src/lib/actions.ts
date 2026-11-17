// Svelte actions for pointer-driven micro-interactions.

/**
 * Tracks the pointer over an element and exposes its position as the CSS
 * variables --mx / --my (used by .card-fx for the spotlight glow).
 * With { tilt: true } the element also leans gently towards the cursor.
 */
export function spotlight(node: HTMLElement, opts: { tilt?: boolean; max?: number } = {}) {
  const max = opts.max ?? 5;
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function move(e: PointerEvent) {
    const r = node.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    node.style.setProperty('--mx', `${x}px`);
    node.style.setProperty('--my', `${y}px`);
    if (opts.tilt && !reduce) {
      const rx = ((y / r.height) - 0.5) * -2 * max;
      const ry = ((x / r.width) - 0.5) * 2 * max;
      node.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  }

  function leave() {
    if (opts.tilt) node.style.transform = '';
  }

  if (opts.tilt) node.style.transition = 'transform 0.25s ease-out';
  node.addEventListener('pointermove', move);
  node.addEventListener('pointerleave', leave);
  return {
    destroy() {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', leave);
    }
  };
}

import { animate, inView, stagger } from 'motion';

/**
 * Reveals al hacer scroll: todo elemento con `data-reveal` entra con un
 * rise+fade suave la primera vez que asoma en el viewport.
 *
 * - `data-reveal` en un elemento: se anima él solo.
 * - `data-reveal="group"`: se animan sus hijos directos en cascada (stagger).
 *
 * Se re-engancha en cada navegación del ClientRouter (astro:page-load) y
 * respeta prefers-reduced-motion.
 */
function setupReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    const group = el.dataset.reveal === 'group';
    const targets = group ? Array.from(el.children as HTMLCollectionOf<HTMLElement>) : [el];
    if (targets.length === 0) continue;

    for (const t of targets) {
      t.style.opacity = '0';
      t.style.transform = 'translateY(14px)';
    }

    inView(
      el,
      () => {
        animate(
          targets,
          { opacity: 1, transform: 'translateY(0px)' },
          { duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: group ? stagger(0.08) : 0 },
        );
      },
      { amount: 0.15 },
    );
  }
}

document.addEventListener('astro:page-load', setupReveals);

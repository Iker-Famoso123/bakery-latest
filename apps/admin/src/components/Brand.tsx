import { cn } from '../lib/cn';

/** Marca de la panadería: un pan dulce (concha) con su rayado característico. */
export function ConchaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('text-concha', className)} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="currentColor" />
      <g stroke="#3b2a24" strokeWidth="1.6" fill="none" opacity="0.24" strokeLinecap="round">
        <path d="M16 3 V29" />
        <path d="M3 16 H29" />
        <path d="M6.5 6.5 L25.5 25.5" />
        <path d="M25.5 6.5 L6.5 25.5" />
      </g>
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <ConchaMark className="size-8 shrink-0" />
      <span className="font-display text-lg leading-none text-cafe">
        Repostería <span className="font-semibold text-concha-hondo">Famoso</span>
      </span>
    </div>
  );
}

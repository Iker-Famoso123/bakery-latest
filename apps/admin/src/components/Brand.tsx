import { cn } from '../lib/cn';

/** Croissant del logotipo formal (trazo negro, para superficies claras). */
export function CroissantMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/croissant.png"
      alt=""
      aria-hidden="true"
      className={cn('w-auto', className)}
      width={600}
      height={466}
    />
  );
}

/** Croissant rosa (para superficies oscuras o acentos). */
export function CroissantRosa({ className }: { className?: string }) {
  return (
    <img
      src="/brand/croissant-rosa.png"
      alt=""
      aria-hidden="true"
      className={cn('w-auto', className)}
      width={600}
      height={466}
    />
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <CroissantMark className="h-7 shrink-0" />
      <span className="font-display text-lg leading-none text-cafe">
        Repostería <span className="font-semibold text-concha-hondo">Famoso</span>
      </span>
    </div>
  );
}

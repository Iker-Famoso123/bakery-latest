import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '../lib/cn';

// ── Button ──────────────────────────────────────────────────
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-concha text-white hover:bg-concha-hondo shadow-sm',
  secondary: 'bg-crema text-cafe border border-linea hover:bg-masa-hondo',
  ghost: 'text-cafe-suave hover:bg-masa-hondo',
  danger: 'bg-peligro text-white hover:brightness-95',
};
const SIZES: Record<Size, string> = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' };

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

// ── Form fields ─────────────────────────────────────────────
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-cafe">{label}</span>
      {children}
      {hint ? <span className="text-xs text-tenue">{hint}</span> : null}
    </label>
  );
}

const CONTROL =
  'w-full rounded-lg border border-linea bg-crema px-3 py-2 text-cafe placeholder:text-tenue ' +
  'transition focus:border-concha focus:outline-none';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'min-h-20 resize-y', className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, 'h-10', className)} {...props} />;
}

// ── Card ────────────────────────────────────────────────────
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-linea bg-crema shadow-sm', className)}>
      {children}
    </div>
  );
}

// ── Chip (etiqueta de estado) ───────────────────────────────
type Tone = 'concha' | 'costra' | 'exito' | 'alerta' | 'peligro' | 'neutral';
const TONES: Record<Tone, string> = {
  concha: 'bg-concha-tenue text-concha-hondo',
  costra: 'bg-costra-tenue text-costra',
  exito: 'bg-exito-tenue text-exito',
  alerta: 'bg-alerta-tenue text-alerta',
  peligro: 'bg-peligro-tenue text-peligro',
  neutral: 'bg-masa-hondo text-cafe-suave',
};

export function Chip({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── Spinner / estados ───────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-cafe">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-cafe-suave">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-linea bg-crema/60 px-6 py-14 text-center">
      <p className="font-medium text-cafe">{title}</p>
      {hint ? <p className="mt-1 text-sm text-tenue">{hint}</p> : null}
    </div>
  );
}

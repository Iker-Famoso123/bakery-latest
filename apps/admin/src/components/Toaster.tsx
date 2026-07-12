import { cn } from '../lib/cn';
import { useToastStore } from '../stores/toast';

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => remove(t.id)}
          className={cn(
            'anim-rise pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg',
            t.kind === 'ok' ? 'bg-exito text-white' : 'bg-peligro text-white',
          )}
        >
          <span aria-hidden>{t.kind === 'ok' ? '✓' : '!'}</span>
          {t.message}
        </button>
      ))}
    </div>
  );
}

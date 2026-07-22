import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/cn';
import { useToastStore } from '../stores/toast';

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
            onClick={() => remove(t.id)}
            className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full border border-linea bg-crema/95 py-2 pl-2 pr-4 text-sm font-medium text-cafe shadow-lg shadow-cafe/10 backdrop-blur"
          >
            <span
              aria-hidden
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white',
                t.kind === 'ok' ? 'bg-exito' : 'bg-peligro',
              )}
            >
              {t.kind === 'ok' ? '✓' : '!'}
            </span>
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

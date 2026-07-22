import { Dialog } from '@base-ui/react/dialog';
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useMediaQuery } from '../lib/useMediaQuery';
import { IconX } from './icons';

type Size = 'sm' | 'md' | 'lg';
const SIZES: Record<Size, string> = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
};

/** Spring principal: firme, con un rebote casi imperceptible (estilo iOS). */
const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 } as const;
/** Spring del sheet móvil: algo más suelto para que el deslizamiento se sienta físico. */
const SHEET_SPRING = { type: 'spring', stiffness: 340, damping: 32, mass: 0.9 } as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Título accesible del diálogo; se muestra en la cabecera. */
  title: string;
  children: ReactNode;
  size?: Size;
  /** Evita cerrar con clic fuera, Escape o arrastre (p. ej. mientras se sube algo). */
  locked?: boolean;
}

/**
 * Modal general del panel.
 *
 * - Escritorio: diálogo centrado que entra con un spring de escala.
 * - Móvil: bottom sheet con asa, arrastrable hacia abajo para cerrar.
 * - Base UI aporta focus trap, Escape, scroll-lock y aria-* correctos.
 *
 * Nota de implementación: el `Dialog.Root` vive y muere con `open` dentro de
 * un `AnimatePresence` (siempre con `open` interno en true). Así Motion es
 * dueño absoluto de entrada y salida y Base UI nunca oculta el popup antes
 * de que termine la animación de cierre.
 *
 * El cuerpo se compone libre: usa <ModalBody> para contenido con padding
 * y <ModalActions> para la fila de acciones al pie.
 */
export function Modal({ open, onClose, title, children, size = 'md', locked = false }: ModalProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (locked) return;
    if (info.offset.y > 90 || info.velocity.y > 600) onClose();
  }

  /** Sheet arrastrable solo en móvil y sin movilidad reducida. */
  const sheet = isMobile && !reduceMotion;

  const variants = reduceMotion
    ? {
        initial: { opacity: 0, ...(isMobile ? {} : { x: '-50%', y: '-50%' }) },
        animate: { opacity: 1, ...(isMobile ? {} : { x: '-50%', y: '-50%' }) },
        exit: { opacity: 0, ...(isMobile ? {} : { x: '-50%', y: '-50%' }) },
      }
    : isMobile
      ? {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
        }
      : {
          initial: { opacity: 0, scale: 0.96, x: '-50%', y: '-47%' },
          animate: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
          exit: { opacity: 0, scale: 0.97, x: '-50%', y: '-48%' },
        };

  return (
    <AnimatePresence>
      {open ? (
        <Dialog.Root
          key="modal"
          open
          onOpenChange={(next) => {
            if (!next && !locked) onClose();
          }}
        >
          <Dialog.Portal>
            <Dialog.Backdrop
              render={
                <motion.div
                  className="fixed inset-0 z-40 bg-cafe/45 backdrop-blur-[3px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                />
              }
            />
            <Dialog.Popup
              render={
                <motion.div
                  className={cn(
                    'z-50 flex flex-col bg-crema shadow-2xl shadow-cafe/20 outline-none',
                    isMobile
                      ? 'fixed inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl pb-[env(safe-area-inset-bottom)]'
                      : 'fixed left-1/2 top-1/2 max-h-[85dvh] w-[calc(100vw-2.5rem)] rounded-3xl',
                    !isMobile && SIZES[size],
                  )}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={isMobile ? SHEET_SPRING : SPRING}
                  drag={sheet ? 'y' : false}
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.55 }}
                  onDragEnd={handleDragEnd}
                />
              }
            >
              {sheet ? (
                <div
                  className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-2.5 active:cursor-grabbing"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <div className="h-1 w-9 rounded-full bg-linea" aria-hidden />
                </div>
              ) : null}

              <header
                className={cn(
                  'flex shrink-0 items-center justify-between gap-3 px-5',
                  sheet ? 'pb-3 pt-1' : 'border-b border-linea py-3.5',
                )}
              >
                <Dialog.Title className="m-0 font-sans text-base font-semibold text-cafe">
                  {title}
                </Dialog.Title>
                <Dialog.Close
                  aria-label="Cerrar"
                  disabled={locked}
                  className="rounded-full bg-masa-hondo p-1.5 text-cafe-suave transition-colors duration-200 hover:bg-linea hover:text-cafe disabled:opacity-40"
                >
                  <IconX className="size-4" />
                </Dialog.Close>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}
    </AnimatePresence>
  );
}

/** Contenido con padding estándar. */
export function ModalBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

/** Fila de acciones al pie del modal. */
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-1">{children}</div>;
}

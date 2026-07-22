import { useState } from 'react';
import { create } from 'zustand';
import { Button } from './ui';
import { Modal, ModalActions, ModalBody } from './Modal';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Acción destructiva: el botón principal se pinta en tono peligro. */
  danger?: boolean;
}

interface ConfirmState {
  current: (ConfirmOptions & { resolve: (ok: boolean) => void }) | null;
  open: (options: ConfirmOptions, resolve: (ok: boolean) => void) => void;
  settle: (ok: boolean) => void;
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  current: null,
  open: (options, resolve) => {
    // Si hubiera uno pendiente, se resuelve como cancelado.
    get().current?.resolve(false);
    set({ current: { ...options, resolve } });
  },
  settle: (ok) => {
    get().current?.resolve(ok);
    set({ current: null });
  },
}));

/**
 * Reemplazo de `window.confirm` con el Modal de la casa.
 *
 *   if (!(await confirm({ title: '¿Eliminar aviso?', danger: true }))) return;
 *
 * Requiere <ConfirmHost /> montado una sola vez (en App).
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.getState().open(options, resolve));
}

export function ConfirmHost() {
  const current = useConfirmStore((s) => s.current);
  const settle = useConfirmStore((s) => s.settle);
  // El último contenido se conserva durante la animación de salida.
  const [last, setLast] = useState<ConfirmOptions | null>(null);
  if (current && current !== last) setLast(current);
  const view = current ?? last;

  return (
    <Modal open={current !== null} onClose={() => settle(false)} title={view?.title ?? ''} size="sm">
      {view?.message ? (
        <ModalBody>
          <p className="m-0 text-sm leading-relaxed text-cafe-suave">{view.message}</p>
        </ModalBody>
      ) : (
        <div className="pt-1" />
      )}
      <ModalActions>
        <Button variant="ghost" onClick={() => settle(false)}>
          {view?.cancelLabel ?? 'Cancelar'}
        </Button>
        <Button variant={view?.danger ? 'danger' : 'primary'} onClick={() => settle(true)} autoFocus>
          {view?.confirmLabel ?? 'Confirmar'}
        </Button>
      </ModalActions>
    </Modal>
  );
}

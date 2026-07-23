import type { SocialLink } from '@rf/types';
import { findSocial, SOCIAL_NETWORKS, SocialIcon } from '@rf/ui';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { IconPlus, IconX } from '../../components/icons';
import { Modal, ModalActions, ModalBody } from '../../components/Modal';
import { Button, Field, Input } from '../../components/ui';

interface Fila extends SocialLink {
  key: number;
}

let seq = 0;

const ROW_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const;

/**
 * Editor de redes sociales: redes predeterminadas con su icono de marca
 * elegidas desde un picker (Modal de la casa), más la opción de una red
 * personalizada. `tipo` guarda el nombre legible ("Instagram"); el público
 * resuelve el icono con el mismo catálogo compartido de @rf/ui.
 */
export function SocialLinksEditor({
  initial,
  onChange,
}: {
  initial: SocialLink[];
  onChange: (redes: SocialLink[]) => void;
}) {
  const [filas, setFilas] = useState<Fila[]>(() =>
    initial.map((r) => ({ ...r, key: ++seq })),
  );
  const [picking, setPicking] = useState(false);
  const reduceMotion = useReducedMotion();
  const mounted = useRef(false);

  function commit(next: Fila[]) {
    setFilas(next);
    onChange(
      next
        .filter((f) => f.tipo.trim() && f.url.trim())
        .map(({ tipo, url }) => ({ tipo: tipo.trim(), url: url.trim() })),
    );
  }

  function add(tipo: string) {
    mounted.current = true;
    setPicking(false);
    commit([...filas, { key: ++seq, tipo, url: '' }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-cafe">Redes sociales</h2>
        <Button type="button" variant="secondary" size="sm" onClick={() => setPicking(true)}>
          <IconPlus className="size-4" /> Agregar red
        </Button>
      </div>

      {filas.length === 0 ? (
        <p className="text-sm text-tenue">Sin redes todavía.</p>
      ) : (
        <AnimatePresence initial={false}>
          {filas.map((fila) => {
            const network = findSocial(fila.tipo);
            return (
              <motion.div
                key={fila.key}
                layout={!reduceMotion && mounted.current}
                initial={
                  !reduceMotion && mounted.current ? { opacity: 0, y: -8, scale: 0.98 } : false
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, height: 0 }}
                transition={ROW_SPRING}
                className="flex items-center gap-3"
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-concha-tenue text-concha-hondo"
                  title={fila.tipo}
                >
                  <SocialIcon tipo={fila.tipo} size={16} />
                </span>
                <span className="w-24 shrink-0 truncate text-sm font-medium text-cafe">
                  {fila.tipo}
                </span>
                <Input
                  placeholder={network?.placeholder ?? 'https://…'}
                  type="url"
                  value={fila.url}
                  onChange={(e) =>
                    commit(filas.map((f) => (f.key === fila.key ? { ...f, url: e.target.value } : f)))
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    mounted.current = true;
                    commit(filas.filter((f) => f.key !== fila.key));
                  }}
                  className="rounded-lg p-2 text-cafe-suave transition-colors duration-200 hover:bg-peligro-tenue hover:text-peligro"
                  aria-label={`Quitar ${fila.tipo}`}
                >
                  <IconX className="size-5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      <SocialPicker
        open={picking}
        onClose={() => setPicking(false)}
        onPick={add}
        yaAgregadas={filas.map((f) => f.tipo)}
      />
    </div>
  );
}

function SocialPicker({
  open,
  onClose,
  onPick,
  yaAgregadas,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (tipo: string) => void;
  yaAgregadas: string[];
}) {
  const [custom, setCustom] = useState('');
  const agregadas = new Set(yaAgregadas.map((t) => t.toLowerCase()));

  function close() {
    setCustom('');
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="Agregar red social" size="sm">
      <ModalBody>
        <div className="grid grid-cols-2 gap-2">
          {SOCIAL_NETWORKS.map((n) => {
            const dupe = agregadas.has(n.id.toLowerCase());
            return (
              <button
                key={n.id}
                type="button"
                disabled={dupe}
                onClick={() => {
                  setCustom('');
                  onPick(n.id);
                }}
                className="flex items-center gap-2.5 rounded-xl border border-linea bg-masa/60 px-3 py-2.5 text-sm font-medium text-cafe transition-[background-color,border-color,transform] duration-200 [transition-timing-function:var(--ease-out-soft)] hover:border-concha hover:bg-concha-tenue active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 motion-reduce:active:scale-100"
              >
                <SocialIcon tipo={n.id} size={17} className="shrink-0 text-cafe-suave" />
                {n.label}
              </button>
            );
          })}
        </div>

        <form
          className="mt-4 border-t border-linea pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const tipo = custom.trim();
            if (tipo) {
              onPick(tipo);
              setCustom('');
            }
          }}
        >
          <Field label="Otra red" hint="Se mostrará con un icono de enlace genérico.">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre, p. ej. Telegram"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
              <Button type="submit" variant="secondary" disabled={!custom.trim()}>
                Agregar
              </Button>
            </div>
          </Field>
        </form>
      </ModalBody>
      <ModalActions>
        <Button type="button" variant="ghost" onClick={close}>
          Cancelar
        </Button>
      </ModalActions>
    </Modal>
  );
}

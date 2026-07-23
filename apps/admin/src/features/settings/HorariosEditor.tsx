import type { Horario } from '@rf/types';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { IconPlus, IconX } from '../../components/icons';
import { Button, Input } from '../../components/ui';
import { cn } from '../../lib/cn';
import { DIAS_CORTOS, formatDias, parseDias, type SeleccionDias } from './horario-dias';

interface Fila {
  key: number;
  sel: SeleccionDias;
  /** Texto que ve el público; se regenera al tocar los chips. */
  dia: string;
  apertura: string;
  cierre: string;
}

let seq = 0;

function filaDesdeHorario(h: Horario): Fila {
  return {
    key: ++seq,
    sel: parseDias(h.dia) ?? Array<boolean>(7).fill(false),
    dia: h.dia,
    apertura: h.apertura,
    cierre: h.cierre,
  };
}

const ROW_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const;

/**
 * Editor flexible de horarios: cada fila es un conjunto de días (chips
 * estilo iOS) más un rango de horas. `Horario.dia` se serializa como texto
 * legible ("Lunes a Viernes"); los textos legacy que no se pueden parsear
 * se conservan hasta que el usuario toque los chips.
 */
export function HorariosEditor({
  initial,
  onChange,
}: {
  initial: Horario[];
  onChange: (horarios: Horario[]) => void;
}) {
  const [filas, setFilas] = useState<Fila[]>(() => initial.map(filaDesdeHorario));
  const reduceMotion = useReducedMotion();
  // Evita animar la carga inicial; solo altas/bajas posteriores.
  const mounted = useRef(false);

  function commit(next: Fila[]) {
    setFilas(next);
    onChange(
      next
        .filter((f) => f.dia.trim())
        .map(({ dia, apertura, cierre }) => ({ dia: dia.trim(), apertura, cierre })),
    );
  }

  function update(key: number, patch: Partial<Fila>) {
    commit(filas.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  function toggleDia(fila: Fila, i: number) {
    const sel = fila.sel.map((on, j) => (j === i ? !on : on));
    update(fila.key, { sel, dia: formatDias(sel) });
  }

  function add() {
    mounted.current = true;
    commit([
      ...filas,
      { key: ++seq, sel: Array<boolean>(7).fill(false), dia: '', apertura: '08:00', cierre: '20:00' },
    ]);
  }

  function remove(key: number) {
    mounted.current = true;
    commit(filas.filter((f) => f.key !== key));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-cafe">Horarios</h2>
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          <IconPlus className="size-4" /> Agregar horario
        </Button>
      </div>

      {filas.length === 0 ? (
        <p className="text-sm text-tenue">
          Sin horarios todavía. Agrega uno y elige los días que aplica.
        </p>
      ) : (
        <AnimatePresence initial={false}>
          {filas.map((fila) => (
            <motion.div
              key={fila.key}
              layout={!reduceMotion && mounted.current}
              initial={
                !reduceMotion && mounted.current ? { opacity: 0, y: -8, scale: 0.98 } : false
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, height: 0, marginTop: -12 }}
              transition={ROW_SPRING}
              className="rounded-xl border border-linea bg-masa/60 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {DIAS_CORTOS.map((corto, i) => (
                    <button
                      key={corto}
                      type="button"
                      aria-pressed={fila.sel[i]}
                      onClick={() => toggleDia(fila, i)}
                      className={cn(
                        'size-9 rounded-full text-xs font-semibold',
                        'transition-[background-color,color,transform] duration-200 [transition-timing-function:var(--ease-out-soft)]',
                        'active:scale-90 motion-reduce:active:scale-100',
                        fila.sel[i]
                          ? 'bg-concha text-white shadow-sm'
                          : 'bg-masa-hondo text-cafe-suave hover:bg-linea hover:text-cafe',
                      )}
                    >
                      {corto}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => remove(fila.key)}
                  className="rounded-lg p-2 text-cafe-suave transition-colors duration-200 hover:bg-peligro-tenue hover:text-peligro"
                  aria-label="Quitar horario"
                >
                  <IconX className="size-5" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    className="w-28"
                    value={fila.apertura}
                    onChange={(e) => update(fila.key, { apertura: e.target.value })}
                    aria-label="Apertura"
                  />
                  <span className="text-tenue">–</span>
                  <Input
                    type="time"
                    className="w-28"
                    value={fila.cierre}
                    onChange={(e) => update(fila.key, { cierre: e.target.value })}
                    aria-label="Cierre"
                  />
                </div>
                <p className="text-sm text-tenue">
                  {fila.dia ? (
                    <>
                      Se mostrará: <span className="font-medium text-cafe-suave">{fila.dia}</span>
                    </>
                  ) : (
                    'Elige los días'
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

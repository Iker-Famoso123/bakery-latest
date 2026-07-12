import type { ReactNode } from 'react';
import { IconCalendar, IconInfinity } from '../../components/icons';
import { Field, Input } from '../../components/ui';
import { cn } from '../../lib/cn';

export type Vigencia = 'fijo' | 'temporal';

interface Props {
  publishAt: string;
  onPublishAt: (v: string) => void;
  mode: Vigencia;
  onMode: (v: Vigencia) => void;
  expiresAt: string;
  onExpiresAt: (v: string) => void;
}

/**
 * Control de vigencia — la firma del panel. Un aviso puede ser "fijo"
 * (permanente) o "temporal" (con fecha de caducidad), como una etiqueta de
 * mostrador que se queda o se retira.
 */
export function VigenciaField({
  publishAt,
  onPublishAt,
  mode,
  onMode,
  expiresAt,
  onExpiresAt,
}: Props) {
  return (
    <div className="rounded-2xl border border-linea bg-masa-hondo/40 p-4">
      <p className="mb-3 text-sm font-semibold text-cafe">Vigencia del aviso</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Se publica">
          <Input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => onPublishAt(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cafe">Duración</span>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-linea bg-crema p-1">
            <ModeButton active={mode === 'fijo'} onClick={() => onMode('fijo')}>
              <IconInfinity className="size-4" /> Fijo
            </ModeButton>
            <ModeButton active={mode === 'temporal'} onClick={() => onMode('temporal')}>
              <IconCalendar className="size-4" /> Temporal
            </ModeButton>
          </div>
        </div>
      </div>

      {mode === 'temporal' ? (
        <div className="mt-3">
          <Field label="Se retira" hint="Después de esta fecha deja de mostrarse en el sitio.">
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => onExpiresAt(e.target.value)}
              required
            />
          </Field>
        </div>
      ) : (
        <p className="mt-3 text-xs text-tenue">
          El aviso permanece publicado hasta que lo retires manualmente.
        </p>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition',
        active ? 'bg-concha text-white shadow-sm' : 'text-cafe-suave hover:bg-masa-hondo',
      )}
    >
      {children}
    </button>
  );
}

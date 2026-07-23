import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { Button, Input, Spinner } from '../../components/ui';
import { ApiError, apiPost } from '../../lib/api';
import { toast } from '../../stores/toast';
import { embedUrl, esEnlaceCorto, mapsLink, parseMapsInput, type Coords } from './maps-url';

/**
 * Ubicación sin capturar lat/lng a mano: se pega lo que Google Maps te da
 * (enlace de Compartir, URL del navegador o coordenadas copiadas) y el pin
 * se confirma visualmente en un mapa embebido.
 */
export function UbicacionEditor({
  initial,
  onChange,
}: {
  initial: Coords | null;
  onChange: (coords: Coords | null) => void;
}) {
  const [coords, setCoords] = useState<Coords | null>(initial);
  const [texto, setTexto] = useState('');
  const [resolviendo, setResolviendo] = useState(false);
  const reduceMotion = useReducedMotion();

  function set(next: Coords | null) {
    setCoords(next);
    onChange(next);
  }

  async function usar() {
    let entrada = texto.trim();
    if (!entrada || resolviendo) return;

    try {
      if (esEnlaceCorto(entrada)) {
        setResolviendo(true);
        const { url } = await apiPost<{ url: string }>('/settings/maps-url', { url: entrada });
        entrada = url;
      }
      const parsed = parseMapsInput(entrada);
      if (!parsed) {
        toast.error('No encontré coordenadas en ese enlace; copia el enlace desde Google Maps');
        return;
      }
      set(parsed);
      setTexto('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo leer el enlace');
    } finally {
      setResolviendo(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-cafe">Ubicación</span>
        <p className="text-xs text-tenue">
          En Google Maps busca tu negocio → Compartir → Copiar enlace, y pégalo aquí. También
          sirven la URL del navegador o unas coordenadas copiadas.
        </p>
      </div>

      {/* Sin <form>: este editor vive dentro del form de ajustes y los forms
          anidados disparan el submit nativo del exterior (recarga la página). */}
      <div className="flex flex-wrap gap-2">
        <Input
          className="min-w-52 flex-1"
          placeholder="https://maps.app.goo.gl/…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // Enter aquí no debe guardar todos los ajustes
              void usar();
            }
          }}
          disabled={resolviendo}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => void usar()}
          disabled={!texto.trim() || resolviendo}
        >
          {resolviendo ? (
            <>
              <Spinner /> Leyendo…
            </>
          ) : coords ? (
            'Reemplazar'
          ) : (
            'Usar ubicación'
          )}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {coords ? (
          <motion.div
            key="preview"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="overflow-hidden rounded-xl border border-linea"
          >
            <iframe
              title="Vista previa de la ubicación"
              src={embedUrl(coords)}
              className="block h-56 w-full border-0 sm:h-64"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linea bg-masa/60 px-3 py-2">
              <p className="text-xs tabular-nums text-tenue">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
              <div className="flex items-center gap-1">
                <a
                  href={mapsLink(coords)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-concha-hondo transition-colors duration-200 hover:bg-concha-tenue"
                >
                  Abrir en Google Maps
                </a>
                <button
                  type="button"
                  onClick={() => set(null)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-cafe-suave transition-colors duration-200 hover:bg-peligro-tenue hover:text-peligro"
                >
                  Quitar
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-dashed border-linea px-4 py-6 text-center text-sm text-tenue"
          >
            Sin ubicación todavía. El botón "Ver en el mapa" del sitio público aparece al definirla.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

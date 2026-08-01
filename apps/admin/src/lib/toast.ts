import { toast as sonner } from 'sonner';

interface ToastOptions {
  /** Segunda línea, en tinta atenuada. Para el detalle que no cabe en el título. */
  description?: string;
  /** Milisegundos en pantalla. Por defecto 4000 (8000 en errores). */
  duration?: number;
}

/**
 * Fachada sobre Sonner: el resto de la app solo conoce `toast.ok` / `toast.error`,
 * así el motor de avisos se puede cambiar sin tocar los ~20 puntos de llamada.
 * El estilo vive en `components/Toaster.tsx`.
 */
export const toast = {
  ok: (message: string, opts?: ToastOptions) => sonner.success(message, opts),
  error: (message: string, opts?: ToastOptions) =>
    sonner.error(message, { duration: 8000, ...opts }),
  info: (message: string, opts?: ToastOptions) => sonner.message(message, opts),
  /** Aviso persistente con spinner; se cierra devolviendo su id a `dismiss`. */
  loading: (message: string, opts?: ToastOptions) => sonner.loading(message, opts),
  dismiss: (id?: number | string) => sonner.dismiss(id),
};

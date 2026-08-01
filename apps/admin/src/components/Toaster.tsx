import { Toaster as SonnerToaster } from 'sonner';
import { IconAlerta, IconCheck } from './icons';
import { Spinner } from './ui';

/** Insignia circular del icono, en el color semántico del aviso. */
function Badge({ tone, children }: { tone: 'exito' | 'peligro'; children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className={`grid size-6 shrink-0 place-items-center rounded-full text-white ${
        tone === 'exito' ? 'bg-exito' : 'bg-peligro'
      }`}
    >
      {children}
    </span>
  );
}

/**
 * Avisos del panel, sobre Sonner: apilado con profundidad, se expanden al pasar
 * el cursor y se descartan arrastrando. El estilo es propio (`unstyled`) para
 * respetar la paleta "Pan dulce" y las curvas de `index.css`.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      offset={{ bottom: '24px' }}
      mobileOffset={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))', left: '16px', right: '16px' }}
      gap={10}
      duration={4000}
      visibleToasts={4}
      closeButton={false}
      icons={{
        success: (
          <Badge tone="exito">
            <IconCheck className="size-3.5" />
          </Badge>
        ),
        error: (
          <Badge tone="peligro">
            <IconAlerta className="size-3.5" />
          </Badge>
        ),
        loading: <Spinner className="size-5 shrink-0 text-concha" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group flex w-full items-center gap-3 rounded-2xl border border-linea bg-crema/95 px-3.5 py-3 shadow-[0_10px_30px_-12px_rgb(59_42_36_/_0.35)] backdrop-blur-xl',
          content: 'flex min-w-0 flex-col gap-0.5',
          title: 'text-sm font-medium leading-snug text-cafe',
          description: 'text-[0.8125rem] leading-snug text-cafe-suave',
          actionButton:
            'ml-auto shrink-0 rounded-full bg-cafe px-3 py-1 text-xs font-semibold text-masa',
        },
      }}
    />
  );
}

import {
  siFacebook,
  siInstagram,
  siPinterest,
  siThreads,
  siTiktok,
  siWhatsapp,
  siX,
  siYoutube,
} from 'simple-icons';

export interface SocialNetwork {
  /** Valor guardado en `SocialLink.tipo` (legible, p. ej. "Instagram"). */
  id: string;
  label: string;
  /** Path SVG (viewBox 0 0 24 24) de simple-icons. */
  path: string;
  /** Prefijo sugerido para el campo de URL del panel. */
  placeholder: string;
}

/** Catálogo de redes predeterminadas del panel; el orden es el del picker. */
export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { id: 'Instagram', label: 'Instagram', path: siInstagram.path, placeholder: 'https://instagram.com/…' },
  { id: 'Facebook', label: 'Facebook', path: siFacebook.path, placeholder: 'https://facebook.com/…' },
  { id: 'TikTok', label: 'TikTok', path: siTiktok.path, placeholder: 'https://tiktok.com/@…' },
  { id: 'WhatsApp', label: 'WhatsApp', path: siWhatsapp.path, placeholder: 'https://wa.me/…' },
  { id: 'YouTube', label: 'YouTube', path: siYoutube.path, placeholder: 'https://youtube.com/@…' },
  { id: 'X', label: 'X', path: siX.path, placeholder: 'https://x.com/…' },
  { id: 'Threads', label: 'Threads', path: siThreads.path, placeholder: 'https://threads.net/@…' },
  { id: 'Pinterest', label: 'Pinterest', path: siPinterest.path, placeholder: 'https://pinterest.com/…' },
];

/** Busca una red por `tipo` (tolerante a mayúsculas y espacios). */
export function findSocial(tipo: string): SocialNetwork | undefined {
  const t = tipo.trim().toLowerCase();
  return SOCIAL_NETWORKS.find((n) => n.id.toLowerCase() === t || n.label.toLowerCase() === t);
}

/**
 * Icono de red social (monocromo, hereda `currentColor`).
 * Para tipos fuera del catálogo pinta un enlace genérico.
 */
export function SocialIcon({
  tipo,
  size = 16,
  className,
}: {
  tipo: string;
  size?: number;
  className?: string;
}) {
  const network = findSocial(tipo);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {network ? (
        <path d={network.path} />
      ) : (
        /* Enlace genérico (cadena) para redes personalizadas */
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        />
      )}
    </svg>
  );
}

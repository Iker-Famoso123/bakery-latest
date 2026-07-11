import { DateTime } from 'luxon';

/**
 * Zona horaria de la panadería. Las fechas SOLO se convierten a esta zona
 * al momento de PRESENTAR; en la DB y en la API viajan como ISO 8601 en UTC.
 */
export const MEXICO_TZ = 'America/Mexico_City';

/**
 * Instante actual en UTC. Única fuente de "now" en todo el stack.
 * NUNCA usar `new Date()` / `Date.now()` — siempre pasar por aquí.
 */
export function now(): DateTime {
  return DateTime.utc();
}

/** `now()` serializado como ISO 8601 en UTC (para cruzar la API). */
export function nowISO(): string {
  return now().toISO()!;
}

/** Parsea un ISO 8601 (asumido UTC) a un `DateTime` en UTC. */
export function fromISO(iso: string): DateTime {
  return DateTime.fromISO(iso, { zone: 'utc' });
}

/** Convierte un ISO 8601 UTC a la zona de la panadería. Solo para PRESENTAR. */
export function toMexico(iso: string): DateTime {
  return fromISO(iso).setZone(MEXICO_TZ);
}

/**
 * Predicado de vigencia de un post. Refleja EXACTAMENTE el filtro que la API
 * aplica en SQL para el portal público:
 *   status = PUBLISHED AND publishAt <= now AND (expiresAt IS NULL OR expiresAt > now)
 *
 * En la API el filtro va en la query (índice compuesto). Este helper existe
 * para el PREVIEW del panel de admin, donde no hay round-trip a la DB.
 */
export function isPostVisible(
  post: {
    status: 'DRAFT' | 'PUBLISHED';
    publishAt: string;
    expiresAt: string | null;
  },
  at: DateTime = now(),
): boolean {
  if (post.status !== 'PUBLISHED') return false;
  if (fromISO(post.publishAt) > at) return false;
  if (post.expiresAt !== null && fromISO(post.expiresAt) <= at) return false;
  return true;
}

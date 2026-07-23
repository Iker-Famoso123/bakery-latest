/**
 * Extracción de coordenadas desde lo que sea que el usuario copie de
 * Google Maps: URL larga, coordenadas sueltas, o enlace corto (este último
 * se expande primero vía la API).
 */

export interface Coords {
  lat: number;
  lng: number;
}

const enRango = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/** ¿Es un enlace corto que hay que expandir en el servidor? */
export function esEnlaceCorto(texto: string): boolean {
  try {
    const url = new URL(texto.trim());
    return /^(maps\.app\.goo\.gl|goo\.gl|app\.goo\.gl|g\.co)$/.test(url.hostname);
  } catch {
    return false;
  }
}

const DECIMAL = String.raw`(-?\d{1,3}(?:\.\d+)?)`;

/** Patrones en orden de precisión (el pin del lugar antes que el centro del mapa). */
const PATRONES: RegExp[] = [
  // …data=!3d20.6597!4d-103.3496 → coordenadas exactas del pin
  new RegExp(String.raw`!3d${DECIMAL}!4d${DECIMAL}`),
  // maps?q=20.6597,-103.3496 | ?query= | ?ll= | ?destination=
  new RegExp(String.raw`[?&](?:q|query|ll|destination)=${DECIMAL}(?:,|%2C)\s*${DECIMAL}`, 'i'),
  // /maps/@20.6597,-103.3496,17z → centro del viewport
  new RegExp(String.raw`@${DECIMAL},${DECIMAL}`),
  // "20.6597, -103.3496" pegado tal cual (clic derecho en Maps → copiar coords)
  new RegExp(String.raw`^\s*${DECIMAL}\s*,\s*${DECIMAL}\s*$`),
];

/** Intenta extraer coordenadas del texto. Null si no hay nada usable. */
export function parseMapsInput(texto: string): Coords | null {
  const t = decodeURIComponent(texto.trim());
  for (const patron of PATRONES) {
    const m = t.match(patron);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (enRango(lat, lng)) return { lat, lng };
    }
  }
  return null;
}

/** URL del iframe de vista previa (embed keyless de Google Maps). */
export function embedUrl({ lat, lng }: Coords): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}

/** Enlace normal para abrir la ubicación en Google Maps. */
export function mapsLink({ lat, lng }: Coords): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

import { toMexico } from '@rf/types';

/** ISO UTC → "12 de julio de 2026" en hora de México. */
export function formatDate(iso: string): string {
  return toMexico(iso).setLocale('es').toFormat("d 'de' LLLL yyyy");
}

/** Enlace a Google Maps a partir de coordenadas. */
export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Normaliza un número a un enlace de WhatsApp (solo dígitos). */
export function whatsappLink(numero: string): string {
  const digits = numero.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

import { MEXICO_TZ, now } from '@rf/types';
import { DateTime } from 'luxon';

const INPUT_FMT = "yyyy-MM-dd'T'HH:mm";

/** ISO UTC → valor para <input type="datetime-local"> en hora de México. */
export function isoToLocalInput(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).setZone(MEXICO_TZ).toFormat(INPUT_FMT);
}

/** Valor de <input datetime-local> (hora de México) → ISO 8601 UTC. */
export function localInputToISO(local: string): string {
  return DateTime.fromFormat(local, INPUT_FMT, { zone: MEXICO_TZ }).toUTC().toISO()!;
}

/** Momento actual como valor de input, en hora de México. */
export function nowLocalInput(): string {
  return now().setZone(MEXICO_TZ).toFormat(INPUT_FMT);
}

/** ISO UTC → "12 de jul 2026, 14:30" en hora de México. */
export function formatDateTime(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' })
    .setZone(MEXICO_TZ)
    .setLocale('es')
    .toFormat("d 'de' LLL yyyy, HH:mm");
}

/** ISO UTC → "12 de julio de 2026" en hora de México. */
export function formatDate(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' })
    .setZone(MEXICO_TZ)
    .setLocale('es')
    .toFormat("d 'de' LLLL yyyy");
}

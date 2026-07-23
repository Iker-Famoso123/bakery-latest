/**
 * Días de la semana como selección flexible.
 *
 * El modelo público (`Horario.dia`) es un texto legible ("Lunes a Viernes")
 * porque así se muestra tal cual en el sitio. El editor trabaja con una
 * selección booleana de 7 días y estas funciones convierten en ambos
 * sentidos; el parse tolera textos escritos a mano (legacy).
 */

export const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'] as const;

export type SeleccionDias = boolean[]; // length 7, índice 0 = Lunes

const normaliza = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

const NOMBRES = DIAS.map(normaliza);

/** Convierte la selección en el texto que ve el público. */
export function formatDias(sel: SeleccionDias): string {
  const idx = sel.flatMap((on, i) => (on ? [i] : []));
  if (idx.length === 0) return '';
  if (idx.length === 7) return 'Todos los días';

  // Corridas consecutivas: 3+ días se compactan como rango "A a B".
  const runs: Array<[number, number]> = [];
  for (const i of idx) {
    const last = runs[runs.length - 1];
    if (last && i === last[1] + 1) last[1] = i;
    else runs.push([i, i]);
  }
  const parts = runs.flatMap(([a, b]) =>
    b - a >= 2 ? [`${DIAS[a]} a ${DIAS[b]}`] : DIAS.slice(a, b + 1),
  );
  if (parts.length === 1) return parts[0]!;
  return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;
}

/**
 * Intenta reconstruir la selección desde un texto.
 * Devuelve null si algún fragmento no se reconoce (texto libre legacy).
 */
export function parseDias(texto: string): SeleccionDias | null {
  const t = normaliza(texto);
  const vacio = () => Array<boolean>(7).fill(false);
  if (!t) return vacio();
  if (t.includes('todos los dias') || t === 'diario') return Array<boolean>(7).fill(true);

  const sel = vacio();
  // Fragmentos separados por comas o "y"
  const tokens = t
    .split(/,|\sy\s/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (tokens.length === 0) return null;

  for (const token of tokens) {
    const rango = token.match(/^([a-z]+)\s+a\s+([a-z]+)$/);
    if (rango) {
      const a = NOMBRES.indexOf(rango[1]!);
      const b = NOMBRES.indexOf(rango[2]!);
      if (a === -1 || b === -1 || b < a) return null;
      for (let i = a; i <= b; i++) sel[i] = true;
      continue;
    }
    const dia = NOMBRES.indexOf(token);
    if (dia === -1) return null;
    sel[dia] = true;
  }
  return sel;
}

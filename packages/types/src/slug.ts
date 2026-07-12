/**
 * Convierte un texto en un slug apto para URL: minúsculas, sin acentos,
 * separado por guiones. Compartido para que el admin pueda previsualizar
 * el slug idéntico a como lo generará el backend.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // quita acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

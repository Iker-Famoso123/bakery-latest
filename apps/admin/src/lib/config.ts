// Base de la API.
// - Dev: queda relativa ('/api') y Vite la proxya al backend (localhost:3000).
// - Producción: se define VITE_API_URL en el build (p. ej.
//   https://api.reposteriafamoso.com) y las peticiones van a ese origen.
export const API_BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

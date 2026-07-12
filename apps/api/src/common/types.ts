import type { Role } from '@rf/types';

/** Usuario ya autenticado que la estrategia JWT adjunta a la request. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/** Contenido del access token JWT. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

import { SetMetadata } from '@nestjs/common';
import type { Role } from '@rf/types';

export const ROLES_KEY = 'roles';

/** Restringe un endpoint a ciertos roles. Ej: `@Roles('admin')`. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

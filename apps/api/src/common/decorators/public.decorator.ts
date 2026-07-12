import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público (sin autenticación). Por defecto TODA la API
 * exige JWT gracias al guard global; este decorador es la excepción explícita.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

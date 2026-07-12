import type { Post, Product, Settings, User } from '@prisma/client';
import type {
  Horario,
  PostDto,
  ProductDetails,
  ProductDto,
  ProductImage,
  SettingsDto,
  SocialLink,
  TiptapDoc,
  UserDto,
} from '@rf/types';
import { DateTime } from 'luxon';

/**
 * Frontera de fechas: Prisma devuelve objetos `Date` de la DB. Aquí —y solo
 * aquí— los convertimos a ISO 8601 UTC para que crucen la API como texto.
 * El resto del código trabaja con Luxon; nunca con `Date`.
 */
export function iso(d: Date): string {
  return DateTime.fromJSDate(d, { zone: 'utc' }).toISO()!;
}

export function toPostDto(p: Post): PostDto {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    body: p.body as unknown as TiptapDoc,
    coverImage: p.coverImage,
    status: p.status,
    publishAt: iso(p.publishAt),
    expiresAt: p.expiresAt ? iso(p.expiresAt) : null,
    pinned: p.pinned,
    categoryId: p.categoryId,
    authorId: p.authorId,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  };
}

export function toProductDto(p: Product): ProductDto {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    images: (p.images as unknown as ProductImage[]) ?? [],
    details: (p.details as unknown as ProductDetails) ?? {},
    categoryId: p.categoryId,
    position: p.position,
    active: p.active,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  };
}

export function toUserDto(u: User): UserDto {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    createdAt: iso(u.createdAt),
    updatedAt: iso(u.updatedAt),
  };
}

export function toSettingsDto(s: Settings): SettingsDto {
  return {
    whatsapp: s.whatsapp,
    telefono: s.telefono,
    direccion: s.direccion,
    lat: s.lat,
    lng: s.lng,
    redes: (s.redes as unknown as SocialLink[]) ?? [],
    horarios: (s.horarios as unknown as Horario[]) ?? [],
    updatedAt: iso(s.updatedAt),
  };
}

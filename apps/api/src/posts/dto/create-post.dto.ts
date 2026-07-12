import { PostStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(2)
  title!: string;

  /** Opcional: si no se envía, se deriva del título. */
  @IsOptional()
  @IsString()
  slug?: string;

  /** Documento de TipTap (ProseMirror JSON). */
  @IsObject()
  body!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  coverImage?: string | null;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  /** ISO 8601 UTC. */
  @IsISO8601()
  publishAt!: string;

  /** ISO 8601 UTC, o null/ausente = permanente. */
  @IsOptional()
  @IsISO8601()
  expiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string | null;
}

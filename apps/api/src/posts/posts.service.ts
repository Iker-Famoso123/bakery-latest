import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Paginated, PostDto } from '@rf/types';
import { nowISO, slugify } from '@rf/types';
import { toPostDto } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Público ──────────────────────────────────────────────

  async findManyPublic(query: QueryPostsDto): Promise<Paginated<PostDto>> {
    const { page, limit, skip } = this.paginate(query);
    const where: Prisma.PostWhereInput = {
      ...this.visibleWhere(),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { publishAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items: items.map(toPostDto), total, page, limit };
  }

  async findOnePublicBySlug(slug: string): Promise<PostDto> {
    const post = await this.prisma.post.findFirst({
      where: { slug, ...this.visibleWhere() },
    });
    if (!post) throw new NotFoundException('Post no encontrado');
    return toPostDto(post);
  }

  // ── Admin ────────────────────────────────────────────────

  async findManyAdmin(query: QueryPostsDto): Promise<Paginated<PostDto>> {
    const { page, limit, skip } = this.paginate(query);
    const where: Prisma.PostWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items: items.map(toPostDto), total, page, limit };
  }

  async findOneAdmin(id: string): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post no encontrado');
    return toPostDto(post);
  }

  async create(dto: CreatePostDto, authorId: string): Promise<PostDto> {
    const slug = await this.uniqueSlug(dto.slug ?? dto.title);
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        slug,
        body: dto.body as Prisma.InputJsonValue,
        coverImage: dto.coverImage ?? null,
        status: dto.status ?? 'DRAFT',
        publishAt: dto.publishAt,
        expiresAt: dto.expiresAt ?? null,
        pinned: dto.pinned ?? false,
        categoryId: dto.categoryId ?? null,
        authorId,
      },
    });
    return toPostDto(post);
  }

  async update(id: string, dto: UpdatePostDto): Promise<PostDto> {
    const data: Prisma.PostUncheckedUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    // El slug solo cambia si se envía explícitamente (cambiarlo rompe URLs).
    if (dto.slug !== undefined) data.slug = await this.uniqueSlug(dto.slug, id);
    if (dto.body !== undefined) data.body = dto.body as Prisma.InputJsonValue;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.publishAt !== undefined) data.publishAt = dto.publishAt;
    if (dto.expiresAt !== undefined) data.expiresAt = dto.expiresAt;
    if (dto.pinned !== undefined) data.pinned = dto.pinned;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;

    try {
      const post = await this.prisma.post.update({ where: { id }, data });
      return toPostDto(post);
    } catch (err) {
      throw this.notFoundIfMissing(err);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.post.delete({ where: { id } });
    } catch (err) {
      throw this.notFoundIfMissing(err);
    }
  }

  // ── Internos ─────────────────────────────────────────────

  /** Filtro de vigencia del portal público (mismo criterio que `isPostVisible`). */
  private visibleWhere(): Prisma.PostWhereInput {
    const at = nowISO();
    return {
      status: 'PUBLISHED',
      publishAt: { lte: at },
      OR: [{ expiresAt: null }, { expiresAt: { gt: at } }],
    };
  }

  private paginate(query: QueryPostsDto): { page: number; limit: number; skip: number } {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    return { page, limit, skip: (page - 1) * limit };
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || 'post';
    let candidate = root;
    let n = 1;
    // Añade sufijo -2, -3… hasta encontrar uno libre.
    for (;;) {
      const existing = await this.prisma.post.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) return candidate;
      n += 1;
      candidate = `${root}-${n}`;
    }
  }

  private notFoundIfMissing(err: unknown): Error {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return new NotFoundException('Post no encontrado');
    }
    return err as Error;
  }
}

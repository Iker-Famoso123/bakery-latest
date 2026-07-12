import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ProductDto } from '@rf/types';
import { slugify } from '@rf/types';
import { toProductDto } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Público ──────────────────────────────────────────────

  async findManyPublic(categoryId?: string): Promise<ProductDto[]> {
    const products = await this.prisma.product.findMany({
      where: { active: true, ...(categoryId ? { categoryId } : {}) },
      orderBy: { position: 'asc' },
    });
    return products.map(toProductDto);
  }

  async findOnePublicBySlug(slug: string): Promise<ProductDto> {
    const product = await this.prisma.product.findFirst({ where: { slug, active: true } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return toProductDto(product);
  }

  // ── Admin ────────────────────────────────────────────────

  async findAllAdmin(): Promise<ProductDto[]> {
    const products = await this.prisma.product.findMany({ orderBy: { position: 'asc' } });
    return products.map(toProductDto);
  }

  async findOneAdmin(id: string): Promise<ProductDto> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return toProductDto(product);
  }

  async create(dto: CreateProductDto): Promise<ProductDto> {
    const slug = await this.uniqueSlug(dto.slug ?? dto.name);
    const position = dto.position ?? (await this.nextPosition());
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        images: (dto.images ?? []) as Prisma.InputJsonValue,
        details: (dto.details ?? {}) as Prisma.InputJsonValue,
        categoryId: dto.categoryId ?? null,
        position,
        active: dto.active ?? true,
      },
    });
    return toProductDto(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const data: Prisma.ProductUncheckedUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = await this.uniqueSlug(dto.slug, id);
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.images !== undefined) data.images = dto.images as Prisma.InputJsonValue;
    if (dto.details !== undefined) data.details = dto.details as Prisma.InputJsonValue;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.active !== undefined) data.active = dto.active;

    try {
      const product = await this.prisma.product.update({ where: { id }, data });
      return toProductDto(product);
    } catch (err) {
      throw this.notFoundIfMissing(err);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (err) {
      throw this.notFoundIfMissing(err);
    }
  }

  /** Reasigna `position` según el orden recibido, en una sola transacción. */
  async reorder(ids: string[]): Promise<ProductDto[]> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.product.update({ where: { id }, data: { position: index } }),
      ),
    );
    return this.findAllAdmin();
  }

  // ── Internos ─────────────────────────────────────────────

  private async nextPosition(): Promise<number> {
    const agg = await this.prisma.product.aggregate({ _max: { position: true } });
    return (agg._max.position ?? -1) + 1;
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || 'pan';
    let candidate = root;
    let n = 1;
    for (;;) {
      const existing = await this.prisma.product.findUnique({ where: { slug: candidate } });
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
      return new NotFoundException('Producto no encontrado');
    }
    return err as Error;
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import type { ProductDto } from '@rf/types';
import { Public } from '../common/decorators/public.decorator';
import { ProductsService } from './products.service';

/** Menú público de panes: solo activos, en el orden configurado. */
@Public()
@Controller('public/products')
export class PublicProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query('categoryId') categoryId?: string): Promise<ProductDto[]> {
    return this.products.findManyPublic(categoryId);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<ProductDto> {
    return this.products.findOnePublicBySlug(slug);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { ProductDto } from '@rf/types';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

/** Administración del menú de panes. */
@Roles('admin', 'editor')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(): Promise<ProductDto[]> {
    return this.products.findAllAdmin();
  }

  // Debe declararse antes de `:id` para no ser capturado como un id.
  @Patch('reorder')
  reorder(@Body() dto: ReorderDto): Promise<ProductDto[]> {
    return this.products.reorder(dto.ids);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<ProductDto> {
    return this.products.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this.products.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.products.remove(id);
  }
}

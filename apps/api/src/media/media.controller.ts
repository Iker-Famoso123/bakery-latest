import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ProductImage } from '@rf/types';
import { Roles } from '../common/decorators/roles.decorator';
import { UploadImageDto } from './dto/upload-image.dto';
import { MediaService, type CropArea } from './media.service';

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

@Roles('admin', 'editor')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_BYTES } }))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadImageDto,
  ): Promise<ProductImage> {
    if (!file) throw new BadRequestException('Falta el archivo de imagen');
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }
    const crop = this.parseCrop(body.crop);
    return this.media.processAndUpload(file.buffer, crop, body.folder);
  }

  private parseCrop(raw: string): CropArea {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestException('El campo "crop" no es un JSON válido');
    }
    const c = parsed as Partial<CropArea>;
    const nums = [c.x, c.y, c.width, c.height];
    if (!nums.every((n) => typeof n === 'number' && Number.isFinite(n))) {
      throw new BadRequestException('crop debe incluir x, y, width y height numéricos');
    }
    if ((c.width ?? 0) <= 0 || (c.height ?? 0) <= 0) {
      throw new BadRequestException('El recorte debe tener ancho y alto positivos');
    }
    return { x: c.x!, y: c.y!, width: c.width!, height: c.height! };
  }
}

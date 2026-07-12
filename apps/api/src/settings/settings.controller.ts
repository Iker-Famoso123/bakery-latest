import { Body, Controller, Get, Put } from '@nestjs/common';
import type { SettingsDto } from '@rf/types';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** About público: WhatsApp, redes, ubicación, horarios. */
  @Public()
  @Get('public/settings')
  getPublic(): Promise<SettingsDto> {
    return this.settings.get();
  }

  /** Edición del About desde el panel. */
  @Roles('admin')
  @Put('settings')
  update(@Body() dto: UpdateSettingsDto): Promise<SettingsDto> {
    return this.settings.update(dto);
  }
}

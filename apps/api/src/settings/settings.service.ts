import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SettingsDto } from '@rf/types';
import { toSettingsDto } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SettingsDto> {
    // Upsert defensivo: garantiza que la fila única exista siempre.
    const settings = await this.prisma.settings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID, redes: [], horarios: [] },
    });
    return toSettingsDto(settings);
  }

  async update(dto: UpdateSettingsDto): Promise<SettingsDto> {
    const data: Prisma.SettingsUncheckedUpdateInput = {};
    if (dto.whatsapp !== undefined) data.whatsapp = dto.whatsapp;
    if (dto.telefono !== undefined) data.telefono = dto.telefono;
    if (dto.direccion !== undefined) data.direccion = dto.direccion;
    if (dto.lat !== undefined) data.lat = dto.lat;
    if (dto.lng !== undefined) data.lng = dto.lng;
    if (dto.redes !== undefined) data.redes = dto.redes as Prisma.InputJsonValue;
    if (dto.horarios !== undefined) data.horarios = dto.horarios as Prisma.InputJsonValue;

    const settings = await this.prisma.settings.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: {
        id: SINGLETON_ID,
        whatsapp: dto.whatsapp ?? null,
        telefono: dto.telefono ?? null,
        direccion: dto.direccion ?? null,
        lat: dto.lat ?? null,
        lng: dto.lng ?? null,
        redes: (dto.redes ?? []) as Prisma.InputJsonValue,
        horarios: (dto.horarios ?? []) as Prisma.InputJsonValue,
      },
    });
    return toSettingsDto(settings);
  }
}

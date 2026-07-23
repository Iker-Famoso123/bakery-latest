import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SettingsDto } from '@rf/types';
import { toSettingsDto } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SINGLETON_ID = 'singleton';

/**
 * Hosts de Google que aceptamos al expandir enlaces cortos de Maps.
 * Allowlist estricta: evita que el endpoint sirva de proxy abierto (SSRF).
 */
const MAPS_HOSTS =
  /^(maps\.app\.goo\.gl|goo\.gl|app\.goo\.gl|g\.co|maps\.google\.[a-z.]+|(www\.)?google\.[a-z.]+|consent\.google\.[a-z.]+)$/;

const MAX_REDIRECTS = 5;

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

  /**
   * Expande un enlace corto de Google Maps (maps.app.goo.gl, g.co…) siguiendo
   * sus redirecciones hasta la URL larga, que sí contiene coordenadas.
   * El navegador no puede hacerlo por CORS; por eso vive aquí.
   * Nunca se lee el cuerpo de la respuesta: solo cabeceras `location`.
   */
  async expandMapsUrl(rawUrl: string): Promise<{ url: string }> {
    let current: URL;
    try {
      current = new URL(rawUrl);
    } catch {
      throw new BadRequestException('El enlace no es una URL válida');
    }

    for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
      if (current.protocol !== 'https:' || !MAPS_HOSTS.test(current.hostname)) {
        throw new BadRequestException('Solo se aceptan enlaces de Google Maps');
      }

      let res: Response;
      try {
        res = await fetch(current, {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.timeout(6000),
        });
      } catch {
        throw new BadRequestException('No se pudo consultar el enlace; intenta de nuevo');
      }
      // Consumo mínimo: descartamos el cuerpo para liberar el socket.
      res.body?.cancel().catch(() => undefined);

      const location = res.headers.get('location');
      if (res.status < 300 || res.status >= 400 || !location) {
        return { url: current.toString() };
      }
      current = new URL(location, current);
    }
    return { url: current.toString() };
  }
}

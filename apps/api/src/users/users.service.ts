import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { UserDto } from '@rf/types';
import { now } from '@rf/types';
import { PasswordService } from '../auth/password.service';
import { toUserDto } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    const passwordHash = await this.passwords.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          name: dto.name,
          role: dto.role,
          passwordHash,
        },
      });
      return toUserDto(user);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Ese email ya está registrado');
      }
      throw err;
    }
  }

  async list(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(toUserDto);
  }

  async setActive(id: string, active: boolean): Promise<UserDto> {
    try {
      const user = await this.prisma.user.update({ where: { id }, data: { active } });
      // Al desactivar, matamos también sus sesiones activas.
      if (!active) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: now().toISO() },
        });
      }
      return toUserDto(user);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw err;
    }
  }
}

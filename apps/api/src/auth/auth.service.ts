import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import type { UserDto } from '@rf/types';
import { now } from '@rf/types';
import { createHash, randomBytes } from 'node:crypto';
import { DateTime } from 'luxon';
import { toUserDto } from '../common/serialize';
import type { JwtPayload } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly passwords: PasswordService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Mensaje genérico a propósito: no revela si el email existe.
    const invalid = new UnauthorizedException('Credenciales inválidas');
    if (!user || !user.active) throw invalid;

    const ok = await this.passwords.compare(dto.password, user.passwordHash);
    if (!ok) throw invalid;

    return this.issueTokens(user);
  }

  /**
   * Rotación con detección de reuso: cada refresh emite un token nuevo y revoca
   * el anterior. Si llega un token YA revocado (señal de robo), se revocan todas
   * las sesiones del usuario.
   */
  async refresh(rawToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedException('Sesión inválida');

    if (stored.revokedAt) {
      // Reuso detectado: alguien presentó un token que ya habíamos rotado.
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Sesión comprometida, vuelve a iniciar sesión');
    }

    if (this.isExpired(stored.expiresAt)) {
      throw new UnauthorizedException('Sesión expirada');
    }
    if (!stored.user.active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Rota: revoca el actual y emite uno nuevo.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: now().toISO() },
    });

    return this.issueTokens(stored.user);
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return toUserDto(user);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: now().toISO() },
    });
  }

  // ── Internos ─────────────────────────────────────────────

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);

    const refreshToken = randomBytes(48).toString('hex');
    const days = this.config.get<number>('REFRESH_TTL_DAYS') ?? 30;
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt: now().plus({ days }).toISO()!,
      },
    });

    return { accessToken, refreshToken, user: toUserDto(user) };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /** Compara la fecha (objeto Date de Prisma) contra `now` usando Luxon. */
  private isExpired(expiresAt: Date): boolean {
    return DateTime.fromJSDate(expiresAt, { zone: 'utc' }) <= now();
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now().toISO() },
    });
  }
}

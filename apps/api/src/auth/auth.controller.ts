import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import type { UserDto } from '@rf/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/types';
import { AuthService, type AuthTokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() dto: RefreshTokenDto): Promise<{ ok: true }> {
    await this.auth.logout(dto.refreshToken);
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.auth.me(user.id);
  }
}

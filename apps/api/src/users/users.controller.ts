import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { UserDto } from '@rf/types';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { UsersService } from './users.service';

/** Gestión de usuarios del panel. Invite-only: exclusivo de administradores. */
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.users.create(dto);
  }

  @Get()
  list(): Promise<UserDto[]> {
    return this.users.list();
  }

  @Patch(':id/active')
  setActive(
    @Param('id') id: string,
    @Body() dto: SetActiveDto,
  ): Promise<UserDto> {
    return this.users.setActive(id, dto.active);
  }
}

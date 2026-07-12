import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { Paginated, PostDto } from '@rf/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../common/types';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

/** Administración de posts. Admin y editor pueden gestionarlos. */
@Roles('admin', 'editor')
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list(@Query() query: QueryPostsDto): Promise<Paginated<PostDto>> {
    return this.posts.findManyAdmin(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<PostDto> {
    return this.posts.findOneAdmin(id);
  }

  @Post()
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PostDto> {
    return this.posts.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto): Promise<PostDto> {
    return this.posts.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.posts.remove(id);
  }
}

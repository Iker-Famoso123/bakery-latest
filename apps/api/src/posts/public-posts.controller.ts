import { Controller, Get, Param, Query } from '@nestjs/common';
import type { Paginated, PostDto } from '@rf/types';
import { Public } from '../common/decorators/public.decorator';
import { QueryPostsDto } from './dto/query-posts.dto';
import { PostsService } from './posts.service';

/** Lectura pública del blog: solo posts vigentes, fijados primero. */
@Public()
@Controller('public/posts')
export class PublicPostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list(@Query() query: QueryPostsDto): Promise<Paginated<PostDto>> {
    return this.posts.findManyPublic(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<PostDto> {
    return this.posts.findOnePublicBySlug(slug);
  }
}

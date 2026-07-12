import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PublicPostsController } from './public-posts.controller';

@Module({
  controllers: [PostsController, PublicPostsController],
  providers: [PostsService],
})
export class PostsModule {}

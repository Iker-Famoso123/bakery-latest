import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

/** Todos los campos opcionales; solo se actualiza lo que se envía. */
export class UpdatePostDto extends PartialType(CreatePostDto) {}

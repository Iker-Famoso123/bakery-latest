import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReorderDto {
  /** IDs de productos en el nuevo orden deseado del menú. */
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];
}

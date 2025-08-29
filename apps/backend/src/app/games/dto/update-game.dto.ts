import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsOptional } from 'class-validator';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsOptional()
  players?: any; // Allow Prisma relation operations
}

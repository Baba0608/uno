import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreateGameDto {
  @IsOptional()
  @IsDate()
  startedAt: Date;

  @IsOptional()
  @IsDate()
  endedAt: Date;

  @IsOptional()
  @IsNumber()
  entryFee: number;

  @IsOptional()
  @IsNumber()
  reward: number;

  @IsNumber()
  roomId: number;

  @IsOptional()
  @IsNumber()
  winnerId: number;
}

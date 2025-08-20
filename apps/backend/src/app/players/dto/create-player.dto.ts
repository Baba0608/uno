import { IsDate, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreatePlayerDto {
  @IsOptional()
  @IsDate()
  joinedAt: Date;

  @IsOptional()
  @IsBoolean()
  isHost: boolean;

  @IsOptional()
  @IsBoolean()
  isReady: boolean;

  @IsNumber()
  userId: number;

  @IsNumber()
  roomId: number;

  @IsOptional()
  @IsNumber()
  gameId: number;
}

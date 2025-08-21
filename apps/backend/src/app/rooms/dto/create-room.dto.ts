import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

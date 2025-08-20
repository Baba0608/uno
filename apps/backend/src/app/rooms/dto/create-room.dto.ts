import { IsBoolean, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  code: string;

  @IsBoolean()
  isActive: boolean;
}

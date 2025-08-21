import { IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  code: string;
}

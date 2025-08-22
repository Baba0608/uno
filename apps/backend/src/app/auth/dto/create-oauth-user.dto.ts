import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateOAuthUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  provider: string;

  @IsString()
  providerId: string;
}

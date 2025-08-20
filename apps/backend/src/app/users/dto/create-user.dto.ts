import { IsString, IsEmail, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  coins?: number;
}

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateOAuthUserDto } from './dto/create-oauth-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('oauth')
  async handleOAuthSignIn(@Body() createOAuthUserDto: CreateOAuthUserDto) {
    return this.authService.handleOAuthSignIn(createOAuthUserDto);
  }
}

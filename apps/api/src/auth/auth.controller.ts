import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    // placeholder
    return { message: 'login placeholder', body };
  }

  @Post('logout')
  async logout() {
    return { message: 'logout placeholder' };
  }
}

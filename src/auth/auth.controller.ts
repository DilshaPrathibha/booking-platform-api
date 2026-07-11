import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * AuthController — public endpoints for authentication.
 *
 * POST /api/auth/register  — create account, returns JWT
 * POST /api/auth/login     — validate credentials, returns JWT
 *
 * No authentication guard is applied here — these routes are intentionally public.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // Default status is 201 Created — appropriate for resource creation.
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Override 201 → 200; login doesn't create a resource.
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

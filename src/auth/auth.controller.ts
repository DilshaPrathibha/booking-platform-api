import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'Account created. Returns access token.' })
  @ApiResponse({ status: 409, description: 'Email is already registered.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and obtain a JWT access token' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns access token.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

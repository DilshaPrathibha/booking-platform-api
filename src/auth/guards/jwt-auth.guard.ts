import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — apply this to any route that requires authentication.
 *
 * Usage in a controller:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('protected')
 *   getProtected(@CurrentUser() user: JwtPayload) { ... }
 *
 * This class exists as a named wrapper around AuthGuard('jwt') so that:
 * 1. Controllers import a domain-specific guard, not a generic string.
 * 2. It can be extended later (e.g. to add role checks or custom errors).
 * 3. It reads clearly in code — @UseGuards(JwtAuthGuard) is self-documenting.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

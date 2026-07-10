import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * @CurrentUser() — extracts the authenticated user's JWT payload from the request.
 *
 * Passport attaches the validated payload to request.user in JwtStrategy.validate().
 * This decorator retrieves it cleanly so controllers never touch request.user directly.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   getProfile(@CurrentUser() user: JwtPayload) {
 *     return { id: user.sub, name: user.name };
 *   }
 *
 * Must always be used on routes protected by JwtAuthGuard.
 * On unprotected routes, request.user is undefined.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);

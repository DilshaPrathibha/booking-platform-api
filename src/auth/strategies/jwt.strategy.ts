import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * JwtStrategy — validates every inbound request that carries a Bearer token.
 *
 * Passport calls validate() only AFTER the JWT signature has been verified
 * and the token has not expired. validate() is therefore the place to run
 * any additional checks, such as confirming the user still exists in the DB.
 *
 * What validate() returns is attached to request.user by Passport.
 * The @CurrentUser() decorator then picks it up from there.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Extract the token from the "Authorization: Bearer <token>" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject expired tokens at the strategy level (not just by ignoring them)
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Called automatically by Passport after verifying the JWT signature.
   * The payload is already decoded at this point.
   *
   * We confirm the user exists in the DB to handle edge cases like
   * a user being deleted while their token is still valid.
   *
   * The return value becomes `request.user` in the controller.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true }, // Only need to confirm existence
    });

    if (!user) {
      throw new UnauthorizedException('User associated with this token no longer exists');
    }

    // Return the payload — this is what @CurrentUser() will receive
    return payload;
  }
}

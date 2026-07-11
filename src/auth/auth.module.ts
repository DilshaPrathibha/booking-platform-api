import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule is registered asynchronously so we can read JWT_SECRET and
    // JWT_EXPIRES_IN from ConfigService at runtime, not at module load time.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // Cast to 'any' is required here because @nestjs/jwt uses the ms library's
          // branded 'StringValue' type for expiresIn, not a plain string.
          // The runtime behavior is identical — this is a type-level constraint only.
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // JwtAuthGuard is provided here so it can be injected directly via
    // NestJS DI if needed, but most controllers will just use @UseGuards()
    JwtAuthGuard,
  ],
  // Export JwtAuthGuard and JwtStrategy so other modules can use them
  // without importing AuthModule (they reference them directly by path).
  // Export JwtModule so other modules can call jwtService.verify() if needed.
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

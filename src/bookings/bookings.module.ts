import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

/**
 * BookingsModule — encapsulates all booking management functionality.
 *
 * No imports needed:
 *   - PrismaModule is @Global() → PrismaService available everywhere.
 *   - ServicesModule is NOT imported — BookingsService queries the services
 *     table directly via PrismaService to avoid cross-module coupling.
 *   - JwtAuthGuard works because PassportModule is initialized via AuthModule
 *     which is already registered in AppModule.
 */
@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}

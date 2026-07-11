import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

/**
 * ServicesModule — encapsulates all service-management functionality.
 *
 * No imports needed:
 *   - PrismaModule is @Global() so PrismaService is available without importing.
 *   - JwtAuthGuard only needs PassportModule which is already initialized via
 *     AuthModule being registered in AppModule.
 *
 * This keeps the module declaration minimal and focused — the NestJS way.
 */
@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}

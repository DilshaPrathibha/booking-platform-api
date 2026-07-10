import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule — provides and exports PrismaService to the entire application.
 *
 * @Global() means this module does not need to be imported in every feature
 * module. Once imported in AppModule, PrismaService is available everywhere.
 *
 * This is the correct NestJS pattern for infrastructure-level providers
 * (database, cache, mailer, etc.) that are used application-wide.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

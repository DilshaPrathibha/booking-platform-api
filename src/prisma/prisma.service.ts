import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

/**
 * PrismaService — the single database access point for the entire application.
 *
 * Design choice: composition over inheritance.
 * Prisma 7 requires a driver adapter passed to the PrismaClient constructor.
 * Using composition avoids TypeScript's `super()` ordering constraint while
 * keeping the service clean, explicit, and easy to mock in tests.
 *
 * This module is declared @Global() so every feature module can inject
 * PrismaService without needing to import PrismaModule in each one.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly prisma: PrismaClient;
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');

    // A pg Pool manages multiple connections efficiently.
    // Prisma 7 delegates all connection handling to this pool via PrismaPg.
    this.pool = new Pool({ connectionString: databaseUrl });

    this.prisma = new PrismaClient({
      adapter: new PrismaPg(this.pool),
    });
  }

  // ── NestJS lifecycle hooks ──────────────────────────────────────────────

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to PostgreSQL...');
    await this.prisma.$connect();
    this.logger.log('Database connection established.');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing database connection...');
    await this.prisma.$disconnect();
    await this.pool.end();
    this.logger.log('Database connection closed.');
  }

  // ── Model delegates ─────────────────────────────────────────────────────
  // Expose only the models defined in schema.prisma.
  // Business logic never touches this.prisma directly — it goes through these.

  get user() {
    return this.prisma.user;
  }

  get service() {
    return this.prisma.service;
  }

  get booking() {
    return this.prisma.booking;
  }

  // ── Transaction support ──────────────────────────────────────────────────
  // Delegate $transaction so callers can run multiple operations atomically
  // without needing a reference to the underlying PrismaClient.

  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}

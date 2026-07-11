import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7+ configuration file.
 *
 * In Prisma 7, the datasource URL moved OUT of schema.prisma and into this
 * file. This gives Prisma full control over connection config at the CLI level
 * (for migrations, db push, etc.) while keeping secrets out of the schema.
 *
 * The PrismaClient in application code receives the adapter separately
 * (see src/prisma/prisma.service.ts).
 */
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
  },
});

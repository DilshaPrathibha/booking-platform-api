import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global API prefix — all routes will be prefixed with /api
  // e.g. POST /api/auth/login, GET /api/services
  app.setGlobalPrefix('api');

  // Global validation pipe — automatically validates all incoming request bodies
  // against their DTO class decorators (@IsString, @IsEmail, etc.)
  app.useGlobalPipes(
    new ValidationPipe({
      // Strip any properties not defined in the DTO — prevents mass-assignment
      whitelist: true,
      // Reject requests that include unknown properties (returns 400)
      forbidNonWhitelisted: true,
      // Automatically transform plain JS objects to DTO class instances
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();

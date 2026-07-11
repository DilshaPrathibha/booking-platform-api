import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global API prefix — all routes will be prefixed with /api
  // e.g. POST /api/auth/login, GET /api/services
  app.setGlobalPrefix('api');

  // Global exception filter — must be registered before ValidationPipe so that
  // unexpected errors from any layer are caught and returned as clean JSON.
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe — automatically validates all incoming request bodies
  // and query parameters against their DTO class decorators.
  app.useGlobalPipes(
    new ValidationPipe({
      // Strip any properties not defined in the DTO — prevents mass-assignment
      whitelist: true,
      // Reject requests that include unknown properties (returns 400)
      forbidNonWhitelisted: true,
      // Automatically transform plain JS objects to DTO class instances and
      // coerce query string values to their correct types (e.g. "10" → 10).
      transform: true,
      // Enable implicit type conversion for query params — needed for
      // @Type(() => Number) decorators in PaginationDto.
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger / OpenAPI documentation ──────────────────────────────────────
  // Available at /api/docs when the server is running.
  const config = new DocumentBuilder()
    .setTitle('Booking Platform API')
    .setDescription(
      'REST API for managing bookable services and customer bookings. ' +
        'Authenticated endpoints require a Bearer JWT token obtained from /api/auth/login.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from /api/auth/login',
      },
      'jwt', // Security scheme name — referenced by @ApiBearerAuth('jwt') decorators
    )
    .addTag('auth', 'Registration and login')
    .addTag('services', 'Manage bookable services')
    .addTag('bookings', 'Manage customer bookings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keeps the token between page refreshes
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/api`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();

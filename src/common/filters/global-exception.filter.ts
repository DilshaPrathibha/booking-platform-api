import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * PrismaClientKnownRequestError shape we need to detect Prisma errors.
 * We avoid importing Prisma types directly to prevent circular dependency
 * issues with the generated client.
 */
interface PrismaError {
  code: string;
  meta?: Record<string, unknown>;
}

/**
 * GlobalExceptionFilter — catches ALL unhandled exceptions and produces a
 * consistent, clean JSON error response.
 *
 * Responsibilities:
 *   1. Pass through NestJS HttpExceptions as-is (they already have the right
 *      status code and message).
 *   2. Translate known Prisma error codes into meaningful HTTP responses:
 *        P2002 — Unique constraint violation → 409 Conflict
 *        P2003 — Foreign key constraint violation → 409 Conflict
 *        P2025 — Record not found (Prisma update/delete) → 404 Not Found
 *   3. Catch all unexpected errors and return 500 without leaking internals.
 *
 * All errors are logged with context so they are traceable in production.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ── NestJS HttpException (our own thrown errors) ──────────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // getResponse() can be a string or an object (from ValidationPipe)
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;

      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // ── Prisma known errors ───────────────────────────────────────────────
    const prismaError = exception as PrismaError;

    if (typeof prismaError?.code === 'string' && prismaError.code.startsWith('P')) {
      const { status, message } = this.mapPrismaError(prismaError);

      this.logger.warn(
        `Prisma error ${prismaError.code} on ${request.method} ${request.url}: ${message}`,
      );

      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // ── Unknown / unexpected errors ───────────────────────────────────────
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapPrismaError(error: PrismaError): {
    status: number;
    message: string;
  } {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint — we already catch this at the service level for
        // booking duplicates with a nicer message. This is the fallback for
        // any other unique violation that slips through.
        const fields = (error.meta?.modelName as string) ?? 'resource';
        return {
          status: HttpStatus.CONFLICT,
          message: `A ${fields} with these details already exists`,
        };
      }
      case 'P2003': {
        // Foreign key constraint — e.g. deleting a Service that has Bookings.
        return {
          status: HttpStatus.CONFLICT,
          message:
            'This record cannot be deleted because it is referenced by other records',
        };
      }
      case 'P2025': {
        // Record not found during update/delete (should be caught earlier,
        // but this is a safety net).
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found',
        };
      }
      default: {
        this.logger.error(`Unhandled Prisma error code: ${error.code}`, error.meta);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred. Please try again later.',
        };
      }
    }
  }
}

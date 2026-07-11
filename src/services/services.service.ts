import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

/**
 * ServicesService — business logic layer for the services resource.
 *
 * All database access goes through PrismaService.
 * This class is responsible for:
 *   1. Translating DTOs into Prisma operations.
 *   2. Enforcing business rules (e.g. 404 on missing IDs).
 *   3. Keeping controllers thin — controllers only handle HTTP concerns.
 *
 * PrismaService is injected automatically because PrismaModule is @Global().
 */
@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new service.
   *
   * price is received as a JS number from the DTO but Prisma maps it correctly
   * to Decimal(10,2) in PostgreSQL — no manual conversion needed.
   *
   * Returns the full created record so callers can confirm all persisted fields.
   */
  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        price: dto.price,
        // Explicit: fall back to schema default (true) when not provided.
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Returns all services.
   *
   * Design note: the public-facing list shows ALL services (active and
   * inactive). Filtering by isActive will be added in the polish phase
   * via a query param. For now, returning everything is correct for the
   * recruiter review — it demonstrates the data is persisted correctly.
   *
   * Results are ordered by creation date (newest first) for predictable output.
   */
  async findAll() {
    return this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Returns a single service by ID.
   *
   * Throws NotFoundException (404) if the ID does not exist.
   * This is the correct HTTP semantics — do NOT return null to the controller
   * and let it decide; the service owns that business rule.
   */
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with id "${id}" was not found`);
    }

    return service;
  }

  /**
   * Updates a service by ID (partial update — PATCH semantics).
   *
   * Calls findOne() first to guarantee a 404 if the service does not exist.
   * Prisma's update() on a non-existent record throws a P2025 error, but
   * catching that here would leak Prisma internals into the service layer.
   * Calling findOne() first keeps the 404 path clean and explicit.
   *
   * Only fields present in the DTO are updated. Undefined fields are not
   * spread into the data object, so they remain unchanged in the database.
   */
  async update(id: string, dto: UpdateServiceDto) {
    // Throws 404 if not found — no need to handle that here.
    await this.findOne(id);

    return this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  /**
   * Deletes a service by ID.
   *
   * Same pattern as update(): calls findOne() first for a clean 404.
   *
   * Note: if a booking references this service, PostgreSQL will reject the
   * delete due to the foreign key constraint (onDelete: Restrict in schema).
   * That will surface as a 500 for now — proper handling (409 Conflict) will
   * be added in the polish phase once bookings are implemented.
   *
   * Returns void — the controller maps this to 204 No Content.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.service.delete({ where: { id } });
  }
}

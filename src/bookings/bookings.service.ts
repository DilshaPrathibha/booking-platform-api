import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BookingStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

/**
 * BookingsService — all booking business logic lives here.
 *
 * Business rules enforced:
 *   1. serviceId must reference an existing, ACTIVE service.
 *   2. bookingDate cannot be in the past (compared in UTC).
 *   3. CANCELLED → COMPLETED transition is forbidden.
 *   4. Duplicate (serviceId + bookingDate + bookingTime) is rejected with 409.
 *
 * PrismaService is injected directly — BookingsService does NOT import
 * ServicesService to avoid cross-module coupling. Both modules share the same
 * PrismaService instance, so we query the service table directly.
 */
@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Status transition rules ─────────────────────────────────────────────
  // Defines which transitions are allowed FROM a given status.
  // Only statuses present as a key are "terminal" or "restricted".
  private static readonly FORBIDDEN_TRANSITIONS: Partial<
    Record<BookingStatus, BookingStatus[]>
  > = {
    // A cancelled booking can never be completed.
    [BookingStatus.CANCELLED]: [BookingStatus.COMPLETED],
    // A completed booking cannot be changed at all.
    [BookingStatus.COMPLETED]: [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.COMPLETED,
    ],
  };

  // ── Create ──────────────────────────────────────────────────────────────

  /**
   * Creates a new booking.
   *
   * Steps:
   *   1. Validate bookingDate is not in the past.
   *   2. Verify serviceId exists and is active.
   *   3. Attempt to insert — catch P2002 (unique violation) as 409 Conflict.
   *
   * bookingDate arrives as an ISO string ("2026-08-15"). We parse it into a
   * Date object for Prisma and for the past-date comparison.
   */
  async create(dto: CreateBookingDto) {
    // Step 1: Past-date validation
    // Parse the date string into UTC midnight to avoid timezone skew.
    const bookingDate = new Date(dto.bookingDate + 'T00:00:00.000Z');
    const today = new Date();
    // Zero out today's time so a booking "today" is allowed.
    today.setUTCHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException(
        'Booking date cannot be in the past. Please choose today or a future date.',
      );
    }

    // Step 2: Verify service exists and is active
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      select: { id: true, isActive: true },
    });

    if (!service) {
      throw new NotFoundException(
        `Service with id "${dto.serviceId}" was not found`,
      );
    }

    if (!service.isActive) {
      throw new BadRequestException(
        `Service with id "${dto.serviceId}" is not currently accepting bookings`,
      );
    }

    // Step 3: Create — let the DB unique constraint handle duplicates
    try {
      return await this.prisma.booking.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          serviceId: dto.serviceId,
          bookingDate,
          bookingTime: dto.bookingTime,
          notes: dto.notes,
          // status defaults to PENDING via the schema
        },
        include: {
          // Include the service summary in the response so the client does
          // not need a separate request to show booking confirmation details.
          service: {
            select: { id: true, title: true, duration: true, price: true },
          },
        },
      });
    } catch (error: any) {
      // P2002 = unique constraint violation
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `This service is already booked on ${dto.bookingDate} at ${dto.bookingTime}. Please choose a different date or time.`,
        );
      }
      throw error;
    }
  }

  // ── Read ────────────────────────────────────────────────────────────────

  /**
   * Returns bookings with pagination, optional status filter, and name/email search.
   *
   * Pagination: page (1-based) + limit (max 100). Returns a meta envelope.
   * Status filter: ?status=PENDING narrows results to that status only.
   * Search: ?search=alice does a case-insensitive partial match on
   *   customerName OR customerEmail — useful for staff looking up a customer.
   *
   * All three are optional and can be combined freely.
   */
  async findAll(query: QueryBookingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    // Build the Prisma where clause dynamically based on provided filters.
    const where = {
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { customerName: { contains: query.search, mode: 'insensitive' as const } },
          { customerEmail: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          service: {
            select: { id: true, title: true, duration: true, price: true },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Returns a single booking by ID.
   * Throws 404 if not found.
   */
  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: { id: true, title: true, duration: true, price: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" was not found`);
    }

    return booking;
  }

  // ── Update Status ───────────────────────────────────────────────────────

  /**
   * Updates a booking's status.
   *
   * Enforces transition rules from FORBIDDEN_TRANSITIONS.
   * Uses 422 Unprocessable Entity for business rule violations on valid data —
   * the distinction from 400 matters: data is valid, the operation is not.
   */
  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.findOne(id);

    const forbiddenNext =
      BookingsService.FORBIDDEN_TRANSITIONS[booking.status] ?? [];

    if (forbiddenNext.includes(dto.status)) {
      throw new UnprocessableEntityException(
        `Cannot transition booking from "${booking.status}" to "${dto.status}"`,
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
      include: {
        service: {
          select: { id: true, title: true, duration: true, price: true },
        },
      },
    });
  }

  // ── Cancel ──────────────────────────────────────────────────────────────

  /**
   * Cancels a booking by setting its status to CANCELLED.
   *
   * Design decision: DELETE /bookings/:id cancels rather than hard-deletes.
   * This preserves the booking record for auditing purposes — a deleted booking
   * would leave orphaned financial or customer history.
   *
   * Returns the updated booking (200) rather than 204, so the client can
   * confirm the final CANCELLED status without a follow-up GET.
   */
  async cancel(id: string) {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new UnprocessableEntityException(
        'This booking is already cancelled',
      );
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new UnprocessableEntityException(
        'A completed booking cannot be cancelled',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        service: {
          select: { id: true, title: true, duration: true, price: true },
        },
      },
    });
  }
}

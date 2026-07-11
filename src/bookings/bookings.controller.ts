import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

/**
 * BookingsController — HTTP layer for the /bookings resource.
 *
 * Route access rules (per assignment spec):
 *   POST   /api/bookings              — Public  (customers book without an account)
 *   GET    /api/bookings              — JWT required (staff views all bookings)
 *   GET    /api/bookings/:id          — JWT required
 *   PATCH  /api/bookings/:id/status   — JWT required (staff manages status)
 *   DELETE /api/bookings/:id          — JWT required (staff cancels)
 *
 * Route ordering matters in NestJS:
 *   PATCH '/:id/status' must be declared BEFORE GET '/:id' so the router
 *   does not interpret 'status' as an ID value on GET /:id.
 */
@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * POST /api/bookings
   * Creates a new booking. Public — no authentication required.
   * Returns 201 Created with the booking and embedded service info.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new booking (public — no auth required)' })
  @ApiResponse({ status: 201, description: 'Booking created. Returns booking with service details.' })
  @ApiResponse({ status: 400, description: 'Validation error, past date, or inactive service.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  @ApiResponse({ status: 409, description: 'This time slot is already booked.' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  /**
   * GET /api/bookings
   * Returns bookings with pagination, optional status filter, and search.
   * JWT required.
   *
   * Query params:
   *   ?page=1&limit=10         — pagination
   *   ?status=PENDING          — filter by status
   *   ?search=alice            — search customerName or customerEmail
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get all bookings — paginated, filterable, searchable (JWT required)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], description: 'Filter by booking status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by customer name or email' })
  @ApiResponse({ status: 200, description: 'Paginated list of bookings with meta.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() query: QueryBookingsDto) {
    return this.bookingsService.findAll(query);
  }

  /**
   * PATCH /api/bookings/:id/status
   * Updates the status of a booking. JWT required.
   * Declared before GET /:id to prevent route collision.
   *
   * Returns 422 if the transition is forbidden (e.g. CANCELLED → COMPLETED).
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update booking status (JWT required)' })
  @ApiResponse({ status: 200, description: 'Status updated. Returns updated booking.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiResponse({ status: 422, description: 'Forbidden status transition (e.g. CANCELLED → COMPLETED).' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  /**
   * GET /api/bookings/:id
   * Returns a single booking by ID. JWT required.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get a booking by ID (JWT required)' })
  @ApiResponse({ status: 200, description: 'The booking record with service details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  /**
   * DELETE /api/bookings/:id
   * Cancels a booking (soft cancel — sets status to CANCELLED).
   * JWT required.
   *
   * Returns 200 with the updated booking so the client can confirm the
   * final status without a follow-up GET request.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cancel a booking (soft-cancel, JWT required)' })
  @ApiResponse({ status: 200, description: 'Booking cancelled. Returns updated booking with CANCELLED status.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiResponse({ status: 422, description: 'Booking is already cancelled or completed.' })
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}

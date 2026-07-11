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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
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
 *   '/:id/status' must be declared BEFORE '/:id' so the router doesn't
 *   interpret 'status' as an ID value on GET /:id.
 */
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * POST /api/bookings
   * Creates a new booking. Public — no authentication required.
   * Returns 201 Created with the booking and embedded service info.
   */
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  /**
   * GET /api/bookings
   * Returns all bookings, newest first. JWT required.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.bookingsService.findAll();
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
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}

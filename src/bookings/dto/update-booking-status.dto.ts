import { BookingStatus } from '../../generated/prisma/enums';
import { IsEnum } from 'class-validator';

/**
 * UpdateBookingStatusDto — validated shape for PATCH /bookings/:id/status.
 *
 * Only 'status' can be updated via this endpoint.
 * The full business rule (no CANCELLED → COMPLETED) is enforced in
 * BookingsService, not here — the DTO only validates the enum value.
 */
export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, {
    message: `status must be one of: ${Object.values(BookingStatus).join(', ')}`,
  })
  status: BookingStatus;
}

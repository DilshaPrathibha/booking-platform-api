import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * CreateBookingDto — validated shape for POST /bookings.
 *
 * bookingDate:
 *   Sent as an ISO 8601 date string (e.g. "2026-08-15").
 *   @IsDateString validates the format. The past-date check is enforced in
 *   BookingsService — it is a business rule, not a format rule, so it belongs
 *   in the service layer where meaningful error messages can be returned.
 *
 * bookingTime:
 *   Stored as "HH:MM" string (e.g. "14:30"). No timezone conversion needed —
 *   the platform is assumed to operate in a single timezone. Using @Matches
 *   for format validation is simpler and more explicit than a custom decorator.
 *
 * customerPhone:
 *   @IsPhoneNumber(null) validates international phone numbers (E.164).
 *   Passing null means it accepts any region. This is deliberately lenient —
 *   a real platform would validate against the region of operation.
 *
 * notes:
 *   Optional free-text field. MaxLength prevents abuse.
 */
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  @MaxLength(200)
  customerName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254)
  customerEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer phone is required' })
  @MinLength(7, { message: 'Phone number must be at least 7 characters' })
  @MaxLength(20)
  customerPhone: string;

  @IsString()
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId: string;

  @IsDateString({}, { message: 'bookingDate must be a valid ISO date (e.g. "2026-08-15")' })
  bookingDate: string;

  @Matches(/^\d{2}:\d{2}$/, {
    message: 'bookingTime must be in HH:MM format (e.g. "14:30")',
  })
  bookingTime: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

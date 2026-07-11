import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
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
 *   Basic length validation — lenient enough for international formats.
 *
 * notes:
 *   Optional free-text field. MaxLength prevents abuse.
 */
export class CreateBookingDto {
  @ApiProperty({ example: 'Alice Johnson', description: 'Full name of the customer', maxLength: 200 })
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  @MaxLength(200)
  customerName: string;

  @ApiProperty({ example: 'alice@example.com', description: 'Customer email address', maxLength: 254 })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254)
  customerEmail: string;

  @ApiProperty({ example: '+1234567890', description: 'Customer phone number (7–20 characters)', minLength: 7, maxLength: 20 })
  @IsString()
  @IsNotEmpty({ message: 'Customer phone is required' })
  @MinLength(7, { message: 'Phone number must be at least 7 characters' })
  @MaxLength(20)
  customerPhone: string;

  @ApiProperty({ example: 'cuid-service-id', description: 'ID of the service to book' })
  @IsString()
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId: string;

  @ApiProperty({ example: '2026-08-15', description: 'Booking date in ISO format (YYYY-MM-DD). Cannot be in the past.' })
  @IsDateString({}, { message: 'bookingDate must be a valid ISO date (e.g. "2026-08-15")' })
  bookingDate: string;

  @ApiProperty({ example: '14:30', description: 'Booking time in HH:MM format (24-hour clock)' })
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'bookingTime must be in HH:MM format (e.g. "14:30")',
  })
  bookingTime: string;

  @ApiPropertyOptional({ example: 'Prefer a quiet room please', description: 'Optional notes for the booking', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

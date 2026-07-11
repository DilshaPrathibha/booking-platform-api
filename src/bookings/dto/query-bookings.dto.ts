import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { BookingStatus } from '../../generated/prisma/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * QueryBookingsDto — query parameters for GET /bookings.
 *
 * Extends PaginationDto to inherit page + limit validation.
 *
 * status: filter by booking status (optional).
 * search: case-insensitive partial match against customerName OR customerEmail.
 *
 * All fields are optional — calling GET /bookings with no params returns
 * the first page of all bookings (newest first).
 */
export class QueryBookingsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(BookingStatus, {
    message: `status must be one of: ${Object.values(BookingStatus).join(', ')}`,
  })
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

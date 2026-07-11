import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * PaginationDto — shared query parameters for all paginated list endpoints.
 *
 * page: 1-based page number (default: 1).
 * limit: items per page (default: 10, max: 100).
 *
 * Using @Type(() => Number) transforms the raw query string into a number
 * before validation runs. Without this, query params arrive as strings and
 * @IsInt would always fail.
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must not exceed 100' })
  limit?: number = 10;
}

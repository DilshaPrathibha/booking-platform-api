import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * CreateServiceDto — validated shape for POST /services.
 *
 * price: using @IsNumber with { maxDecimalPlaces: 2 } to accept standard
 * monetary input (e.g. 49.99). Prisma stores it as Decimal(10,2).
 *
 * duration: stored in minutes. Must be a positive integer.
 *
 * isActive: optional — defaults to true in the database schema.
 * Allowing it here lets an admin pre-create a draft service as inactive.
 */
export class CreateServiceDto {
  @ApiProperty({ example: 'Classic Haircut', description: 'Name of the service', maxLength: 200 })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title: string;

  @ApiPropertyOptional({ example: '30-minute precision haircut', description: 'Optional description', maxLength: 2000 })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description?: string;

  @ApiProperty({ example: 30, description: 'Duration of the service in minutes (must be a positive integer)' })
  @IsInt({ message: 'Duration must be a whole number of minutes' })
  @IsPositive({ message: 'Duration must be greater than 0' })
  @Min(1)
  duration: number;

  @ApiProperty({ example: 25.00, description: 'Price in local currency (up to 2 decimal places)' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with at most 2 decimal places' },
  )
  @IsPositive({ message: 'Price must be greater than 0' })
  price: number;

  @ApiPropertyOptional({ example: true, default: true, description: 'Whether the service is accepting bookings' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

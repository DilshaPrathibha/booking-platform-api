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
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description?: string;

  @IsInt({ message: 'Duration must be a whole number of minutes' })
  @IsPositive({ message: 'Duration must be greater than 0' })
  @Min(1)
  duration: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with at most 2 decimal places' },
  )
  @IsPositive({ message: 'Price must be greater than 0' })
  price: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

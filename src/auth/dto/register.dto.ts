import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Alice Johnson', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'alice@example.com', description: 'Email address (must be unique)' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'securepass123', description: 'Password (8–72 characters)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long' })
  // MaxLength 72 because bcrypt silently truncates passwords longer than 72 bytes
  password: string;
}

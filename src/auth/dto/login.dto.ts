import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com', description: 'Registered email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'securepass123', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}

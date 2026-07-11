import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

/**
 * UpdateServiceDto — validated shape for PATCH /services/:id.
 *
 * PartialType(CreateServiceDto) generates a class where every field from
 * CreateServiceDto is made optional, while preserving all validation decorators.
 *
 * This means:
 *   - Sending {} is valid (no-op update — correct PATCH semantics).
 *   - Sending { price: 99.99 } updates only the price.
 *   - All @IsString, @IsInt, @IsPositive etc. rules still apply for fields
 *     that ARE provided — you cannot send { price: -5 }.
 *
 * We never duplicate validators manually between Create and Update DTOs.
 * That is the whole point of mapped-types.
 */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

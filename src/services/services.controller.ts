import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

/**
 * ServicesController — HTTP layer for the /services resource.
 *
 * Route access rules (per assignment spec):
 *   POST   /api/services      — JWT required (create = admin/staff action)
 *   GET    /api/services      — Public   (customers browse available services)
 *   GET    /api/services/:id  — Public   (customers view a specific service)
 *   PATCH  /api/services/:id  — JWT required (update = admin/staff action)
 *   DELETE /api/services/:id  — JWT required (delete = admin/staff action)
 *
 * The guard is applied per-route (not at the class level) because the same
 * controller exposes both public and protected endpoints.
 *
 * Controllers have NO business logic — they delegate entirely to ServicesService.
 */
@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * POST /api/services
   * Creates a new bookable service. Requires a valid JWT.
   * Returns 201 Created (NestJS default for POST) with the full created object.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a new service (JWT required)' })
  @ApiResponse({ status: 201, description: 'Service created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  /**
   * GET /api/services
   * Returns all services with pagination. Public — no authentication required.
   * Query params: ?page=1&limit=10
   */
  @Get()
  @ApiOperation({ summary: 'Get all services (paginated, public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({ status: 200, description: 'Paginated list of services.' })
  findAll(@Query() query: PaginationDto) {
    return this.servicesService.findAll(query);
  }

  /**
   * GET /api/services/:id
   * Returns a single service by ID. Public — no authentication required.
   * Responds with 404 if the ID does not exist.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a service by ID (public)' })
  @ApiResponse({ status: 200, description: 'The service record.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  /**
   * PATCH /api/services/:id
   * Partially updates a service. Requires a valid JWT.
   * Only provided fields are updated (PATCH semantics, not full replacement).
   * Returns the full updated service object with 200 OK.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update a service (JWT required)' })
  @ApiResponse({ status: 200, description: 'Service updated successfully.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  /**
   * DELETE /api/services/:id
   * Deletes a service. Requires a valid JWT.
   * Returns 204 No Content on success.
   * Returns 404 if the service does not exist.
   * Returns 409 if the service has existing bookings.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete a service (JWT required)' })
  @ApiResponse({ status: 204, description: 'Service deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  @ApiResponse({ status: 409, description: 'Service has existing bookings and cannot be deleted.' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}

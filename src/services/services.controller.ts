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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

/**
 * ServicesController — HTTP layer for the /services resource.
 *
 * Route access rules (per assignment spec):
 *   POST   /api/services/:id  — JWT required (create = admin/staff action)
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
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * POST /api/services
   * Creates a new bookable service. Requires a valid JWT.
   *
   * Returns 201 Created (NestJS default for POST) with the full created object.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  /**
   * GET /api/services
   * Returns all services. Public — no authentication required.
   *
   * @HttpCode(200) is the default for GET so no override needed.
   */
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  /**
   * GET /api/services/:id
   * Returns a single service by ID. Public — no authentication required.
   *
   * Responds with 404 if the ID does not exist (thrown by ServicesService).
   * @Param('id') extracts the :id segment from the URL path.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  /**
   * PATCH /api/services/:id
   * Partially updates a service. Requires a valid JWT.
   *
   * Only provided fields are updated (PATCH semantics, not full replacement).
   * Returns the full updated service object with 200 OK.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  /**
   * DELETE /api/services/:id
   * Deletes a service. Requires a valid JWT.
   *
   * Returns 204 No Content on success — REST convention for successful deletion.
   * Returns 404 if the service does not exist.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}

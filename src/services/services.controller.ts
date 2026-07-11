import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServicesService } from './services.service';

/**
 * ServicesController — HTTP layer for the /services resource.
 *
 * Route access rules (per assignment spec):
 *   POST   /api/services      — JWT required (create = admin/staff action)
 *   GET    /api/services      — Public   (customers browse available services)
 *   GET    /api/services/:id  — Public   (customers view a specific service)
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
}

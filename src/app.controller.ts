import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /api
   * Returns basic API metadata and status.
   * Useful as a quick health-check endpoint.
   */
  @Get()
  @ApiOperation({ summary: 'API health and info' })
  @ApiResponse({
    status: 200,
    description: 'API is running.',
    schema: {
      example: {
        name: 'Booking Platform API',
        version: '1.0.0',
        status: 'ok',
        docs: '/api/docs',
      },
    },
  })
  getApiInfo() {
    return this.appService.getApiInfo();
  }
}

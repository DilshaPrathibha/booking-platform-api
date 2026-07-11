import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Booking Platform API',
      version: '1.0.0',
      status: 'ok',
      docs: '/api/docs',
    };
  }
}

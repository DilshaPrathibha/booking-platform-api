import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getApiInfo', () => {
    it('should return API info object with status ok', () => {
      const result = appController.getApiInfo();
      expect(result.status).toBe('ok');
      expect(result.name).toBe('Booking Platform API');
      expect(result.docs).toBe('/api/docs');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FounderController } from './founder.controller';
import { FounderService } from './founder.service';

describe('FounderController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [FounderController],
      providers: [FounderService],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello From Strettch founders!"', () => {
      const founderController = app.get(FounderController);
      expect(founderController.getHello()).toBe(
        'Hello From Strettch founders!',
      );
    });
  });
});

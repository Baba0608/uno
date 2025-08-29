import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from '../shared/services/prisma.service';

describe('AppService', () => {
  let service: AppService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            findCards: jest.fn(),
          },
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });
  });
});

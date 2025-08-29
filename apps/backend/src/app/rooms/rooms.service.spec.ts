import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../../shared/services/prisma.service';

describe('RoomsService', () => {
  let service: RoomsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: PrismaService,
          useValue: {
            createRoom: jest.fn(),
            findRoomById: jest.fn(),
            findRoomByCode: jest.fn(),
            findRooms: jest.fn(),
            updateRoom: jest.fn(),
            deleteRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

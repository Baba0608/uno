import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../../shared/services/prisma.service';

describe('RoomsController', () => {
  let controller: RoomsController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
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

    controller = module.get<RoomsController>(RoomsController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

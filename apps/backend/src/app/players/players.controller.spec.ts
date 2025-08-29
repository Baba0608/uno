import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { PrismaService } from '../../shared/services/prisma.service';

describe('PlayersController', () => {
  let controller: PlayersController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        PlayersService,
        {
          provide: PrismaService,
          useValue: {
            createPlayer: jest.fn(),
            findPlayerById: jest.fn(),
            findPlayers: jest.fn(),
            updatePlayer: jest.fn(),
            deletePlayer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

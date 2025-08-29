import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from '../../shared/services/prisma.service';

describe('GamesController', () => {
  let controller: GamesController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: {
            createGame: jest.fn(),
            findPlayers: jest.fn(),
            updateUsersBatch: jest.fn(),
            createCoinTransactions: jest.fn(),
            findGames: jest.fn(),
            findGameById: jest.fn(),
            updateGame: jest.fn(),
            deleteGame: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from '../../shared/services/prisma.service';

describe('GamesService', () => {
  let service: GamesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<GamesService>(GamesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

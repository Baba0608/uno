import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { PrismaService } from '../../shared/services/prisma.service';

describe('PlayersService', () => {
  let service: PlayersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PlayersService>(PlayersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

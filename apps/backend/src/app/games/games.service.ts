import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../../shared/services/prisma.service';
import { TransactionType } from '@prisma/client';
import { Player, User } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private prismaService: PrismaService) {}

  async create(createGameDto: CreateGameDto) {
    const game = await this.prismaService.createGame(createGameDto);

    if (!game) {
      throw new Error('Failed to create game');
    }

    // deduct coins from players
    const players = (await this.prismaService.findPlayers({
      where: {
        roomId: game.roomId,
      },
      include: {
        user: true,
      },
    })) as (Player & { user: User })[];

    for (const player of players) {
      await this.prismaService.updateUser(player.userId, {
        coins: player.user.coins - game.entryFee,
      });

      await this.prismaService.createCoinTransaction({
        userId: player.userId,
        amount: game.entryFee,
        type: TransactionType.ENTRY_FEE,
        gameId: game.id,
      });
    }

    return game;
  }

  findAll() {
    return this.prismaService.findGames();
  }

  findOne(id: number) {
    return this.prismaService.findGameById(id);
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return this.prismaService.updateGame(id, updateGameDto);
  }

  remove(id: number) {
    return this.prismaService.deleteGame({
      where: { id },
    });
  }
}

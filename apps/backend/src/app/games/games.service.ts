import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../../shared/services/prisma.service';
import { TransactionType } from '@prisma/client';
import { Player, User } from '@prisma/client';
import { COIN_TRANSACTION_NOTES } from '../../shared/constants/coin-transaction-notes';

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

    // assign players to game
    await this.prismaService.updateGame(game.id, {
      players: { connect: players.map((player) => ({ id: player.id })) },
    });

    // Prepare batch updates
    const userUpdates = players.map((player) => ({
      id: player.userId,
      data: { coins: player.user.coins - game.entryFee },
    }));

    const coinTransactions = players.map((player) => ({
      userId: player.userId,
      amount: game.entryFee,
      type: TransactionType.ENTRY_FEE,
      notes: COIN_TRANSACTION_NOTES.JOIN_ROOM,
      gameId: game.id,
    }));

    // Execute batch operations
    await Promise.all([
      this.prismaService.updateUsersBatch(userUpdates),
      this.prismaService.createCoinTransactions(coinTransactions),
    ]);

    return game;
  }

  findAll() {
    return this.prismaService.findGames();
  }

  findOne(id: number) {
    return this.prismaService.findGameById(id, {
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    });
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

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../../app/users/dto/create-user.dto';
import { CreateRoomDto } from '../../app/rooms/dto/create-room.dto';
import { UpdateUserDto } from '../../app/users/dto/update-user.dto';
import { UpdateRoomDto } from '../../app/rooms/dto/update-room.dto';
import { CreatePlayerDto } from '../../app/players/dto/create-player.dto';
import { UpdatePlayerDto } from '../../app/players/dto/update-player.dto';
import { CreateGameDto } from '../../app/games/dto/create-game.dto';
import { UpdateGameDto } from '../../app/games/dto/update-game.dto';
import { CreateCoinTransactionDto } from '../../app/coin-transactions/dto/create-coin-transaction.dto';

@Injectable()
export class PrismaService {
  private prisma: PrismaClient;
  constructor(private databaseService: DatabaseService) {
    this.prisma = this.databaseService.client;
  }

  // Common database operations that can be used across modules
  // Users
  async createUser(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async findUserById(id: number, options?: any) {
    return this.prisma.user.findUnique({
      where: { id },
      ...options,
    });
  }

  async findUsers(options?: any) {
    return this.prisma.user.findMany(options);
  }

  async updateUser(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(options: { where: { id: number } }) {
    return this.prisma.user.delete(options);
  }

  // Batch operations for optimization
  async updateUsersBatch(updates: { id: number; data: UpdateUserDto }[]) {
    return this.prisma.$transaction(
      updates.map(({ id, data }) =>
        this.prisma.user.update({
          where: { id },
          data,
        })
      )
    );
  }

  // Rooms
  async createRoom(data: CreateRoomDto) {
    return this.prisma.room.create({
      data,
    });
  }

  async findRoomById(id: number, options?: any) {
    return this.prisma.room.findUnique({
      where: { id },
      ...options,
    });
  }

  async findRoomByCode(code: string, options?: any) {
    return this.prisma.room.findUnique({
      where: { code },
      ...options,
    });
  }

  async findRooms(options?: any) {
    return this.prisma.room.findMany(options);
  }

  async updateRoom(id: number, data: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async deleteRoom(options: { where: { id: number } }) {
    return this.prisma.room.delete(options);
  }

  // Players
  async createPlayer(data: CreatePlayerDto) {
    return this.prisma.player.create({
      data,
    });
  }

  async findPlayerById(id: number, options?: any) {
    return this.prisma.player.findUnique({
      where: { id },
      ...options,
    });
  }

  async findPlayers(options?: any) {
    return this.prisma.player.findMany(options);
  }

  async updatePlayer(id: number, data: UpdatePlayerDto) {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }

  async deletePlayer(options: { where: { id: number } }) {
    return this.prisma.player.delete(options);
  }

  // Games
  async createGame(data: CreateGameDto) {
    return this.prisma.game.create({
      data,
    });
  }

  async findGameById(id: number, options?: any) {
    return this.prisma.game.findUnique({
      where: { id },
      ...options,
    });
  }

  async findGames(options?: any) {
    return this.prisma.game.findMany(options);
  }

  async updateGame(id: number, data: UpdateGameDto) {
    return this.prisma.game.update({
      where: { id },
      data,
    });
  }

  async deleteGame(options: { where: { id: number } }) {
    return this.prisma.game.delete(options);
  }

  // Coin Transactions
  async createCoinTransactions(data: CreateCoinTransactionDto[]) {
    return this.prisma.coinTransaction.createMany({
      data,
    });
  }

  // Cards
  async findCards(options?: any) {
    return this.prisma.card.findMany(options);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { generateRoomCode } from '../../shared/utils/game-helpers';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    // Generate a unique room code
    let code: string;
    let existingRoom;
    
    do {
      code = generateRoomCode();
      existingRoom = await this.prisma.findRoomByCode(code);
    } while (existingRoom);

    return this.prisma.room.create({
      data: {
        code,
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.room.findMany({
      where: { isActive: true },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        game: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                coins: true,
              },
            },
          },
        },
        game: {
          include: {
            winner: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.findRoomByCode(code);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async deactivate(id: number) {
    return this.prisma.room.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: number) {
    return this.prisma.room.delete({
      where: { id },
    });
  }

  async getRoomWithPlayers(roomId: number) {
    return this.prisma.findPlayersByRoomId(roomId);
  }

  async isRoomFull(roomId: number, maxPlayers: number = 4) {
    const players = await this.prisma.findPlayersByRoomId(roomId);
    return players.length >= maxPlayers;
  }

  async getActiveGame(roomId: number) {
    return this.prisma.findActiveGameByRoomId(roomId);
  }
}

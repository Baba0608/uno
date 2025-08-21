import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../shared/services/prisma.service';
import { generateRoomCode } from '../../shared/utils/game-helpers';

@Injectable()
export class RoomsService {
  constructor(private prismaService: PrismaService) {}

  async create(createRoomDto: CreateRoomDto, userId: number) {
    const code = createRoomDto.code ?? generateRoomCode();
    const room = await this.prismaService.createRoom({
      code,
      isActive: createRoomDto.isActive ?? true,
    });

    await this.prismaService.createPlayer({
      roomId: room.id,
      userId,
      isHost: true,
    });

    return room;
  }

  findAll() {
    return this.prismaService.findRooms();
  }

  findOne(id: number) {
    return this.prismaService.findRoomById(id, {
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return this.prismaService.updateRoom(id, updateRoomDto);
  }

  remove(id: number) {
    return this.prismaService.deleteRoom({
      where: { id },
    });
  }

  async join(joinRoomDto: JoinRoomDto, userId: number) {
    const room = await this.prismaService.findRoomByCode(joinRoomDto.code);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.prismaService.createPlayer({
      roomId: room.id,
      userId,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../shared/services/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prismaService: PrismaService) {}

  create(createRoomDto: CreateRoomDto) {
    return this.prismaService.createRoom(createRoomDto);
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
}

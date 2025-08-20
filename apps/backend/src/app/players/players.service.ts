import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PrismaService } from '../../shared/services/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private prismaService: PrismaService) {}

  create(createPlayerDto: CreatePlayerDto) {
    return this.prismaService.createPlayer(createPlayerDto);
  }

  findAll() {
    return this.prismaService.findPlayers();
  }

  findOne(id: number) {
    return this.prismaService.findPlayerById(id);
  }

  update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return this.prismaService.updatePlayer(id, updatePlayerDto);
  }

  remove(id: number) {
    return this.prismaService.deletePlayer({
      where: { id },
    });
  }
}

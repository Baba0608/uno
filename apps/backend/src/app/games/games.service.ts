import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../../shared/services/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prismaService: PrismaService) {}

  create(createGameDto: CreateGameDto) {
    return this.prismaService.createGame(createGameDto);
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prismaService.createUser({
      username: createUserDto.username,
      email: createUserDto.email,
      coins: createUserDto.coins || 1000, // Default starting coins
    });
  }

  async findAll() {
    return this.prismaService.findUsers({
      select: {
        id: true,
        username: true,
        email: true,
        coins: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prismaService.findUserById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.updateUser({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prismaService.deleteUser({
      where: { id },
    });
  }
}

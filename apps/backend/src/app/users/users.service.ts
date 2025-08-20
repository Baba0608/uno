import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransactionType } from '../../../generated/prisma';
import { CreateCoinTransactionDto } from '../coin-transactions/dto/create-coin-transaction.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prismaService.createUser(createUserDto);

    // add coin transaction for initial coins
    await this.prismaService.createCoinTransaction({
      amount: user.coins,
      type: TransactionType.EARN,
      userId: user.id,
    });

    return user;
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
    return this.prismaService.updateUser(id, updateUserDto);
  }

  async addCoins(
    id: number,
    createCoinTransactionDto: CreateCoinTransactionDto
  ) {
    let user = await this.prismaService.findUserById(id);

    user = await this.prismaService.updateUser(id, {
      coins: user.coins + createCoinTransactionDto.amount,
    });

    await this.prismaService.createCoinTransaction(createCoinTransactionDto);

    return user;
  }

  async removeCoins(
    id: number,
    createCoinTransactionDto: CreateCoinTransactionDto
  ) {
    let user = await this.prismaService.findUserById(id);

    user = await this.prismaService.updateUser(id, {
      coins: user.coins - createCoinTransactionDto.amount,
    });

    await this.prismaService.createCoinTransaction(createCoinTransactionDto);

    return user;
  }

  async remove(id: number) {
    return this.prismaService.deleteUser({
      where: { id },
    });
  }
}

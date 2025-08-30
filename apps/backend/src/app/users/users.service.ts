import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransactionType } from '@prisma/client';
import { CreateCoinTransactionDto } from '../coin-transactions/dto/create-coin-transaction.dto';
import { COIN_TRANSACTION_NOTES } from '../../shared/constants/coin-transaction-notes';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prismaService.createUser(createUserDto);

    // add coin transaction for initial coins
    await this.prismaService.createCoinTransactions([
      {
        amount: user.coins,
        type: TransactionType.EARN,
        userId: user.id,
        notes: COIN_TRANSACTION_NOTES.INITIAL_COINS,
      },
    ]);

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
    const user = await this.prismaService.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
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

    await this.prismaService.createCoinTransactions([createCoinTransactionDto]);

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

    await this.prismaService.createCoinTransactions([createCoinTransactionDto]);

    return user;
  }

  async remove(id: number) {
    return this.prismaService.deleteUser({
      where: { id },
    });
  }
}

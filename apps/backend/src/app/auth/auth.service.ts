import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateOAuthUserDto } from './dto/create-oauth-user.dto';
import { TransactionType } from '@prisma/client';
import { COIN_TRANSACTION_NOTES } from '../../shared/constants/coin-transaction-notes';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleOAuthSignIn(createOAuthUserDto: CreateOAuthUserDto) {
    const { email, name, provider, providerId } = createOAuthUserDto;

    // Check if user already exists
    const users = await this.prismaService.findUsers({ where: { email } });
    let user = users[0];

    if (!user) {
      // Create new user with default coins
      user = await this.prismaService.createUser({
        email,
        username:
          name ||
          email.split('@')[0] ||
          `Player ${Math.floor(Math.random() * 1000000)}`,
      });

      // create coin transaction
      await this.prismaService.createCoinTransaction({
        userId: user.id,
        amount: 1000,
        type: TransactionType.EARN,
        notes: COIN_TRANSACTION_NOTES.INITIAL_COINS,
      });
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}

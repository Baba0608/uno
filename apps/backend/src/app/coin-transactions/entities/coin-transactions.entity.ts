import { TransactionType } from '../../../../generated/prisma';
import { Game } from '../../games/entities/game.entity';
import { User } from '../../users/entities/user.entity';

export class CoinTransaction {
  id: number;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  userId: number;
  user: User;
  gameId?: number;
  game?: Game;
}

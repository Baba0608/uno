import { CoinTransaction } from '../../coin-transactions/entities/coin-transactions.entity';
import { Player } from '../../players/entities/player.entity';
import { User } from '../../users/entities/user.entity';

export class Game {
  id: number;
  startedAt: Date;
  endedAt: Date;
  entryFee: number;
  reward: number;
  roomId: number;
  winnerId: number;
  winner: User;
  players: Player[];
  transactions: CoinTransaction[];
}

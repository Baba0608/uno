import { Game } from '../../games/entities/game.entity';
import { Room } from '../../rooms/entities/room.entity';
import { User } from '../../users/entities/user.entity';

export class Player {
  id: number;
  joinedAt: Date;
  isHost: boolean;
  isReady: boolean;
  userId: number;
  roomId: number;
  gameId?: number;
  user?: User;
  room?: Room;
  game?: Game;
}

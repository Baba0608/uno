export class CreatePlayerDto {
  joinedAt: Date;
  isHost: boolean;
  isReady: boolean;
  userId: number;
  roomId: number;
  gameId?: number;
}

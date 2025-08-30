export interface Card {
  id: number;
  type: 'NUMBER' | 'SKIP' | 'REVERSE' | 'DRAW_TWO' | 'WILD' | 'WILD_DRAW_FOUR';
  color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | null;
  value?: number; // only for number cards (0–9)
}

export interface Player {
  id: number;
  userId: number;
  username: string;
  cards: Card[];
  isHost: boolean;
  isReady: boolean;
}

export interface GameState {
  id: string; // game/room ID
  players: Player[];
  deck: Card[]; // draw pile
  discardPile: Card[]; // cards played
  currentPlayer: string; // playerId
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  started: boolean;
  winner?: string; // set when game ends
  createdAt: Date;
}

export interface GameAction {
  type:
    | 'PLAY_CARD'
    | 'DRAW_CARD'
    | 'SKIP_TURN'
    | 'REVERSE'
    | 'DRAW_TWO'
    | 'WILD'
    | 'WILD_DRAW_FOUR';
  playerId: string;
  cardId?: number;
  color?: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
  targetPlayerId?: string;
}

export interface GameEvent {
  type:
    | 'GAME_STARTED'
    | 'CARD_PLAYED'
    | 'TURN_CHANGED'
    | 'GAME_ENDED'
    | 'ERROR';
  data: any;
  timestamp: Date;
}

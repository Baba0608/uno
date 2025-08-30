import { Card, Player, GameState } from '../../app/games/types/game.types';

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function isGameActive(endedAt: Date | null): boolean {
  return endedAt === null;
}

/**
 * Shuffle an array of cards using Fisher-Yates algorithm
 */
export function shuffleCards(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Distribute 7 cards to each player
 */
export function distributeCards(
  deck: Card[],
  playerCount: number
): { playerCards: Card[][]; remainingDeck: Card[] } {
  const playerCards: Card[][] = [];
  const remainingDeck = [...deck];

  // Initialize empty card arrays for each player
  for (let i = 0; i < playerCount; i++) {
    playerCards[i] = [];
  }

  // Distribute 7 cards to each player
  for (let round = 0; round < 7; round++) {
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      if (remainingDeck.length > 0) {
        const card = remainingDeck.pop()!;
        playerCards[playerIndex].push(card);
      }
    }
  }

  return { playerCards, remainingDeck };
}

/**
 * Check if a card can be played on the current discard pile
 */
export function canPlayCard(card: Card, topCard: Card): boolean {
  // Wild cards can always be played
  if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') {
    return true;
  }

  // Color must match
  if (card.color === topCard.color) {
    return true;
  }

  // Type must match (for action cards)
  if (card.type === topCard.type) {
    return true;
  }

  // Number cards must match color or value
  if (card.type === 'NUMBER' && topCard.type === 'NUMBER') {
    return card.color === topCard.color || card.value === topCard.value;
  }

  return false;
}

/**
 * Get next player in turn order
 */
export function getNextPlayer(
  currentPlayerIndex: number,
  direction: 1 | -1,
  playerCount: number
): number {
  let nextIndex = currentPlayerIndex + direction;

  // Handle wrapping around
  if (nextIndex >= playerCount) {
    nextIndex = 0;
  } else if (nextIndex < 0) {
    nextIndex = playerCount - 1;
  }

  return nextIndex;
}

/**
 * Initialize game state with shuffled deck and distributed cards
 */
export async function initializeGameState(
  gameId: number,
  roomId: number,
  prismaService: any
): Promise<GameState> {
  // Get room and players
  const room = await prismaService.findRoomById(roomId, {
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  const players = room.players;
  if (players.length < 2) {
    throw new Error('Need at least 2 players to start a game');
  }

  // Get shuffled deck
  const cards = await prismaService.findCards();
  const shuffledDeck = shuffleCards(cards);

  // Distribute cards
  const { playerCards, remainingDeck } = distributeCards(
    shuffledDeck,
    players.length
  );

  // Create game state
  const gameState: GameState = {
    id: gameId.toString(),
    players: players.map((player: any, index: number) => ({
      id: player.id,
      userId: player.userId,
      username: player.user.username,
      cards: playerCards[index],
      isHost: player.isHost,
      isReady: player.isReady,
    })),
    deck: remainingDeck,
    discardPile: [],
    currentPlayer: players[0].id.toString(), // Start with first player
    direction: 1, // Clockwise
    started: true,
    createdAt: new Date(),
  };

  // Set first card in discard pile (draw from deck)
  if (gameState.deck.length > 0) {
    const firstCard = gameState.deck.pop()!;
    gameState.discardPile.push(firstCard);
  }

  return gameState;
}

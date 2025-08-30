import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
export interface Card {
  id: number;
  type: 'NUMBER' | 'SKIP' | 'REVERSE' | 'DRAW_TWO' | 'WILD' | 'WILD_DRAW_FOUR';
  color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | null;
  value?: number;
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
  id: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayer: string;
  direction: 1 | -1;
  started: boolean;
  winner?: string;
  createdAt: Date;
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

export function useGameSocket(gameId: string, userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!gameId || !userId) return;

    // Create socket connection to games namespace
    const newSocket = io('http://localhost:8000/games', {
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to games gateway');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from games gateway');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to game server');
      setIsConnected(false);
    });

    // Game events
    newSocket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setLoading(false);
    });

    newSocket.on('gameState', (state: GameState) => {
      console.log('Game state updated:', state);
      setGameState(state);
      setLoading(false);
      setError(null);
    });

    newSocket.on('playerHand', (data) => {
      console.log('Player hand received:', data);
      // Update the specific player's cards in game state
      if (gameState) {
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((player) =>
              player.id === data.playerId
                ? { ...player, cards: data.cards }
                : player
            ),
          };
        });
      }
    });

    newSocket.on('cardPlayed', (data) => {
      console.log('Card played:', data);
      // Game state will be updated via gameState event
    });

    newSocket.on('cardDrawn', (data) => {
      console.log('Card drawn:', data);
      // Game state will be updated via gameState event
    });

    newSocket.on('gameEnded', (data) => {
      console.log('Game ended:', data);
      if (gameState) {
        setGameState((prev) =>
          prev ? { ...prev, winner: data.winner, started: false } : null
        );
      }
    });

    newSocket.on('error', (data) => {
      console.error('Game error:', data);
      setError(data.message);
    });

    // Join the game
    newSocket.emit('joinGame', { gameId, userId });

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [gameId, userId]);

  // Get current player from game state
  const currentPlayer = gameState?.players.find(
    (p) => p.userId.toString() === userId
  );

  // Get other players (excluding current player)
  const otherPlayers =
    gameState?.players.filter((p) => p.userId.toString() !== userId) || [];

  // Get current player's cards
  const currentPlayerCards = currentPlayer?.cards || [];

  // Check if it's current player's turn
  const isMyTurn = gameState?.currentPlayer === currentPlayer?.id.toString();

  // Game actions
  const playCard = (cardId: number, color?: string) => {
    if (socket && currentPlayer && isMyTurn) {
      socket.emit('playCard', {
        gameId,
        playerId: currentPlayer.id.toString(),
        cardId,
        color,
      });
    }
  };

  const drawCard = () => {
    if (socket && currentPlayer && isMyTurn) {
      socket.emit('drawCard', {
        gameId,
        playerId: currentPlayer.id.toString(),
      });
    }
  };

  const getGameState = () => {
    if (socket) {
      socket.emit('getGameState', { gameId });
    }
  };

  return {
    socket,
    gameState,
    isConnected,
    error,
    loading,
    currentPlayer,
    otherPlayers,
    currentPlayerCards,
    isMyTurn,
    playCard,
    drawCard,
    getGameState,
  };
}

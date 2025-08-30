import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GamesService } from './games.service';
import { PrismaService } from '../../shared/services/prisma.service';
import { GameState, GameAction, GameEvent } from './types/game.types';
import {
  initializeGameState,
  canPlayCard,
  getNextPlayer,
  shuffleCards,
} from '../../shared/utils/game-helpers';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/games',
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamesGateway.name);

  // In-memory storage for active games (in production, use Redis or database)
  private activeGames = new Map<string, GameState>();

  // Track connected clients per game
  private connectedClients = new Map<string, Set<string>>();

  // Track player socket mappings (playerId -> socketId)
  private playerSocketMap = new Map<string, Map<number, string>>();

  constructor(
    private readonly gamesService: GamesService,
    private readonly prismaService: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected to games gateway: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from games gateway: ${client.id}`);

    // Remove client from all games
    for (const [gameId, clients] of this.connectedClients.entries()) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.connectedClients.delete(gameId);
        this.playerSocketMap.delete(gameId);
      } else {
        // Remove this client from player-socket mapping
        const playerMap = this.playerSocketMap.get(gameId);
        if (playerMap) {
          for (const [playerId, socketId] of playerMap.entries()) {
            if (socketId === client.id) {
              playerMap.delete(playerId);
              break;
            }
          }
        }
      }
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { gameId: string; userId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { gameId, userId } = data;
      const gameKey = `game-${gameId}`;

      // Join the game room
      await client.join(gameKey);

      // Track connected client
      if (!this.connectedClients.has(gameKey)) {
        this.connectedClients.set(gameKey, new Set());
      }
      this.connectedClients.get(gameKey)!.add(client.id);

      // Track player-socket mapping
      if (!this.playerSocketMap.has(gameKey)) {
        this.playerSocketMap.set(gameKey, new Map());
      }
      this.playerSocketMap.get(gameKey)!.set(parseInt(userId), client.id);

      // Get game state
      const gameState = this.activeGames.get(gameId);
      if (gameState) {
        // Send current game state to the joining player
        client.emit('gameState', gameState);

        // Notify other players
        client.to(gameKey).emit('playerJoinedGame', {
          userId,
          message: `Player ${userId} joined the game`,
        });
      } else {
        client.emit('error', { message: 'Game not found or not started' });
      }

      this.logger.log(`Player ${userId} joined game ${gameId}`);
    } catch (error) {
      this.logger.error(`Error joining game: ${error.message}`);
      client.emit('error', { message: 'Failed to join game' });
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() data: { roomId: number; gameId: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { roomId, gameId } = data;
      const gameKey = `game-${gameId}`;

      this.logger.log(`Starting game ${gameId} in room ${roomId}`);

      // Initialize game state with shuffled deck and distributed cards
      const gameState = await initializeGameState(
        gameId,
        roomId,
        this.prismaService
      );

      // Store game state in memory
      this.activeGames.set(gameId.toString(), gameState);

      // Join the current client to the game room
      await client.join(gameKey);

      // Track connected client
      if (!this.connectedClients.has(gameKey)) {
        this.connectedClients.set(gameKey, new Set());
      }
      this.connectedClients.get(gameKey)!.add(client.id);

      // Emit game started event to all players
      this.server.to(gameKey).emit('gameStarted', {
        gameId: gameId.toString(),
        message: 'Game has started!',
        timestamp: new Date(),
      });

      // Create a public game state (without private card information)
      const publicGameState = {
        ...gameState,
        players: gameState.players.map((player) => ({
          id: player.id,
          userId: player.userId,
          username: player.username,
          isHost: player.isHost,
          isReady: player.isReady,
          cardsCount: player.cards.length, // Only show card count, not the actual cards
        })),
      };

      // Emit public game state to all players
      this.server.to(gameKey).emit('gameState', publicGameState);

      // Emit individual player hands (each player only sees their own cards)
      gameState.players.forEach((player) => {
        // Find the specific player's socket and emit only to them
        const playerSocket = this.findPlayerSocket(player.id, gameKey);
        if (playerSocket) {
          playerSocket.emit('playerHand', {
            playerId: player.id,
            cards: player.cards,
          });
        }
      });

      this.logger.log(
        `Game ${gameId} started successfully with ${gameState.players.length} players`
      );
    } catch (error) {
      this.logger.error(`Error starting game: ${error.message}`);
      client.emit('error', {
        message: `Failed to start game: ${error.message}`,
      });
    }
  }

  @SubscribeMessage('playCard')
  async handlePlayCard(
    @MessageBody()
    data: { gameId: string; playerId: string; cardId: number; color?: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { gameId, playerId, cardId, color } = data;
      const gameKey = `game-${gameId}`;

      const gameState = this.activeGames.get(gameId);
      if (!gameState) {
        client.emit('error', { message: 'Game not found' });
        return;
      }

      // Validate turn
      if (gameState.currentPlayer !== playerId) {
        client.emit('error', { message: 'Not your turn' });
        return;
      }

      // Find player and card
      const player = gameState.players.find(
        (p) => p.id.toString() === playerId
      );
      if (!player) {
        client.emit('error', { message: 'Player not found' });
        return;
      }

      const cardIndex = player.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) {
        client.emit('error', { message: 'Card not found in hand' });
        return;
      }

      const card = player.cards[cardIndex];
      const topCard = gameState.discardPile[gameState.discardPile.length - 1];

      // Check if card can be played
      if (!canPlayCard(card, topCard)) {
        client.emit('error', { message: 'Invalid card play' });
        return;
      }

      // Play the card
      player.cards.splice(cardIndex, 1);
      gameState.discardPile.push(card);

      // Handle special card effects
      this.handleSpecialCardEffects(gameState, card, color);

      // Check for winner
      if (player.cards.length === 0) {
        gameState.winner = playerId;
        gameState.started = false;

        this.server.to(gameKey).emit('gameEnded', {
          winner: playerId,
          winnerName: player.username,
          message: `${player.username} wins the game!`,
        });
      } else {
        // Move to next player
        this.moveToNextPlayer(gameState);
      }

      // Update game state
      this.activeGames.set(gameId, gameState);

      // Emit updated game state to all players
      this.server.to(gameKey).emit('gameState', gameState);

      // Emit card played event
      this.server.to(gameKey).emit('cardPlayed', {
        playerId,
        card,
        nextPlayer: gameState.currentPlayer,
        direction: gameState.direction,
      });

      this.logger.log(
        `Player ${playerId} played card ${cardId} in game ${gameId}`
      );
    } catch (error) {
      this.logger.error(`Error playing card: ${error.message}`);
      client.emit('error', { message: 'Failed to play card' });
    }
  }

  @SubscribeMessage('drawCard')
  async handleDrawCard(
    @MessageBody() data: { gameId: string; playerId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { gameId, playerId } = data;
      const gameKey = `game-${gameId}`;

      const gameState = this.activeGames.get(gameId);
      if (!gameState) {
        client.emit('error', { message: 'Game not found' });
        return;
      }

      // Validate turn
      if (gameState.currentPlayer !== playerId) {
        client.emit('error', { message: 'Not your turn' });
        return;
      }

      // Draw card from deck
      if (gameState.deck.length === 0) {
        // Reshuffle discard pile (except top card)
        const topCard = gameState.discardPile.pop()!;
        gameState.deck = shuffleCards(gameState.discardPile);
        gameState.discardPile = [topCard];
      }

      if (gameState.deck.length > 0) {
        const drawnCard = gameState.deck.pop()!;
        const player = gameState.players.find(
          (p) => p.id.toString() === playerId
        );
        if (player) {
          player.cards.push(drawnCard);
        }

        // Move to next player
        this.moveToNextPlayer(gameState);

        // Update game state
        this.activeGames.set(gameId, gameState);

        // Emit updated game state
        this.server.to(gameKey).emit('gameState', gameState);

        // Emit card drawn event
        this.server.to(gameKey).emit('cardDrawn', {
          playerId,
          cardCount: player?.cards.length || 0,
          nextPlayer: gameState.currentPlayer,
        });

        this.logger.log(`Player ${playerId} drew a card in game ${gameId}`);
      }
    } catch (error) {
      this.logger.error(`Error drawing card: ${error.message}`);
      client.emit('error', { message: 'Failed to draw card' });
    }
  }

  private handleSpecialCardEffects(
    gameState: GameState,
    card: any,
    color?: string
  ) {
    switch (card.type) {
      case 'SKIP':
        this.moveToNextPlayer(gameState);
        break;
      case 'REVERSE':
        gameState.direction *= -1;
        break;
      case 'DRAW_TWO': {
        this.moveToNextPlayer(gameState);
        // Next player draws 2 cards
        const nextPlayer = gameState.players.find(
          (p) => p.id.toString() === gameState.currentPlayer
        );
        if (nextPlayer && gameState.deck.length >= 2) {
          nextPlayer.cards.push(gameState.deck.pop()!);
          nextPlayer.cards.push(gameState.deck.pop()!);
        }
        this.moveToNextPlayer(gameState);
        break;
      }
      case 'WILD':
      case 'WILD_DRAW_FOUR':
        if (color) {
          // Update the card color
          card.color = color;
        }
        if (card.type === 'WILD_DRAW_FOUR') {
          this.moveToNextPlayer(gameState);
          // Next player draws 4 cards
          const nextPlayer = gameState.players.find(
            (p) => p.id.toString() === gameState.currentPlayer
          );
          if (nextPlayer && gameState.deck.length >= 4) {
            for (let i = 0; i < 4; i++) {
              nextPlayer.cards.push(gameState.deck.pop()!);
            }
          }
          this.moveToNextPlayer(gameState);
        }
        break;
    }
  }

  private moveToNextPlayer(gameState: GameState) {
    const currentPlayerIndex = gameState.players.findIndex(
      (p) => p.id.toString() === gameState.currentPlayer
    );

    if (currentPlayerIndex !== -1) {
      const nextPlayerIndex = getNextPlayer(
        currentPlayerIndex,
        gameState.direction,
        gameState.players.length
      );

      gameState.currentPlayer =
        gameState.players[nextPlayerIndex].id.toString();
    }
  }

  @SubscribeMessage('getGameState')
  async handleGetGameState(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { gameId } = data;
      const gameState = this.activeGames.get(gameId);

      if (gameState) {
        // Create a public game state (without private card information)
        const publicGameState = {
          ...gameState,
          players: gameState.players.map((player) => ({
            id: player.id,
            userId: player.userId,
            username: player.username,
            isHost: player.isHost,
            isReady: player.isReady,
            cardsCount: player.cards.length, // Only show card count, not the actual cards
          })),
        };

        client.emit('gameState', publicGameState);
      } else {
        client.emit('error', { message: 'Game not found' });
      }
    } catch (error) {
      this.logger.error(`Error getting game state: ${error.message}`);
      client.emit('error', { message: 'Failed to get game state' });
    }
  }

  /**
   * Find a player's socket by their player ID within a specific game
   */
  private findPlayerSocket(playerId: number, gameKey: string): Socket | null {
    const playerMap = this.playerSocketMap.get(gameKey);
    if (!playerMap) return null;

    const socketId = playerMap.get(playerId);
    if (!socketId) return null;

    return this.server.sockets.sockets.get(socketId) || null;
  }
}

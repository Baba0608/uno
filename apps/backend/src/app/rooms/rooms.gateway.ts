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
import { RoomsService } from './rooms.service';
import { PrismaService } from '../../shared/services/prisma.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/rooms',
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RoomsGateway.name);

  // Track connected clients per room
  private connectedClients = new Map<string, Set<string>>();

  constructor(
    private readonly roomsService: RoomsService,
    private readonly prismaService: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { roomId, userId } = data;
      const roomKey = `room-${roomId}`;

      // Join the room
      await client.join(roomKey);

      // Get current room state
      const room = await this.roomsService.findOne(parseInt(roomId));
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      // Check if this user is already connected to this room
      if (!this.connectedClients.has(roomKey)) {
        this.connectedClients.set(roomKey, new Set());
      }

      const roomUsers = this.connectedClients.get(roomKey);
      if (!roomUsers) {
        client.emit('error', { message: 'Failed to get room users' });
        return;
      }

      const isNewUser = !roomUsers.has(userId);

      if (isNewUser) {
        roomUsers.add(userId);
      }

      // Emit room state to the joining player
      client.emit('roomState', room);

      // Only notify other players if this is a new user
      if (isNewUser) {
        client.to(roomKey).emit('playerJoined', {
          userId: parseInt(userId),
          message: `Player ${userId} joined the room`,
        });

        // Emit updated room state to all players in the room
        this.server.to(roomKey).emit('roomState', room);
      }

      this.logger.log(
        `Player ${userId} ${
          isNewUser ? 'joined' : 'reconnected to'
        } room ${roomId}`
      );
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() data: { roomId: number; gameId: number },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId, gameId } = data;
    const roomKey = `room-${roomId}`;

    const room = await this.roomsService.findOne(roomId);
    if (!room) {
      this.logger.error('Room not found');
      client.emit('error', { message: 'Room not found' });
      return;
    }
    this.logger.log(`Starting game ${gameId}`);

    const roomUsers = this.connectedClients.get(roomKey);
    if (!roomUsers) {
      this.logger.error('Failed to get room users');
      client.emit('error', { message: 'Failed to get room users' });
      return;
    }

    const game = await this.prismaService.findGameById(gameId);

    if (!game) {
      this.logger.error('Game not found');
      client.emit('error', { message: 'Game not found' });
      return;
    }

    this.logger.log(`Game ${gameId} started`);
    this.server.to(roomKey).emit('gameStarted', game);
  }
}

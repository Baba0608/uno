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

  constructor(private readonly roomsService: RoomsService) {}

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

      const roomUsers = this.connectedClients.get(roomKey)!;
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
}

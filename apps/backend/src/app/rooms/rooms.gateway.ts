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

      // Join the room
      await client.join(`room-${roomId}`);

      // Get current room state
      const room = await this.roomsService.findOne(parseInt(roomId));
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      // Emit room state to the joining player
      client.emit('roomState', room);

      // Notify other players that someone joined
      client.to(`room-${roomId}`).emit('playerJoined', {
        userId: parseInt(userId),
        message: `Player ${userId} joined the room`,
      });

      this.logger.log(`Player ${userId} joined room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      client.emit('error', { message: 'Failed to join room' });
    }
  }
}

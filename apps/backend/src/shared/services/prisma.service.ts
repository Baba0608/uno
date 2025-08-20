import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../../app/users/dto/create-user.dto';
import { CreateRoomDto } from '../../app/rooms/dto/create-room.dto';

@Injectable()
export class PrismaService {
  private prisma: PrismaClient;
  constructor(private databaseService: DatabaseService) {
    this.prisma = this.databaseService.client;
  }

  // Common database operations that can be used across modules
  // Users
  async createUser(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async findUserById(id: number, options?: any) {
    return this.prisma.user.findUnique({
      where: { id },
      ...options,
    });
  }

  async findUsers(options?: any) {
    return this.prisma.user.findMany(options);
  }

  async updateUser(options: any) {
    return this.prisma.user.update(options);
  }

  async deleteUser(options: { where: { id: number } }) {
    return this.prisma.user.delete(options);
  }

  // Rooms
  async createRoom(data: CreateRoomDto) {
    return this.prisma.room.create({
      data,
    });
  }

  async findRoomById(id: number, options?: any) {
    return this.prisma.room.findUnique({
      where: { id },
      ...options,
    });
  }

  async findRooms(options?: any) {
    return this.prisma.room.findMany(options);
  }

  async updateRoom(options: any) {
    return this.prisma.room.update(options);
  }

  async deleteRoom(options: { where: { id: number } }) {
    return this.prisma.room.delete(options);
  }
}

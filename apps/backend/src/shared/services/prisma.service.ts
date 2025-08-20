import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../../app/users/dto/create-user.dto';
import { UpdateUserDto } from '../../app/users/dto/update-user.dto';

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

  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUsers(options?: any) {
    return this.prisma.user.findMany(options);
  }

  async updateUser(options: { where: { id: number }; data: UpdateUserDto }) {
    return this.prisma.user.update(options);
  }

  async deleteUser(options: { where: { id: number } }) {
    return this.prisma.user.delete(options);
  }
}

import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private static prisma: PrismaClient;

  public client: PrismaClient;

  constructor() {
    if (!DatabaseService.prisma) {
      DatabaseService.prisma = new PrismaClient();
    }

    this.client = DatabaseService.prisma;
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}

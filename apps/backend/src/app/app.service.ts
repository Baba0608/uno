import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  // get all cards
  async getCards() {
    return await this.prismaService.findCards({
      orderBy: {
        id: 'asc',
      },
    });
  }
}

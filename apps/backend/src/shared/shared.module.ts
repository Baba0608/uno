import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SharedModule {}

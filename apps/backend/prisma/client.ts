import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

declare global {
  // eslint-disable-next-line
  var prisma: PrismaClient | undefined;
}

const client =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat:
      process.env['NODE_ENV'] === 'development' ? 'pretty' : 'minimal',
  });

if (process.env['NODE_ENV'] !== 'production') globalThis.prisma = client;

@Injectable()
export class PrismaService {
  public client = client;
}

export default client;

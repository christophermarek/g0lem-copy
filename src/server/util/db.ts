import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: 'development' === 'development' ? ['query', 'error', 'warn'] : ['error'],
    log: ['error'],
  });

// if (process.env.DEPLOYMENT !== 'production') {
global.prisma = prisma;
// }

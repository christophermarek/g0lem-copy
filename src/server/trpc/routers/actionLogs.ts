import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const actionLogsRouter = createTRPCRouter({
  getActionLogs: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.prisma) return;
    return await ctx.prisma.actionLog.findMany({
      where: {
        callerId: ctx.session.user.id,
      },
    });
  }),
});

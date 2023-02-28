import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// this is unused i think

export const testPostRouter = createTRPCRouter({
  createTestPost: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        await ctx.prisma.testPost.create({
          data: {
            text: input.text,
            userId: ctx.session.user.id,
          },
        });
        return { success: true, message: 'success create testPost' };
      } catch (e) {
        return { success: false, message: 'fail to create testPost' };
      }
    }),
});

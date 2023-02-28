import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { Actions, FireActionResponse } from '../../bots/action';

export const actionsRouter = createTRPCRouter({
  fireAction: protectedProcedure
    .input(
      z.object({
        actionName: z.string(),
        actionConfig: z.any(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<FireActionResponse> => {
      if (!ctx.prisma) return { success: false, message: 'No prisma client' };
      return Actions.wrapFireAction({
        callerId: ctx.session.user.id,
        actionName: input.actionName,
        actionConfig: input.actionConfig,
      });
    }),
});

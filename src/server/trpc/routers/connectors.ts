import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
// this is unused i think

export const connectorsRouter = createTRPCRouter({
  addInstagramConnector: protectedProcedure
    .input(z.object({ teamId: z.string().optional(), username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // login to instagram
      // if success save info to db
      // if fail return error
      //   then add instagram post action.
      // in connector list, make link to profile https://www.instagram.com/undercoverbusinessman_/.
      // it is just instagram.com / username
      // must be buisness account
    }),
});

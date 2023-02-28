import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TwitterApi } from 'twitter-api-v2';

export const twitterOAuthRouterPublic = createTRPCRouter({
  findUnRegisteredTwitterOAuthKeys: publicProcedure.query(async ({ ctx }) => {
    if (ctx.prisma) {
      return ctx.prisma.twitterOAuth.findMany({
        // where: {
        // accessToken: '',
        // },
      });
    }
  }),
  getTwitterOAuthKeysForUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) return;
    if (!ctx.prisma) return;

    return ctx.prisma.twitterOAuth.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  testTwitterLogin: protectedProcedure
    .input(z.object({ oAuthAccessToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) return;
      if (!ctx.prisma) return;
      try {
        const client = new TwitterApi(input.oAuthAccessToken);
        // return await Twitter.sendTweet(client, 'test', []);

        return await client.currentUserV2();
      } catch (e) {
        return e;
      }
    }),
});

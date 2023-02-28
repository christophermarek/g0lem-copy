import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TweetV2PostTweetResult, TwitterApi } from 'twitter-api-v2';
import { twitterClientId, twitterClientSecret } from './oauth';

interface TwitterApiResponse {
  success: boolean;
  message: string;
  data?: TweetV2PostTweetResult | any;
}
export const twitterRouter = createTRPCRouter({
  postTweet: protectedProcedure
    .input(z.object({ accountId: z.string(), tweet: z.string() }))
    .mutation(
      async ({ ctx, input }): Promise<TwitterApiResponse> => {
        if (!prisma) return { success: false, message: 'db not connected' };
        const account = await prisma.oAuth.findUnique({
          where: {
            authTypeAccountId: input.accountId,
          },
        });
        if (!account) return { success: false, message: 'invalid account' };

        if (!account.accessToken || !account.refreshToken || !account.expiresIn)
          return { success: false, message: 'invalid account' };

        let twitterApi: TwitterApi;
        try {
          // if oauth token was updated more than expires in time (in seconds) ago, refresh token
          if (account.updatedAt.getTime() + account.expiresIn * 1000 < Date.now()) {
            const client = new TwitterApi({
              clientId: twitterClientId,
              clientSecret: twitterClientSecret,
            });
            const newTokens = await client.refreshOAuth2Token(account.refreshToken);

            if (newTokens) {
              twitterApi = newTokens.client;
              await prisma.oAuth.update({
                where: {
                  id: account.id,
                },
                data: {
                  accessToken: newTokens.accessToken,
                  refreshToken: newTokens.refreshToken,
                  expiresIn: newTokens.expiresIn,
                },
              });
            } else {
              return { success: false, message: 'error refreshing token' };
            }
          } else {
            twitterApi = new TwitterApi(account.accessToken);
          }
          const result = await twitterApi.v2.tweet(input.tweet);
          return { success: true, message: 'tweet posted', data: result };
        } catch (e) {
          console.log(e);
          return { success: false, message: 'error posting tweet', data: e };
        }
      },
    ),
});

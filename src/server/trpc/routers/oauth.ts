import { TwitterApi } from 'twitter-api-v2';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { baseUrl } from '../../../utils/api';
import { z } from 'zod';
import { ApiReturn } from '../root';
import { TeamPermissionsTypes, oAuth, Prisma } from '@prisma/client';
import { doesUserHavePermissionFromTeam } from '../controllers/teams/teamPermissions';

const twitterAuthorizeUrl = 'https://twitter.com/i/oauth2/authorize';
const twitterAuthScope = [
  'tweet.read',
  'users.read',
  'offline.access',
  'tweet.write',
  'bookmark.read',
  'bookmark.write',
  'like.write',
  'like.read',
  'tweet.moderate.write',
  'follows.write',
  'follows.read',
  'block.write',
  'block.read',
  'mute.write',
  'mute.read',
];
// https://datatracker.ietf.org/doc/html/rfc2617#section-2

// test requests, this is a good side actually
// https://httpbin.org/

export const twitterOauthRedirectUri = `${baseUrl}/api/oauth/twitterCallback`;
export const twitterClientId = process.env.TWITTER_CLIENT_ID || '';
export const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET || '';

export const redditClientId = process.env.REDDIT_CLIENT_ID || '';
export const redditClientSecret = process.env.REDDIT_CLIENT_SECRET || '';
export const redditOauthRedirectUri = `${baseUrl}/api/oauth/redditCallback`;
export const redditUserAgent = 'g0lemwebapp-ywfai_rRKzo8JHPvLplyOQ';

// need this for the token endpoint not now
const authHeader = Buffer.from(`${twitterClientId}:${twitterClientSecret}`).toString('base64');

interface Params {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
}

const genTwitterOAuthUrlParams = (): {
  code: string;
  state: string;
  params: Params;
} => {
  // why radix 16 and slice 2
  const state = Math.random().toString(16).slice(2);
  const code = Math.random().toString(16).slice(2);

  const urlSearchParams = {
    response_type: 'code',
    client_id: twitterClientId,
    redirect_uri: twitterOauthRedirectUri,
    scope: twitterAuthScope.join('%20'),
    state: state,
    code_challenge: code,
    code_challenge_method: 'plain',
  };
  return { code, state, params: urlSearchParams };
};

export const oAuthRouter = createTRPCRouter({
  deleteAllOAuth: protectedProcedure
    .input(z.object({ teamID: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) return;

      if (input?.teamID) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: input.teamID,
          permission: TeamPermissionsTypes.DISCONNECT_CONNECTORS,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      await ctx.prisma.oAuth.deleteMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
    }),
  deleteConnector: protectedProcedure
    .input(z.object({ teamID: z.string().optional(), connectorID: z.string() }))
    .mutation(async ({ ctx, input }): Promise<ApiReturn<void>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      if (input?.teamID) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: input.teamID,
          permission: TeamPermissionsTypes.DISCONNECT_CONNECTORS,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      try {
        await ctx.prisma.oAuth.delete({
          where: {
            id: input.connectorID,
          },
        });
        return { success: true, message: 'Deleted' };
      } catch (e) {
        return { success: false, message: 'Error deleting connector' };
      }
    }),

  cleaupUnusedUserOAuth: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input }): Promise<ApiReturn<oAuth[]>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };

      // return { success: true, message: 'Deleted', data: null };
      try {
        let incompleteOAuth = await ctx.prisma.oAuth.findMany({
          where: {
            // AND: [{ userId: ctx.session.user.id }, { accessToken: null }],
            userId: ctx.session.user.id,
          },
        });
        incompleteOAuth = incompleteOAuth.filter((oAuth) => oAuth.accessToken === null);
        incompleteOAuth.forEach(async (oAuth) => {
          await ctx.prisma?.oAuth.delete({
            where: {
              id: oAuth.id,
            },
          });
        });
        return { success: true, message: 'Deleted', data: incompleteOAuth };
        // const deletion = await ctx.prisma.oAuth.deleteMany({
        //   where: {
        //     AND: [{ userId: ctx.session.user.id }, { accessToken: null }],
        //   },
        // });
        // return { success: true, message: 'Deleted', data: deletion };
      } catch (e) {
        return { success: false, message: 'Error deleting connector' };
      }
    }),

  twitterOAuthStep1: protectedProcedure
    .input(z.object({ teamID: z.string().optional() }))

    .mutation(
      async ({
        ctx,
        input,
      }): Promise<
        ApiReturn<{
          params: Params;
          url: string;
        }>
      > => {
        if (!ctx.prisma) return { success: false, message: 'db not connected' };
        if (input?.teamID) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: input.teamID,
            permission: TeamPermissionsTypes.ADD_CONNECTORS,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        }
        if (!ctx.session.user) return { success: false, message: 'not logged in' };
        const { code, state, params } = genTwitterOAuthUrlParams();
        await ctx.prisma.oAuth.create({
          data: {
            userId: ctx.session.user.id,
            code: code,
            state: state,
            type: 'twitter',
          },
        });
        return {
          success: true,
          message: 'success',
          data: {
            params: params,
            url: `${twitterAuthorizeUrl}`,
          },
        };
      },
    ),
  redditOauthStep1: protectedProcedure
    .input(z.object({ teamID: z.string().optional() }))
    .mutation(async ({ ctx, input }): Promise<ApiReturn<{ params: Params; url: string }>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };

      // https://github.com/reddit-archive/reddit/wiki/OAuth2
      if (input?.teamID) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: input.teamID,
          permission: TeamPermissionsTypes.ADD_CONNECTORS,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }

      const baseUrl = 'https://www.reddit.com/api/v1/authorize';
      const code = '69';
      const response_type = 'code';
      const client_id = redditClientId;
      const redirect_uri = redditOauthRedirectUri;
      const duration = 'permanent';
      const scope =
        'identity edit flair history modconfig modflair modlog modposts modwiki mysubreddits privatemessages read report save submit subscribe vote wikiedit wikiread';
      const state = Math.random().toString(16).slice(2);

      await ctx.prisma.oAuth.create({
        data: {
          userId: ctx.session.user.id,
          state: state,
          type: 'reddit',
          code: code,
        },
      });

      const urlSearchParams = {
        response_type,
        client_id,
        redirect_uri,
        duration,
        scope,
        state,
        code_challenge: '',
        code_challenge_method: '',
      };
      return {
        success: true,
        message: 'success',
        data: {
          params: urlSearchParams,
          url: `${baseUrl}`,
        },
      };
    }),

  revokeAccessToken: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return;
      const { user } = ctx.session;
      const oAuth = await ctx.prisma.oAuth.findFirst({
        where: {
          userId: user.id,
          type: 'twitter',
          authTypeAccountId: input.accountId,
        },
        include: {
          Team: true,
        },
      });
      if (!oAuth) return;
      if (oAuth.Team?.id) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: oAuth.Team?.id,
          permission: TeamPermissionsTypes.DISCONNECT_CONNECTORS,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }

      const client = new TwitterApi({
        clientId: twitterClientId,
        clientSecret: twitterClientSecret,
      });
      const { refreshToken } = oAuth;
      if (!refreshToken || typeof refreshToken != 'string') return;

      try {
        await client.revokeOAuth2Token(refreshToken, 'refresh_token');
        await ctx.prisma.oAuth.delete({
          where: {
            id: oAuth.id,
          },
        });
        return 'token revoked';
      } catch (e) {
        console.log(e);
        return 'error revoking token';
      }
    }),

  getConnectors: protectedProcedure
    .input(
      z.object({
        teamId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return;
      let connectors: oAuth[];
      if (input.teamId) {
        // get connectors for team
        connectors = await ctx.prisma.oAuth.findMany({
          where: {
            teamId: input.teamId,
          },
        });
      } else {
        const { user } = ctx.session;
        connectors = await ctx.prisma.oAuth.findMany({
          where: {
            userId: user.id,
          },
        });
      }
      return connectors.map((c) => {
        return {
          id: c.id,
          type: c.type,
          authTypeAccountId: c.authTypeAccountId,
          authTypeAccountName: c.authTypeAccountUsername,
          teamId: c.teamId,
          userId: c.userId,
        };
      });
    }),
  getConnector: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.prisma) return;
      const { user } = ctx.session;
      const connector = await ctx.prisma.oAuth.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
      });
      return connector;
    }),
  connectorToTeam: protectedProcedure
    .input(z.object({ connectorId: z.string(), teamId: z.string() }))
    .mutation(async ({ input, ctx }): Promise<ApiReturn<oAuth>> => {
      if (!ctx.prisma) return { message: 'no prisma client', success: false };
      const connector = await ctx.prisma.oAuth.findFirst({
        where: {
          id: input.connectorId,
        },
        include: {
          Team: true,
        },
      });
      if (!connector) return { message: 'no connector', success: false };
      if (connector.Team?.id) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: connector.Team.id,
          permission: TeamPermissionsTypes.ADD_CONNECTORS,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }

      const res = await ctx.prisma.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          connectors: {
            connect: {
              id: connector.id,
            },
          },
        },
      });
      if (res) {
        return { message: 'connected', success: true };
      } else {
        return { message: 'error', success: false };
      }
    }),
  disconnectConnectorFromTeam: protectedProcedure
    .input(z.object({ connectorId: z.string(), teamId: z.string() }))
    .mutation(async ({ input, ctx }): Promise<ApiReturn<oAuth>> => {
      if (!ctx.prisma) return { message: 'no prisma client', success: false };
      const connector = await ctx.prisma.oAuth.findFirst({
        where: {
          id: input.connectorId,
        },
        include: {
          Team: true,
        },
      });
      if (!connector) return { message: 'no connector', success: false };
      if (connector.Team?.id) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: connector.Team.id,
          permission: TeamPermissionsTypes.DISCONNECT_CONNECTORS,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      const res = await ctx.prisma.team.update({
        where: {
          id: input.teamId,
        },
        data: {
          connectors: {
            disconnect: {
              id: connector.id,
            },
          },
        },
      });
      if (res) {
        return { message: 'disconnected', success: true };
      } else {
        return { message: 'error', success: false };
      }
    }),
  addDiscordWebhookConnector: protectedProcedure
    .input(
      z.object({
        teamId: z.string().optional(),
        webhookUrl: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return;
      const { user } = ctx.session;
      const webhookUrl = input.webhookUrl;
      const teamId = input.teamId;
      const connector = await ctx.prisma.oAuth.create({
        data: {
          userId: user.id,
          type: 'discordWebhook',
          authTypeAccountId: webhookUrl,
          authTypeAccountUsername: webhookUrl,
          teamId: teamId,

          code: 'webhook',
          state: 'webhook',
        },
      });
      return connector;
    }),
});

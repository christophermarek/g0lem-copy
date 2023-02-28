import { User } from '@prisma/client';
import { z } from 'zod';
import { testApiKey } from '../../externalControllers/promptController';
import { ApiReturn } from '../root';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  getDataForUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.prisma) return;
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        bots: true,
        twitterOAuth: true,
      },
    });
  }),
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.prisma) return;
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  updateProfilePicture: protectedProcedure
    .input(z.object({ imageUrl: z.string() }))
    .mutation(async ({ ctx, input }): Promise<ApiReturn<User>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const update = await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            image: input.imageUrl,
          },
        });
        return { success: true, data: update, message: 'Update success' };
      } catch (e) {
        return { success: false, message: 'Error updating user' };
      }
    }),
  updateUserName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }): Promise<ApiReturn<User>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const update = await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            name: input.name,
          },
        });
        return { success: true, data: update, message: 'Update success' };
      } catch (e) {
        return { success: false, message: 'Error updating user' };
      }
    }),

  updateOpenAiApiKey: protectedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx, input }): Promise<ApiReturn<User>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };

      // need to test the key

      const result = await testApiKey(input.apiKey);
      if (!result) {
        return { success: false, message: 'Invalid API key' };
      } else {
        const update = await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            openAiApiKey: input.apiKey,
          },
        });

        return { success: true, data: update, message: 'Update success' };
      }
    }),
});

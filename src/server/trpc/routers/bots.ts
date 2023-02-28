import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { doesUserHavePermissionFromTeam } from '../controllers/teams/teamPermissions';
import { ApiReturn } from '../root';
import { bot } from '@prisma/client';

export const botRouter = createTRPCRouter({
  getBots: protectedProcedure
    .input(z.object({ teamId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return;
      if (input.teamId) {
        return await ctx.prisma.bot.findMany({
          where: {
            teamId: input.teamId,
          },
        });
      } else {
        return await ctx.prisma.bot.findMany({
          where: {
            userId: ctx.session.user.id,
            teamId: input.teamId,
          },
        });
      }
    }),

  createBot: protectedProcedure
    .input(z.object({ botName: z.string().min(1).max(50), teamId: z.string().optional() }))
    .mutation(async ({ input, ctx }): Promise<ApiReturn<bot>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      if (input.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: input.teamId,
          permission: 'ADD_BOTS',
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      const bot = await ctx.prisma.bot.create({
        data: {
          name: input.botName,
          userId: ctx.session.user.id,
          teamId: input.teamId,
        },
      });
      return { success: true, message: 'Bot created', data: bot };
    }),
  duplicateBot: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .mutation(async ({ input, ctx }): Promise<ApiReturn<void>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const bot = await ctx.prisma.bot.findUnique({
        where: {
          id: input.botId,
        },
      });
      if (!bot) {
        return { success: false, message: 'Bot not found' };
      }
      if (bot.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: bot.teamId,
          permission: 'EDIT_BOTS',
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      try {
        await ctx.prisma.bot.create({
          data: {
            name: bot.name + ' (copy)',
            userId: ctx.session.user.id,
            teamId: bot.teamId,
          },
        });
        return { success: true, message: 'Bot duplicated' };
      } catch (e) {
        return { success: false, message: 'Failed to duplicate Bot' };
      }
    }),
  deleteBot: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .mutation(async ({ input, ctx }): Promise<ApiReturn<void>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const bot = await ctx.prisma.bot.findUnique({
        where: {
          id: input.botId,
        },
      });
      if (!bot) {
        return { success: false, message: 'Bot not found' };
      }
      if (bot.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: bot.teamId,
          permission: 'DELETE_BOTS',
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }

      await ctx.prisma.bot.delete({
        where: {
          id: input.botId,
        },
      });
      return { success: true, message: 'Bot deleted' };
    }),
  getBot: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.prisma) return;
      const bot = await ctx.prisma.bot.findUnique({
        where: {
          id: input.botId,
        },
        include: {
          jobs: true,
          JobSchedule: true,
        },
      });
      if (!bot) {
        return { success: false, message: 'Bot not found' };
      }
      return { success: true, bot: bot };
    }),
  editBot: protectedProcedure
    .input(z.object({ botId: z.string(), botName: z.string().min(1).max(50) }))
    .mutation(async ({ input, ctx }): Promise<ApiReturn<void>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };

      const bot = await ctx.prisma.bot.findUnique({
        where: {
          id: input.botId,
        },
      });
      if (!bot) {
        return { success: false, message: 'Bot not found' };
      }
      if (bot.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: bot.teamId,
          permission: 'EDIT_BOTS',
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }

      await ctx.prisma.bot.update({
        where: {
          id: input.botId,
        },
        data: {
          name: input.botName,
        },
      });
      return { success: true, message: 'Bot updated' };
    }),
});

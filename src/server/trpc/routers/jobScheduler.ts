import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { Scheduler } from '../../bots/scheduler';
import { ApiReturn } from '../root';
import { JobSchedule, TeamPermissionsTypes } from '@prisma/client';
import { doesUserHavePermissionFromTeam } from '../controllers/teams/teamPermissions';

export const jobScheduleRouter = createTRPCRouter({
  getJobSchedules: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return;
      return await ctx.prisma.jobSchedule.findMany({
        where: {
          botId: input.botId,
        },
      });
    }),
  createJobSchedule: protectedProcedure
    .input(
      z.object({
        botId: z.string(),
        jobName: z.string().min(1).max(50),
        jobId: z.string(),
        teamId: z.string().optional(),
        intervalMs: z.string().min(1).max(1000000000),
        intervalType: z.enum(['MS', 'S']),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<JobSchedule>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const job = await ctx.prisma.job.findUnique({
        where: {
          id: input.jobId,
        },
        include: {
          Team: true,
          bot: true,
        },
      });
      if (!job) return { success: false, message: 'job not found' };
      if (job.Team?.id) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: job.Team.id,
          permission: TeamPermissionsTypes.ADD_SCHEDULES,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      if (job.bot) {
        if (job.bot.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: job.bot.teamId,
            permission: TeamPermissionsTypes.ADD_SCHEDULES,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        }
      }

      const res = await ctx.prisma.jobSchedule.create({
        data: {
          botId: input.botId,
          name: input.jobName,
          createdById: ctx.session.user.id,
          intervalMs: input.intervalMs.toString(),
          intervalType: input.intervalType,
          executeAt: '',
          enabled: input.enabled,
          jobId: input.jobId,
        },
      });
      return { success: true, data: res, message: 'created job schedule' };
    }),
  deleteJobSchedule: protectedProcedure
    .input(z.object({ jobScheduleId: z.string().min(1).max(50) }))
    .mutation(async ({ input, ctx }): Promise<ApiReturn<void>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const jobSchedule = await ctx.prisma.jobSchedule.findUnique({
        where: {
          id: input.jobScheduleId,
        },
        include: {
          job: true,
          bot: true,
        },
      });
      if (!jobSchedule) return { success: false, message: 'job schedule not found' };
      if (jobSchedule.job?.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: jobSchedule.job?.teamId,
          permission: TeamPermissionsTypes.DELETE_SCHEDULES,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      if (jobSchedule.bot?.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: jobSchedule.bot.teamId,
          permission: TeamPermissionsTypes.DELETE_SCHEDULES,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }

      try {
        await ctx.prisma.jobSchedule.delete({
          where: {
            id: input.jobScheduleId,
          },
        });
        return { success: true, message: 'Deleted job schedule' };
      } catch (err) {
        return { success: false, message: 'Error deleting job schedule' };
      }
    }),
  updateJobSchedule: protectedProcedure
    .input(
      z.object({
        jobScheduleId: z.string().min(1).max(50),
        scheduleName: z.string().min(1).max(50),
        teamId: z.string().optional(),
        intervalMs: z.string().min(1).max(1000000000),
        intervalType: z.enum(['MS', 'S']),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<JobSchedule>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const jobSchedule = await ctx.prisma.jobSchedule.findUnique({
        where: {
          id: input.jobScheduleId,
        },
        include: {
          job: true,
          bot: true,
        },
      });
      if (jobSchedule?.job?.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: jobSchedule.job?.teamId,
          permission: TeamPermissionsTypes.EDIT_SCHEDULES,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      if (jobSchedule?.bot?.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: jobSchedule.bot.teamId,
          permission: TeamPermissionsTypes.EDIT_SCHEDULES,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      try {
        const res = await ctx.prisma.jobSchedule.update({
          where: {
            id: input.jobScheduleId,
          },
          data: {
            name: input.scheduleName,
            teamId: input.teamId,
            intervalMs: input.intervalMs.toString(),
            intervalType: input.intervalType,
            executeAt: '',
            enabled: input.enabled,
          },
        });
        return { success: true, data: res, message: 'updated job schedule' };
      } catch (err) {
        return { success: false, message: 'Error updating job schedule' };
      }
    }),
  getJobSchedule: protectedProcedure
    .input(z.object({ jobScheduleId: z.string().min(1).max(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return;
      return await ctx.prisma.jobSchedule.findUnique({
        where: {
          id: input.jobScheduleId,
        },
        include: {
          job: true,
        },
      });
    }),
  toggleJobScheduleEnabled: protectedProcedure
    .input(
      z.object({
        jobScheduleId: z.string().min(1).max(50),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<JobSchedule>> => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const jobSchedule = await ctx.prisma.jobSchedule.findUnique({
        where: {
          id: input.jobScheduleId,
        },
        include: {
          job: true,
          bot: true,
        },
      });
      if (!jobSchedule) return { success: false, message: 'job schedule not found' };

      if (jobSchedule.job?.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: jobSchedule.job?.teamId,
          permission: jobSchedule.enabled
            ? TeamPermissionsTypes.DISABLE_SCHEDULES
            : TeamPermissionsTypes.ENABLE_SCHEDULES,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      if (jobSchedule.bot?.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: jobSchedule.bot.teamId,
          permission: jobSchedule.enabled
            ? TeamPermissionsTypes.DISABLE_SCHEDULES
            : TeamPermissionsTypes.ENABLE_SCHEDULES,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }
      try {
        const res = await ctx.prisma.jobSchedule.update({
          where: {
            id: input.jobScheduleId,
          },
          data: {
            enabled: !jobSchedule.enabled,
          },
        });
        return { success: true, data: res, message: 'updated job schedule' };
      } catch (err) {
        return { success: false, message: 'Error updating job schedule' };
      }
    }),
  runJobSchedules: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.prisma) return { success: false, message: 'no prisma client' };
    try {
      const run = await Scheduler();
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }),
  getLogsForJobSchedule: protectedProcedure
    .input(
      z.object({
        jobScheduleId: z.string().min(1).max(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return;
      return await ctx.prisma.jobScheduleLog.findMany({
        where: {
          jobScheduleId: input.jobScheduleId,
        },
        orderBy: {
          dateCreated: 'desc',
        },
      });
    }),
});

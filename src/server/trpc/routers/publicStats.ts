import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const publicStatsRouter = createTRPCRouter({
  getPublicStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.prisma) return;
    const userCount = await ctx.prisma.user.count({});
    const botCount = await ctx.prisma.bot.count({});
    const connectorCount = await ctx.prisma.oAuth.count({});
    const actionLogsCount = await ctx.prisma.actionLog.count({});
    const jobsCount = await ctx.prisma.job.count({});
    const jobSchedulesCount = await ctx.prisma.jobSchedule.count({});
    const teamCount = await ctx.prisma.team.count({});
    const jobFireCount = await ctx.prisma.jobFiredLog.count({});
    const jobScheduleLogCount = await ctx.prisma.jobScheduleLog.count({});

    return {
      userCount,
      botCount,
      connectorCount,
      actionLogsCount,
      jobsCount,
      jobSchedulesCount,
      teamCount,
      jobFireCount,
      jobScheduleLogCount,
    };
  }),
  amILoggedIn: protectedProcedure.query(async ({ ctx }) => {
    // un authed this will throw an error bc protected procedure
    return true;
  }),
});

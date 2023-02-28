export {}; // import { z } from 'zod';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ApiReturn } from '../root';
import { Job, JobFiredLog, TeamPermissionsTypes } from '@prisma/client';
import { CompleteJob } from '../../../../prisma/zod';
import { wrapFireJob } from '../../bots/jobs';
import { JobsController } from '../controllers/jobs';
import { doesUserHavePermissionFromTeam } from '../controllers/teams/teamPermissions';

export const jobRouter = createTRPCRouter({
  createJob: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        botId: z.string().optional(),
        teamId: z.string().optional(),
        stages: z.array(
          z.object({
            stageActions: z.array(
              z.object({
                name: z.string(),
                inputs: z.array(
                  z.object({
                    isManualInput: z.boolean(),
                    inputName: z.string(),
                    inputValue: z.string(),
                    inputActionIndex: z.string(),
                    inputActionName: z.string(),
                  }),
                ),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<any>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };

      if (input.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: input.teamId,
          permission: 'ADD_JOBS',
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      }

      if (input.botId) {
        const bot = await ctx.prisma.bot.findUnique({
          where: {
            id: input.botId,
          },
        });
        if (!bot) return { success: false, message: 'bot not found' };
        if (bot?.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: bot?.teamId,
            permission: TeamPermissionsTypes.ADD_JOBS,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        }
      }

      const job = await JobsController.createJob({
        prisma: ctx.prisma,
        userId: ctx.session.user.id,
        jobName: input.name,
        teamId: input.teamId,
        botId: input.botId,
      });
      if (!job) return { success: false, message: 'job not created' };
      const stages = await JobsController.createJobStages({
        prisma: ctx.prisma,
        job: job,
        numStages: input.stages.length,
      });
      if (!stages) return { success: false, message: 'stages not created' };
      const stageActions: {
        stageId: string;
        name: string;
        inputs: {
          isManualInput: boolean;
          inputValue: string;
          inputActionIndex: string;
          inputActionName: string;
          inputName: string;
        }[];
      }[] = [];

      for (let i = 0; i < input.stages.length; i++) {
        const stage = input.stages[i];
        const newStageAction = stages[i];
        stage.stageActions.forEach((action) => {
          stageActions.push({
            stageId: newStageAction.id,
            name: action.name,
            inputs: action.inputs,
          });
        });
      }
      // for each new stage we want to find all of its actions and create them
      const newStageActions = await JobsController.createJobStageActions({
        prisma: ctx.prisma,
        job: job,
        newJobStages: stages,
        stageActions: stageActions,
      });
      if (!newStageActions) return { success: false, message: 'stage actions not created' };

      return { success: true, message: 'job created successfully', data: job };
    }),
  editJob: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        botId: z.string().optional(),
        teamId: z.string().optional(),
        stages: z.array(
          z.object({
            stageActions: z.array(
              z.object({
                name: z.string(),
                inputs: z.array(
                  z.object({
                    isManualInput: z.boolean(),
                    inputName: z.string(),
                    inputValue: z.string(),
                    inputActionIndex: z.string(),
                    inputActionName: z.string(),
                  }),
                ),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<Job>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        if (input.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: input.teamId,
            permission: 'EDIT_JOBS',
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        }

        const prevJob = await ctx.prisma.job.findUnique({
          where: { id: input.id },
          include: {
            bot: true,
          },
        });
        if (!prevJob) return { success: false, message: 'job not found' };
        if (prevJob.bot?.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: prevJob.bot?.teamId,
            permission: TeamPermissionsTypes.EDIT_JOBS,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        }
        const job = await ctx.prisma.job.update({
          where: { id: input.id },
          data: {
            name: input.name,
            botId: input.botId,
            teamId: input.teamId,
          },
        });

        await JobsController.deleteAllJobStageData({
          prisma: ctx.prisma,
          jobId: input.id,
        });
        const newStages = await JobsController.createJobStages({
          prisma: ctx.prisma,
          job: job,
          numStages: input.stages.length,
        });
        if (!newStages) return { success: false, message: 'stages not created' };

        const stageActions: {
          stageId: string;
          name: string;
          inputs: {
            isManualInput: boolean;
            inputValue: string;
            inputActionIndex: string;
            inputActionName: string;
            inputName: string;
          }[];
        }[] = [];

        for (let i = 0; i < input.stages.length; i++) {
          const stage = input.stages[i];
          const newStageAction = newStages[i];
          stage.stageActions.forEach((action) => {
            stageActions.push({
              stageId: newStageAction.id,
              name: action.name,
              inputs: action.inputs,
            });
          });
        }
        // for each new stage we want to find all of its actions and create them
        const newStageActions = await JobsController.createJobStageActions({
          prisma: ctx.prisma,
          job: job,
          newJobStages: newStages,
          stageActions: stageActions,
        });
        if (!newStageActions) return { success: false, message: 'stage actions not created' };

        return { success: true, message: 'job updated successfully', data: job };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),
  duplicateJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<any>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };

      try {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.jobId },
          include: {
            bot: true,
            stages: {
              include: {
                stageActions: {
                  include: {
                    inputs: true,
                  },
                },
              },
            },
          },
        });

        if (!job) return { success: false, message: 'job not found' };
        if (job.bot?.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: job.bot?.teamId,
            permission: TeamPermissionsTypes.RUN_JOBS,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        } else {
          if (job.teamId) {
            const check = await doesUserHavePermissionFromTeam({
              userID: ctx.session.user.id,
              teamID: job.teamId,
              permission: 'EDIT_JOBS',
            });
            if (!check.success) {
              return { success: false, message: check.message };
            }
          }
        }
        const newJob = await ctx.prisma.job.create({
          data: {
            name: job.name + ' (copy)',
            botId: job.botId,
            teamId: job.teamId,
            userId: job.userId,
            stages: {
              create: job.stages.map((stage) => ({
                stageActions: {
                  create: stage.stageActions.map((action) => ({
                    name: action.name,
                    actionIndex: action.actionIndex,
                    inputs: {
                      create: action.inputs.map((input) => ({
                        name: input.name,
                        inputValue: input.inputValue,
                        isManualInput: input.isManualInput,
                        inputActionIndex: input.inputActionIndex,
                        inputActionName: input.inputActionName,
                      })),
                    },
                  })),
                },
              })),
            },
          },
        });
        return { success: true, message: 'job duplicated successfully', data: newJob };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),

  getJobs: protectedProcedure
    .input(
      z.object({
        botId: z.string().optional(),
        teamId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }): Promise<ApiReturn<CompleteJob[]>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      const where: {
        botId?: string;
        userId?: string;
        teamId?: string;
      } = {};
      if (input.botId) {
        where.botId = input.botId;
      } else if (input.teamId) {
        where.teamId = input.teamId;
      } else {
        where.userId = ctx.session.user.id;
      }
      console.log('where', where);
      try {
        const jobs = await ctx.prisma.job.findMany({
          where,
          include: {
            stages: {
              include: {
                stageActions: {
                  include: {
                    inputs: true,
                  },
                },
              },
            },
          },
        });

        return {
          success: true,
          message: 'jobs fetched successfully',
          data: jobs as CompleteJob[],
        };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),
  getJob: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<Job>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.id },
        });
        if (!job) return { success: false, message: 'job not found' };
        return { success: true, message: 'job fetched successfully', data: job };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),

  deleteJob: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<Job>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.id },
          include: {
            bot: true,
          },
        });
        if (!job) return { success: false, message: 'job not found' };
        if (job.bot?.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: job.bot?.teamId,
            permission: TeamPermissionsTypes.RUN_JOBS,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        } else {
          if (job.teamId) {
            const check = await doesUserHavePermissionFromTeam({
              userID: ctx.session.user.id,
              teamID: job.teamId,
              permission: TeamPermissionsTypes.DELETE_JOBS,
            });
            if (!check.success) {
              return { success: false, message: check.message };
            }
          }
        }
        const stages = await ctx.prisma.jobStage.findMany({
          where: { jobId: input.id },
        });
        const stageActions = await ctx.prisma.jobStageAction.findMany({
          where: { jobStageId: { in: stages.map((stage) => stage.id) } },
        });
        const inputs = await ctx.prisma.jobStageActionInput.findMany({
          where: { jobStageActionId: { in: stageActions.map((action) => action.id) } },
        });
        await ctx.prisma.jobStageActionInput.deleteMany({
          where: { jobStageActionId: { in: stageActions.map((action) => action.id) } },
        });
        await ctx.prisma.jobStageAction.deleteMany({
          where: { jobStageId: { in: stages.map((stage) => stage.id) } },
        });
        await ctx.prisma.jobStage.deleteMany({ where: { jobId: input.id } });
        await ctx.prisma.job.delete({ where: { id: input.id } });

        return { success: true, message: 'job deleted successfully', data: job };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),

  connectJob: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        botId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<boolean>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        const job = await ctx.prisma.job.update({
          where: { id: input.id },
          data: {
            bot: {
              connect: {
                id: input.botId,
              },
            },
          },
        });
        return { success: true, message: 'job connected successfully' };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),
  disconnectJob: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<any>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.id },
        include: {
          bot: true,
        },
      });
      if (!job) return { success: false, message: 'job not found' };
      if (job.bot?.teamId) {
        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: job.bot?.teamId,
          permission: TeamPermissionsTypes.RUN_JOBS,
        });
        if (!check.success) {
          return { success: false, message: check.message };
        }
      } else {
        if (job.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: job.teamId,
            permission: TeamPermissionsTypes.DELETE_JOBS,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        }
      }
      try {
        const job = await ctx.prisma.job.update({
          where: { id: input.id },
          data: {
            bot: {
              disconnect: true,
            },
          },
        });
        return { success: true, message: 'job disconnected successfully', data: job };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),

  runJob: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<void>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.id },
          include: {
            bot: true,
          },
        });
        if (!job) return { success: false, message: 'job not found' };
        if (job.bot?.teamId) {
          const check = await doesUserHavePermissionFromTeam({
            userID: ctx.session.user.id,
            teamID: job.bot?.teamId,
            permission: TeamPermissionsTypes.RUN_JOBS,
          });
          if (!check.success) {
            return { success: false, message: check.message };
          }
        }

        const _job: CompleteJob = job as CompleteJob;

        return await wrapFireJob({ job: _job, callerId: ctx.session.user.id });
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),

  getJobFiredLogs: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }): Promise<ApiReturn<JobFiredLog[]>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        const jobFiredLogs = await ctx.prisma.jobFiredLog.findMany({
          where: { jobId: input.id },
          orderBy: { createdAt: 'desc' },
        });
        return {
          success: true,
          message: 'job fired logs fetched successfully',
          data: jobFiredLogs,
        };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),
  getJobFiredLog: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }): Promise<ApiReturn<JobFiredLog>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        const jobFiredLog = await ctx.prisma.jobFiredLog.findUnique({
          where: { id: input.id },
        });
        if (!jobFiredLog) return { success: false, message: 'job fired log not found' };
        return {
          success: true,
          message: 'job fired log fetched successfully',
          data: jobFiredLog,
        };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),

  jobToBot: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        botId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ApiReturn<Job>> => {
      if (!ctx.prisma) return { success: false, message: 'no prisma client' };
      try {
        const job = await ctx.prisma.job.update({
          where: { id: input.id },
          data: {
            bot: {
              connect: {
                id: input.botId,
              },
            },
          },
        });
        return { success: true, message: 'job connected successfully', data: job };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }),
});

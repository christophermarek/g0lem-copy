import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { doesUserHavePermissionFromTeam } from '../../controllers/teams/teamPermissions';
import { TeamPermissionsTypes } from '@prisma/client';

export const teamsRouter = createTRPCRouter({
  getAllTeamsProfiles: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.prisma) return { success: false, message: 'db not connected' };

    try {
      const teams = await ctx.prisma.team.findMany({
        where: {
          OR: [
            {
              users: {
                some: {
                  id: ctx.session.user.id,
                },
              },
            },
            { name: 'g0lem' },
          ],
        },
        include: {
          users: true,
        },
      });

      const g0lemTeam = teams.find((team) => team.name === 'g0lem');
      if (!g0lemTeam)
        return { success: false, message: 'g0lem team not found, must seed database' };
      // if user is not in g0lem team, add it
      if (!g0lemTeam.users.some((user) => user.id === ctx.session.user.id)) {
        await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            teams: {
              connect: { id: g0lemTeam.id },
            },
          },
        });
        await ctx.prisma.team.update({
          where: { id: g0lemTeam.id },
          data: {
            users: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      }

      return {
        success: true,
        data: teams.map((team) => ({
          id: team.id,
          name: team.name,
          picture: team.teamPicture,
          userCount: team.users.length,
        })),

        message: 'success get all teams',
      };
    } catch (e) {
      return { success: false, message: 'fail to get all teams' };
    }
  }),
  joinTeam: protectedProcedure
    .input(z.object({ teamName: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: { name: input.teamName },
        });
        if (!team) return { success: false, message: 'team not found' };
        if (team.teamPassword !== input.password)
          return { success: false, message: 'invalid password' };

        await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            teams: {
              connect: { id: team.id },
            },
          },
        });
        await ctx.prisma.team.update({
          where: { id: team.id },
          data: {
            users: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
        return { success: true, message: 'success join team' };
      } catch (e) {
        return { success: false, message: 'fail to join team' };
      }
    }),

  leaveTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: { id: input.teamId },
        });
        if (!team) return { success: false, message: 'team not found' };
        if (team.name === 'g0lem') {
          return { success: false, message: 'cannot leave g0lem team' };
        }

        await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            teams: {
              disconnect: { id: input.teamId },
            },
          },
        });
        await ctx.prisma.team.update({
          where: { id: input.teamId },
          data: {
            users: {
              disconnect: { id: ctx.session.user.id },
            },
          },
        });
        return { success: true, message: 'success leave team' };
      } catch (e) {
        return { success: false, message: 'fail to leave team' };
      }
    }),
  kickUser: protectedProcedure
    .input(z.object({ teamId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: { id: input.teamId },
        });
        if (!team) return { success: false, message: 'team not found' };

        const check = await doesUserHavePermissionFromTeam({
          userID: ctx.session.user.id,
          teamID: team.id,
          permission: TeamPermissionsTypes.TEAM_KICK,
        });
        console.log('check', check);
        if (!check.success) {
          return { success: false, message: check.message };
        }

        await ctx.prisma.user.update({
          where: { id: input.userId },
          data: {
            teams: {
              disconnect: { id: input.teamId },
            },
          },
        });
        await ctx.prisma.team.update({
          where: { id: input.teamId },
          data: {
            users: {
              disconnect: { id: input.userId },
            },
          },
        });
        return { success: true, message: 'success kick user' };
      } catch (e) {
        return { success: false, message: 'fail to kick user' };
      }
    }),
  createTeam: protectedProcedure
    .input(z.object({ name: z.string(), password: z.string(), pictureUrl: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.create({
          data: {
            name: input.name,
            teamPassword: input.password,
            teamPicture: input.pictureUrl,
            users: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
        await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            teams: {
              connect: { id: team.id },
            },
          },
        });
        return { success: true, message: 'success create team' };
      } catch (e) {
        return { success: false, message: 'fail to create team' };
      }
    }),
  deleteTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        await ctx.prisma.team.delete({
          where: { id: input.teamId },
        });
        return { success: true, message: 'success delete team' };
      } catch (e) {
        return { success: false, message: 'fail to delete team' };
      }
    }),
  updateTeamProfile: protectedProcedure
    .input(z.object({ teamId: z.string(), name: z.string(), pictureUrl: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        await ctx.prisma.team.update({
          where: { id: input.teamId },
          data: {
            name: input.name,
            teamPicture: input.pictureUrl,
          },
        });
        return { success: true, message: 'success update team profile' };
      } catch (e) {
        return { success: false, message: 'fail to update team profile' };
      }
    }),

  getTeamProfile: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: { id: input.teamId },
          include: {
            users: true,
            bots: true,
            jobs: true,
          },
        });
        if (!team) return { success: false, message: 'team not found' };
        return {
          success: true,
          message: 'success get team profile',
          data: {
            id: team.id,
            name: team.name,
            picture: team.teamPicture,
            userCount: team.users.length,
            bots: team.bots,
            jobs: team.jobs,
            users: team.users.map((user: { name: any; image: any }) => ({
              email: '',
              name: user.name,
              image: user.image,
            })),
          },
        };
      } catch (e) {
        return { success: false, message: 'fail to get team profile' };
      }
    }),
  botToTeam: protectedProcedure
    .input(z.object({ teamId: z.string(), botId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: { id: input.teamId },
        });
        if (!team) return { success: false, message: 'team not found' };
        await ctx.prisma.team.update({
          where: { id: input.teamId },
          data: {
            bots: {
              connect: { id: input.botId },
            },
          },
        });
        return { success: true, message: 'success bot to team' };
      } catch (e) {
        return { success: false, message: 'fail to bot to team' };
      }
    }),
  connectorToTeam: protectedProcedure
    .input(z.object({ teamId: z.string(), connectorId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: { id: input.teamId },
        });
        if (!team) return { success: false, message: 'team not found' };
        await ctx.prisma.team.update({
          where: { id: input.teamId },
          data: {
            connectors: {
              connect: { id: input.connectorId },
            },
          },
        });
        return { success: true, message: 'success connector to team' };
      } catch (e) {
        return { success: false, message: 'fail to connector to team' };
      }
    }),
  jobToTeam: protectedProcedure
    .input(z.object({ teamId: z.string(), jobId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: { id: input.teamId },
        });
        if (!team) return { success: false, message: 'team not found' };
        await ctx.prisma.team.update({
          where: { id: input.teamId },
          data: {
            jobs: {
              connect: { id: input.jobId },
            },
          },
        });
        return { success: true, message: 'success job to team' };
      } catch (e) {
        return { success: false, message: 'fail to job to team' };
      }
    }),
});

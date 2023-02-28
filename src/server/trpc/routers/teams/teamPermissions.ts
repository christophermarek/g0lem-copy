import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TeamPermissionsTypes } from '@prisma/client';
import {
  defaultTeamOnJoinPermissions,
  doesUserHavePermissionFromTeam,
} from '../../controllers/teams/teamPermissions';

export const teamPermissionsRouter = createTRPCRouter({
  createTeamPermission: protectedProcedure
    .input(
      z.object({
        teamID: z.string(),
        onJoinPermissions: z.array(z.nativeEnum(TeamPermissionsTypes)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        // need to check if default team permissions are set
        const team = await ctx.prisma.team.findUnique({
          where: {
            id: input.teamID,
          },
        });
        if (!team) return { success: false, message: 'team not found' };

        const existingTeamPermissions = await ctx.prisma.teamPermission.findMany({
          where: {
            teamId: input.teamID,
          },
        });
        if (existingTeamPermissions.length > 0) {
          return { success: false, message: 'team permissions already exist' };
        }

        let defaultPermissions = input.onJoinPermissions;
        if (defaultPermissions.length === 0) {
          defaultPermissions = defaultTeamOnJoinPermissions;
        }
        const updatedTeam = await ctx.prisma.team.update({
          where: {
            id: input.teamID,
          },
          data: {
            onJoinPermissions: defaultPermissions,
          },
        });

        const teamPermission = await ctx.prisma.teamPermission.create({
          data: {
            teamId: input.teamID,
            userId: ctx.session.user.id,
            teamPermissions: [
              ...defaultPermissions,
              TeamPermissionsTypes.TEAM_OWNER,
              TeamPermissionsTypes.TEAM_KICK,
              TeamPermissionsTypes.TEAM_PROFILE_EDITOR,
            ],
          },
        });
        return { success: true, message: 'team permission created', teamPermission, team };
      } catch (e) {
        return { success: false, message: 'fail to create team' };
      }
    }),
  getTeamOnJoinPermissions: protectedProcedure
    .input(z.object({ teamID: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: {
            id: input.teamID,
          },
        });
        if (!team) return { success: false, message: 'team not found' };
        return { success: true, message: 'team permissions', permissions: team.onJoinPermissions };
      } catch (e) {
        return { success: false, message: 'fail to get team permissions' };
      }
    }),
  addTeamOnJoinPermission: protectedProcedure
    .input(
      z.object({
        teamID: z.string(),
        permission: z.nativeEnum(TeamPermissionsTypes),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: {
            id: input.teamID,
          },
        });
        if (!team) return { success: false, message: 'team not found' };
        const updatedTeam = await ctx.prisma.team.update({
          where: {
            id: input.teamID,
          },
          data: {
            onJoinPermissions: {
              set: [...team.onJoinPermissions, input.permission],
            },
          },
        });
        return { success: true, message: 'team updated', team: updatedTeam };
      } catch (e) {
        return { success: false, message: 'fail to update team' };
      }
    }),
  removeTeamOnJoinPermission: protectedProcedure
    .input(
      z.object({
        teamID: z.string(),
        permission: z.nativeEnum(TeamPermissionsTypes),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: {
            id: input.teamID,
          },
        });
        if (!team) return { success: false, message: 'team not found' };
        const updatedTeam = await ctx.prisma.team.update({
          where: {
            id: input.teamID,
          },
          data: {
            onJoinPermissions: {
              set: team.onJoinPermissions.filter((p) => p !== input.permission),
            },
          },
        });
        return { success: true, message: 'team updated', team: updatedTeam };
      } catch (e) {
        return { success: false, message: 'fail to update team' };
      }
    }),

  editOnJoinTeamPermission: protectedProcedure
    .input(
      z.object({ teamID: z.string(), permissions: z.array(z.nativeEnum(TeamPermissionsTypes)) }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const team = await ctx.prisma.team.findUnique({
          where: {
            id: input.teamID,
          },
        });
        if (!team) return { success: false, message: 'team not found' };
        const updatedTeam = await ctx.prisma.team.update({
          where: {
            id: input.teamID,
          },
          data: {
            onJoinPermissions: input.permissions,
          },
        });
        return { success: true, message: 'team updated', team: updatedTeam };
      } catch (e) {
        return { success: false, message: 'fail to update team' };
      }
    }),
  getTeamPermission: protectedProcedure
    .input(z.object({ teamID: z.string(), teamPermissionID: z.string() }))
    .query(async ({ input, ctx }) => {
      // Takes team permission id for a specific user / team permission id
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamPermissionID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const teamPermission = await ctx.prisma.teamPermission.findUnique({
          where: {
            id: input.teamPermissionID,
          },
        });
        if (!teamPermission) return { success: false, message: 'team permission not found' };
        return { success: true, message: 'team permission found', teamPermission };
      } catch (e) {
        return { success: false, message: 'fail to get team permission' };
      }
    }),
  getAllTeamPermissions: protectedProcedure
    .input(z.object({ teamID: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };

      // for a team
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const teamPermissions = await ctx.prisma.teamPermission.findMany({
          where: {
            teamId: input.teamID,
          },
          include: {
            User: true,
          },
        });
        if (!teamPermissions) return { success: false, message: 'team permissions not found' };
        return { success: true, message: 'team permissions found', teamPermissions };
      } catch (e) {
        return { success: false, message: 'fail to get team permissions' };
      }
    }),
  // per user
  getUserTeamPermissions: protectedProcedure
    .input(z.object({ userID: z.string(), teamID: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const teamPermissions = await ctx.prisma.teamPermission.findMany({
          where: {
            userId: input.userID,
          },
        });
        if (!teamPermissions) return { success: false, message: 'team permissions not found' };
        return { success: true, message: 'team permissions found', teamPermissions };
      } catch (e) {
        return { success: false, message: 'fail to get team permissions' };
      }
    }),
  createOrEditUserTeamPermission: protectedProcedure
    .input(
      z.object({
        teamID: z.string(),
        teamPermissionID: z.string(),
        permissions: z.array(z.nativeEnum(TeamPermissionsTypes)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const teamPermission = await ctx.prisma.teamPermission.findUnique({
          where: {
            id: input.teamPermissionID,
          },
        });
        if (!teamPermission) return { success: false, message: 'team permission not found' };
        const updatedTeamPermission = await ctx.prisma.teamPermission.update({
          where: {
            id: input.teamPermissionID,
          },
          data: {
            teamPermissions: input.permissions,
          },
        });
        return {
          success: true,
          message: 'team permission updated',
          teamPermission: updatedTeamPermission,
        };
      } catch (e) {
        return { success: false, message: 'fail to update team permission' };
      }
    }),
  addPermissionToUserTeamPermission: protectedProcedure
    .input(
      z.object({
        teamID: z.string(),
        teamPermissionID: z.string(),
        permission: z.nativeEnum(TeamPermissionsTypes),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const teamPermission = await ctx.prisma.teamPermission.findUnique({
          where: {
            id: input.teamPermissionID,
          },
        });
        if (!teamPermission) return { success: false, message: 'team permission not found' };
        const updatedTeamPermission = await ctx.prisma.teamPermission.update({
          where: {
            id: input.teamPermissionID,
          },
          data: {
            teamPermissions: {
              push: input.permission,
            },
          },
        });
        return {
          success: true,
          message: 'team permission updated',
          teamPermission: updatedTeamPermission,
        };
      } catch (e) {
        return { success: false, message: 'fail to update team permission' };
      }
    }),
  removePermissionFromUserTeamPermission: protectedProcedure
    .input(
      z.object({
        teamID: z.string(),
        teamPermissionID: z.string(),
        permission: z.nativeEnum(TeamPermissionsTypes),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.prisma) return { success: false, message: 'db not connected' };
      const checkUserPermission = await doesUserHavePermissionFromTeam({
        userID: ctx.session.user.id,
        permission: TeamPermissionsTypes.TEAM_OWNER,
        teamID: input.teamID,
      });
      if (!checkUserPermission.success)
        return { success: false, message: checkUserPermission.message };
      try {
        const teamPermission = await ctx.prisma.teamPermission.findUnique({
          where: {
            id: input.teamPermissionID,
          },
        });
        if (!teamPermission) return { success: false, message: 'team permission not found' };
        const updatedPermissionList = teamPermission.teamPermissions.filter(
          (permission) => permission !== input.permission,
        );
        const updatedTeamPermission = await ctx.prisma.teamPermission.update({
          where: {
            id: input.teamPermissionID,
          },
          data: {
            teamPermissions: updatedPermissionList,
          },
        });
        return {
          success: true,
          message: 'team permission updated',
          teamPermission: updatedTeamPermission,
        };
      } catch (e) {
        return { success: false, message: 'fail to update team permission' };
      }
    }),
});

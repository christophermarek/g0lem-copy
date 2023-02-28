import { PrismaClient, TeamPermissionsTypes } from '@prisma/client';

interface TeamPermissionResponse {
  success: boolean;
  message: string;
}
export const defaultTeamOnJoinPermissions: TeamPermissionsTypes[] = [
  'ADD_BOTS',
  'EDIT_BOTS',
  'DELETE_BOTS',
  'ADD_JOBS',
  'EDIT_JOBS',
  'DELETE_JOBS',
  'RUN_JOBS',
  'ADD_SCHEDULES',
  'EDIT_SCHEDULES',
  'DELETE_SCHEDULES',
  'ENABLE_SCHEDULES',
  'DISABLE_SCHEDULES',
  'ADD_CONNECTORS',
  'EDIT_CONNECTORS',
  'DISCONNECT_CONNECTORS',
];

const makeSureAllUsersHavePermissions = async (teamID: string): Promise<boolean> => {
  if (!prisma) return false;
  const team = await prisma.team.findUnique({
    where: {
      id: teamID,
    },
    include: {
      users: true,
    },
  });
  if (!team) return false;
  const teamPermissions = await prisma.teamPermission.findMany({
    where: {
      teamId: teamID,
    },
  });
  if (teamPermissions.length === 0) return false;
  const usersWithoutPermissions = team.users.filter((user) => {
    const userHasPermissions = teamPermissions.find((teamPermission) => {
      return teamPermission.userId === user.id;
    });
    return !userHasPermissions;
  });
  if (usersWithoutPermissions.length === 0) return true;
  for (const user of usersWithoutPermissions) {
    await prisma.teamPermission.create({
      data: {
        teamId: teamID,
        userId: user.id,
        teamPermissions: team.onJoinPermissions,
      },
    });
  }
  return true;
};

const checkAndSetDefaultTeamPermissions = async (
  teamID: string,
  callerID: string,
): Promise<TeamPermissionResponse> => {
  if (!prisma) return { success: false, message: 'db not connected' };
  const team = await prisma.team.findUnique({
    where: {
      id: teamID,
    },
    include: {
      TeamPermissions: true,
      users: true,
    },
  });
  if (!team) return { success: false, message: 'team not found' };

  const teamPermissions = await prisma.teamPermission.findMany({
    where: {
      teamId: teamID,
    },
  });

  if (teamPermissions.length === 0) {
    // check if user is team owner
    const isTeamCreator = team.users[0].id === callerID;
    if (!isTeamCreator) return { success: false, message: 'user is not team creator' };

    // if no defaultJoinPermissions, set them for the team
    if (team.onJoinPermissions.length === 0) {
      await prisma.team.update({
        where: {
          id: teamID,
        },
        data: {
          onJoinPermissions: defaultTeamOnJoinPermissions,
        },
      });
    }

    const teamPermission = await prisma.teamPermission.create({
      data: {
        teamId: teamID,
        userId: callerID,
        teamPermissions: [
          ...defaultTeamOnJoinPermissions,
          TeamPermissionsTypes.TEAM_OWNER,
          TeamPermissionsTypes.TEAM_KICK,
          TeamPermissionsTypes.TEAM_PROFILE_EDITOR,
        ],
      },
    });
    return { success: true, message: 'team permissions created' };
  }
  return { success: true, message: 'team permissions already exist' };
};

export const doesUserHavePermissionFromTeam = async ({
  userID,
  permission,
  teamID,
}: {
  userID: string;
  teamID: string;
  permission: TeamPermissionsTypes;
}): Promise<TeamPermissionResponse> => {
  if (!prisma) return { success: false, message: 'db not connected' };
  const init: TeamPermissionResponse = await checkAndSetDefaultTeamPermissions(teamID, userID);

  if (!init.success) return init;
  const hasPermissions = await makeSureAllUsersHavePermissions(teamID);
  if (!hasPermissions)
    return { success: false, message: 'could not make sure all users have permissions' };

  const userPermissions = await prisma.teamPermission.findFirst({
    where: {
      userId: userID,
      teamId: teamID,
    },
  });

  if (!userPermissions)
    return { success: false, message: 'user does not have permission from team' };
  if (userPermissions.teamPermissions.includes(permission)) {
    return { success: true, message: 'user has permission' };
  } else {
    return { success: false, message: 'user does not have permission' };
  }
};

export const doesUserHavePermissionFromTeamForItem = async (
  prisma: PrismaClient,
  userID: string,
  teamID: string,
  permission: TeamPermissionsTypes,
) => {
  const userPermissions = await prisma.teamPermission.findFirst({
    where: {
      userId: userID,
      teamId: teamID,
    },
  });
  if (!userPermissions)
    return { success: false, message: 'user does not have permission from team for this item' };
  if (userPermissions.teamPermissions.includes(permission)) {
    return { success: true, message: 'user has permission' };
  }
};

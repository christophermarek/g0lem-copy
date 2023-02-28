import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ListPrimary } from '../../components/ListPrimary';
import { Modal } from '../../components/modals/Modal';
import { api } from '../../utils/api';
import { ParentProps } from '../Parent';
import { TabColors } from '../../components/HeaderTabs';
import { ButtonSecondary } from '../../components/buttonSecondary';
import {
  faCircleXmark,
  faEdit,
  faExclamationTriangle,
  faPlus,
  faUserFriends,
  faUserShield,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TeamPermissionsTypes } from '@prisma/client';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import { ControlPane } from '../../components/ControlPane';
import { TRACE_OUTPUT_VERSION } from 'next/dist/shared/lib/constants';

interface PermissionControlsProps {
  teamParent: Required<ParentProps>['teamParent'];
  setOpenTeamPermissionControls: Dispatch<SetStateAction<boolean>>;
  selectChildPage: (pageId: string, open: boolean) => void;
}

export const TeamPermissionControls: React.FC<PermissionControlsProps> = ({
  teamParent,
  setOpenTeamPermissionControls,
  selectChildPage,
}) => {
  const getTeamPermissions = api.teamPermissions.getAllTeamPermissions.useQuery({
    teamID: teamParent.id,
  });

  const getTeamOnJoinPermissions = api.teamPermissions.getTeamOnJoinPermissions.useQuery({
    teamID: teamParent.id,
  });
  const addTeamOnJoinPermission = api.teamPermissions.addTeamOnJoinPermission.useMutation();
  const removeTeamOnJoinPermission = api.teamPermissions.removeTeamOnJoinPermission.useMutation();

  const addPermissionToUserTeamPermission =
    api.teamPermissions.addPermissionToUserTeamPermission.useMutation();
  const removeUserTeamPermission =
    api.teamPermissions.removePermissionFromUserTeamPermission.useMutation();

  const teamOnJoinPermissionsFormatted = () => {
    const teamOnJoinHas = Object.keys(TeamPermissionsTypes).filter((permission) =>
      getTeamOnJoinPermissions?.data?.permissions?.some(
        (onJoinPermissionItem) => onJoinPermissionItem === permission,
      ),
    );
    const teamOnJoinDoesNotHave = Object.keys(TeamPermissionsTypes).filter(
      (permission) => !teamOnJoinHas.some((userPermission) => userPermission === permission),
    );

    return { teamOnJoinHas, teamOnJoinDoesNotHave };
  };

  const fireAddTeamOnJoinPermission = async (id: string) => {
    const toType = id as TeamPermissionsTypes;
    const res = await addTeamOnJoinPermission.mutateAsync({
      teamID: teamParent.id,
      permission: toType,
    });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
      getTeamOnJoinPermissions.refetch();
    } else {
      fireToast(ToastTypes.error, res.message);
    }
  };
  const fireRemoveTeamOnJoinPermission = async (id: string) => {
    const toType = id as TeamPermissionsTypes;
    const res = await removeTeamOnJoinPermission.mutateAsync({
      teamID: teamParent.id,
      permission: toType,
    });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
      getTeamOnJoinPermissions.refetch();
    } else {
      fireToast(ToastTypes.error, res.message);
    }
  };

  const [openEditTeamPermissionsSection, setOpenEditTeamPermissionsSection] = useState(false);
  const [selectedEditTeamPermission, setSelectedEditTeamPermission] = useState<string>('');

  const giveUserPermission = async (id: string) => {
    const toType = id as TeamPermissionsTypes;

    const response = await addPermissionToUserTeamPermission.mutateAsync({
      teamID: teamParent.id,
      teamPermissionID: selectedEditTeamPermission,
      permission: toType,
    });
    if (response.success) {
      fireToast(ToastTypes.success, response.message);
      getTeamPermissions.refetch();
    } else {
      fireToast(ToastTypes.error, response.message);
    }
  };
  const removeUserPermission = async (id: string) => {
    // id passed is the teamPermission type.
    const toType = id as TeamPermissionsTypes;

    const response = await removeUserTeamPermission.mutateAsync({
      teamID: teamParent.id,
      teamPermissionID: selectedEditTeamPermission,
      permission: toType,
    });
    if (response.success) {
      fireToast(ToastTypes.success, response.message);
      getTeamPermissions.refetch();
    } else {
      fireToast(ToastTypes.error, response.message);
    }
  };

  const userPermissionFormatted = (permissionId: string) => {
    const userPermissions = getTeamPermissions?.data?.teamPermissions?.find(
      (permission) => permission.id === permissionId,
    )?.teamPermissions;
    if (!userPermissions) return { userHas: [], userDoesNotHave: [] };
    const userHas = Object.keys(TeamPermissionsTypes).filter((permission) =>
      userPermissions.some((userPermission) => userPermission === permission),
    );
    const userDoesNotHave = Object.keys(TeamPermissionsTypes).filter(
      (permission) => !userHas.some((userPermission) => userPermission === permission),
    );

    return { userHas, userDoesNotHave };
  };

  const [openEditTeamOnJoinPermissionsSection, setOpenEditTeamOnJoinPermissionsSection] =
    useState(false);

  useEffect(() => {
    if (getTeamPermissions.data?.success === false) {
      fireToast(ToastTypes.error, getTeamPermissions.data.message);
      selectChildPage('List', false);
    }
  }, [getTeamPermissions.data]);

  return (
    <Modal
      title='Admin'
      height='h-screen'
      // noControlPane
      openModalState={true}
      setOpenModal={setOpenTeamPermissionControls}
      parentBorderColor={TabColors.Teams.secondary}
      buttons={[
        {
          text: 'Close',
          onClick: () => selectChildPage('List', false),
          isVisible: true,
          selected: false,
          icon: faCircleXmark,
        },
        {
          icon: faUserShield,
          text: 'Users',
          isVisible: true,
          selected: !openEditTeamOnJoinPermissionsSection,
          onClick: () => setOpenEditTeamOnJoinPermissionsSection(false),
        },
        {
          icon: faUserFriends,
          text: 'On Join',
          isVisible: true,
          selected: openEditTeamOnJoinPermissionsSection,
          onClick: () => setOpenEditTeamOnJoinPermissionsSection(true),
        },
      ]}
    >
      {getTeamPermissions.isLoading && <div>Loading...</div>}
      {getTeamPermissions.isError && <div>Error</div>}
      {getTeamPermissions.data?.success === false && (
        <div>
          <ButtonSecondary
            noHoverAnimation
            noCursor
            className='w-fit items-center gap-x-4 px-4 text-lg font-bold'
            selected={false}
          >
            {getTeamPermissions.data?.message}
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </ButtonSecondary>
        </div>
      )}
      {getTeamPermissions.data?.teamPermissions && (
        <div className='my-4 w-96'>
          {openEditTeamOnJoinPermissionsSection ? (
            <>
              <div className='grid h-60 grid-cols-2 overflow-y-scroll'>
                <div>
                  Unset On Join Permissions:
                  <ListPrimary
                    listItems={teamOnJoinPermissionsFormatted().teamOnJoinDoesNotHave.map(
                      (permission: string) => ({
                        id: permission,
                        name: permission,
                      }),
                    )}
                    itemActions={[
                      {
                        exec: fireAddTeamOnJoinPermission,
                        icon: faX,
                      },
                    ]}
                  />
                </div>
                <div>
                  Team On Join Permissions:
                  <ListPrimary
                    listItems={teamOnJoinPermissionsFormatted().teamOnJoinHas.map(
                      (permission: string) => ({
                        id: permission,
                        name: permission,
                      }),
                    )}
                    itemActions={[
                      {
                        exec: fireRemoveTeamOnJoinPermission,
                        icon: faX,
                      },
                    ]}
                  />
                </div>
              </div>
            </>
          ) : (
            <ListPrimary
              listItems={getTeamPermissions.data?.teamPermissions.map((permission) => ({
                id: permission.id,
                name: permission.User.name || 'No name',
              }))}
              itemActions={[
                {
                  exec: async (id: string) => {
                    setOpenEditTeamPermissionsSection(!openEditTeamPermissionsSection);
                    setSelectedEditTeamPermission(id);
                  },
                  icon: faEdit,
                  actionName: 'Edit',
                },
              ]}
              expandedItemIndex={
                selectedEditTeamPermission
                  ? getTeamPermissions.data?.teamPermissions.findIndex(
                      (permission) => permission.id === selectedEditTeamPermission,
                    )
                  : -1
              }
            >
              <div className='grid h-60 grid-cols-2 overflow-y-scroll'>
                <div>
                  User does not have:
                  <ListPrimary
                    listItems={userPermissionFormatted(
                      selectedEditTeamPermission,
                    ).userDoesNotHave.map((permission) => ({
                      id: permission,
                      name: permission,
                    }))}
                    itemActions={[
                      {
                        exec: giveUserPermission,
                        icon: faPlus,
                      },
                    ]}
                  />
                </div>
                <div>
                  Users Permissions:
                  <ListPrimary
                    listItems={userPermissionFormatted(selectedEditTeamPermission).userHas.map(
                      (permission) => ({
                        id: permission,
                        name: permission,
                      }),
                    )}
                    itemActions={[
                      {
                        exec: removeUserPermission,
                        icon: faX,
                      },
                    ]}
                  />
                </div>
              </div>
            </ListPrimary>
          )}
        </div>
      )}
    </Modal>
  );
};

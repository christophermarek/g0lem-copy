import { useState } from 'react';
import { RootPage, usePageSelector } from '../../components/RootPage';
import { TeamsCreate } from './TeamsCreate';
import { TeamsList } from './TeamsList';
import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { TabColors } from '../../components/HeaderTabs';
import { JoinTeam } from './JoinTeam';
import Bots from '../bots';
import Jobs from '../jobs';
import { api } from '../../utils/api';
import Connectors from '../connectors';
import { TeamPermissionControls } from './PermissionControls';
import { Team } from './Team';
import { fireToast, ToastTypes } from '../../react/hooks/useToast';
import { ControlPaneButton } from '../../components/ControlPane/Button';
import { faPersonWalkingDashedLineArrowRight } from '@fortawesome/free-solid-svg-icons';

interface TeamsProps {}

export const Teams: React.FC<TeamsProps> = ({}) => {
  const [listPageOpen, setListPageOpen] = useState(true);
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [teamPageOpen, setTeamPageOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [joinTeamOpen, setJoinTeamOpen] = useState(false);
  const [connectorsOpen, setConnectorsOpen] = useState(false);

  // team page
  const [openJobs, setOpenJobs] = useState(false);
  const [openBots, setOpenBots] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  const team = api.teams.getTeamProfile.useQuery({ teamId: selectedTeam });
  const teamsList = api.teams.getAllTeamsProfiles.useQuery();
  const disconnectTeam = api.teams.leaveTeam.useMutation();

  const viewTeam = async (id: string) => {
    setSelectedTeam(id);
  };

  const fireDisconnectTeam = async (id: string) => {
    console.log('disconnecting from team');
    console.log(id);
    console.log(selectedTeam);
    fireToast(ToastTypes.loading, 'Disconnecting from team');
    const res = await disconnectTeam.mutateAsync({ teamId: selectedTeam });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
      teamsList.refetch();
      selectChildPage('List', false);
    } else {
      fireToast(ToastTypes.error, res.message);
    }
  };

  const pageControls = [
    {
      isOpen: listPageOpen,
      pageId: 'List',
      setPageOpen: setListPageOpen,
      closesChildren: true,
    },

    ...(!teamPageOpen && !openBots && !openJobs && !connectorsOpen
      ? [
          {
            isOpen: createPageOpen,
            pageId: 'Add',
            setPageOpen: setCreatePageOpen,
            opensModal: true,
          },
          {
            isOpen: joinTeamOpen,
            pageId: 'Join',
            setPageOpen: setJoinTeamOpen,
            opensModal: true,
          },
          {
            isOpen: teamPageOpen,
            pageId: 'Team',
            setPageOpen: setTeamPageOpen,
            hidden: true,
          },
        ]
      : []),
  ];

  const childPaneButtons = [
    {
      isOpen: teamPageOpen,
      pageId: 'Info',
      setPageOpen: setTeamPageOpen,
    },
    {
      isOpen: openBots,
      pageId: 'Bots',
      setPageOpen: setOpenBots,
    },
    {
      isOpen: openJobs,
      pageId: 'Jobs',
      setPageOpen: setOpenJobs,
    },
    {
      isOpen: connectorsOpen,
      pageId: 'Connectors',
      setPageOpen: setConnectorsOpen,
    },
    {
      isOpen: permissionsOpen,
      pageId: 'Admin',
      setPageOpen: setPermissionsOpen,
      opensModal: true,
    },
  ];
  const selectChildPage = usePageSelector(pageControls, childPaneButtons);

  return (
    <ComponentPortalWrapper portal='.portal2'>
      <RootPage
        parentBorderColor={TabColors.Teams.secondary}
        pageTitle='Teams'
        pageControls={pageControls}
        childPaneOpen={teamPageOpen || openBots || openJobs || connectorsOpen || permissionsOpen}
        childPaneTitle={`${team.data ? (team.data.data ? team.data.data.name : '') : ''} Team`}
        childPaneButtons={childPaneButtons}
        selectChildPage={selectChildPage}
        injectedChildButtons={
          <ControlPaneButton
            button={{
              icon: faPersonWalkingDashedLineArrowRight,
              text: 'Leave',
              isVisible: true,
              onClick: fireDisconnectTeam as any,
              selected: false,
              widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
              roundedConfigOverride: 'rounded-none',
            }}
            border={''}
            rounded={''}
          />
        }
      >
        {listPageOpen && (
          <>
            {teamsList.isLoading && <div>Loading...</div>}
            {teamsList.isError && <div>Error: {teamsList.error.message}</div>}
            {teamsList.data && (
              <TeamsList
                viewTeam={viewTeam}
                setSelectedTeam={setSelectedTeam}
                selectChildPage={selectChildPage}
                teamsList={teamsList.data}
                refetch={teamsList.refetch}
              />
            )}
          </>
        )}
        {createPageOpen && (
          <TeamsCreate
            selectChildPage={selectChildPage}
            refetch={teamsList.refetch}
            setCreatePageOpen={setCreatePageOpen}
          />
        )}
        {joinTeamOpen && <JoinTeam refetch={teamsList.refetch} setJoinTeamOpen={setJoinTeamOpen} />}
        {teamPageOpen && (
          <>
            {team.isLoading && <div>Loading...</div>}
            {team.isError && <div>Error: {team.error.message}</div>}
            {team.data?.data && <Team teamQuery={team.data} refetch={team.refetch} />}
          </>
        )}
        {openBots && (
          <>
            {team.isLoading && <div>Loading...</div>}
            {team.isError && <div>Error: {team.error.message}</div>}
            {team.data?.data && (
              <Bots
                botParent={undefined}
                teamParent={{ id: team.data.data.id, name: team.data.data.name }}
              />
            )}
          </>
        )}
        {openJobs && (
          <>
            {team.isLoading && <div>Loading...</div>}
            {team.isError && <div>Error: {team.error.message}</div>}
            {team.data?.data && (
              <Jobs
                botParent={undefined}
                teamParent={{ id: team.data.data.id, name: team.data.data.name }}
              />
            )}
          </>
        )}
        {connectorsOpen && (
          <>
            {team.isLoading && <div>Loading...</div>}
            {team.isError && <div>Error: {team.error.message}</div>}
            {team.data?.data && (
              <Connectors teamParent={{ id: team.data.data.id, name: team.data.data.name }} />
            )}
          </>
        )}
        {permissionsOpen && team.data?.data && (
          <>
            <TeamPermissionControls
              selectChildPage={selectChildPage}
              setOpenTeamPermissionControls={setPermissionsOpen}
              teamParent={{
                id: team.data.data.id,
                name: team.data.data.name,
              }}
            />
          </>
        )}
      </RootPage>
    </ComponentPortalWrapper>
  );
};

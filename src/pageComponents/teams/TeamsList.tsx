import { faPlugCircleXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ListPrimary } from '../../components/ListPrimary';
import { api } from '../../utils/api';
import { ParentProps } from '../Parent';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import { Dispatch, SetStateAction } from 'react';
import { TabColors } from '../../components/HeaderTabs';
import { Frame } from '../../components/container';
import { UseTRPCInfiniteQueryResult } from '@trpc/react-query/shared';
import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '../../server/trpc/root';

interface TeamsListProps {
  setSelectedTeam: Dispatch<SetStateAction<string>>;
  viewTeam: (id: string) => Promise<void>;
  selectChildPage: (pageId: string, opensModal: boolean) => void;
  teamsList: inferRouterOutputs<AppRouter>['teams']['getAllTeamsProfiles'];
  refetch: any;
}

export const TeamsList: React.FC<ParentProps & TeamsListProps> = ({
  setSelectedTeam,
  viewTeam,
  selectChildPage,
  teamsList,
  refetch,
}) => {
  const fireViewTeam = async (id: string) => {
    viewTeam(id);
    selectChildPage('Info', false);
  };

  return (
    <Frame parentBorderColor={TabColors.Teams.secondary} className='my-4 border-none px-0 py-0'>
      {teamsList.data && teamsList.data && (
        <ListPrimary
          forceButtonsRow
          listItems={teamsList.data.map((team) => ({
            name: team.name,
            id: team.id,
            srcImageUrl: team.picture,
          }))}
          itemActions={[
            // { exec: fireDisconnectTeam, icon: faPlugCircleXmark, actionName: 'Disconnect' },
            { exec: fireViewTeam, icon: faSearch, actionName: 'View' },
          ]}
        />
      )}
    </Frame>
  );
};

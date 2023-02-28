import { faPlug, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dispatch, SetStateAction, useState } from 'react';
import { ListPrimary } from '../../components/ListPrimary';
import { api } from '../../utils/api';
import { ParentProps } from '../Parent';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '../../server/trpc/root';

interface ConnectorListProps {
  setConnectorOpened: Dispatch<SetStateAction<boolean>>;
  connectorOpened: boolean;
  refetch: any;
  connectorList: inferRouterOutputs<AppRouter>['oauth']['getConnectors'];
}

export const ConnectorList: React.FC<ParentProps & ConnectorListProps> = ({
  setConnectorOpened,
  connectorOpened,
  teamParent,
  refetch,
  connectorList,
}) => {
  const deleteConnector = api.oauth.deleteConnector.useMutation();
  const revokeConnectorAccessToken = api.oauth.revokeAccessToken.useMutation();
  const disconnectConnectorFromTeam = api.oauth.disconnectConnectorFromTeam.useMutation();

  const [selectedConnector, setSelectedConnector] = useState<string>('');

  const callDeleteConnector = async (id: string) => {
    fireToast(ToastTypes.loading, 'Deleting connector...');
    const res = await deleteConnector.mutateAsync({ teamID: teamParent?.id, connectorID: id });
    if (res.success) {
      fireToast(ToastTypes.success, 'Connector deleted');
      refetch();
    } else {
      fireToast(ToastTypes.error, 'Error deleting connector');
    }
  };
  const viewConnector = async (id: string) => {
    const connector = connectorList?.find((conn) => conn.id === id);
    if (!connector) {
      fireToast(ToastTypes.error, 'Error opening connector');
      return;
    }
    if (connector.type === 'reddit') {
      // if reddit, open profile in new tab
      window.open(`https://reddit.com/user/${connector.authTypeAccountName}`, '_blank');
    } else if (connector.type === 'twitter') {
      window.open(`https://twitter.com/i/user/${connector.authTypeAccountId}`, '_blank');
    } else {
      // if reddit, open profile in new tab
      setConnectorOpened(true);
      setSelectedConnector(id);
    }
  };

  const fireDisconnectConnectorFromTeam = async (id: string) => {
    const prompt = window.confirm(
      'Are you sure you want to disconnect this connector from this team?\n ',
    );
    if (!prompt) {
      return;
    }
    if (!teamParent) {
      fireToast(ToastTypes.error, 'Need to open team page error');
      return;
    }

    const res = await disconnectConnectorFromTeam.mutateAsync({
      connectorId: id,
      teamId: teamParent?.id,
    });
    if (res.success) {
      refetch();
      fireToast(ToastTypes.success, 'Connector disconnected from team');
    } else {
      fireToast(ToastTypes.error, 'Error disconnecting connector from team');
    }
  };

  return (
    <div className='my-4'>
      {connectorList && (
        <ListPrimary
          listItems={connectorList
            .filter(
              (conn) =>
                conn.type === 'twitter' || conn.type === 'discordWebhook' || conn.type === 'reddit',
            )
            .map((connector) => ({
              name:
                `${connector.type.substring(0, 1).toUpperCase()}${connector.type.substring(1)} 
                ${connector.authTypeAccountName}` || 'INVALID!',
              id: connector.id || 'INVALID!',
            }))}
          itemActions={[
            {
              icon: faSearch,
              exec: viewConnector,
              actionName: 'View',
            },
            ...(teamParent
              ? [
                  {
                    icon: faPlug,
                    exec: fireDisconnectConnectorFromTeam,
                    actionName: 'Disconnect',
                  },
                ]
              : [
                  {
                    icon: faTrash,
                    exec: callDeleteConnector,
                    actionName: 'Delete',
                  },
                ]),
          ]}
        />
      )}
    </div>
  );
};

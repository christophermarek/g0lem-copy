import { api } from '../../../utils/api';
import { ListPrimary } from '../../../components/ListPrimary';
import { faEye } from '@fortawesome/free-solid-svg-icons';

interface ActionLogsProps {}
export const ActionLogs: React.FC<ActionLogsProps> = ({}) => {
  const actionLogsList = api.actionLogs.getActionLogs.useQuery();

  return (
    <>
      {actionLogsList.isLoading && <div>Loading...</div>}
      {actionLogsList.isError && <div>Error: {actionLogsList.error.message}</div>}
      {actionLogsList.isSuccess && actionLogsList.data && (
        <>
          <ListPrimary
            listItems={actionLogsList.data.map((_actionLog, index) => ({
              name: _actionLog.actionDisplayName,
              id: _actionLog.id,
            }))}
            itemActions={[
              {
                exec: async () => alert('View Log'),
                icon: faEye,
                actionName: 'View',
              },
            ]}
          />
        </>
      )}
    </>
  );
};

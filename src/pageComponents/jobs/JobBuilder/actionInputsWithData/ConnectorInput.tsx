import { Dispatch, useEffect } from 'react';
import { JobStageAction, JobStateReducerAction } from '../../../../react/reducers/jobStageReducer';
import { api } from '../../../../utils/api';
import { ParentProps } from '../../../Parent';

interface ConnectorInputProps {
  input: JobStageAction['inputs'][0];
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
}

export const ConnectorInput: React.FC<ParentProps & ConnectorInputProps> = ({
  input,
  stageIndex,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
  teamParent,
}) => {
  const connectors = api.oauth.getConnectors.useQuery({});
  const teamConnectors = api.oauth.getConnectors.useQuery({ teamId: teamParent?.id });

  const inputNameToConnectorType = (inputName: string) => {
    if (inputName.includes('twitter')) return 'twitter';
    if (inputName.includes('reddit')) return 'reddit';
    return 'Invalid connector name';
  };

  const connectorNameToDefaultConnectorValue = (connectorName: string) => {
    return defaultConnectorValue(inputNameToConnectorType(connectorName));
  };
  const defaultConnectorValue = (connectorType: string) => {
    if (!connectors.data) return 'Error fetching connector on frontend';
    const userConnector = connectors.data.find((c) => c.type === connectorType);
    if (!userConnector) return 'Error fetching connector on frontend';
    return userConnector.id || 'Error fetching connector on frontend';
  };

  const connectorValues = (
    connectorType: string,
    userConnectors: {
      id: string;
      type: string;
      authTypeAccountId: string | null;
      authTypeAccountName: string | null;
      teamId: string | null;
    }[],
    teamConnectors: {
      id: string;
      type: string;
      authTypeAccountId: string | null;
      authTypeAccountName: string | null;
      teamId: string | null;
    }[],
  ) => {
    return userConnectors
      ?.concat(
        teamConnectors.filter((teamConnector) =>
          connectors.data?.find((c) => c.id === teamConnector.id) ? false : true,
        ) || [],
      )
      .filter((connector) => connector.type === connectorType);
  };

  useEffect(() => {
    if (connectors.data && input.value.trim() === '') {
      dispatchJobStagesReducer({
        type: 'updateActionInput',
        payload: {
          stageIndex,
          actionIndex,
          inputIndex,
          value: connectorNameToDefaultConnectorValue(input.inputName.toLowerCase()),
        },
      });
    }
  }, [connectors.data]);

  return (
    <>
      {connectors.data && (
        <select
          className='bg-primary h-11 w-full rounded-md border border-solid border-gray-400 py-1 px-2'
          value={
            input.value.trim() === ''
              ? connectorNameToDefaultConnectorValue(input.inputName.toLowerCase())
              : input.value
          }
          onChange={(e) =>
            dispatchJobStagesReducer({
              type: 'updateActionInput',
              payload: { stageIndex, actionIndex, inputIndex, value: e.target.value },
            })
          }
        >
          {input.inputName.toLowerCase().includes('twitter') ? (
            <>
              {connectorValues('twitter', connectors.data, teamConnectors.data || []).map(
                (connector) => (
                  <option key={connector.id} value={connector.id || 'Error getting connector'}>
                    {connector.authTypeAccountName}
                  </option>
                ),
              )}
            </>
          ) : input.inputName.toLowerCase().includes('reddit') ? (
            <>
              {connectorValues('reddit', connectors.data, teamConnectors.data || []).map(
                (connector) => (
                  <option key={connector.id} value={connector.id}>
                    {connector.authTypeAccountName}
                  </option>
                ),
              )}
            </>
          ) : (
            <>No connectors for this oauth</>
          )}
        </select>
      )}
    </>
  );
};

import { useEffect } from 'react';
import { api } from '../../../../utils/api';
import { ActionInputProps } from '../ActionInput';

export const OpenAiApiKeyInput: React.FC<ActionInputProps> = ({
  input,
  inputIndex,
  actionIndex,
  stageIndex,
  dispatchJobStagesReducer,
}) => {
  const userData = api.user.getUserProfile.useQuery();
  const key = userData.data?.openAiApiKey || 'g0lem';

  useEffect(() => {
    if (userData.data) {
      dispatchJobStagesReducer({
        type: 'updateActionInput',
        payload: {
          stageIndex,
          actionIndex,
          inputIndex,
          value: key,
        },
      });
    }
  }, [input.inputName, userData.data]);

  //   we either use the users api key or set it to g0lem

  return (
    <>
      {userData.data && (
        <select
          className='bg-primary h-11 w-full rounded-md border border-solid border-gray-400 py-1 px-2'
          value={input.value}
          onChange={(e) =>
            dispatchJobStagesReducer({
              type: 'updateActionInput',
              payload: {
                stageIndex,
                actionIndex,
                inputIndex,
                value: e.target.value,
              },
            })
          }
        >
          <>{userData.data && <option value={key}>{key}</option>}</>
          <option value={'g0lem'}>{'g0lem'}</option>
        </select>
      )}
    </>
  );
};

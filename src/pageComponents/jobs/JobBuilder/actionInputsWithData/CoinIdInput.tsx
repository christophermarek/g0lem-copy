import { Dispatch, useEffect } from 'react';
import { JobStageAction, JobStateReducerAction } from '../../../../react/reducers/jobStageReducer';
import { api } from '../../../../utils/api';

interface CoidIdInputProps {
  input: JobStageAction['inputs'][0];
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
}

export const CoidIdInput: React.FC<CoidIdInputProps> = ({
  input,
  stageIndex,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
}) => {
  const getCoinsList = api.marketData.getCoinList.useQuery();

  useEffect(() => {
    if (input.inputName.includes('coinId')) {
      if (getCoinsList.data?.data) {
        dispatchJobStagesReducer({
          type: 'updateActionInput',
          payload: {
            stageIndex,
            actionIndex,
            inputIndex,
            value: getCoinsList.data.data[0],
          },
        });
      }
    }
  }, [input.inputName, getCoinsList.data]);

  return (
    <>
      {getCoinsList.data?.data && (
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
          <>
            {getCoinsList.data.data.map((currency, index) => (
              <option key={`${currency}-${index}`} value={currency}>
                {currency}
              </option>
            ))}
          </>
        </select>
      )}
    </>
  );
};

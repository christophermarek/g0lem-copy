import { Dispatch, useEffect } from 'react';
import { api } from '../../../../utils/api';
import { JobStageAction, JobStateReducerAction } from '../../../../react/reducers/jobStageReducer';

interface CurrencyInputProps {
  input: JobStageAction['inputs'][0];
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  input,
  stageIndex,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
}) => {
  const getCurrencies = api.marketData.getCurrencyList.useQuery();

  useEffect(() => {
    if (input.inputName.includes('currency')) {
      if (getCurrencies.data?.data) {
        dispatchJobStagesReducer({
          type: 'updateActionInput',
          payload: {
            stageIndex,
            actionIndex,
            inputIndex,
            value: getCurrencies.data.data[0],
          },
        });
      }
    }
  }, [input.inputName, getCurrencies.data]);

  return (
    <>
      {getCurrencies.data?.data && (
        <select
          className='bg-primary h-11 w-full rounded-md border border-solid border-gray-400 py-1 px-2'
          value={input.value.trim() === '' ? getCurrencies.data.data[0] : input.value}
          onChange={(e) =>
            dispatchJobStagesReducer({
              type: 'updateActionInput',
              payload: { stageIndex, actionIndex, inputIndex, value: e.target.value },
            })
          }
        >
          <>
            {getCurrencies.data?.data.map((currency, index) => (
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

import { Dispatch, useEffect } from 'react';
import { JobStageAction, JobStateReducerAction } from '../../../../react/reducers/jobStageReducer';

interface JoinOnInputProps {
  input: JobStageAction['inputs'][0];
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
}

export const JoinOnInput: React.FC<JoinOnInputProps> = ({
  input,
  stageIndex,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
}) => {
  return (
    <>
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
          {/* {["space, comma"].map((item, index) => ( */}
          <option value={' '}>{'space'}</option>
          {/* ))} */}
        </>
      </select>
    </>
  );
};

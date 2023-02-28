import { Dispatch } from 'react';
import { JobStageAction, JobStateReducerAction } from '../../../../react/reducers/jobStageReducer';

interface ManualInputProps {
  input: JobStageAction['inputs'][0];
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
}

export const ManualInput: React.FC<ManualInputProps> = ({
  input,
  stageIndex,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
}) => {
  return (
    <input
      className='bg-primary h-11 w-full rounded-md border border-solid border-gray-400 py-1 px-2'
      type={input.type}
      value={input.value}
      placeholder={'Enter a value for this input.'}
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
    />
  );
};

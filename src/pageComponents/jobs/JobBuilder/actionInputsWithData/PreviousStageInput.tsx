import { Dispatch } from 'react';
import {
  JobStage,
  JobStageAction,
  JobStateReducerAction,
} from '../../../../react/reducers/jobStageReducer';

interface PreviousStageInputProps {
  input: JobStageAction['inputs'][0];
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
  previousStage: JobStage;
}

export const PreviousStageInput: React.FC<PreviousStageInputProps> = ({
  input,
  stageIndex,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
  previousStage,
}) => {
  return (
    <select
      className='h-11 w-full rounded-md border border-solid border-gray-400 py-1 px-2'
      value={[String(actionIndex), previousStage.actions[0].name]}
      onChange={(e) =>
        dispatchJobStagesReducer({
          type: 'updateActionInput',
          payload: { stageIndex, actionIndex, inputIndex, value: e.target.value },
        })
      }
    >
      {previousStage &&
        previousStage.actions.map((action, actionIndex) => (
          <option
            key={actionIndex}
            value={[String(actionIndex), action.name]}
          >{`${action.name} ${actionIndex}`}</option>
        ))}
    </select>
  );
};

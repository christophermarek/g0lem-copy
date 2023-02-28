import { faChevronCircleDown, faChevronCircleUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { JobStage, JobStateReducerAction } from '../../../react/reducers/jobStageReducer';
import { Dispatch } from 'react';
import { ActionInput, renderFieldDescription } from './ActionInput';
import { ParentProps } from '../../Parent';
import { ListPrimary } from '../../../components/ListPrimary';
import { actionData, estimateCost, modelCost } from '../../../utils/actions';
import { useWindowSize } from 'usehooks-ts';

interface JobStageProps {
  stageIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
  job: JobStage;
  previousStage: JobStage | undefined;
  setOpenActionSelector: Dispatch<React.SetStateAction<boolean>>;
}

export const JobStageComponent: React.FC<ParentProps & JobStageProps> = ({
  stageIndex,
  dispatchJobStagesReducer,
  job,
  previousStage,
  setOpenActionSelector,
  teamParent,
}) => {
  const actionToListItem = (action: JobStage['actions'][0], index: number) => ({
    name: action.name,
    id: index.toString(),
  });

  const { width } = useWindowSize();
  return (
    <div className={`bg-primary grid grid-cols-1 overflow-scroll md:grid-cols-2`}>
      {job.actions.map((action, actionIndex) => (
        <div
          key={actionIndex}
          style={{
            gridColumn: `span ${width > 640 && action.name === 'textVariableAction' ? '2' : '1'}`,
          }}
        >
          <ListPrimary
            forceButtonsRow
            listItems={[
              {
                name: actionData[action.name]?.label || action.name,
                id: actionIndex.toString(),
              },
            ]}
            itemActions={[
              {
                actionName: 'Delete',
                exec: async (id: string) =>
                  dispatchJobStagesReducer({
                    type: 'deleteActionFromStage',
                    payload: { stageIndex, actionIndex },
                  }),
                icon: faTrash,
              },
              // {
              //   actionName: 'Inputs',
              //   exec: async (id: string) =>
              //     dispatchJobStagesReducer({
              //       type: 'toggleActionsExpanded',
              //       payload: { stageIndex, actionIndex },
              //     }),
              //   icon: !action.isExpanded ? faChevronCircleDown : faChevronCircleUp,
              // },
            ]}
            expandedItemIndex={0}
            key={`Action-${actionIndex + 1}`}
          >
            <>
              {actionData[action.name] && (
                <div className=''>{renderFieldDescription(actionData[action.name])}</div>
              )}
              {action.isExpanded && (
                <>
                  {action.inputs.map((input, inputIndex) => (
                    <ActionInput
                      key={`Action-${actionIndex + 1}-Input-${inputIndex + 1}`}
                      previousStage={previousStage}
                      stageIndex={stageIndex}
                      actionIndex={actionIndex}
                      inputIndex={inputIndex}
                      input={input}
                      dispatchJobStagesReducer={dispatchJobStagesReducer}
                      teamParent={teamParent}
                    />
                  ))}
                  {action.name === 'generateCompletionAction' && (
                    <>
                      {` Cost estimator ${estimateCost(
                        { frontendAction: action },
                        { frontendAction: previousStage },
                      )} USD`}
                      <div className='text-sm text-gray-400'>
                        Prices are per 1,000 tokens. You can think of tokens as pieces of words,
                        where 1,000 tokens is about 750 words. This paragraph is 35 tokens.
                        <br></br>
                        Cost per token: {modelCost} /1K tokens = 0.00002 per token
                        <br></br>
                        The tokens used are from the prompt + the max_tokens you want the model to
                        output
                        <br></br>A token is any character including spaces, every 4 characters
                        counts as one token.
                        <br></br>
                        Dynamic outputs from variables in the previous stage will be parsed in this
                        estimator as the length of its action name
                        <br></br>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          </ListPrimary>
        </div>
      ))}
    </div>
  );
};

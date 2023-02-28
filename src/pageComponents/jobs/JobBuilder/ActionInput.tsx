import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonSecondary } from '../../../components/buttonSecondary';
import {
  JobStage,
  JobStageAction,
  JobStateReducerAction,
  forcedManualInputs,
} from '../../../react/reducers/jobStageReducer';
import { Dispatch, ReactNode } from 'react';
import { api } from '../../../utils/api';
import { ParentProps } from '../../Parent';
import { InputField, fieldData } from '../../../utils/actions';
import { TextColors } from '../../../components/HeaderTabs';
import { ActionInputRender } from './ActionInputRender';

export const renderFieldDescription = (thisFieldData: InputField | undefined): ReactNode => {
  if (thisFieldData?.description) {
    const description = thisFieldData.description;
    const descriptionArray = description.split(' ');
    const descriptionArrayWithLinks: ReactNode[] = descriptionArray.map((word) => {
      return word.startsWith('link:') ? (
        <a className='underline' href={word.replace('link:', '')} target='_blank' rel='noreferrer'>
          {word.replace('link:', '')}
        </a>
      ) : (
        <>{` ${word} `}</>
      );
    });
    const node = (
      <div className={`text-lg  ${TextColors.Default.secondary}`}>{descriptionArrayWithLinks}</div>
    );
    return node;
  } else {
    return '';
  }
};

export interface ActionInputProps {
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  previousStage: JobStage | undefined;
  input: JobStageAction['inputs'][0];
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
}
export const ActionInput: React.FC<ParentProps & ActionInputProps> = ({
  stageIndex,
  input,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
  previousStage,
  teamParent,
}) => {
  const getCurrentCoinPriceForCurrency = api.marketData.getCurrentCoinPriceForCurrency.useQuery({
    coinId: 'bitcoin',
    currency: 'usd',
  });

  const thisFieldData = fieldData[input.inputName];

  return (
    <>
      <div className='my-1 flex items-end justify-between '>
        <div className='flex flex-col'>
          {thisFieldData?.label ||
            input.inputName
              .replace('_', ' ')
              .split(' ')
              .map((word) => word[0].toUpperCase() + word.slice(1))
              .join(' ')}
          {renderFieldDescription(thisFieldData)}
        </div>
        {previousStage && !forcedManualInputs.includes(input.inputName) && (
          <ButtonSecondary
            className='flex h-8 items-center gap-x-2'
            onClick={() =>
              dispatchJobStagesReducer({
                type: 'updateActionInputIsManual',
                payload: {
                  stageIndex,
                  actionIndex,
                  inputIndex,
                  isManualInput: !input.isManualInput,
                },
              })
            }
          >
            <FontAwesomeIcon icon={!input.isManualInput ? faToggleOff : faToggleOn} />
            Manual
          </ButtonSecondary>
        )}
      </div>
      {/* if previousStage , show options and manual, else show manual only */}
      <div
        className={
          input.value && input.value.trim() === '' && !(input.inputName.toLowerCase() === 'joinon')
            ? 'text-red-600'
            : ''
        }
      >
        <ActionInputRender
          input={input}
          inputIndex={inputIndex}
          actionIndex={actionIndex}
          stageIndex={stageIndex}
          dispatchJobStagesReducer={dispatchJobStagesReducer}
          previousStage={previousStage}
          teamParent={teamParent}
        />
      </div>
    </>
  );
};

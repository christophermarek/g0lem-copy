import { ParentProps } from '../../Parent';
import { ActionInputProps } from './ActionInput';
import { CoidIdInput } from './actionInputsWithData/CoinIdInput';
import { ConnectorInput } from './actionInputsWithData/ConnectorInput';
import { CurrencyInput } from './actionInputsWithData/CurrencyInput';
import { JoinOnInput } from './actionInputsWithData/JoinOnInput';
import { ManualInput } from './actionInputsWithData/ManualInput';
import { OpenAiApiKeyInput } from './actionInputsWithData/OpenAiApiKeyInput';
import { PreviousStageInput } from './actionInputsWithData/PreviousStageInput';
import { VariableTextInput } from './actionInputsWithData/VariableTextInput';

export const ActionInputRender: React.FC<ParentProps & ActionInputProps> = ({
  input,
  inputIndex,
  actionIndex,
  stageIndex,
  dispatchJobStagesReducer,
  previousStage,
  teamParent,
}) => {
  if (input.inputName.toLowerCase().includes('oauth')) {
    return (
      <ConnectorInput
        teamParent={teamParent}
        input={input}
        inputIndex={inputIndex}
        actionIndex={actionIndex}
        stageIndex={stageIndex}
        dispatchJobStagesReducer={dispatchJobStagesReducer}
      />
    );
  } else {
    switch (input.inputName.toLowerCase()) {
      case 'currency':
        return (
          <CurrencyInput
            input={input}
            inputIndex={inputIndex}
            actionIndex={actionIndex}
            stageIndex={stageIndex}
            dispatchJobStagesReducer={dispatchJobStagesReducer}
          />
        );
      case 'coinid':
        return (
          <CoidIdInput
            input={input}
            inputIndex={inputIndex}
            actionIndex={actionIndex}
            stageIndex={stageIndex}
            dispatchJobStagesReducer={dispatchJobStagesReducer}
          />
        );
      case 'tokens':
        return (
          <VariableTextInput
            input={input}
            inputIndex={inputIndex}
            actionIndex={actionIndex}
            stageIndex={stageIndex}
            dispatchJobStagesReducer={dispatchJobStagesReducer}
            previousStage={previousStage}
          />
        );
      case 'joinon':
        return (
          <JoinOnInput
            input={input}
            inputIndex={inputIndex}
            actionIndex={actionIndex}
            stageIndex={stageIndex}
            dispatchJobStagesReducer={dispatchJobStagesReducer}
          />
        );
      case 'openaiapikey':
        return (
          <OpenAiApiKeyInput
            input={input}
            inputIndex={inputIndex}
            actionIndex={actionIndex}
            stageIndex={stageIndex}
            dispatchJobStagesReducer={dispatchJobStagesReducer}
            previousStage={previousStage}
          />
        );
      default:
        // check manual or not
        if (input.isManualInput) {
          return (
            <ManualInput
              input={input}
              inputIndex={inputIndex}
              actionIndex={actionIndex}
              stageIndex={stageIndex}
              dispatchJobStagesReducer={dispatchJobStagesReducer}
            />
          );
        } else {
          // check if previous stage
          if (previousStage) {
            return (
              <PreviousStageInput
                input={input}
                inputIndex={inputIndex}
                actionIndex={actionIndex}
                stageIndex={stageIndex}
                dispatchJobStagesReducer={dispatchJobStagesReducer}
                previousStage={previousStage}
              />
            );
          } else {
            return <>Error rendering input from previous stage</>;
          }
        }
    }
  }
};

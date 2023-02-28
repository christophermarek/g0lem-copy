import { CompleteJobStage } from '../../../prisma/zod';
// import { CheckBoxField } from '../../components/modals/CheckboxModal';
import { ActionConfigType } from '../../server/bots/action';

export const forcedManualInputs = [
  'tokens',
  'redditOauthConnectorID',
  'twitterOauthConnectorID',
  'openAiApiKey',
  'max_tokens',
  'top_p',
  'temperature',
];
export const apiJobStagesToJobStagesSerializer = (apiJobStages: CompleteJobStage[]): JobStage[] => {
  console.log(apiJobStages);
  return apiJobStages.map((jobStage) => {
    return {
      isExpanded: true,
      stageIsValid: true,
      actions: jobStage.stageActions.map((stageAction) => {
        return {
          name: stageAction.name,
          isExpanded: true,
          inputs: stageAction.inputs.map((input) => {
            return {
              inputName: input.name,
              type: 'text',
              isManualInput: forcedManualInputs.includes(input.name) || input.isManualInput,
              value: input.isManualInput
                ? input.inputValue
                : `${input.inputActionName} ${input.inputActionIndex}`,
            };
          }),
          hasOutput: true,
        };
      }),
    };
  });
};

interface PostJobType {
  jobId?: string;
  name: string;
  botId?: string;
  teamId?: string;
  stages: {
    stageActions: {
      name: string;
      inputs: {
        isManualInput: boolean;
        inputName: string;
        inputValue: string;
        inputActionIndex: string;
        inputActionName: string;
      }[];
    }[];
  }[];
}

const mapInputToApiInput = (input: {
  inputName: string;
  type: string;
  isManualInput: boolean;
  value: string;
}): {
  inputValue: string;
  inputName: string;
  isManualInput: boolean;
  inputActionIndex: string;
  inputActionName: string;
} => {
  const ret = {
    inputName: input.inputName,
    inputValue: '', //input.value,
    isManualInput: input.isManualInput,
    inputActionIndex: '', //input.inputActionId,
    inputActionName: '', // input.inputName,
  };
  if (input.isManualInput) {
    ret.inputValue = input.value || '';
  } else {
    const split = input.value.split(' ');
    ret.inputActionName = split[0];
    ret.inputActionIndex = split[1];
  }
  return ret;
};
export const jobStagesToApiJobStagesSerializer = (
  jobName: string,
  jobStages: JobStage[],
  jobId?: string,
  botId?: string,
  teamId?: string,
): PostJobType => {
  return {
    jobId: jobId,
    name: jobName,
    botId: botId,
    teamId: teamId,
    stages: jobStages.map((jobStage) => {
      return {
        stageActions: jobStage.actions.map((action) => {
          return {
            name: action.name,
            inputs: action.inputs.map((input) => {
              return mapInputToApiInput(input);
            }),
          };
        }),
      };
    }),
  };
};

export interface JobStageAction {
  name: string;
  // id is randomly generated and is used to identify the action in the job stage
  isExpanded: boolean;
  inputs: {
    inputName: string;
    type: string;
    isManualInput: boolean;
    value: string;
  }[];
  hasOutput: boolean;
}
export interface JobStage {
  isExpanded: boolean;
  stageIsValid: boolean;
  actions: JobStageAction[];
}

export type JobStateReducerAction =
  | { type: 'set'; payload: { jobStages: JobStage[] } }
  | { type: 'reset' }
  | { type: 'addJobStep' }
  | { type: 'moveStage'; payload: { stageIndex: number; direction: 'up' | 'down' } }
  | { type: 'deleteStage'; payload: { stageIndex: number } }
  | { type: 'deleteActionFromStage'; payload: { stageIndex: number; actionIndex: number } }
  | {
      type: 'updateActionInput';
      payload: { stageIndex: number; actionIndex: number; inputIndex: number; value: string };
    }
  | {
      type: 'addActions';
      payload: {
        stageIndex: number;
        actionConfigs: ActionConfigType[];
        finalFields: { functionName: string }[];
        prevJobStage: JobStage | undefined;
      };
    }
  | {
      type: 'updateActionInputIsManual';
      payload: {
        stageIndex: number;
        actionIndex: number;
        inputIndex: number;
        isManualInput: boolean;
      };
    }
  | { type: 'toggleActionsExpanded'; payload: { stageIndex: number; actionIndex: number } }
  | { type: 'toggleJobExpanded'; payload: { stageIndex: number } };

export const initialJobListState: JobStage[] = [];

export const jobStageReducer = (state: JobStage[], action: JobStateReducerAction): JobStage[] => {
  switch (action.type) {
    case 'set': {
      return action.payload.jobStages;
    }
    case 'toggleJobExpanded': {
      console.log('toggleJobExpanded', action.payload.stageIndex);
      return state.map((job, index) => {
        if (index !== action.payload.stageIndex) return job;
        return {
          ...job,
          isExpanded: !job.isExpanded,
        };
      });
    }
    case 'toggleActionsExpanded': {
      {
        return state.map((job, index) => {
          if (index !== action.payload.stageIndex) return job;
          return {
            ...job,
            actions: job.actions.map((_action, _actionIndex) => {
              if (action.payload.actionIndex !== _actionIndex) return _action;
              return {
                ..._action,
                isExpanded: !_action.isExpanded,
              };
            }),
          };
        });
      }
    }
    case 'updateActionInputIsManual': {
      return state.map((_job, _index) => {
        if (_index !== action.payload.stageIndex) return _job;
        return {
          ..._job,
          actions: _job.actions.map((_action, _actionIndex) => {
            if (action.payload.actionIndex !== _actionIndex) return _action;
            return {
              ..._action,
              inputs: _action.inputs.map((input, _inputIndex) => {
                if (action.payload.inputIndex !== _inputIndex) return input;
                return { ...input, isManualInput: action.payload.isManualInput, value: '' };
              }),
            };
          }),
        };
      });
    }
    case 'addActions': {
      const configs = action.payload.actionConfigs;
      const newActions: JobStageAction[] = [];
      action.payload.finalFields.map((field) => {
        const actionConfig = configs.find((config) => config.action === field.functionName);
        // for every action selected
        if (actionConfig) {
          const _action: JobStageAction = {
            name: actionConfig.action,
            isExpanded: true,
            inputs: [],
            hasOutput: true,
          };

          // how do i want to do this, should i jut set the input to the first action in the previous stage for all actions?
          // simple enough, and i think any other logic is more confuing to the user.
          for (const [key, value] of Object.entries(actionConfig)) {
            if (key === 'action') continue;
            _action.inputs.push({
              inputName: key,
              type: 'text',
              value: forcedManualInputs.includes(key)
                ? ''
                : action.payload.prevJobStage
                ? action.payload.prevJobStage.actions[0]
                  ? `${action.payload.prevJobStage.actions[0].name} 0`
                  : ''
                : '',
              isManualInput: forcedManualInputs.includes(key)
                ? true
                : action.payload.stageIndex === 0
                ? true
                : false,
            });
          }
          newActions.push(_action);
        }
      });
      return state.map((job, index) => {
        if (index !== action.payload.stageIndex) return job;
        return {
          ...job,
          actions: [...job.actions, ...newActions],
        };
      });
    }
    case 'updateActionInput': {
      console.log('updateActionInput', action.payload);
      return state.map((job, index) => {
        if (index !== action.payload.stageIndex) return job;
        return {
          ...job,
          actions: job.actions.map((_action, _actionIndex) => {
            if (action.payload.actionIndex !== _actionIndex) return _action;
            return {
              ..._action,
              inputs: _action.inputs.map((input, _inputIndex) => {
                if (action.payload.inputIndex !== _inputIndex) return input;
                return { ...input, value: action.payload.value };
              }),
            };
          }),
        };
      });
    }
    case 'deleteStage': {
      return [
        ...state.slice(0, action.payload.stageIndex),
        ...state.slice(action.payload.stageIndex + 1),
      ];
    }
    case 'deleteActionFromStage': {
      return [
        ...state.slice(0, action.payload.stageIndex),
        {
          ...state[action.payload.stageIndex],
          actions: [
            ...state[action.payload.stageIndex].actions.slice(0, action.payload.actionIndex),
            ...state[action.payload.stageIndex].actions.slice(action.payload.actionIndex + 1),
          ],
        },
        ...state.slice(action.payload.stageIndex + 1),
      ];
    }
    case 'moveStage': {
      const copy = [...state];
      if (action.payload.direction === 'up') {
        if (action.payload.stageIndex === 0) return state;
        [copy[action.payload.stageIndex - 1], copy[action.payload.stageIndex]] = [
          copy[action.payload.stageIndex],
          copy[action.payload.stageIndex - 1],
        ];
        if (action.payload.stageIndex === 1) {
          copy[0].actions.map((action) => {
            action.inputs.map((input) => {
              input.isManualInput = true;
            });
          });
        }
      } else {
        if (action.payload.stageIndex === state.length - 1) return state;
        [copy[action.payload.stageIndex + 1], copy[action.payload.stageIndex]] = [
          copy[action.payload.stageIndex],
          copy[action.payload.stageIndex + 1],
        ];
      }
      return [...copy];
    }
    case 'addJobStep': {
      return [
        ...state,
        {
          stageIsValid: false,
          isExpanded: true,
          actions: [],
        },
      ];
    }
    case 'reset':
      console.log('resetting job list state');
      return initialJobListState;
    default:
      // this will never happen, wont compile because of typing
      throw new Error(`Unknown action type: ${action}`);
  }
};

import { CompleteJob } from '../../../prisma/zod';
import { estimateCost } from '../../utils/actions';
import { ActionConfigType, wrapFireAction } from './action';

export * as Jobs from './jobs';

export interface FireJobResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface FireJobRequest {
  job: CompleteJob;
  botId?: string;
  callerId: string;
}

export const wrapFireJob = async ({
  job,
  botId,
  callerId,
}: FireJobRequest): Promise<FireJobResponse> => {
  if (!prisma) return { success: false, message: 'db not connected' };

  let status = true;

  // get each job stage
  const jobStages = await prisma.jobStage.findMany({
    where: {
      jobId: job.id,
    },
    include: {
      stageActions: {
        include: {
          inputs: true,
        },
      },
    },
  });

  const data: any = [];

  const savedActionOutputs: {
    jobStageIndex: number;
    actionIndex: string;
    actionName: string;
    output: string;
  }[] = [];

  let message = 'Job Fired';
  console.log('jobStages', jobStages);
  for (const [stageIndex, stage] of jobStages.entries()) {
    console.log('onto next stage:', stage.id);
    console.log('status', JSON.parse(JSON.stringify(status)));
    if (!status) break;
    for (const action of stage.stageActions) {
      if (!status) break;

      const config: { [key: string]: string } = {};
      config['action'] = action.name;
      action.inputs.forEach((input) => {
        // if its tokens, then there can be multiple input variables rom the previous stage piped into this action.
        console.log('checking input: ', input);
        if (input.name === 'tokens') {
          // the tokens is a json encoded string,
          // so we convert the string into an array of strings
          // IDENTIFY the variables and populate them from the previous actions
          // then we convert the array of strings back into a string to be used as output.
          const newTokens: string[] = [];
          // then parse the token property
          const _tokens = input.inputValue.split('#DELIMITER#');
          if (_tokens) {
            console.log('savedActionOutputs', savedActionOutputs);
            for (const token of _tokens) {
              if (token.startsWith('var:')) {
                const variable = token.replace('var:', '');
                //variable in token is encoded as: 0,getCurrentCoinPriceAction
                // number is actionIndex, string is actionName
                const [actionIndex, actionName] = variable.split(',');
                const actionOutput = savedActionOutputs.find(
                  (actionOutput) =>
                    actionOutput.actionIndex === actionIndex &&
                    actionOutput.jobStageIndex === stageIndex - 1 &&
                    actionOutput.actionName === actionName,
                );
                if (actionOutput) {
                  newTokens.push(actionOutput.output);
                } else {
                  status = false;
                  message = `Failed to find action output for actionIndex: ${actionIndex} ${actionName}`;
                }
              } else {
                newTokens.push(token);
              }
            }
            config[input.name] = newTokens.join(' ');
          } else {
            status = false;
            message = `Failed to find tokens in tokens input`;
          }
        } else if (input.name === 'openAiApiKey') {
          config[input.name] = input.inputValue;
          if (input.inputValue === 'g0lem') {
            // check if current request will hit quota
            if (
              estimateCost({ apiAction: action }, { apiAction: jobStages[stageIndex - 1] }) >= 0.1
            )
              status = false;
            message = `This job will exceed the free Open AI completion usage. Setup your own api key.`;
          }
        } else {
          // if input is manual we use the inputValue, but if its not
          // we need to fetch the previous output.
          if (input.isManualInput) {
            config[input.name] = input.inputValue;
          } else {
            console.log('saved outputs', savedActionOutputs);

            const actionOutput = savedActionOutputs.find(
              (actionOutput) =>
                actionOutput.actionIndex === input.inputActionIndex &&
                actionOutput.jobStageIndex === stageIndex - 1 &&
                actionOutput.actionName === input.inputActionName,
            );
            if (actionOutput) {
              config[input.name] = actionOutput.output;
            } else {
              console.log(
                'Failed to find action output for` actionIndex: ',
                input.inputActionIndex,
                input.name,
                input.inputActionName,
                input.inputValue,
              );
              status = false;
              message = `Failed to find action output for actionIndex: ${input.inputActionIndex} ${input.name}`;
            }
          }
        }
      });
      // cast to ActionConfigType :( any
      const casted: ActionConfigType = config as any;
      data.push(casted);
      // fire action
      // these are logged in the wrapFireAction call
      console.log('Firing Action', action.name, casted);
      const res = await wrapFireAction({
        callerId: callerId,
        botId: botId,
        actionName: action.name,
        actionConfig: casted,
      });
      console.log('Action Fired', action.name, casted, res);

      if (!res.success) {
        console.log('\nAction Failed !! ##\n');
        status = false;
        message = res.message;
      } else {
        savedActionOutputs.push({
          actionIndex: action.actionIndex,
          actionName: action.name,
          output: res.actionOutput ? res.actionOutput : 'Error, no output!',
          jobStageIndex: stageIndex,
        });
      }
    }
  }

  let jobFiredLog;
  try {
    jobFiredLog = await prisma.jobFiredLog.create({
      data: {
        jobId: job.id,
        name: job.name,
        jobDump: JSON.stringify({ job, savedActionOutputs }),
        status: status,
      },
    });
  } catch (e) {
    status = false;
    message = 'Failed to log job fired';
  }

  return {
    success: status,
    message: message,
    data: { job, savedActionOutputs, data, jobFiredLog },
  };
};

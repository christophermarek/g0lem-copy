import { Job, JobStage, JobStageAction, JobStageActionInput, PrismaClient } from '@prisma/client';

export * as JobsController from './jobs';

export const deleteAllJobStageData = async (data: { prisma: PrismaClient; jobId: string }) => {
  console.log('deleting all job stage data');
  const { prisma, jobId } = data;
  try {
    const stages = await prisma.jobStage.findMany({
      where: {
        jobId: jobId,
      },
    });
    const stageActions = await prisma.jobStageAction.findMany({
      where: {
        jobStageId: {
          in: stages.map((stage) => stage.id),
        },
      },
    });
    await prisma.jobStageActionInput.deleteMany({
      where: {
        jobStageActionId: {
          in: stageActions.map((action) => action.id),
        },
      },
    });
    await prisma.jobStageAction.deleteMany({
      where: {
        jobStageId: {
          in: stages.map((stage) => stage.id),
        },
      },
    });
    await prisma.jobStage.deleteMany({
      where: {
        jobId: jobId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const createJob = async (data: {
  prisma: PrismaClient;
  userId: string;
  jobName: string;
  teamId?: string;
  botId?: string;
}) => {
  const { prisma, userId, jobName, teamId, botId } = data;
  try {
    const job = await prisma.job.create({
      data: {
        name: jobName,
        userId: userId,
        botId: botId,
        teamId: teamId,
      },
    });
    return job;
  } catch (error) {
    console.log(error);
  }
};

export const createJobStages = async (data: {
  prisma: PrismaClient;
  job: Job;
  numStages: number;
}): Promise<JobStage[] | undefined> => {
  const { prisma, job, numStages } = data;

  try {
    const createStages: JobStage[] = [];
    for (let i = 0; i < numStages; i++) {
      createStages.push(
        await prisma.jobStage.create({
          data: {
            jobId: job.id,
          },
        }),
      );
    }
    return createStages;
  } catch (error) {
    console.log(error);
  }
};

export const createJobStageActions = async (data: {
  prisma: PrismaClient;
  job: Job;
  newJobStages: JobStage[];
  stageActions: {
    name: string;
    stageId: string;
    inputs: {
      isManualInput: boolean;
      inputName: string;
      inputValue: string;
      inputActionIndex: string;
      inputActionName: string;
    }[];
  }[];
}): Promise<{ action: JobStageAction; inputs: JobStageActionInput[] }[] | undefined> => {
  const { prisma, job, newJobStages, stageActions } = data;
  try {
    const createdStageActions: { action: JobStageAction; inputs: JobStageActionInput[] }[] = [];

    let actionIndex = 0;
    let prevStageId = '';
    for (const stageAction of stageActions) {
      const matchingStage = newJobStages.find((stage) => stage.id === stageAction.stageId);
      if (!matchingStage) return;
      if (prevStageId !== matchingStage.id) {
        actionIndex = 0;
      }

      // since this iterates over all stages, we cant use the index of the stageActions array
      // we need to keep track of the index per stage
      console.log('stageAction', stageAction);
      console.log('actionIndex', actionIndex);
      const createdStageAction = await prisma.jobStageAction.create({
        data: {
          name: stageAction.name,
          actionIndex: String(actionIndex),
          jobStageId: matchingStage.id,
        },
      });
      const inputs = await createInputsForStageAction({
        prisma,
        job,
        action: createdStageAction,
        inputs: stageAction.inputs,
      });
      createdStageActions.push({
        action: createdStageAction,
        inputs: inputs || [],
      });
      actionIndex += 1;
      prevStageId = matchingStage.id;
    }
    return createdStageActions;
  } catch (error) {
    console.log(error);
    deleteAllJobStageData({ prisma, jobId: job.id });
  }
};

const createInputsForStageAction = async (data: {
  prisma: PrismaClient;
  job: Job;
  action: JobStageAction;
  inputs: {
    isManualInput: boolean;
    inputName: string;
    inputValue: string;
    inputActionIndex: string;
    inputActionName: string;
  }[];
}) => {
  const { prisma, job, inputs } = data;
  try {
    const createdInputs: JobStageActionInput[] = [];
    inputs.forEach(async (input) => {
      const createdInput = await prisma.jobStageActionInput.create({
        data: {
          name: input.inputName,
          inputValue: input.inputValue,
          isManualInput: input.isManualInput,
          inputActionIndex: input.inputActionIndex,
          inputActionName: input.inputActionName,
          jobStageActionId: data.action.id,
        },
      });
      createdInputs.push(createdInput);
    });
    return createdInputs;
  } catch (error) {
    console.log(error);
    deleteAllJobStageData({ prisma, jobId: job.id });
  }
};

export const createJobStageActionInputs = async (data: {
  prisma: PrismaClient;
  job: Job;
  stageActions: JobStageAction[];
  actionInputs: {
    actionId: string;
    isManualInput: boolean;
    inputName: string;
    inputValue: string;
    inputActionIndex: string;
    inputActionName: string;
  }[];
}): Promise<JobStageActionInput[] | undefined> => {
  const { prisma, job, stageActions, actionInputs } = data;
  try {
    const createdStageActionInputs: JobStageActionInput[] = [];

    actionInputs.forEach(async (actionInput) => {
      const matchingStageAction = stageActions.find((action) => action.id === actionInput.actionId);
      if (!matchingStageAction) return;
      const createdStageActionInput = await prisma.jobStageActionInput.create({
        data: {
          name: actionInput.inputName,
          inputValue: actionInput.inputValue,
          isManualInput: actionInput.isManualInput,
          inputActionIndex: actionInput.inputActionIndex,
          inputActionName: actionInput.inputActionName,
          jobStageActionId: matchingStageAction.id,
        },
      });
      createdStageActionInputs.push(createdStageActionInput);
    });
    return createdStageActionInputs;
  } catch (error) {
    console.log(error);
    deleteAllJobStageData({ prisma, jobId: job.id });
  }
};

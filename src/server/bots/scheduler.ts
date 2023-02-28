import { JobSchedule, JobScheduleLog } from '@prisma/client';
import crypto from 'crypto';
import { wrapFireJob } from './jobs';
import { CompleteJob } from '../../../prisma/zod';

const SCHEDULER_LOG = 'scheduler';

export const log = (log: string) => {
  console.error(`${SCHEDULER_LOG} - ${log}}`);
};

const getAllSchedules = async () => {
  if (!prisma) return log('No prisma connection');
  // get all schedules from the database.
  // return an array of schedules.
  const schedules = await prisma.jobSchedule.findMany({
    where: {
      enabled: true,
      jobId: { not: null },
    },
    include: { job: true },
  });
  return schedules;
};

const getLastScheduleRun = async (scheduleId: string) => {
  // get the last time the schedule ran.
  // return the last time the schedule ran.
  const lastRun = prisma?.jobScheduleLog.findFirst({
    where: {
      jobScheduleId: scheduleId,
    },
    orderBy: {
      dateCreated: 'desc',
    },
  });
  return lastRun;
};

const computeNextRunDate = (lastRunAt: Date, schedule: JobSchedule) => {
  // compute the next time the schedule will run.
  let interval = Number(schedule.intervalMs);

  const nextRun = new Date(lastRunAt.getTime() + interval);

  // time in interval when schedule runs
  // -1 is random time in interval
  // 1 is end , 0 is start.
  // const timeInInterval = Number(schedule.executeAt);
  if (schedule.intervalType === 'S') interval = interval * 1000;

  // if (timeInInterval === -1) {
  // const randomExecuteAtRatio = crypto.randomInt(0, timeInInterval) / timeInInterval;
  // nextRun.setMillis/econds(nextRun.getMilliseconds() + randomExecuteAtRatio * interval);
  // } else {
  // nextRun.setMilliseconds(nextRun.getMilliseconds() + timeInInterval * interval);
  // }

  return nextRun;
};

const getFullJob = async (jobId: string) => {
  // get the full job from the database.
  // return the full job.
  const job = await prisma?.job.findUnique({
    where: {
      id: jobId,
    },
    include: {
      stages: {
        include: {
          stageActions: {
            include: {
              inputs: true,
            },
          },
        },
      },
      user: true,
      jobSchedules: true,
      JobFiredLogs: true,
    },
  });
  return job;
};

export const Scheduler = async () => {
  log(`Scheduler started at ${new Date()}`);
  // this is where we will check the schedules.
  const schedules = await getAllSchedules();
  if (!schedules) return log('Scheduler found no schedules');
  log(`Scheduler found ${schedules.length} schedules`);

  // schedule firing is not async, they will all fire at the same time.
  // for each schedule it will run async
  schedules.forEach(async (schedule) => {
    log(`Schedule ${schedule.id}`);

    const _lastRun = await getLastScheduleRun(schedule.id);
    if (!_lastRun) {
      log(`Schedule ${schedule.id} has no last run`);
    } else {
      // Check if the schedule is due to run.
      const now = new Date();
      const nextRun = computeNextRunDate(_lastRun.dateCreated, schedule);

      if (now < nextRun) return log(`Schedule ${schedule.id} is not due to run`);
    }

    const _job = schedule.job;
    if (!_job) return log(`Schedule ${schedule.id} has no job`);
    log(`Job ${_job.id} - ${_job.name}`);

    // get the full job from the database.
    const job = await getFullJob(_job.id);
    if (!job) return log(`Schedule ${schedule.id} has no job`);

    // log the schedule firing.
    const fireJob = await wrapFireJob({ job: job as CompleteJob, callerId: schedule.createdById });
    if (!fireJob.success) log(`Schedule ${schedule.id} failed to fire job`);
    const jobFiredLog = fireJob.data.jobFiredLog;
    if (!jobFiredLog) log(`Schedule ${schedule.id} failed to log job fired`);
    const scheduleLog = await prisma?.jobScheduleLog.create({
      data: {
        jobScheduleId: schedule.id,
        createdById: schedule.createdById,
        failed: fireJob.success,
        jobFiredLogId: jobFiredLog?.id,
      },
    });

    if (!scheduleLog) log(`Schedule ${schedule.id} failed to log schedule`);

    log(`Schedule ${schedule.id} fired job ${job.id} - ${job.name}`);
    log(`Schedule ${schedule.id} finished`);
  });
  log(`Scheduler finished at ${new Date()}`);
};

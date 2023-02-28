import {
  faEdit,
  faTrashCan,
  faCirclePlay,
  faUnlink,
  faCopy,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../../utils/api';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import {
  JobStage,
  JobStateReducerAction,
  apiJobStagesToJobStagesSerializer,
} from '../../react/reducers/jobStageReducer';
import { ListPrimary } from '../../components/ListPrimary';
import { ParentProps } from '../Parent';
import { TabColors } from '../../components/HeaderTabs';
import { Frame } from '../../components/container';
import { JobBuilder } from './JobBuilder/JobBuilder';
import { useEffect } from 'react';

interface JobListProps {
  dispatchJobStagesReducer: React.Dispatch<JobStateReducerAction>;
  setOpenJobBuilder: React.Dispatch<React.SetStateAction<boolean>>;
  selectPage: (pageId: string, opensModal: boolean) => void;
  setSelectedJob: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
    }>
  >;
  openJobBuilder: boolean;
  jobStages: JobStage[];
  selectedJob: {
    id: string;
    name: string;
  };
}

export const JobList: React.FC<ParentProps & JobListProps> = ({
  dispatchJobStagesReducer,
  setOpenJobBuilder,
  botParent,
  teamParent,
  selectPage,
  setSelectedJob,
  openJobBuilder,
  jobStages,
  selectedJob,
}) => {
  useEffect(() => {
    dispatchJobStagesReducer({
      type: 'set',
      payload: { jobStages: [] },
    });
    setSelectedJob({
      id: '',
      name: '',
    });
  }, []);

  const jobs = api.jobs.getJobs.useQuery({
    botId: botParent?.id,
    teamId: teamParent?.id,
  });

  const runJob = api.jobs.runJob.useMutation();
  const disconnectJob = api.jobs.disconnectJob.useMutation();

  const handleRun = async (jobId: string) => {
    fireToast(ToastTypes.loading, 'Running job...');
    const res = await runJob.mutateAsync({ id: jobId });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
    } else {
      fireToast(ToastTypes.error, res.message);
    }
  };

  const handleEdit = async (jobId: string) => {
    const foundJob = jobs.data?.data?.find((job) => job.id === jobId);
    if (!foundJob) {
      fireToast(ToastTypes.error, 'Job not found');
      return;
    }

    const _jobStages = apiJobStagesToJobStagesSerializer(foundJob.stages);
    dispatchJobStagesReducer({
      type: 'set',
      payload: { jobStages: _jobStages },
    });
    setSelectedJob({
      id: foundJob.id,
      name: foundJob.name,
    });
    selectPage('Add', false);
  };

  const handleDisconnect = async (jobId: string) => {
    fireToast(ToastTypes.loading, 'Disconnecting job...');

    disconnectJob.mutateAsync({ id: jobId }).then((res) => {
      if (res.success) {
        fireToast(ToastTypes.success, 'Job disconnected');
        jobs.refetch();
      } else {
        fireToast(ToastTypes.error, res.message);
      }
    });
  };

  const handleOpenJobRunLogs = async (id: string) => {
    selectPage('Logs', false);
    setSelectedJob({
      id,
      name: jobs.data?.data?.find((job) => job.id === id)?.name || '',
    });
  };

  return (
    <Frame
      parentBorderColor={TabColors.Teams.secondary}
      className='my-4 w-full border-none px-0 py-0'
    >
      {jobs.isLoading && <div>Loading...</div>}
      {jobs.isError && <div>Error: {jobs.error?.message}</div>}

      {jobs.data && jobs.data.data && (
        <>
          <ListPrimary
            listItems={jobs.data.data.map((job) => ({
              name: job.name,
              id: job.id,
            }))}
            itemActions={[
              {
                exec: handleRun,
                icon: faCirclePlay,
                actionName: 'Run',
              },
              {
                exec: handleEdit,
                icon: faEdit,
                actionName: 'Edit',
              },

              // ...(teamParent
              //   ? [
              //       {
              //         exec: handleDisconnect,
              //         icon: faUnlink,
              //         actionName: 'Disconnect',
              //       },
              //     ]
              //   : []),
              {
                exec: handleOpenJobRunLogs,
                icon: faHistory,
                actionName: 'Logs',
              },
            ]}
          />
        </>
      )}
    </Frame>
  );
};

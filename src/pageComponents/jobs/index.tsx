import { useEffect, useReducer, useState } from 'react';
import React from 'react';
import { JobList } from './JobList';
import { JobBuilder } from './JobBuilder/JobBuilder';
import {
  jobStageReducer,
  initialJobListState,
  jobStagesToApiJobStagesSerializer,
} from '../../react/reducers/jobStageReducer';
import { ParentProps } from '../Parent';
import { PageControl, RootPage, usePageSelector } from '../../components/RootPage';
import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { TabColors } from '../../components/HeaderTabs';
import { AnimatePresence } from 'framer-motion';
import { JobRunLogs } from './JobRunLogs';
import {
  faCircleXmark,
  faTrash,
  faCopy,
  faTrashCan,
  faCirclePlus,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { fireToast, ToastTypes } from '../../react/hooks/useToast';
import { api } from '../../utils/api';
import { FormField } from '../../components/Form/Form';
import { ControlPaneTitleButtons } from '../../components/ControlPane/TitleButtons';
import { ControlPaneButton } from '../../components/ControlPane/Button';

interface JobsProps {
  botId?: string;
}
const Jobs: React.FC<ParentProps & JobsProps> = ({ botParent, teamParent, botId }) => {
  const [jobStages, dispatchJobStagesReducer] = useReducer(jobStageReducer, initialJobListState);

  const [openJobBuilder, setOpenJobBuilder] = useState<boolean>(false);
  const [openJobList, setOpenJobList] = useState<boolean>(true);
  const [openJobLogs, setOpenJobLogs] = useState<boolean>(false);
  const deleteJob = api.jobs.deleteJob.useMutation();
  const duplicateJob = api.jobs.duplicateJob.useMutation();
  const [selectedJob, setSelectedJob] = useState<{
    id: string;
    name: string;
  }>({
    id: '',
    name: '',
  });

  useEffect(() => {
    if (openJobList) {
      dispatchJobStagesReducer({ type: 'reset' });
      setSelectedJob({ id: '', name: '' });
    }
  }, [openJobList]);

  const handleDelete = async (jobId: string) => {
    fireToast(ToastTypes.loading, 'Deleting job...');
    const res = await deleteJob.mutateAsync({ id: jobId });
    if (res.success) {
      fireToast(ToastTypes.success, 'Deleted job');
      selectPage('List', false);
    } else {
      fireToast(ToastTypes.error, res.message);
    }
  };
  const fireSaveJob = async () => {
    console.log('firing save job on Job: ' + jobStages);

    if (!validateJob()) {
      return;
    }

    if (selectedJob.id !== '') {
      fireUpdateJob();
    } else {
      const jobName = jobFormFields.find((field) => field.name === 'Job Name')?.value || '';

      const formattedForApi = jobStagesToApiJobStagesSerializer(
        jobName,
        jobStages,
        '',
        botParent?.id,
        teamParent?.id,
      );
      const { success, data, message } = await saveJob.mutateAsync(formattedForApi);
      if (success && data) {
        fireToast(ToastTypes.success, `Job ${jobName} saved!`);
        selectPage('List', false);
      } else {
        fireToast(ToastTypes.error, message);
      }
      console.log(success, data, message);
    }
  };

  const updateJob = api.jobs.editJob.useMutation();

  // validates in fireSaveJob
  const fireUpdateJob = async () => {
    if (!selectedJob.id) {
      alert('no job selected, this is an error in the code');
      return;
    }
    const jobName = jobFormFields.find((field) => field.name === 'Job Name')?.value || '';

    const formattedForApi = jobStagesToApiJobStagesSerializer(
      jobName,
      jobStages,
      selectedJob.id,
      botParent?.id,
      teamParent?.id,
    );
    const { success, data, message } = await updateJob.mutateAsync({
      id: selectedJob.id,
      ...formattedForApi,
    });
    if (success && data) {
      fireToast(ToastTypes.success, `Job ${jobName} saved!`);
      selectPage('List', false);
    } else {
      fireToast(ToastTypes.error, message);
    }
    console.log(success, data, message);
  };

  const handleDuplicate = async (jobId: string) => {
    fireToast(ToastTypes.loading, 'Duplicating job...');
    duplicateJob.mutateAsync({ jobId: jobId }).then((res) => {
      if (res.success) {
        fireToast(ToastTypes.success, 'Job duplicated');
        selectPage('List', false);
      } else {
        fireToast(ToastTypes.error, res.message);
      }
    });
  };

  const saveJob = api.jobs.createJob.useMutation();

  const validateJob = (): boolean => {
    if (jobStages.length === 0) {
      fireToast(ToastTypes.error, 'no job stages');
      return false;
    }
    const jobName = jobFormFields.find((field) => field.name === 'Job Name')?.value || '';

    if (jobName === '') {
      fireToast(ToastTypes.error, 'no job name');
    }
    if (jobStages.some((jobStage) => jobStage.actions.length === 0)) {
      fireToast(ToastTypes.error, 'no actions in job stage');
      return false;
    }
    if (
      jobStages.some((jobStage) =>
        jobStage.actions.some((action) =>
          action.inputs.some(
            (input) =>
              input.value &&
              input.value.trim() === '' &&
              !input.inputName.toLowerCase().includes('joinon'),
          ),
        ),
      )
    ) {
      fireToast(ToastTypes.error, 'empty input');
      return false;
    }
    return true;
  };

  const pageControls: PageControl[] = [
    {
      pageId: 'List',

      setPageOpen: setOpenJobList,
      isOpen: openJobList,
    },
    ...(!openJobLogs
      ? [
          {
            pageId: 'Add',
            title: `${selectedJob.id ? 'Edit' : 'Add'}`,
            setPageOpen: setOpenJobBuilder,
            isOpen: openJobBuilder,
          },
        ]
      : []),
  ];
  const childPageControls: PageControl[] = [
    {
      pageId: 'Logs',
      setPageOpen: setOpenJobLogs,
      isOpen: openJobLogs,
    },
  ];

  const selectPage = usePageSelector(pageControls, childPageControls);
  const [jobFormFields, setJobFormFields] = useState<FormField[]>([
    {
      name: 'Job Name',
      value: '',
      type: 'textarea',
      isEditable: true,
    },
  ]);
  useEffect(() => {
    if (selectedJob) {
      setJobFormFields([
        {
          name: 'Job Name',
          value: selectedJob.name,
          type: 'textarea',
          isEditable: true,
        },
      ]);
    }
  }, [selectedJob]);
  // what if i add jobparent to parentprops and pass to create / logs
  return (
    <AnimatePresence>
      <ComponentPortalWrapper portal='.portal2'>
        <RootPage
          titleOverride={`Jobs`}
          parentBorderColor={TabColors.Jobs.secondary}
          pageTitle={`Jobs`}
          botParent={botParent}
          teamParent={teamParent}
          pageControls={pageControls}
          childPaneButtons={childPageControls}
          childPaneTitle={
            openJobBuilder
              ? selectedJob.name
                ? `Edit ${selectedJob.name}`
                : 'Build a Job'
              : openJobLogs
              ? 'Logs'
              : ''
          }
          selectChildPage={selectPage}
          hasChildrenBorder={true}
          childPaneOpen={openJobLogs}
          injectedButtons={
            openJobBuilder ? (
              <>
                <ControlPaneButton
                  button={{
                    icon: faCirclePlus,
                    text: 'Stage',
                    isVisible: true,
                    onClick: () => {
                      dispatchJobStagesReducer({ type: 'addJobStep' });
                    },
                    selected: false,
                    widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
                  }}
                  border={''}
                  rounded={'rounded-none'}
                />
                <ControlPaneButton
                  button={{
                    icon: faTrash,
                    text: 'Reset',
                    isVisible: true,
                    onClick: () => {
                      dispatchJobStagesReducer({ type: 'reset' });
                    },
                    selected: false,
                    widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
                  }}
                  border={''}
                  rounded={'rounded-none'}
                />
                <ControlPaneButton
                  button={{
                    icon: faCopy,
                    text: 'Duplicate',
                    isHidden: selectedJob.id === '',
                    isVisible: selectedJob.id !== '',
                    onClick: () => {
                      handleDuplicate(selectedJob.id);
                    },
                    selected: false,
                    widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
                  }}
                  border={''}
                  rounded={'rounded-none'}
                />
                <ControlPaneButton
                  button={{
                    icon: faTrashCan,
                    text: 'Delete',
                    isVisible: selectedJob.id !== '',
                    isHidden: selectedJob.id === '',

                    onClick: () => {
                      handleDelete(selectedJob.id);
                    },
                    selected: false,
                    widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
                  }}
                  border={''}
                  rounded={'rounded-none'}
                />

                <ControlPaneButton
                  button={{
                    icon: faCircleCheck,
                    text: 'Save',
                    isVisible: true,
                    onClick: () => {
                      fireSaveJob();
                    },
                    selected: false,
                    widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
                  }}
                  border={''}
                  rounded={'rounded-none'}
                />
              </>
            ) : (
              <></>
            )
          }
        >
          <>
            {/* {openJobConnector && <JobConnect setOpenJobConnector={setOpenJobConnector} />} */}
            {openJobList && (
              <>
                <JobList
                  botParent={botParent}
                  teamParent={teamParent}
                  dispatchJobStagesReducer={dispatchJobStagesReducer}
                  setOpenJobBuilder={setOpenJobBuilder}
                  setSelectedJob={setSelectedJob}
                  selectPage={selectPage}
                  jobStages={jobStages}
                  openJobBuilder={openJobBuilder}
                  selectedJob={selectedJob}
                />
              </>
            )}
            {openJobBuilder && (
              <JobBuilder
                openJobBuilder={openJobBuilder}
                botParent={botParent}
                teamParent={teamParent}
                jobStages={jobStages}
                dispatchJobStagesReducer={dispatchJobStagesReducer}
                setOpenJobBuilder={setOpenJobBuilder}
                selectedJob={selectedJob}
                setSelectedJob={setSelectedJob}
                selectPage={selectPage}
                // refetch={jobs.refetch}
                jobFormFields={jobFormFields}
                setJobFormFields={setJobFormFields}
              />
            )}
            {openJobLogs && <JobRunLogs jobId={selectedJob.id} jobName={selectedJob.name} />}
          </>
        </RootPage>
      </ComponentPortalWrapper>
    </AnimatePresence>
  );
};

export default Jobs;

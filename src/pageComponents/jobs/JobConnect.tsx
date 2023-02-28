import cogoToast from 'cogo-toast';
import { api } from '../../utils/api';
import { ParentProps } from '../Parent';
import { ListPrimary } from '../../components/ListPrimary';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../components/modals/Modal';
import { TabColors } from '../../components/HeaderTabs';
import { Dispatch, SetStateAction, useState } from 'react';
import React from 'react';
import { FormField } from '../../components/Form/Form';

interface JobConnectProps {
  setOpenJobConnector: Dispatch<SetStateAction<boolean>>;
}

export const JobConnect: React.FC<ParentProps & JobConnectProps> = ({
  teamParent,
  setOpenJobConnector,
}) => {
  const connectJob = api.jobs.connectJob.useMutation();

  const userJobs = api.jobs.getJobs.useQuery({});
  const teamJobs = api.jobs.getJobs.useQuery({ teamId: teamParent?.id });

  const fireConnectJob = async (jobId: string) => {
    const res = await connectJob.mutateAsync({
      id: jobId,
      botId: '',
    });
    if (res.success) {
      cogoToast.success('Connected job');
    } else {
      cogoToast.error('Failed to connect job');
    }
  };

  const [connectorFormFields, setConnectorFormFields] = useState<FormField[]>([
    {
      name: 'Connect user jobs to a bot',
      type: 'select',
      value: userJobs.data?.data?.[0].id || 'No user jobs found',
      options: userJobs.data?.data?.map((job) => ({
        value: job.id,
        label: `${job.name}`,
      })),
      isEditable: true,
    },
  ]);
  const [teamConnectorFormFields, setTeamConnectorFormFields] = useState<FormField[]>([
    {
      name: 'connector',
      type: 'select',
      value: teamJobs.data?.data?.[0].id || 'No team jobs found',
      options: teamJobs.data?.data?.map((job) => ({
        value: job.id,
        label: `${job.name}`,
      })),
      isEditable: true,
    },
  ]);

  return (
    <>
      {teamParent && (
        <Modal
          title={`Add your job to ${teamParent.name}`}
          setOpenModal={setOpenJobConnector}
          parentBorderColor={TabColors.Jobs.secondary}
        >
          Connect a job to this team Connect a job to a bot
          {userJobs.data && userJobs.data.data && (
            <ListPrimary
              listItems={userJobs.data.data.map((job) => ({
                id: job.id,
                name: job.name,
              }))}
              itemActions={[
                {
                  exec: (id) => fireConnectJob(id),
                  icon: faLink,
                },
              ]}
            />
          )}
        </Modal>
      )}
    </>
  );
};

import { Modal } from '../../components/modals/Modal';
import { Form, TextFormField } from '../../components/Form/Form';
import { TabColors } from '../../components/HeaderTabs';
import { useEffect, useState } from 'react';
import { api } from '../../utils/api';

interface JobLogInfoModalProps {
  selectedLog: {
    id: string;
    name: string;
  };
  setOpenViewLog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const JobLogInfoModal: React.FC<JobLogInfoModalProps> = ({
  selectedLog,
  setOpenViewLog,
}) => {
  const jobLog = api.jobs.getJobFiredLog.useQuery({
    id: selectedLog.id,
  });

  useEffect(() => {
    if (jobLog.data) {
      const parsed = JSON.parse(jobLog?.data?.data?.jobDump || '');
      console.log(parsed);
      setSavedActionOutputs(parsed.savedActionOutputs);
    }
  }, [jobLog.data]);

  const [savedActionOutputs, setSavedActionOutputs] = useState<any[]>([]);

  return (
    // <Modal
    //   title={`View Log - ${jobLog.data?.data?.name}`}
    //   setOpenModal={setOpenViewLog}
    //   parentBorderColor={TabColors.Jobs.secondary}
    // >
    <div className='flex flex-col'>
      <div className={`${jobLog.data?.data?.status ? 'text-green-500' : 'text-red-500'} text-2xl`}>
        {jobLog.data?.data?.status ? 'Success' : 'Failed'}
      </div>

      <div className='px-2'>
        <TextFormField
          index={0}
          formFields={[
            {
              name: 'Ran at',
              value: jobLog.data?.data?.createdAt.toLocaleString() || '',
              isEditable: false,
              type: 'text',
            },
          ]}
          setFormFields={() => {}}
        />
      </div>
      {savedActionOutputs.map((stage: any, index: number) => {
        return (
          <div className='flex flex-col' key={index}>
            <Form
              noSubmitButton={true}
              formFields={[
                {
                  name: 'Job Stage',
                  value: index,
                  isEditable: false,
                  type: 'text',
                },
                {
                  name: 'Action Index',
                  value: stage.actionIndex,
                  isEditable: false,
                  type: 'text',
                },
                {
                  name: 'Action Name',
                  value: stage.actionName,
                  isEditable: false,
                  type: 'text',
                },
                {
                  name: 'Job Stage Index',
                  value: stage.jobStageIndex,
                  isEditable: false,
                  type: 'text',
                },
                {
                  name: 'Output',
                  value: stage.output,
                  isEditable: false,
                  type: 'textarea',
                },
              ]}
              setFormFields={() => {}}
            />
          </div>
        );
      })}
    </div>
    // </Modal>
  );
};

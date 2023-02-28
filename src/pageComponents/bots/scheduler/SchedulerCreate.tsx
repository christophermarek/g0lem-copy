import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { FormField } from '../../../components/Form/Form';
import { TabColors } from '../../../components/HeaderTabs';
import { api } from '../../../utils/api';
import { fireToast, ToastTypes } from '../../../react/hooks/useToast';
import { IntervalType } from '@prisma/client';
import { ParentProps } from '../../Parent';
import { CreateEditForm } from '../../../components/CreateEditForm';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { ModalContext } from '../../../react/context/ModalContext';

interface SchedulerCreateProps {
  openSchedulerCreate: boolean;
  setOpenSchedulerCreate: Dispatch<SetStateAction<boolean>>;
  refetch: any;
  selectedSchedule: { id: string; name: string };
  setSelectedSchedule: Dispatch<SetStateAction<{ id: string; name: string }>>;
  toggleFireSubmit: boolean;
  setToggleFireSubmit: Dispatch<SetStateAction<boolean>>;
}

export const SchedulerCreate: React.FC<ParentProps & SchedulerCreateProps> = ({
  botParent,
  teamParent,
  openSchedulerCreate,
  setOpenSchedulerCreate,
  refetch,
  selectedSchedule,
  setSelectedSchedule,
  toggleFireSubmit,
  setToggleFireSubmit,
}) => {
  const jobs = api.jobs.getJobs.useQuery({ botId: botParent?.id || '' });
  const createSchedule = api.jobSchedule.createJobSchedule.useMutation();
  const updateSchedule = api.jobSchedule.updateJobSchedule.useMutation();

  const selectedScheduleData = api.jobSchedule.getJobSchedule.useQuery(
    {
      jobScheduleId: selectedSchedule.id,
    },
    { enabled: false },
  );
  const [scheduleFormFields, setScheduleFormFields] = useState<FormField[]>([]);

  const getExistingSchedule = async () => {
    const { data } = await selectedScheduleData.refetch();
    if (data) {
      setScheduleFormFields([
        {
          name: 'Schedule Name',
          type: 'text',
          value: data.name,
          isEditable: true,
        },
        {
          name: 'Interval',
          type: 'number',
          value: data.intervalMs,
          isEditable: true,
        },
        {
          name: 'Job',
          type: 'select',
          spanCols: '2',

          value: data.jobId || 'No Jobs',
          options: jobs.data?.data?.map((job) => ({
            label: job.name,
            value: job.id,
          })),
          isEditable: true,
        },

        {
          name: 'Enabled',
          type: 'checkbox',
          value: String(data.enabled),
          isEditable: true,
        },
        {
          name: 'inSeconds',
          type: 'checkbox',
          value: data.intervalType === IntervalType.S ? IntervalType.S : IntervalType.MS,
          isEditable: true,
        },
        // { name: 'executeAt', type: 'text', value: '', isEditable: true },
      ]);
    } else {
      fireToast(ToastTypes.error, 'Error getting schedule data');
    }
  };
  useEffect(() => {
    if (jobs.data?.data) {
      if (selectedSchedule.id === '') {
        setScheduleFormFields([
          {
            name: 'Schedule Name',
            type: 'text',
            value: '',
            isEditable: true,
            spanCols: '2',
          },
          {
            name: 'Interval',
            type: 'number',
            value: '',
            isEditable: true,
            spanCols: '2',
          },
          {
            name: 'Job',
            type: 'select',
            spanCols: '2',
            value: jobs.data?.data[0]?.id,
            options: jobs.data?.data?.map((job) => ({
              label: job.name,
              value: job.id,
            })),
            isEditable: true,
          },

          {
            name: 'Enabled',
            type: 'checkbox',
            value: '',
            isEditable: true,
          },
          {
            name: 'inSeconds',
            type: 'checkbox',
            value: '',
            isEditable: true,
          },
          // { name: 'executeAt', type: 'text', value: '', isEditable: true },
        ]);
      } else {
        getExistingSchedule();
      }
    }
  }, [jobs.data?.data]);

  const validateForm = (): { isValid: boolean; error: string } => {
    const jobName = scheduleFormFields.find((field) => field.name === 'Schedule Name')?.value;
    if (!jobName) {
      fireToast(ToastTypes.error, 'Schedule name is required');
      return { isValid: false, error: 'Schedule name is required' };
    }
    const interval = scheduleFormFields.find((field) => field.name === 'Interval')?.value;
    if (!interval) {
      fireToast(ToastTypes.error, 'Interval is required');
      return { isValid: false, error: 'Interval is required' };
    }
    const jobId = scheduleFormFields.find((field) => field.name === 'Job')?.value;
    if (!jobId) {
      fireToast(ToastTypes.error, 'Job is required');
      return { isValid: false, error: 'Job is required' };
    }
    return { isValid: true, error: '' };
  };

  const fireCreateSchedule = async () => {
    const res = await createSchedule.mutateAsync({
      botId: botParent?.id || '',
      jobName: scheduleFormFields.find((field) => field.name === 'Schedule Name')?.value || '',
      intervalMs: scheduleFormFields.find((field) => field.name === 'Interval')?.value || '',
      intervalType:
        scheduleFormFields.find((field) => field.name === 'inSeconds')?.value === 'true'
          ? IntervalType.S
          : IntervalType.MS,
      enabled: scheduleFormFields.find((field) => field.name === 'Enabled')?.value === 'true',
      jobId: scheduleFormFields.find((field) => field.name === 'Job')?.value || '',
    });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
      setIsOpen(false);
      setOpenSchedulerCreate(false);
    } else {
      fireToast(ToastTypes.error, res.message);
    }
  };

  const fireUpdateSchedule = async () => {
    const res = await updateSchedule.mutateAsync({
      jobScheduleId: selectedSchedule.id,
      scheduleName: scheduleFormFields.find((field) => field.name === 'Schedule Name')?.value || '',
      intervalMs: scheduleFormFields.find((field) => field.name === 'Interval')?.value || '',
      intervalType:
        scheduleFormFields.find((field) => field.name === 'inSeconds')?.value === 'true'
          ? IntervalType.S
          : IntervalType.MS,
      enabled: scheduleFormFields.find((field) => field.name === 'Enabled')?.value === 'true',
    });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
      setIsOpen(false);
      setOpenSchedulerCreate(false);
    } else {
      fireToast(ToastTypes.error, res.message);
    }
    setSelectedSchedule({ id: '', name: '' });
  };

  const renderReadableIntervals = (interval: number, inSeconds: boolean) => {
    if (inSeconds) interval = interval * 1000;
    const ms = interval;
    const seconds = interval / 1000;
    const minutes = interval / 1000 / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    return (
      <ul className='grid-auto-cols grid'>
        <li>- {ms} ms</li>
        <li>- {seconds.toFixed(2)} seconds</li>
        <li>- {minutes.toFixed(2)} minutes</li>
        {hours.toFixed(2) != '0.00' && <li>- {hours.toFixed(2)} hours</li>}
        {days.toFixed(2) != '0.00' && <li>- {days.toFixed(2)} days</li>}
      </ul>
    );
  };

  const { setIsOpen } = useContext(ModalContext);
  return (
    <div className='p-4'>
      <CreateEditForm
        formFields={scheduleFormFields}
        setFormFields={setScheduleFormFields}
        create={fireCreateSchedule}
        update={fireUpdateSchedule}
        validateForm={validateForm}
        selectedItem={selectedSchedule}
        refetch={refetch}
        noSubmitButton
        toggleFireSubmit={toggleFireSubmit}
        dataType='Schedule'
      >
        <div className='p-2 text-xl'>
          Schedule will run every{' '}
          <>
            {renderReadableIntervals(
              Number(scheduleFormFields.find((field) => field.name === 'Interval')?.value || 0),
              scheduleFormFields.find((field) => field.name === 'inSeconds')?.value === 'true',
            )}
          </>
        </div>
      </CreateEditForm>
    </div>
  );
};

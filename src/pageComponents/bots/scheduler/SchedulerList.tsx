import {
  faEye,
  faCopy,
  faTrashCan,
  faBoltLightning,
  faEdit,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import { Frame } from '../../../components/container';
import { TabColors } from '../../../components/HeaderTabs';
import { ListPrimary } from '../../../components/ListPrimary';
import { api } from '../../../utils/api';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { ToastTypes, fireToast } from '../../../react/hooks/useToast';
import { ParentProps } from '../../Parent';
import { JobSchedule } from '@prisma/client';

interface SchedulerListProps {
  setSelectedSchedule: Dispatch<SetStateAction<{ id: string; name: string }>>;
  schedules: JobSchedule[];
  refetch: any;
  selectPage: (pageId: string, opensModal: boolean) => void;
}

export const SchedulerList: React.FC<ParentProps & SchedulerListProps> = ({
  setSelectedSchedule,
  schedules,
  refetch,
  selectPage,
}) => {
  const deleteBotSchedule = api.jobSchedule.deleteJobSchedule.useMutation();
  const enableSchedule = api.jobSchedule.toggleJobScheduleEnabled.useMutation();

  useEffect(() => {
    setSelectedSchedule({ id: '', name: '' });
    refetch();
  }, []);

  const deleteScheduler = async (id: string) => {
    const res = await deleteBotSchedule.mutateAsync({ jobScheduleId: id });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
    } else {
      fireToast(ToastTypes.error, res.message);
      refetch();
    }
  };

  const handleOpenSchedule = async (id: string) => {
    setSelectedSchedule({ id, name: schedules.find((s) => s.id === id)?.name || '' });
    selectPage('Add', false);
  };

  const handleEnableSchedule = async (id: string) => {
    const res = await enableSchedule.mutateAsync({ jobScheduleId: id });
    if (res.success) {
      fireToast(ToastTypes.success, res.message);
    } else {
      fireToast(ToastTypes.error, res.message);
      refetch();
    }
  };

  const handleViewSchedule = async (id: string) => {
    setSelectedSchedule({ id, name: schedules.find((s) => s.id === id)?.name || '' });
    selectPage('Logs', false);
  };

  return (
    <>
      <div className='my-4 '>
        <ListPrimary
          listItems={schedules?.map((schedule, index) => ({
            name: schedule.name + ' ' + (schedule.enabled ? 'Enabled' : 'Disabled'),
            id: schedule.id,
          }))}
          itemActions={[
            {
              exec: handleOpenSchedule,
              icon: faEdit,
              actionName: `Edit`,
            },
            {
              exec: handleEnableSchedule,
              icon: faBoltLightning,
              actionName: `Toggle Enabled`,
            },
            {
              exec: deleteScheduler,
              icon: faTrashCan,
              actionName: `Delete`,
            },
            {
              exec: handleViewSchedule,
              icon: faHistory,
              actionName: `View Logs`,
            },
          ]}
        />
      </div>
    </>
  );
};

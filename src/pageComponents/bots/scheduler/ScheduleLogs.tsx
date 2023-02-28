import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '@nextui-org/react';
import { Form } from '../../../components/Form/Form';
import { TabColors } from '../../../components/HeaderTabs';
import { ListPrimary } from '../../../components/ListPrimary';
import { Frame } from '../../../components/container';
import { api } from '../../../utils/api';
import { ParentProps } from '../../Parent';
import { JobLogInfoModal } from '../../jobs/JobLogInfoModal';
import { useState } from 'react';
import { ToastTypes, fireToast } from '../../../react/hooks/useToast';

interface ScheduleLogsProps {
  jobScheduleId: string;
}

export const ScheduleLogs: React.FC<ParentProps & ScheduleLogsProps> = ({
  botParent,
  teamParent,
  jobScheduleId,
}) => {
  const logs = api.jobSchedule.getLogsForJobSchedule.useQuery({ jobScheduleId: jobScheduleId });
  const [openViewLog, setOpenViewLog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<{
    id: string;
    name: string;
  }>();

  const handleViewJobLog = async (id: string) => {
    // id points to a scheduleLog
    const log = logs?.data?.find((log) => log.id === id);

    if (log?.jobFiredLogId === null || log?.jobFiredLogId === undefined) {
      fireToast(ToastTypes.error, 'No job fired log for this schedule log');
      return;
    }

    // selected log we want to view is the job fired log for this schedule
    setSelectedLog({
      id: log?.jobFiredLogId || '',
      name: String(log?.failed),
    });
    setOpenViewLog(true);
  };

  return (
    <Frame parentBorderColor={TabColors.Bots.secondary} className='my-4 border-none px-0 py-0'>
      {logs.isLoading && <div>Loading...</div>}
      {logs.isError && <div>Error</div>}
      {logs?.data && (
        <ListPrimary
          listItems={logs.data.map((log) => ({
            id: log.id,
            name: `${!log.failed ? 'Success' : 'Failed'} - ${log.dateCreated}`,
          }))}
          itemActions={[
            {
              exec: handleViewJobLog,
              icon: faMagnifyingGlassPlus,
              actionName: 'View Job Log',
            },
          ]}
        />
      )}
      {openViewLog && selectedLog && (
        <JobLogInfoModal setOpenViewLog={setOpenViewLog} selectedLog={selectedLog} />
      )}
    </Frame>
  );
};

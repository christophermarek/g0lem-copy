import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';
import { ListPrimary } from '../../components/ListPrimary';
import { api } from '../../utils/api';
import { useState } from 'react';
import { JobFiredLog } from '@prisma/client';
import { TabColors } from '../../components/HeaderTabs';
import { Frame } from '../../components/container';
import { JobLogInfoModal } from './JobLogInfoModal';

interface JobRunLogs {
  jobId: string;
  jobName: string;
}

export const JobRunLogs: React.FC<JobRunLogs> = ({ jobId, jobName }) => {
  const jobLogs = api.jobs.getJobFiredLogs.useQuery({
    id: jobId,
  });

  const [opnViewLog, setOpnViewLog] = useState(false);
  const [expandedLogIndex, setExpandedLogIndex] = useState<number>(-1);
  const [selectedLog, setSelectedLog] = useState<{
    id: string;
    name: string;
  }>();

  const handleViewLog = async (id: string) => {
    if (selectedLog?.id === id) {
      setOpnViewLog(!opnViewLog);
      return;
    }
    const log = jobLogs?.data?.data?.find((log) => log.id === id);
    const logIndex = jobLogs?.data?.data?.findIndex((log) => log.id === id);
    if (!log || logIndex === undefined) return;
    setSelectedLog({
      id: log?.id || '',
      name: log?.name || '',
    });

    setOpnViewLog(true);
    setExpandedLogIndex(logIndex);
  };

  return (
    <Frame parentBorderColor={TabColors.Jobs.secondary} className='my-4 border-none px-0 py-0'>
      {jobLogs.isLoading && <div>Loading...</div>}
      {jobLogs.isError && <div>Error</div>}
      {jobLogs?.data?.data && (
        <ListPrimary
          listItems={jobLogs.data.data.map((log) => ({
            id: log.id,
            name: `${log.name} - ${
              log.status ? 'Success' : 'Failed'
            } - ${log.createdAt.toLocaleString()}`,
          }))}
          itemActions={[
            {
              exec: handleViewLog,
              icon: faMagnifyingGlassPlus,
              actionName: 'View',
            },
          ]}
          expandedItemIndex={expandedLogIndex}
        >
          {' '}
          {opnViewLog && selectedLog && (
            <JobLogInfoModal selectedLog={selectedLog} setOpenViewLog={setOpnViewLog} />
          )}
        </ListPrimary>
      )}
    </Frame>
  );
};

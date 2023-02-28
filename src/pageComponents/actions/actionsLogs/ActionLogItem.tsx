import { faSquareCaretDown, faSquareCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionLog } from '@prisma/client';
import { Frame } from '../../../components/container';
import { useState } from 'react';

interface ActionLogItemProps {
  actionLog: ActionLog;
}

export const ActionLogItem: React.FC<ActionLogItemProps> = ({ actionLog }) => {
  const [actionLogExpanded, setActionLogExpanded] = useState(false);
  return (
    <>
      <Frame
        className={`${
          actionLogExpanded ? 'noBottomBorder rounded-t-lg' : ''
        } flex overflow-scroll rounded-t-lg`}
        key={actionLog.id}
      >
        <div>{actionLog.actionDisplayName}</div>
        <div>
          {actionLog.createdAt.toLocaleDateString()} {actionLog.createdAt.toLocaleTimeString()}
        </div>
        <div>{actionLog.success ? 'Success' : 'Error'}</div>
        <FontAwesomeIcon
          className={`'w-6'`}
          icon={true ? faSquareCaretDown : faSquareCaretUp}
          onClick={() => setActionLogExpanded(!actionLogExpanded)}
        />
      </Frame>
      {actionLogExpanded && (
        <Frame className='selectedTab noTopBorder rounded-b-lg'>
          <div>{actionLog.message}</div>
          <div className='text-ellipsis'>{actionLog.actionConfig}</div>
        </Frame>
      )}
    </>
  );
};

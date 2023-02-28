import React from 'react';
import { ListPrimary } from '../../components/ListPrimary';
import { faBullseye, faHistory } from '@fortawesome/free-solid-svg-icons';
import { FireActionComponent } from './FireActionComponent';
import { actionData } from '../../utils/actions';

interface ActionsListProps {
  selectPage: (pageId: string, opensModal: boolean) => void;
}
export const ActionsList: React.FC<ActionsListProps> = ({ selectPage }) => {
  const possibleActions = actionData;
  const handleOpenActionLogs = async (id: string) => {
    selectPage('Logs', false);
  };

  const handleOpenFireAction = async (id: string) => {
    const actionFunction = id;
    const action = possibleActions[id as keyof typeof possibleActions.data];
    if (action) {
      setSelectedAction({ actionName: action.label, actionFunction: id });
      setOpenFireAction(true);
    } else {
      alert('Action not found');
    }
  };

  const [selectedAction, setSelectedAction] = React.useState<{
    actionName: string;
    actionFunction: string;
  }>({ actionName: '', actionFunction: '' });
  const [openFireAction, setOpenFireAction] = React.useState(false);

  return (
    <>
      {possibleActions && (
        <>
          <ListPrimary
            listItems={Object.entries(possibleActions).map(([key, value]) => ({
              id: key,
              name: value?.label || 'No name',
            }))}
            itemActions={[
              {
                exec: handleOpenFireAction,
                icon: faBullseye,
                actionName: 'Fire',
              },
              {
                exec: handleOpenActionLogs,
                icon: faHistory,
                actionName: 'Logs',
              },
            ]}
          />
          {openFireAction && (
            <FireActionComponent
              actionName={selectedAction.actionName}
              actionFunction={selectedAction.actionFunction}
              setOpenFireAction={setOpenFireAction}
            />
          )}
        </>
      )}
    </>
  );
};

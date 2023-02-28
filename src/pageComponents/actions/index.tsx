import { ParentProps } from '../Parent';
import { PageControl, RootPage, usePageSelector } from '../../components/RootPage';
import { TabColors } from '../../components/HeaderTabs';
import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { ActionsList } from './ActionsList';
import { ActionLogs } from './actionsLogs/ActionLogs';
import { useState } from 'react';

interface ActionsPageProps {}

const Actions: React.FC<ParentProps & ActionsPageProps> = ({ botParent, teamParent }) => {
  const [openLogs, setOpenLogs] = useState(false);
  const [openFireAction, setOpenFireAction] = useState(false);
  const [openActionsList, setOpenActionsList] = useState(true);
  const [openActionLogItem, setOpenActionLogItem] = useState(false);

  const pageControls: PageControl[] = [
    {
      isOpen: openActionsList,
      pageId: 'List',
      setPageOpen: setOpenActionsList,
    },
  ];
  const childPageControls: PageControl[] = [
    {
      isOpen: openLogs,
      pageId: 'Logs',
      setPageOpen: setOpenLogs,
    },
    {
      isOpen: openFireAction,
      pageId: 'Fire',
      setPageOpen: setOpenFireAction,
      opensModal: true,
      hidden: true,
    },
    {
      isOpen: openActionLogItem,
      pageId: 'Item',
      setPageOpen: setOpenActionLogItem,
      opensModal: true,
      hidden: true,
    },
  ];
  const selectPage = usePageSelector(pageControls, childPageControls);
  return (
    <ComponentPortalWrapper portal='.portal2'>
      <RootPage
        parentBorderColor={TabColors.Actions.secondary}
        pageTitle='Actions'
        botParent={botParent}
        teamParent={teamParent}
        pageControls={pageControls}
        childPaneOpen={openLogs || openActionLogItem}
        childPaneTitle='Logs'
        childPaneButtons={childPageControls}
        selectChildPage={selectPage}
      >
        {openActionsList && <ActionsList selectPage={selectPage} />}
        {openLogs && <ActionLogs />}

        {/* <ActionLogItem actionLog={_actionLog} key={_actionLog.id} /> */}
      </RootPage>
    </ComponentPortalWrapper>
  );
};

export default Actions;

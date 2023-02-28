import { useEffect, useState } from 'react';
import { ComponentPortalWrapper } from '../../../components/ComponentPortalWrapper';
import { TabColors } from '../../../components/HeaderTabs';
import { api } from '../../../utils/api';
import { ParentProps } from '../../Parent';
import { PageControl, RootPage, usePageSelector } from '../../../components/RootPage';
import { SchedulerCreate } from './SchedulerCreate';
import { SchedulerList } from './SchedulerList';
import { ScheduleLogs } from './ScheduleLogs';
import { ControlPaneTitleButtons } from '../../../components/ControlPane/TitleButtons';
import { ControlPaneButton } from '../../../components/ControlPane/Button';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

interface BotSchedulerProps {}

export const BotScheduler: React.FC<ParentProps & BotSchedulerProps> = ({
  botParent,
  teamParent,
}) => {
  const [openSchedulerCreate, setOpenSchedulerCreate] = useState(false);
  const [openBotSchedulerList, setOpenBotSchedulerList] = useState(true);
  const [openBotScheduleLogs, setOpenBotScheduleLogs] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<{
    id: string;
    name: string;
  }>({
    id: '',
    name: '',
  });

  const pageControls: PageControl[] = [
    {
      isOpen: openBotSchedulerList,
      pageId: 'List',
      setPageOpen: setOpenBotSchedulerList,
    },
    {
      isOpen: openSchedulerCreate,
      pageId: 'Add',
      title: `${selectedSchedule.id !== '' ? 'Edit' : 'Add'}`,
      setPageOpen: setOpenSchedulerCreate,
      // opensModal: true,
    },
  ];

  const childPageControls: PageControl[] = [
    ...(selectedSchedule.id !== ''
      ? [
          {
            isOpen: openBotScheduleLogs,
            pageId: 'Logs',
            setPageOpen: setOpenBotScheduleLogs,
          },
        ]
      : []),
  ];

  const selectPage = usePageSelector(pageControls, childPageControls);
  const [toggleFireSubmit, setToggleFireSubmit] = useState(false);

  const schedules = api.jobSchedule.getJobSchedules.useQuery({ botId: botParent?.id || '' });
  return (
    <ComponentPortalWrapper portal='.portal2'>
      <RootPage
        parentBorderColor={TabColors.Bots.secondary}
        // pageTitle={`${botParent?.name} Scheduler`}
        pageTitle={`Scheduler`}
        titleOverride={`Scheduler`}
        botParent={botParent}
        teamParent={teamParent}
        pageControls={pageControls}
        selectChildPage={selectPage}
        childPaneButtons={childPageControls}
        childPaneOpen={openBotScheduleLogs || openSchedulerCreate}
        childPaneTitle={`Schedule ${selectedSchedule.name}`}
        hasChildrenBorder={true}
        injectedChildButtons={[
          <ControlPaneButton
            key={'injected-0'}
            button={{
              icon: faCircleCheck,
              text: selectedSchedule.id !== '' ? 'Save' : 'Save',
              isVisible: true,
              onClick: () => {
                setToggleFireSubmit(true);
              },
              selected: false,
              widthOverride: 'sm: w-1/2  md:w-fit lg:w-fit',
            }}
            border={''}
            rounded={'rounded-none'}
          />,
        ]}
      >
        {openSchedulerCreate && (
          <SchedulerCreate
            openSchedulerCreate={openSchedulerCreate}
            botParent={botParent}
            setOpenSchedulerCreate={setOpenSchedulerCreate}
            refetch={schedules.refetch}
            selectedSchedule={selectedSchedule}
            setSelectedSchedule={setSelectedSchedule}
            toggleFireSubmit={toggleFireSubmit}
            setToggleFireSubmit={setToggleFireSubmit}
          />
        )}
        {openBotSchedulerList && schedules.data && (
          <SchedulerList
            setSelectedSchedule={setSelectedSchedule}
            botParent={botParent}
            refetch={schedules.refetch}
            schedules={schedules.data}
            selectPage={selectPage}
          />
        )}
        {openBotScheduleLogs && <ScheduleLogs jobScheduleId={selectedSchedule.id} />}
      </RootPage>
    </ComponentPortalWrapper>
  );
};

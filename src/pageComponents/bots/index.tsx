import { PropsWithChildren, useEffect, useState } from 'react';
import { BotList } from './BotList';
import { BotCreate } from './BotCreate';
import { RootPage, usePageSelector } from '../../components/RootPage';
import { ParentProps } from '../Parent';
import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { TabColors } from '../../components/HeaderTabs';
import { AnimatePresence, motion } from 'framer-motion';
import { FormField } from '../../components/Form/Form';
import { api } from '../../utils/api';
import Jobs from '../jobs';
import { BotActivity } from './BotActivity';
import { BotScheduler } from './scheduler/BotScheduler';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export const ModalComponent: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className='modal'>{children}</div>;
};
interface BotsProps {}
const Bots: React.FC<ParentProps & BotsProps> = ({ botParent, teamParent }) => {
  const [openBotList, setOpenBotList] = useState<boolean>(true);
  const [openBotCreate, setOpenBotCreate] = useState<boolean>(false);

  useEffect(() => {}, [openBotCreate]);

  const [selectedBot, setSelectedBot] = useState<{
    botId: string;
    botName: string;
  }>({
    botId: '',
    botName: '',
  });

  const [openBotJobs, setOpenBotJobs] = useState(false);
  const [openBotEdit, setOpenBotEdit] = useState(false);
  const [openBotScheduler, setOpenBotScheduler] = useState(false);
  const [openBotActivity, setOpenBotActivity] = useState(false);
  const [openBotPersonality, setOpenBotPersonality] = useState(false);

  const pageControls = [
    {
      isOpen: openBotList,
      pageId: 'List',
      setPageOpen: setOpenBotList,
    },
    ...(!openBotJobs && !openBotScheduler && !openBotActivity
      ? [
          {
            isOpen: openBotCreate,
            pageId: 'Add',
            setPageOpen: setOpenBotCreate,
            opensModal: true,
          },
        ]
      : []),
  ];

  const childPageControls = [
    {
      isOpen: openBotEdit,
      pageId: 'Edit',
      setPageOpen: setOpenBotEdit,
      opensModal: true,
    },

    {
      isOpen: openBotJobs,
      pageId: 'Jobs',
      setPageOpen: setOpenBotJobs,
    },
    {
      isOpen: openBotScheduler,
      pageId: 'Scheduler',
      setPageOpen: setOpenBotScheduler,
    },

    // {
    //   isOpen: openBotActivity,
    //   pageId: 'Activity',
    //   setPageOpen: setOpenBotActivity,
    // },
    // {
    //   isOpen: openBotPersonality,
    //   pageId: 'Personalities',
    //   setPageOpen: setOpenBotPersonality,
    // },
  ];

  const selectPage = usePageSelector(pageControls, childPageControls);
  const [createBotFormFields, setCreateBotFormFields] = useState<FormField[]>([]);

  const bot = api.bots.getBot.useQuery(
    { botId: selectedBot.botId },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (bot.data && bot.data.bot) {
      setCreateBotFormFields([
        {
          name: 'Name',
          value: bot.data.bot.name,
          isEditable: openBotEdit,
          type: 'text',
        },
        {
          name: 'Date Created',
          value: bot.data.bot.createdAt.toLocaleString(),
          isEditable: false,
          visible: openBotEdit,
          type: 'text',
        },
      ]);
    }
  }, [bot.data]);

  const setBotFormFields = async () => {
    const isEdit = openBotEdit;
    let botData: any = {};
    if (selectedBot.botId != '') {
      const _botData = await bot.refetch();
      botData = _botData;
    }
    setCreateBotFormFields([
      {
        name: 'Name',
        value: isEdit ? botData?.data?.bot?.name || '' : '',
        isEditable: true,
        type: 'text',
      },
      {
        name: 'Date Created',
        value: isEdit ? botData.data?.bot?.createdAt.toLocaleString() || '' : '',
        isEditable: false,
        type: 'text',
        visible: openBotEdit,
      },
    ]);
  };

  useEffect(() => {
    console.log('selectedBot.botId', selectedBot);
    setBotFormFields();
  }, [selectedBot.botId]);

  useEffect(() => {
    setBotFormFields();
  }, [openBotEdit, openBotCreate]);

  const botList = api.bots.getBots.useQuery(
    { teamId: teamParent?.id },
    {
      refetchOnWindowFocus: false,
    },
  );
  const botDataRefetchOnFormSubmit = async (refetchFunction: string) => {
    console.log('refetchFunction', refetchFunction);
    if (refetchFunction === 'create') {
      await botList.refetch();
      setSelectedBot({
        botId: '',
        botName: '',
      });
    } else if (refetchFunction === 'edit') {
      const previousBotId = selectedBot.botId;
      console.log('previousBotId', previousBotId);

      await bot.refetch();
      await botList.refetch();
      const updateBot = botList?.data?.find((bot) => bot.id === previousBotId);
      console.log('updateBot', updateBot);
      if (updateBot) {
        setSelectedBot({
          botId: updateBot.id || '',
          botName: updateBot.name || '',
        });
      } else {
        alert('Bot not found after update');
      }
    }
  };

  return (
    <>
      {/* AnimatePresence */}
      {/* <AnimatePresence> */}
      <ComponentPortalWrapper portal='.portal2'>
        <RootPage
          parentBorderColor={TabColors.Bots.secondary}
          pageTitle='Bots'
          botParent={botParent}
          teamParent={teamParent}
          pageControls={pageControls}
          childPaneOpen={
            selectedBot.botId != '' &&
            (openBotJobs || openBotScheduler || openBotActivity || openBotPersonality)
          }
          childPaneTitle={`${selectedBot.botName}`}
          childPaneButtons={childPageControls}
          selectChildPage={selectPage}
        >
          {openBotList && botList.data && (
            <BotList
              botParent={botParent}
              teamParent={teamParent}
              setSelectedBot={setSelectedBot}
              setOpenBotList={setOpenBotList}
              selectChildPage={selectPage}
              botList={botList}
            />
          )}

          {(openBotCreate || openBotEdit) && (
            <BotCreate
              botParent={botParent}
              teamParent={teamParent}
              createBotFormFields={createBotFormFields}
              setCreateBotFormFields={setCreateBotFormFields}
              setIsEdit={setOpenBotEdit}
              botId={selectedBot.botId}
              isEdit={openBotEdit}
              setOpenBotCreate={setOpenBotCreate}
              setOpenBotEdit={setOpenBotEdit}
              openBotCreate={openBotCreate}
              openBotEdit={openBotEdit}
              refetch={botDataRefetchOnFormSubmit}
            />
          )}

          {openBotJobs && (
            <>
              {bot.isLoading && <div>Loading...</div>}
              {bot.isError && <div>Error</div>}
              {bot.data?.bot && (
                <>
                  {
                    <Jobs
                      botParent={{
                        id: bot.data.bot.id,
                        name: bot.data.bot.name,
                      }}
                      teamParent={teamParent}
                      botId={bot.data.bot.id}
                    />
                  }
                </>
              )}
            </>
          )}
          {openBotScheduler && (
            <>
              {bot.isLoading && <div>Loading...</div>}
              {bot.isError && <div>Error</div>}
              {bot.data?.bot && (
                <>
                  {
                    <BotScheduler
                      botParent={{
                        id: bot.data.bot.id,
                        name: bot.data.bot.name,
                      }}
                    />
                  }
                </>
              )}
            </>
          )}
          {openBotActivity && (
            <>
              {bot.isLoading && <div>Loading...</div>}
              {bot.isError && <div>Error</div>}
              {bot.data?.bot && <>{<BotActivity />}</>}
            </>
          )}
          {openBotPersonality && (
            <>
              {bot.isLoading && <div>Loading...</div>}
              {bot.isError && <div>Error</div>}
              {bot.data?.bot && <>Unimplemented</>}
            </>
          )}
        </RootPage>
      </ComponentPortalWrapper>
      {/* </AnimatePresence> */}
    </>
  );
};

export default Bots;

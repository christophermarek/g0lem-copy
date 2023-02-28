import { faCopy, faEye, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { api } from '../../utils/api';
import { Dispatch, SetStateAction, use, useEffect } from 'react';
import { ListPrimary } from '../../components/ListPrimary';
import { ParentProps } from '../Parent';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import { bot } from '@prisma/client';
import { Frame } from '../../components/container';
import { TabColors } from '../../components/HeaderTabs';

interface BotListProps {
  setOpenBotList: Dispatch<SetStateAction<boolean>>;
  setSelectedBot: Dispatch<
    SetStateAction<{
      botId: string;
      botName: string;
    }>
  >;
  selectChildPage: (pageId: string, opensModal: boolean) => void;
  botList: any;
}

export const BotList: React.FC<ParentProps & BotListProps> = ({
  setSelectedBot,
  setOpenBotList,
  botParent,
  teamParent,
  selectChildPage,
  botList,
}) => {
  useEffect(() => {
    botList.refetch();
  }, []);
  const deleteBot = api.bots.deleteBot.useMutation();

  const handleOpenBot = async (id: string) => {
    selectChildPage('Jobs', false);
    setSelectedBot({
      botId: id,
      botName: botList.data.find((bot: bot) => bot.id === id)?.name || '',
    });
  };

  const handleDelete = async (id: string) => {
    fireToast(ToastTypes.loading, 'Deleting bot...');
    const res = await deleteBot.mutateAsync({ botId: id });
    if (res.success) {
      fireToast(ToastTypes.success, 'Deleted bot');
    } else {
      fireToast(ToastTypes.error, res.message);
    }
    botList.refetch();
  };

  return (
    <>
      <div className='my-4 w-full '>
        {botList.data && (
          <ListPrimary
            listItems={botList.data?.map((bot: bot) => ({
              name: bot.name,
              id: bot.id,
            }))}
            itemActions={[
              {
                exec: handleOpenBot,
                icon: faEye,
                actionName: 'Open',
              },

              {
                exec: handleDelete,
                icon: faTrashCan,
                actionName: 'Delete',
              },
            ]}
          />
        )}
      </div>
    </>
  );
};

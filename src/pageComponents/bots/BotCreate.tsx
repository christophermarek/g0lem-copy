import { useContext, useState } from 'react';
import { api } from '../../utils/api';
import cogoToast from 'cogo-toast';
import { ParentProps } from '../Parent';
import { Form, FormField } from '../../components/Form/Form';
import { fireToast, ToastTypes } from '../../react/hooks/useToast';
import bot from './bot';
import { Modal } from '../../components/modals/Modal';
import { TabColors } from '../../components/HeaderTabs';
import { ModalContext } from '../../react/context/ModalContext';
import { faCheck, faCircleCheck, faCircleXmark, faCopy } from '@fortawesome/free-solid-svg-icons';
import { CreateEditForm } from '../../components/CreateEditForm';

interface BotCreateProps {
  botId: string;
  createBotFormFields: FormField[];
  setCreateBotFormFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit: boolean;
  setOpenBotEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenBotCreate: React.Dispatch<React.SetStateAction<boolean>>;
  openBotEdit: boolean;
  openBotCreate: boolean;
  refetch: (refetchFunction: string) => Promise<void>;
}

export const BotCreate: React.FC<ParentProps & BotCreateProps> = ({
  botParent,
  teamParent,
  botId,
  createBotFormFields,
  setCreateBotFormFields,
  setIsEdit,
  isEdit,
  setOpenBotEdit,
  setOpenBotCreate,
  openBotEdit,
  openBotCreate,
  refetch,
}) => {
  const createBot = api.bots.createBot.useMutation();

  const editBot = api.bots.editBot.useMutation();

  const { setIsOpen } = useContext(ModalContext);

  const updateBot = async () => {
    console.log('updateBot');
    const botName = createBotFormFields.find((field) => field.name === 'Name')?.value;
    if (botName && botName.length > 0) {
      const editRes = await editBot.mutateAsync({
        botId: botId,
        botName,
      });

      if (editRes.success) {
        fireToast(ToastTypes.success, 'Bot name updated');
      } else {
        fireToast(ToastTypes.error, editRes.message);
      }
    } else {
      fireToast(ToastTypes.error, 'Bot name cannot be empty');
    }
    setIsEdit(false);
    setIsOpen(false);
    setOpenBotEdit(false);
    refetch('edit');
  };
  const duplicateBot = api.bots.duplicateBot.useMutation();

  const fireCreateBot = async () => {
    console.log('fireCreateBot');
    try {
      const botName = createBotFormFields.find((field) => field.name === 'Name')?.value;
      if (!botName || botName.length === 0) {
        cogoToast.error('Bot name cannot be empty');
        return;
      }
      const res = await createBot.mutateAsync({ botName, teamId: teamParent?.id });

      if (res.success) {
        cogoToast.success('Created bot');
      } else {
        cogoToast.error(res.message);
      }
    } catch (e) {
      console.log(e);
      cogoToast.error('Error creating bot');
    }
    setIsOpen(false);
    setOpenBotCreate(false);
    refetch('create');
  };

  const handleDuplicate = async (id: string) => {
    // const confirm = window.confirm('Are you sure you want to duplicate this bot?');
    // if (confirm) {
    fireToast(ToastTypes.loading, 'Duplicating bot...');
    const res = await duplicateBot.mutateAsync({ botId: id });

    if (res.success) {
      fireToast(ToastTypes.success, 'Duplicated bot');
    } else {
      fireToast(ToastTypes.error, res.message);
    }
    refetch('edit');
    setIsEdit(false);
    setIsOpen(false);
    setOpenBotEdit(false);
    // }
  };

  return (
    <>
      <CreateEditForm
        formFields={createBotFormFields}
        setFormFields={setCreateBotFormFields}
        noSubmitButton={true}
        create={fireCreateBot}
        update={updateBot}
        validateForm={() => {
          return { isValid: true, error: '' };
        }}
        toggleFireSubmit={false}
        selectedItem={{ name: '', id: botId }}
        dataType=''
        refetch={refetch}
        modalProps={{
          parentBorderColor: TabColors.Bots.secondary,
          title: `Bot ${isEdit ? 'Edit' : 'Create'}`,
          noClickOutside: true,
          setOpenModal: openBotEdit
            ? setOpenBotEdit
            : openBotCreate
            ? setOpenBotCreate
            : () => alert('NO update function'),
          buttons: [
            {
              icon: faCircleXmark,
              text: 'Cancel',
              isVisible: true,
              onClick: () => {
                setIsOpen(false);
                setOpenBotEdit(false);
                setOpenBotCreate(false);
              },
              selected: false,
            },
            {
              icon: faCircleCheck,
              text: openBotEdit ? 'Edit' : 'Create',
              isVisible: true,
              onClick: () => {
                isEdit ? updateBot() : fireCreateBot();
              },
              selected: false,
            },
            ...(isEdit
              ? [
                  {
                    icon: faCopy,
                    text: 'Duplicate',
                    isVisible: true,
                    onClick: () => {
                      handleDuplicate(botId);
                    },
                    selected: false,
                  },
                ]
              : []),
          ],
        }}
      />
    </>
  );
};

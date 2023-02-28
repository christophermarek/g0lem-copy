import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { Form, FormField } from '../../components/Form/Form';
import { TabColors } from '../../components/HeaderTabs';
import { api } from '../../utils/api';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import { Modal } from '../../components/modals/Modal';
import { faCirclePlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { ModalContext } from '../../react/context/ModalContext';

interface JoinTeamProps {
  setJoinTeamOpen: Dispatch<SetStateAction<boolean>>;
  refetch: any;
}

export const JoinTeam: React.FC<JoinTeamProps> = ({ setJoinTeamOpen, refetch }) => {
  const [teamFormFields, setTeamFormFields] = useState<FormField[]>([
    {
      name: 'Team Name',
      value: '',
      isEditable: true,
      type: 'text',
    },
    {
      name: 'Team Password',
      value: '',
      isEditable: true,
      type: 'text',
    },
  ]);

  const joinTeam = api.teams.joinTeam.useMutation();
  const { setIsOpen } = useContext(ModalContext);

  const submitJoinTeam = async () => {
    const teamName = teamFormFields.find((field) => field.name === 'Team Name')?.value;
    const teamPassword = teamFormFields.find((field) => field.name === 'Team Password')?.value;
    if (!teamName || !teamPassword) {
      alert('Please fill out all fields');
      return;
    }
    if (teamName.length < 3 || teamName.length > 20) {
      alert('Team name must be between 3 and 20 characters long');
      return;
    }
    if (teamPassword.length < 3 || teamPassword.length > 20) {
      alert('Team password must be between 3 and 20 characters long');
      return;
    }
    const res = await joinTeam.mutateAsync({
      teamName,
      password: teamPassword,
    });
    if (res.success) {
      fireToast(ToastTypes.success, 'Successfully joined team');
    } else {
      fireToast(ToastTypes.error, 'Error joining team');
    }
  };

  return (
    <Modal
      title='Join a Team'
      setOpenModal={setJoinTeamOpen}
      parentBorderColor={TabColors.Teams.secondary}
      buttons={[
        {
          text: 'Cancel',
          onClick: () => {
            setJoinTeamOpen(false);
            setIsOpen(false);
          },
          icon: faCircleXmark,
          isVisible: true,
          selected: false,
        },
        {
          text: 'Join',
          onClick: () => submitJoinTeam(),
          icon: faCirclePlus,
          isVisible: true,
          selected: false,
        },
      ]}
    >
      <Form formFields={teamFormFields} setFormFields={setTeamFormFields} noSubmitButton />
    </Modal>
  );
};

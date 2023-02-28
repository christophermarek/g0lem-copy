import { Dispatch, useContext, useState } from 'react';
import { Form, FormField } from '../../components/Form/Form';
import { ParentProps } from '../Parent';
import { api } from '../../utils/api';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';
import { defaultImageUrl } from '../../utils/globals';
import { OutlineColors, TabColors } from '../../components/HeaderTabs';
import { Modal } from '../../components/modals/Modal';
import { faCirclePlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import image from 'next/image';
import { getFirebaseStorage } from '../../firebase';
import { ModalContext } from '../../react/context/ModalContext';

interface TeamsCreateProps {
  setCreatePageOpen: Dispatch<React.SetStateAction<boolean>>;
  refetch: any;
  selectChildPage: (pageId: string, opensModal: boolean) => void;
}

export const TeamsCreate: React.FC<ParentProps & TeamsCreateProps> = ({
  setCreatePageOpen,
  refetch,
  selectChildPage,
}) => {
  const createTeam = api.teams.createTeam.useMutation();
  const { setIsOpen } = useContext(ModalContext);

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
    {
      name: 'Team Picture',
      value: defaultImageUrl,
      isEditable: true,
      type: 'image',
    },
  ]);

  // PICTURE SHOULD BE ABLE TO TAKE URL OR FILE UPLOAD
  const submitCreateTeam = async () => {
    const teamName = teamFormFields.find((field) => field.name === 'Team Name')?.value;
    const teamPicture = teamFormFields.find((field) => field.name === 'Team Picture')?.file;
    const teamPassword = teamFormFields.find((field) => field.name === 'Team Password')?.value;
    if (!teamName || !teamPassword) {
      fireToast(ToastTypes.error, 'Please fill out all fields');
      return;
    }
    if (teamName.length < 3 || teamName.length > 20) {
      fireToast(ToastTypes.error, 'Team name must be between 3 and 20 characters long');

      return;
    }
    if (teamPassword.length < 3 || teamPassword.length > 20) {
      fireToast(ToastTypes.error, 'Team password must be between 3 and 20 characters long');
      return;
    }
    if (teamPicture) {
      fireToast(ToastTypes.loading, 'Uploading Image...');
      const storageRef = ref(getFirebaseStorage(), `/profilePictures/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, teamPicture);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (err) => console.log(err),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
            fireToast(ToastTypes.success, 'Image Uploaded!');
            fireToast(ToastTypes.loading, 'Creating Team...');

            const res = await createTeam.mutateAsync({
              name: teamName,
              pictureUrl: url,
              password: teamPassword,
            });
            if (res.success) {
              fireToast(ToastTypes.success, 'Team Created');
              refetch();
              selectChildPage('List', false);
            } else {
              fireToast(ToastTypes.error, res.message);
            }
          });
        },
      );
    } else {
      fireToast(ToastTypes.loading, 'Creating Team...');

      // using the default image url
      const res = await createTeam.mutateAsync({
        name: teamName,
        pictureUrl: defaultImageUrl,
        password: teamPassword,
      });
      if (res.success) {
        fireToast(ToastTypes.success, 'Team Created');
        refetch();
        selectChildPage('List', false);
      } else {
        fireToast(ToastTypes.error, res.message);
      }
    }
  };

  return (
    <Modal
      title='Create a Team'
      setOpenModal={setCreatePageOpen}
      parentBorderColor={TabColors.Teams.secondary}
      buttons={[
        {
          text: 'Cancel',
          onClick: () => {
            setCreatePageOpen(false);
            setIsOpen(false);
          },
          icon: faCircleXmark,
          isVisible: true,
          selected: false,
        },
        {
          text: 'Create',
          onClick: submitCreateTeam,
          icon: faCirclePlus,
          isVisible: true,
          selected: false,
        },
      ]}
    >
      <Form
        OutlineColor={OutlineColors.Teams.secondary}
        formFields={teamFormFields}
        setFormFields={setTeamFormFields}
        onSubmit={submitCreateTeam}
        submitButtonText='Create Team'
        noSubmitButton
      />
    </Modal>
  );
};

import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ControlPane } from '../../components/ControlPane';
import { Form, FormField, TextFormField } from '../../components/Form/Form';
import { TabColors } from '../../components/HeaderTabs';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { PropsWithChildren, SetStateAction, useEffect, useState } from 'react';
import { getFirebaseStorage } from '../../firebase';
import { fireToast, ToastTypes } from '../../react/hooks/useToast';
import { api } from '../../utils/api';
import { ButtonSecondary } from '../../components/buttonSecondary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface UserProfileProps {
  isCreateProfile: boolean;
  refetch?: any;
}

export const UserProfile: React.FC<PropsWithChildren<UserProfileProps>> = ({
  children,
  isCreateProfile,
  refetch,
}) => {
  const updateUserName = api.user.updateUserName.useMutation();
  const saveProfilePicture = api.user.updateProfilePicture.useMutation();

  const [formFields, setFormFields] = useState<FormField[]>([]);

  const fireUpdatePicture = async () => {
    const image = formFields.find((field) => field.name === 'Profile Picture')?.file;
    if (image) {
      fireToast(ToastTypes.loading, 'Uploading Image...');
      if (image) {
        const storageRef = ref(getFirebaseStorage(), `/profilePictures/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          },
          (err) => console.log(err),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
              fireToast(ToastTypes.success, 'Image Uploaded!');
              await saveProfilePicture.mutateAsync({ imageUrl: url });
            });
          },
        );
      }
    }
  };

  const fireUpdateUserName = async () => {
    const name = formFields.find((field) => field.name === 'Display Name')?.value;
    fireToast(ToastTypes.loading, 'Updating Name...');
    if (name && name.length > 0) {
      const res = await updateUserName.mutateAsync({ name });
      if (res) {
        fireToast(ToastTypes.success, 'Name Updated!');
      } else {
        fireToast(ToastTypes.error, 'Name Update Failed!');
      }
    } else {
      fireToast(ToastTypes.error, 'Invalid Display Name');
    }
  };

  const fireUpdateProfile = async () => {
    await fireUpdateUserName();
    await fireUpdatePicture();
    refetch();
  };

  const user = api.user.getUserProfile.useQuery(undefined, { refetchOnWindowFocus: false });

  useEffect(() => {
    if (user.data) {
      setFormFields([
        {
          name: 'Display Name',
          value: user.data.name || '',
          isEditable: true,
          type: 'text',
        },
        {
          name: 'Profile Picture',
          value: user.data.image || '',
          isEditable: true,
          type: 'image',
          noSpan: true,
        },
        {
          name: 'Email',
          value: user.data.email || '',
          isEditable: false,
          type: 'text',
        },
      ]);
      setOpenAiApiKey([
        {
          name: 'OpenAI API Key',
          value: user.data.openAiApiKey || '',
          isEditable: true,
          type: 'text',
        },
      ]);
    }
  }, [user.data]);

  const [openAiApiKey, setOpenAiApiKey] = useState<FormField[]>([
    {
      name: 'OpenAI API Key',
      value: '',
      isEditable: true,
      type: 'text',
    },
  ]);

  const updateOpenAiApiKey = api.user.updateOpenAiApiKey.useMutation();
  const fireUpdateOpenAiApiKey = async () => {
    const key = openAiApiKey.find((field) => field.name === 'OpenAI API Key')?.value;
    fireToast(ToastTypes.loading, 'Updating OpenAI API Key...');
    if (key && key.length > 0) {
      const res = await updateOpenAiApiKey.mutateAsync({ apiKey: key });
      if (res.success) {
        fireToast(ToastTypes.success, res.message);
      } else {
        fireToast(ToastTypes.error, res.message);
      }
    } else {
      fireToast(ToastTypes.error, 'Enter an OpenAI API Key!');
    }
  };

  return (
    <ControlPane
      title='User'
      buttons={[
        {
          icon: faCircleCheck,

          text: 'Update Profile',
          isVisible: true,
          selected: false,
          onClick: () => {
            fireUpdateProfile();
          },
        },
      ]}
      parentBorderColor={TabColors.Teams.secondary}
      hasChildrenBorder={false}
      isHeaderPane={true}
      childrenPaddingOverride='py-2 px-2'
    >
      {children}
      {user.isLoading && <p>Loading...</p>}
      {user.isError && <p>Error: {user.error.message}</p>}
      {user.data && (
        <Form gridCols='2' formFields={formFields} setFormFields={setFormFields} noSubmitButton />
      )}
      {!isCreateProfile && (
        <div className='grid grid-cols-[70%_30%] gap-2 px-2'>
          <TextFormField index={0} formFields={openAiApiKey} setFormFields={setOpenAiApiKey} />
          <ButtonSecondary
            className='items-center justify-start gap-4 self-end'
            onClick={() => fireUpdateOpenAiApiKey()}
          >
            <FontAwesomeIcon icon={faCircleCheck} /> Update
          </ButtonSecondary>
        </div>
      )}
    </ControlPane>
  );
};

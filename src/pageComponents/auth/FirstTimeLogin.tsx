import { useContext, useEffect, useState } from 'react';
import { Modal } from '../../components/modals/Modal';
import { api } from '../../utils/api';
import { UserProfile } from '../user/Profile';
import { ModalContext } from '../../react/context/ModalContext';

export const FirstTimeLogin = ({ children }: any): any => {
  const userProfile = api.user.getUserProfile.useQuery(undefined, { refetchOnWindowFocus: false });
  const [hasProfile, setHasProfile] = useState(false);

  const { setIsOpen } = useContext(ModalContext);

  useEffect(() => {
    if (userProfile.data?.name) {
      setHasProfile(true);
      setIsOpen(false);
    } else {
      setHasProfile(false);
    }
  }, [userProfile.data]);

  return (
    <>
      {!hasProfile ? (
        <>
          <Modal openModalState={!hasProfile} title='Profile' setOpenModal={setHasProfile}>
            <UserProfile refetch={userProfile.refetch} isCreateProfile={true}>
              <div className='px-2 py-2'>
                <br />
                Set a display name and profile picture so other users can recognize you.
                <br />
                Only your display name is required
                <br />
                <u>Your email will not be shared with other users.</u>
                <br />
                <br />
                You can change these settings later on the homepage.
                <br />
                <br />
              </div>
            </UserProfile>
          </Modal>
          {children}
        </>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

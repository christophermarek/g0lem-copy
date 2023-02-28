import { logEvent, setUserId } from 'firebase/analytics';
import { PropsWithChildren, useEffect } from 'react';
import { useTrackSignedInUser } from './useTrackSignedInUser';
import { useRouter } from 'next/router';
import { getAnalyticsObj } from '../../firebase';
import { useSession } from 'next-auth/react';
import { useSsr } from 'usehooks-ts';

interface TrackPageProps {
  selectedTab: string;
}
export const TrackPage: React.FC<PropsWithChildren<TrackPageProps>> = ({
  children,
  selectedTab,
}) => {
  useTrackSignedInUser();

  const { asPath } = useRouter();
  const { data: sessionData } = useSession();
  const { isBrowser } = useSsr();

  const userId = sessionData?.user?.email;

  useEffect(() => {
    const analytics = getAnalyticsObj();

    if (userId) {
      setUserId(analytics, userId);
    }
  }, [userId]);

  useEffect(() => {
    const analytics = getAnalyticsObj();
    const title = selectedTab;
    console.log('analytics', analytics);
    console.log('track page', title, asPath);
    logEvent(analytics, 'screen_view', {
      firebase_screen: title,
      firebase_screen_class: asPath,
    });
  }, [selectedTab]);

  return <>{children}</>;
};

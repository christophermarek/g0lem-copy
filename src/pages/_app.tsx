import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { api } from '../utils/api';

import '../styles/globals.scss';
import { Auth } from '../pageComponents/auth/authed';
import React, { useEffect, useState } from 'react';
import { ModalContext } from '../react/context/ModalContext';
import { HeaderNavContext } from '../react/context/HeaderNavContext';
import Head from 'next/head';
import { HeaderTabsComponent } from '../components/HeaderTabs';
import { useSsr, useWindowSize } from 'usehooks-ts';
import { PublicStats } from '../components/publicStats';
import { UserPage } from '../pageComponents/user';
import Bots from '../pageComponents/bots';
import Jobs from '../pageComponents/jobs';
import Connectors from '../pageComponents/connectors';
import Actions from '../pageComponents/actions';
import { Teams } from '../pageComponents/teams';
import { useRouter } from 'next/router';
import TOS from './company/tos';
import Privacy from './company/privacy';
import { Settings } from '../pageComponents/settings/Settings';
import { FirstTimeLogin } from '../pageComponents/auth/FirstTimeLogin';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { useTrackSignedInUser } from '../react/firebase/useTrackSignedInUser';
import { getAnalyticsObj, getFirebaseApp } from '../firebase';
import { TrackPage } from '../react/firebase/TrackPage';
import { GoogleAnalytics } from 'nextjs-google-analytics';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedModal, setSelectedModal] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('Home');
  const { width } = useWindowSize();
  const { isBrowser } = useSsr();
  const { asPath } = useRouter();
  const [selectedParent, setSelectedParent] = useState<string>('Home');
  const sdk = isBrowser ? getFirebaseApp() : undefined;

  useEffect(() => {
    const page = window.document.location.href;
    const analytics = getAnalyticsObj();
    logEvent(analytics, 'screen_view', {
      firebase_screen: page,
      firebase_screen_class: page,
    });
  }, [selectedTab]);

  return (
    <>
      <Head>
        <title>g0lem</title>
      </Head>
      <SessionProvider session={session}>
        <ModalContext.Provider value={{ isOpen, setIsOpen, selectedModal, setSelectedModal }}>
          {/* i think this is unused */}
          <HeaderNavContext.Provider
            value={{
              selectedTab,
              setSelectedTab,
            }}
          >
            {asPath === '/company/tos' ? (
              <TOS />
            ) : asPath === '/company/privacy' ? (
              <Privacy />
            ) : (
              <Auth>
                {/* <TrackPage selectedTab={selectedParent}> */}
                {/* <AnimatePresence> */}
                <div className='modal-portal'>
                  <FirstTimeLogin></FirstTimeLogin>
                </div>
                {/* </AnimatePresence> */}

                <div
                  className={` border-solid text-neutral-200 ${isOpen ? 'inactive blur-sm' : ''}
                    ${width < 640 ? ' ' : 'column'}
                    grid sm:grid-cols-1 md:grid-cols-[30%_70%] lg:grid-cols-[25%_75%]`}
                >
                  <div className='portal1 pb-4'>
                    <HeaderTabsComponent setSelectedParent={setSelectedParent} />

                    <PublicStats />
                    {selectedParent === 'Home' && <UserPage />}

                    {/* <TeamsPage /> */}
                    {selectedParent === 'Settings' && <Settings />}
                    {selectedParent === 'Teams' && <Teams />}
                    {selectedParent === 'Bots' && <Bots />}
                    {selectedParent === 'Jobs' && <Jobs />}
                    {selectedParent === 'Connectors' && <Connectors />}
                    {selectedParent === 'Actions' && <Actions />}

                    {/* no more page routing this is disabled.*/}
                    {/* <RootPage pageTitle={selectedParent} pageControls={[]}>
                   
                  </RootPage> */}
                  </div>

                  {width > 640 && <div className='portal2 pb-4'></div>}
                </div>
                {/* </TrackPage> */}
              </Auth>
            )}
          </HeaderNavContext.Provider>
          {/* <Component {...pageProps} /> */}
        </ModalContext.Provider>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);

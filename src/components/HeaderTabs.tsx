import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faChevronCircleDown,
  faChevronCircleUp,
  faClockFour,
  faCog,
  faEdit,
  faHistory,
  faHome,
  faInfoCircle,
  faList,
  faLock,
  faPeopleGroup,
  faPlugCircleBolt,
  faPlugCircleCheck,
  faPlusCircle,
  faRestroom,
  faRobot,
  faSearch,
  faSignOut,
  faTools,
  faUserPlus,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck, faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderNavContext } from '../react/context/HeaderNavContext';
import { ButtonSecondary } from './buttonSecondary';
import { signOut, useSession } from 'next-auth/react';
import { Frame } from './container';
import { ControlPane } from './ControlPane';
import { useWindowSize } from 'usehooks-ts';
import { faConnectdevelop } from '@fortawesome/free-brands-svg-icons';

interface HeaderTabsProps {
  setSelectedParent: React.Dispatch<React.SetStateAction<string>>;
}

export const appVersion = '1.0.0';

export const HeaderTabs: string[] = [
  'Teams',
  'Bots',
  'Jobs',
  'Connectors',
  'Actions',
  'Settings',
  'Sign out',
];

export const TabColors: {
  [key: string]: { primary: string; secondary: string };
} = {
  Default: { primary: 'border-neutral-700', secondary: 'border-neutral-300' },
  Bots: { primary: 'border-orange-500', secondary: 'border-orange-600' },
  Jobs: { primary: 'border-purple-500', secondary: 'border-purple-600' },
  Connectors: { primary: 'border-emerald-500', secondary: 'border-emerald-600' },
  Actions: { primary: 'border-blue-500', secondary: 'border-blue-600' },
  Teams: { primary: 'border-yellow-500', secondary: 'border-yellow-300' },
  'Sign out': { primary: 'border-red-500', secondary: 'border-red-600' },
};

export const OutlineColors: {
  [key: string]: { primary: string; secondary: string };
} = {
  Default: { primary: 'outline-neutral-700', secondary: 'outline-neutral-300' },
  Jobs: { primary: 'outline-purple-500', secondary: 'outline-purple-600' },
  Teams: { primary: 'outline-yellow-500', secondary: 'outline-yellow-300' },
  Bots: { primary: 'outline-orange-500', secondary: 'outline-orange-600' },
  Connectors: { primary: 'outline-emerald-500', secondary: 'outline-emerald-600' },
};

export const TextColors: {
  [key: string]: { primary: string; secondary: string };
} = {
  Default: { primary: 'text-gray-300', secondary: 'text-gray-400' },
  Bots: { primary: 'text-orange-500', secondary: 'text-orange-600' },
  Jobs: { primary: 'text-purple-500', secondary: 'text-purple-700' },
  Connectors: { primary: 'text-emerald-500', secondary: 'text-emerald-600' },
  Actions: { primary: 'text-blue-500', secondary: 'text-blue-600' },
  Teams: { primary: 'text-yellow-500', secondary: 'text-yellow-600' },
  'Sign out': { primary: 'text-red-500', secondary: 'text-red-600' },
};

export const getTabColor = (tab: string) => {
  if (!TabColors[tab]) return TabColors.Default;
  return TabColors[tab];
};

export const getTextColor = (tab: string) => {
  if (!TextColors[tab]) return TextColors.Default;
  return TextColors[tab];
};

export const getTabPath = (tab: string) => {
  switch (tab) {
    case 'Bots':
      return '/bots';
    case 'Actions':
      return '/actions';
    case 'Teams':
      return '/teams';
    case 'Connectors':
      return '/connectors';
    case 'Twitter OAuth':
      return '/twitterOAuth';
    case 'Tools':
      return '/tools';
    case 'Actions':
      return '/actions';
    case 'Jobs':
      return '/jobs';
    case 'Home':
      return '/';
    case 'Settings':
      return '/settings';
    default:
      return '/bots';
  }
};
export const getTabIcon = (tab: string) => {
  switch (tab) {
    case 'Bots':
      return faRobot;
    case 'Bot':
      return faRobot;
    case 'Teams':
      return faPeopleGroup;
    case 'Twitter OAuth':
      return faLock;
    case 'Tools':
      return faTools;
    case 'Actions':
      return faCircleCheck;
    case 'Jobs':
      return faClockFour;
    case 'Tutorial':
      return faQuestionCircle;
    case 'Home':
      return faHome;
    case 'Sign out':
      return faSignOut;
    case 'Connectors':
      return faPlugCircleBolt;
    case 'Actions':
      return faBullseye;
    case 'View':
      return faSearch;
    case 'Add':
      return faPlusCircle;
    case 'Logs':
      return faHistory;
    case 'Connect':
      return faPlugCircleCheck;
    case 'List':
      return faList;
    case 'Edit':
      return faEdit;
    case 'Activity':
      return faHistory;
    case 'Scheduler':
      return faClockFour;
    case 'Join':
      return faUserPlus;
    case 'Info':
      return faInfoCircle;
    case 'Fire':
      return faBullseye;
    case 'Settings':
      return faCog;
    case 'Admin':
      return faUserShield;

    default:
      return faRestroom;
  }
};
const getTabIconClass = (tab: string) => {
  switch (tab) {
    case 'Bots':
      return 'h-8';
    case 'Twitter OAuth':
      return 'h-7';
    case 'Tools':
      return 'h-8';
    default:
      return 'h-8';
  }
};

export const HeaderTabsComponent: React.FC<HeaderTabsProps> = ({ setSelectedParent }) => {
  const [tabsExpanded, setTabsExpanded] = React.useState(false);

  const { selectedTab, setSelectedTab } = React.useContext(HeaderNavContext);
  const { data: sessionData } = useSession();

  const { width } = useWindowSize();

  useEffect(() => {
    if (width > 768) {
      setTabsExpanded(true);
    } else {
      setTabsExpanded(false);
    }
  }, [width]);

  return (
    <>
      {sessionData && sessionData.user && (
        <ControlPane
          parentBorderColor={TabColors.Default.primary}
          hasChildrenBorder={true}
          noRoundedBottom
          title={
            <>
              <Frame
                parentBorderColor={TabColors.Default.primary}
                className='flex w-full items-center justify-between gap-2 rounded-none border-none px-1 py-1 text-2xl '
              >
                <img
                  src={sessionData.user.image || '/images/g0lem.png'}
                  className='bg-gray-50'
                  style={{ outline: 'solid black' }}
                  alt='g0lem'
                  height={70}
                  width={60}
                />
                {/* {'g0lem'} */}
                <div className='overflow-hidden overflow-ellipsis'>{sessionData.user.email}</div>
              </Frame>
            </>
          }
          isHeaderPane={true}
          buttons={[
            {
              icon: getTabIcon('Home'),
              isVisible: true,
              onClick: () => {
                setSelectedTab('Home');
                setSelectedParent('Home');
                if (width < 768) {
                  setTabsExpanded(false);
                }
              },
              selected: selectedTab === 'Home',
              text: <Link href={`${getTabPath('Home')}`}>{'Home'}</Link>,
              borderConfigOverride: `${tabsExpanded ? '' : 'border-t-0 border-l-2 border-r-2'}`,
              roundedConfigOverride: 'rounded-none',
              textSizeOverride: 'text-3xl',
            },
            {
              icon: !tabsExpanded ? faChevronCircleDown : faChevronCircleUp,
              isVisible: true,
              selected: false,
              onClick: () => {
                // if (width < 768) {
                setTabsExpanded(!tabsExpanded);
                // }
              },
              text: 'Menu',
              borderConfigOverride: `${tabsExpanded ? '' : 'border-t-0 border-r-2'}`,
              roundedConfigOverride: 'rounded-none',
              textSizeOverride: 'text-3xl',
            },
          ]}
          childrenPaddingOverride='px-0 py-0'
        >
          <>
            {tabsExpanded && (
              <>
                {HeaderTabs.map((tab, index) => (
                  <>
                    <ButtonSecondary
                      hoverScaleDirection='x'
                      textColor={getTextColor(tab).primary}
                      borderColor={getTabColor(tab).secondary}
                      className={`flex w-full items-center justify-start rounded-none border-l-2 border-r-2 border-b-2 bg-gray-900 py-3	text-3xl`}
                      key={`${tab}-tab`}
                      selected={selectedTab === tab}
                      // className={`flex items-center  rounded-none`}
                      // why do we have onclick in button and link
                      onClick={() => {
                        setSelectedTab(tab);
                        setSelectedParent(tab);

                        if (width < 768) {
                          setTabsExpanded(false);
                        }
                      }}
                    >
                      <FontAwesomeIcon
                        className={`${getTabIconClass(tab)} mr-5`}
                        icon={getTabIcon(tab)}
                      />
                      {tab === 'Sign out' ? (
                        <Link href={'/'} onClick={() => signOut()}>
                          {tab}
                        </Link>
                      ) : (
                        <>{selectedTab === tab ? <u>{tab}</u> : <>{tab}</>}</>
                      )}
                    </ButtonSecondary>
                  </>
                ))}
              </>
            )}
          </>
        </ControlPane>
      )}
    </>
  );
};

import { ControlPane } from '../../components/ControlPane';
import { TabColors } from '../../components/HeaderTabs';
import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { ExplanationPage } from './Explanation';
import { UserProfile } from './Profile';
import { useWindowSize } from 'usehooks-ts';

interface UserPageProps {}

export const UserPage: React.FC<UserPageProps> = ({}) => {
  const { width } = useWindowSize();

  return (
    <ComponentPortalWrapper portal='.portal2'>
      {/* <div className='md:grid md:grid-cols-2'> */}
      <div className='flex flex-col'>
        <div
          className={`
                    ${width < 640 ? ' ' : ''}
                    `}
        >
          <ControlPane
            parentBorderColor={TabColors.Default.primary}
            title={`g0lem Info`}
            isHeaderPane={true}
            childrenPaddingOverride='py-2 px-2'
            hasChildrenBorder={false}
            buttons={[]}
          >
            <div className='text-2xl underline'>User vs Team:</div>
            Your user is your account. A user can be a part of multiple teams. Each team has its own
            bots, jobs, and connectors. Outside of a team you can do all of the same but anything
            created as a User and not a team will be tied to your account. You can move things from
            your user to a team and vice versa on the settings page.
            <div className='text-2xl underline'>Teams:</div>A team allows multiple users to work
            together on with the same bots, jobs, and connectors. Teams help organize the
            collections of bots and their jobs.
            <div className='text-2xl underline'>Connectors:</div>
            Connectors are where external accounts are connected to the app. Using OAuth, g0lem can
            access your accounts without having your passwords. On the external site for that
            connector, you can revoke access to g0lem.
            <div className='text-2xl underline'>Actions:</div>
            Actions are firable events that can be manually triggered or triggered by a job. Actions
            are hardcoded on the server and more will be added.
            <div className='text-2xl underline'>Jobs:</div>A job is a pipeline of actions. With a
            job, multiple actions can be chained together to produce a significant output. For
            example, a job: Action(get bitcoin price) {'->'} Action(generate completion) {'->'}{' '}
            Action(post tweet). This job could be used with a bot to post {'unique'} content on
            financial markets.
            <div className='text-2xl underline'>Bots:</div>A bot contains jobs. A bot can have its
            jobs run on a schedule or be fired manually. The purpose of a bot is to automate a
            process, such as posting content on social media. An example would be a investment
            influencer bot on twitter. The bot would have a job that would post 1 or many times
            daily about its ideas on the state of the market, a job to post an educational text
            tutorial once a day.
            <div className='text-2xl underline'>Scheduler:</div>
            Jobs in a bot can be scheduled. The schedule is defined in milliseconds, and the job
            will be fired every x milliseconds. The server checks every minute if a job requires
            executing, and there is not support for faster intervals. Using a schedule, a bot can be
            used to look like it is posting organic content on social media, and it would be doing
            so autonomously. Support for random time intervals will be coming.
            <div className='text-2xl underline'>Settings:</div>
            The settings page is for quick access to move things from your user to a team and vice
            versa. It will probably not remain in this state in the future.
          </ControlPane>
        </div>
        <div className=''>
          <ExplanationPage />
          <UserProfile isCreateProfile={false} />
        </div>
      </div>
    </ComponentPortalWrapper>
  );
};

import { faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { ControlPane } from '../../components/ControlPane';
import { ListPrimary } from '../../components/ListPrimary';
import { api } from '../../utils/api';
import { ParentProps } from '../Parent';
import { TabColors } from '../../components/HeaderTabs';
import { Form } from '../../components/Form/Form';
import { ButtonSecondary } from '../../components/buttonSecondary';
import { Frame } from '../../components/container';
import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '../../server/trpc/root';
import { fireToast, ToastTypes } from '../../react/hooks/useToast';

interface TeamProps {
  teamQuery: inferRouterOutputs<AppRouter>['teams']['getTeamProfile'];
  refetch: () => void;
}
export const Team: React.FC<ParentProps & TeamProps> = ({ teamQuery, refetch }) => {
  const teamKick = api.teams.kickUser.useMutation();
  const fireKickUser = async (id: string) => {
    const userMatch = undefined;
    //  = teamQuery?.data?.users[Number(id)];
    if (userMatch && teamQuery.data) {
      const res = await teamKick.mutateAsync({
        teamId: teamQuery.data.id,
        // userId: userMatch?.id,
        userId: '1',
      });
      if (res.success) {
        refetch();
        fireToast(ToastTypes.success, res.message);
      } else {
        fireToast(ToastTypes.error, res.message);
      }
    } else {
      fireToast(ToastTypes.error, 'Failed to kick User.');
    }
  };

  return (
    <>
      <>
        {teamQuery && teamQuery.data && (
          <>
            <Frame
              parentBorderColor={TabColors.Teams.secondary}
              className='bg w-full border-b-0 border-t-0 border-r-0 border-l-0'
            >
              <div className='grid grid-cols-2'>
                <div className='flex w-fit items-center gap-x-4 px-4 text-3xl font-bold'>
                  {teamQuery.data.name}
                  <img src={teamQuery.data.picture} className='h-20 w-20 object-scale-down' />
                </div>
                <Form
                  setFormFields={() => undefined}
                  noSubmitButton
                  formFields={[
                    {
                      type: 'text',
                      name: 'Users',
                      value: String(teamQuery.data.users.length),
                      isEditable: false,
                    },
                    {
                      type: 'text',
                      name: 'Bots',
                      value: String(teamQuery.data.bots.length),
                      isEditable: false,
                    },
                    {
                      type: 'text',
                      name: 'Jobs',
                      value: String(teamQuery.data.jobs.length),
                      isEditable: false,
                    },
                  ]}
                />
              </div>
            </Frame>
            <ControlPane
              title={`Users in ${teamQuery.data.name}`}
              hasChildrenBorder={false}
              buttons={[]}
              parentBorderColor={TabColors.Teams.secondary}
              isHeaderPane
              childrenPaddingOverride='px-2 py-2'
              noRoundedBottom
            >
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                {teamQuery.data.users.map((user, index) => (
                  <div className='flex justify-between hover:outline' key={index}>
                    {user && (
                      <>
                        <ListPrimary
                          listItems={
                            <div className=''>
                              <ButtonSecondary
                                noHoverAnimation
                                noCursor
                                className='w-fit items-center gap-x-4 px-4 text-lg font-bold'
                                selected={false}
                              >
                                {user.name ? user.name : 'No Name'}
                                <img
                                  src={user.image ? user.image : undefined}
                                  className='h-10 w-10 object-scale-down'
                                />
                              </ButtonSecondary>
                            </div>
                          }
                          itemActions={[
                            {
                              exec: fireKickUser,
                              icon: faUserMinus,
                              actionName: 'Kick',
                            },
                          ]}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ControlPane>
          </>
        )}
      </>
    </>
  );
};

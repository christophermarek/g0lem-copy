import { api } from '../utils/api';
import { camelToTitle } from '../utils/globals';
import { Form } from './Form/Form';
import { TabColors } from './HeaderTabs';
import { RootPage } from './RootPage';

export const PublicStats = () => {
  const publicStats = api.publicStats.getPublicStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <div className='hidden sm:block'>
      {publicStats.data && (
        <RootPage
          pageControls={[]}
          pageTitle='g0lem 1.0'
          selectChildPage={() => {}}
          parentBorderColor={TabColors.Default.primary}
        >
          <div className='p-2'>
            <Form
              formFields={Object.entries(publicStats.data).map(([key, value]) => ({
                name: camelToTitle(key),
                type: 'text',
                value: String(value),
                isEditable: false,
              }))}
              setFormFields={() => {}}
              submitButtonText='Refetch'
              onSubmit={() => {
                publicStats.refetch();
              }}
              noSubmitButton
            />
          </div>
        </RootPage>
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { ConnectorList } from './ConnectorList';
import { ConnectorCreate } from './ConnectorCreate';
import { TabColors } from '../../components/HeaderTabs';
import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { PageControl, RootPage, usePageSelector } from '../../components/RootPage';
import { ParentProps } from '../Parent';
import { api } from '../../utils/api';
import { fireToast } from '../../react/hooks/useToast';

const Connectors: React.FC<ParentProps> = ({ teamParent }) => {
  const [openConnectorList, setOpenConnectorList] = useState<boolean>(true);
  const [openConnectorCreate, setOpenConnectorCreate] = useState<boolean>(false);
  const getConnectors = api.oauth.getConnectors.useQuery(
    {
      teamId: teamParent?.id,
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  const cleaupUnusedUserOauth = api.oauth.cleaupUnusedUserOAuth.useMutation();

  const [connectorOpened, setConnectorOpened] = useState(false);

  const pageControls: PageControl[] = [
    {
      isOpen: openConnectorList,
      pageId: 'List',
      setPageOpen: setOpenConnectorList,
    },
    {
      isOpen: openConnectorCreate,
      pageId: 'Add',
      setPageOpen: setOpenConnectorCreate,
    },
  ];
  const childPaneButtons: PageControl[] = [];

  const selectChildPage = usePageSelector(pageControls, childPaneButtons);

  const handleCleanupUnusedOauth = async () => {
    const res = await cleaupUnusedUserOauth.mutateAsync({});
    if (res.success) {
      getConnectors.refetch();
    }
  };

  useEffect(() => {
    if (!openConnectorCreate) {
      handleCleanupUnusedOauth();
    }
  }, [openConnectorCreate]);

  return (
    <ComponentPortalWrapper portal='.portal2'>
      <RootPage
        pageTitle='Connectors'
        pageControls={pageControls}
        parentBorderColor={TabColors.Connectors.secondary}
        childPaneButtons={childPaneButtons}
        selectChildPage={selectChildPage}
        childPaneTitle='Add a connector'
      >
        {openConnectorList && (
          <>
            {getConnectors.isLoading && <div>Loading...</div>}
            {getConnectors.isError && <div>Error: {getConnectors.error.message}</div>}
            {getConnectors.data && (
              <ConnectorList
                connectorOpened={connectorOpened}
                setConnectorOpened={setConnectorOpened}
                teamParent={teamParent}
                refetch={getConnectors.refetch}
                connectorList={getConnectors.data}
              />
            )}
          </>
        )}
        {openConnectorCreate && (
          <ConnectorCreate
            setOpenConnectorCreate={setOpenConnectorCreate}
            selectChildPage={selectChildPage}
            teamParent={teamParent}
          />
        )}
      </RootPage>
    </ComponentPortalWrapper>
  );
};

export default Connectors;

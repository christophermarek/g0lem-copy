import { Dispatch, SetStateAction, useState } from 'react';
import { Modal } from '../../components/modals/Modal';
import { api } from '../../utils/api';
import { ParentProps } from '../Parent';
import { TabColors } from '../../components/HeaderTabs';
import { FormField, Form } from '../../components/Form/Form';
import { ToastTypes, fireToast } from '../../react/hooks/useToast';

interface ConnectUserConnectorToTeamProps {
  setOpenConnectorConnectToTeam: Dispatch<SetStateAction<boolean>>;
}

export const ConnectUserConnectorToTeam: React.FC<
  ParentProps & ConnectUserConnectorToTeamProps
> = ({ teamParent, setOpenConnectorConnectToTeam }) => {
  const userConnectors = api.oauth.getConnectors.useQuery({});

  const [connectorFormFields, setConnectorFormFields] = useState<FormField[]>([
    {
      name: 'connector',
      type: 'select',
      value: userConnectors.data?.[0].id || 'No connectors found',
      options: userConnectors.data?.map((connector) => ({
        value: connector.id,
        label: `${connector.type} ${connector.authTypeAccountName}`,
      })),
      isEditable: true,
    },
  ]);

  const connectorToTeam = api.oauth.connectorToTeam.useMutation();

  const submitConnectorToTeam = async () => {
    if (!teamParent) {
      fireToast(ToastTypes.error, 'Need to open team page error');
    } else {
      const connectorId = connectorFormFields.find((field) => field.name === 'connector')?.value;
      if (!connectorId) {
        fireToast(ToastTypes.error, 'Need to select a connector');
      } else {
        const res = await connectorToTeam.mutateAsync({
          connectorId,
          teamId: teamParent.id,
        });
        if (res.success) {
          fireToast(ToastTypes.success, 'Connector added to team');
        } else {
          fireToast(ToastTypes.error, res.message);
        }
      }
    }
  };

  return (
    <>
      {teamParent ? (
        <Modal
          title={`Add your connectors to ${teamParent.name}`}
          setOpenModal={setOpenConnectorConnectToTeam}
          parentBorderColor={TabColors.Connectors.secondary}
        >
          <Form
            formFields={connectorFormFields}
            setFormFields={setConnectorFormFields}
            submitButtonText='Add Connector to Team'
            onSubmit={submitConnectorToTeam}
          />
        </Modal>
      ) : (
        <div>
          <h1>Need to open team page error</h1>
        </div>
      )}
    </>
  );
};

import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { ModalContext } from '../../react/context/ModalContext';
import { Toast, fireToast } from '../../react/hooks/useToast';
import { api } from '../../utils/api';
import cogoToast from 'cogo-toast';
import { Modal } from '../../components/modals/Modal';
import { TabColors } from '../../components/HeaderTabs';
import { Form, FormField } from '../../components/Form/Form';
import { faBullseye, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { faBuysellads } from '@fortawesome/free-brands-svg-icons';
import { getEmptyActionConfigForAction } from '../../utils/actions';

interface FireActionComponentProps {
  actionName: string;
  actionFunction: string;
  setOpenFireAction: Dispatch<SetStateAction<boolean>>;
}
export const FireActionComponent: React.FC<FireActionComponentProps> = ({
  actionName,
  actionFunction,
  setOpenFireAction,
}) => {
  const getConfigForAction = getEmptyActionConfigForAction(actionFunction);

  const [formFields, setFormFields] = useState<FormField[]>(
    Object.entries(getConfigForAction).map(([key, value]) => {
      return { name: key, type: 'text', value, isEditable: true };
    }),
  );

  const { error, status, mutateAsync, data } = api.actions.fireAction.useMutation();

  const { setIsOpen } = useContext(ModalContext);

  const fireActionSubmit = async () => {
    console.log('submit form modal');
    const _finalFields = [...formFields];
    const emptyActionConfig: any = {};
    emptyActionConfig.action = actionFunction;
    // check if all fields are filled
    if (!_finalFields || _finalFields.length === 0)
      return fireToast(Toast.ToastTypes.error, 'No fields');
    for (const field of _finalFields) {
      if (field.name === 'action') continue;
      if (!field.value || field.value.trim() === '') {
        fireToast(Toast.ToastTypes.error, `Missing value for ${field.name}`);
        return;
      }
      emptyActionConfig[field.name] = field.value;
    }
    console.log('emptyActionConfig', emptyActionConfig);

    // then fire action if successful
    const { hide } = cogoToast.loading('Firing action...', { hideAfter: 0 });
    const data = await mutateAsync({ actionConfig: emptyActionConfig, actionName: actionFunction });
    if (hide) hide();

    if (!data) {
      fireToast(Toast.ToastTypes.error, 'No data');
    } else if (!data.success) {
      fireToast(Toast.ToastTypes.error, data.message);
    } else {
      fireToast(Toast.ToastTypes.success, data.message);
    }
    setOpenFireAction(false);
    setFormFields([]);
    setIsOpen(false);
  };

  return (
    <>
      <Modal
        title={`${actionName}`}
        setOpenModal={setOpenFireAction}
        parentBorderColor={TabColors.Actions.secondary}
        buttons={[
          {
            text: 'Cancel',
            onClick: () => {
              setOpenFireAction(false);
              setFormFields([]);
              setIsOpen(false);
            },
            isVisible: true,
            selected: false,
            icon: faCircleXmark,
          },
          {
            text: 'Fire',
            onClick: fireActionSubmit,
            isVisible: true,
            selected: false,
            icon: faBullseye,
          },
        ]}
      >
        <Form
          formFields={formFields}
          onSubmit={fireActionSubmit}
          setFormFields={setFormFields}
          noSubmitButton
        />
      </Modal>
    </>
  );
};

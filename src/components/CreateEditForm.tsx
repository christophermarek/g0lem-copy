import { Dispatch, PropsWithChildren, SetStateAction, useEffect } from 'react';
import { FormField, Form } from './Form/Form';
import { Modal, ModalProps } from './modals/Modal';

interface CreateEditForm {
  formFields: FormField[];
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  create: () => void;
  update: () => void;
  validateForm: () => { isValid: boolean; error: string };
  selectedItem: { id: string; name: string };
  dataType: string;
  refetch: any;
  modalProps?: ModalProps;
  noSubmitButton?: boolean;
  toggleFireSubmit: boolean;
  closeModal?: () => void;
}
// edit is on when selectedItem.id !== ''
export const CreateEditForm: React.FC<PropsWithChildren<CreateEditForm>> = ({
  children,
  formFields,
  setFormFields,
  create,
  update,
  validateForm,
  selectedItem,
  dataType,
  refetch,
  modalProps,
  noSubmitButton,
  toggleFireSubmit,
}) => {
  const fireSubmit = () => {
    if (!validateForm()) {
      return;
    } else {
      if (selectedItem.id === '') {
        create();
      } else {
        update();
      }
      refetch();
    }
  };

  useEffect(() => {
    if (toggleFireSubmit) {
      fireSubmit();
    }
  }, [toggleFireSubmit]);

  return (
    <>
      {modalProps ? (
        <Modal {...modalProps}>
          <Form
            formFields={formFields}
            setFormFields={setFormFields}
            submitButtonText={selectedItem.id === '' ? `Create ${dataType}` : `Update ${dataType}`}
            onSubmit={fireSubmit}
            noSubmitButton={noSubmitButton}
          >
            {children}
          </Form>
        </Modal>
      ) : (
        <Form
          formFields={formFields}
          setFormFields={setFormFields}
          submitButtonText={selectedItem.id === '' ? `Create ${dataType}` : `Update ${dataType}`}
          onSubmit={fireSubmit}
          noSubmitButton={noSubmitButton}
        >
          {children}
        </Form>
      )}
    </>
  );
};

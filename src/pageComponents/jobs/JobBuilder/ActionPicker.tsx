import { Dispatch, useState, useContext } from 'react';
import { JobStage, JobStateReducerAction } from '../../../react/reducers/jobStageReducer';
import { TabColors } from '../../../components/HeaderTabs';
import { Modal } from '../../../components/modals/Modal';
import { faCircleXmark, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { CheckBoxFormField } from '../../../components/Form/CheckboxFormField';
import { FormField, Form } from '../../../components/Form/Form';
import { actionData, allActionConfigsEmpty } from '../../../utils/actions';
import { ModalContext } from '../../../react/context/ModalContext';

interface ActionPickerProps {
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
  stageIndex: number;
  prevJobStage: JobStage | undefined;
  setOpenActionSelector: Dispatch<React.SetStateAction<boolean>>;
}

export const ActionPicker: React.FC<ActionPickerProps> = ({
  dispatchJobStagesReducer,
  stageIndex,
  prevJobStage,
  setOpenActionSelector,
}) => {
  const possibleActions = actionData;
  const getActionConfigs = allActionConfigsEmpty();
  const [actionFormFields, setActionFormFields] = useState<FormField[]>(
    Object.entries(possibleActions).map(([actionFunction, actionName]) => ({
      name: actionName?.label || actionFunction,
      value: 'false',
      type: 'checkbox',
      isEditable: true,
    })),
  );

  const { setIsOpen } = useContext(ModalContext);

  const _addStage = () => {
    const finalFields = actionFormFields.filter((field) => field.value === 'true');
    const finalActionFunctionAndName = Object.entries(possibleActions)
      .filter(([actionFunction, actionName]) =>
        finalFields.some((field) => field.name === actionName?.label),
      )
      .map(([actionFunction, actionName]) => ({ actionName: actionName?.label, actionFunction }));
    const justActionFunctions = finalActionFunctionAndName.map((action) => ({
      functionName: action.actionFunction,
    }));

    console.log('adding actions', justActionFunctions);
    dispatchJobStagesReducer({
      type: 'addActions',
      payload: {
        stageIndex: stageIndex,
        actionConfigs: getActionConfigs,
        finalFields: justActionFunctions,
        prevJobStage,
      },
    });
    setOpenActionSelector(false);
    setIsOpen(false);
  };
  const [actionFiltersFormFields, setActionFiltersFormFields] = useState<FormField[]>([
    {
      name: 'Connectors',
      value: 'true',
      type: 'checkbox',
      isEditable: true,
    },
    {
      name: 'External',
      value: 'true',
      type: 'checkbox',
      isEditable: true,
    },
    {
      name: 'Text',
      value: 'true',
      type: 'checkbox',
      isEditable: true,
    },
    {
      name: 'AI',
      value: 'true',
      type: 'checkbox',
      isEditable: true,
    },
  ]);

  return (
    <Modal
      width='90vw'
      height='h-screen'
      parentBorderColor={TabColors.Jobs.secondary}
      title='Add Action(s)'
      setOpenModal={setOpenActionSelector}
      noClickOutside
      buttons={[
        {
          text: 'Cancel',
          onClick: () => {
            setOpenActionSelector(false);
            setIsOpen(false);
          },
          isVisible: true,
          selected: false,
          icon: faCircleXmark,
        },
        {
          text: 'Add',
          onClick: _addStage,
          isVisible: true,
          selected: false,
          icon: faPlusCircle,
        },
      ]}
    >
      <div className='mt-4 px-4 text-lg'>
        Filters
        <div className='flex flex-wrap gap-4 px-2'>
          <div className='flex items-center gap-x-4'>
            <CheckBoxFormField
              formFields={actionFiltersFormFields}
              setFormFields={setActionFiltersFormFields}
              index={actionFiltersFormFields.findIndex((field) => field.name === 'Connectors')}
            />
          </div>
          <div className='flex items-center gap-x-4'>
            <CheckBoxFormField
              formFields={actionFiltersFormFields}
              setFormFields={setActionFiltersFormFields}
              index={actionFiltersFormFields.findIndex((field) => field.name === 'External')}
            />
          </div>
          <div className='flex items-center gap-x-4'>
            <CheckBoxFormField
              formFields={actionFiltersFormFields}
              setFormFields={setActionFiltersFormFields}
              index={actionFiltersFormFields.findIndex((field) => field.name === 'Text')}
            />
          </div>
          <div className='flex items-center gap-x-4'>
            <CheckBoxFormField
              formFields={actionFiltersFormFields}
              setFormFields={setActionFiltersFormFields}
              index={actionFiltersFormFields.findIndex((field) => field.name === 'AI')}
            />
          </div>
        </div>
      </div>
      <div className='mt-4 px-4 text-lg'>
        Actions
        <Form
          gridCols='2'
          formFields={actionFormFields.filter((field) => {
            // we want to filter form fields where their type is not in the actionFiltersFormFields
            const type = possibleActions[field.name as keyof typeof possibleActions]?.type;
            if (type) {
              const filter = actionFiltersFormFields.find(
                (filter) => filter.name === type && filter.value === 'true',
              );
              if (filter) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          })}
          setFormFields={setActionFormFields}
          noSubmitButton
        />
      </div>

      <div className='mb-4'></div>
    </Modal>
  );
};

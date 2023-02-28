import { Dispatch, useEffect, useRef, useState } from 'react';
import {
  JobStage,
  JobStageAction,
  JobStateReducerAction,
} from '../../../../react/reducers/jobStageReducer';
import { FormField, TextFormField } from '../../../../components/Form/Form';
import { ButtonSecondary } from '../../../../components/buttonSecondary';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { faEdit, faEye, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextColors } from '../../../../components/HeaderTabs';

interface VariableTextInputProps {
  input: JobStageAction['inputs'][0];
  stageIndex: number;
  actionIndex: number;
  inputIndex: number;
  dispatchJobStagesReducer: Dispatch<JobStateReducerAction>;
  previousStage: JobStage | undefined;
}

export const VariableTextInput: React.FC<VariableTextInputProps> = ({
  input,
  stageIndex,
  actionIndex,
  inputIndex,
  dispatchJobStagesReducer,
  previousStage,
}) => {
  const editBoxId = `editBox-${stageIndex}-${actionIndex}-${inputIndex}`;
  const editBoxRef = useRef<HTMLDivElement>(null);
  const editBoxTokensRefs = useRef<HTMLDivElement[]>([]);

  const [inputVariables, setInputVariables] = useState<string[]>([]);

  useEffect(() => {
    if (previousStage) {
      setInputVariables([
        ...previousStage.actions.map((action, index) => `var:${index},${action.name}`),
      ]);
    }
  }, [previousStage, input.value]);

  const [isDragging, setIsDragging] = useState(false);

  const onStartDragging = (e: any) => {
    // console.log(e);
    setIsDragging(true);
  };

  const onStopDragging = (e: DraggableEvent, data: DraggableData, token: string) => {
    setIsDragging(false);

    if (editBoxRef.current) {
      let x = 0;
      let y = 0;
      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else {
        if (e instanceof TouchEvent) {
          x = e.changedTouches[0].clientX;
          y = e.changedTouches[0].clientY;
        }
        // x = e.touches[0].clientX;
        // y = e.touches[0].clientY;
      }

      const { top, left, bottom, right } = editBoxRef.current.getBoundingClientRect();
      if (x > left && y > top && x < right && y < bottom) {
        // now we want to find what element we are dragging into
        // we want to find the element to the left of where we are dragging
        // first we can do the x case, y later for multiline when we get there.

        let refMatchIndex = -1;
        for (let i = 0; i < editBoxTokensRefs.current.length; i++) {
          const tokenRef = editBoxTokensRefs.current[i];
          const {
            left: _left,
            right: _right,
            top: _top,
            bottom: _bottom,
          } = tokenRef.getBoundingClientRect();
          // first check elevation
          if (y < _top && y > _bottom) {
            // on this tokens line
            if (x > _left && x < _right) {
              refMatchIndex = i;
            }
          }
        }
        const tokenToFormField: FormField = {
          name: token,
          type: 'text',
          value: token,
          isEditable: true,
        };
        // if none we append to end
        if (refMatchIndex === -1) {
          console.log('no match');

          setVariableTextFormFields([...variableTextFormFields, tokenToFormField]);
        } else {
          console.log('refMatchIndex', refMatchIndex);
          const newVariableTextFormFields = [...variableTextFormFields];
          console.log('newVariableTextFormFields', newVariableTextFormFields);
          newVariableTextFormFields.splice(refMatchIndex, 0, tokenToFormField);
          setVariableTextFormFields(newVariableTextFormFields);
        }
      }
    }
  };

  const [variableTextFormFields, setVariableTextFormFields] = useState<FormField[]>([]);

  useEffect(() => {
    // we either cant update input.value or must make it the same as
    // variable text form fields

    if (variableTextFormFields.length === 0 && input.value != '') {
      const formFields: FormField[] = input.value.split('#DELIMITER#').map((value) => {
        return {
          name: value,
          type: 'text',
          value,
          isEditable: true,
        };
      });
      setVariableTextFormFields(formFields);
    } else {
      const nonVariableFields = variableTextFormFields.filter(
        (field) => !field.value.startsWith('var:'),
      );
      // check if any of these fields are empty, if they are then remove them
      const emptyFields = nonVariableFields.filter((field) => field.value === '');
      if (emptyFields.length > 0) {
        setVariableTextFormFields(
          variableTextFormFields.filter((field) => !emptyFields.includes(field)),
        );
      }

      dispatchJobStagesReducer({
        type: 'updateActionInput',
        payload: {
          stageIndex,
          actionIndex,
          inputIndex,
          value: variableTextFormFields.map((f) => f.value).join('#DELIMITER#'),
        },
      });
    }
  }, [variableTextFormFields]);

  const [isEdit, setIsEdit] = useState(true);
  return (
    <>
      Outputs from previous stage:
      <div className='flex flex-wrap gap-2'>
        {inputVariables.map((token, index) => {
          return (
            <Draggable
              key={index}
              onStop={(e, data) => onStopDragging(e, data, token)}
              onStart={onStartDragging}
              position={{ x: 0, y: 0 }}
            >
              {/* */}
              <div>
                <div className='handle'></div>
                <ButtonSecondary className='handle cursor-move'>
                  <div className=''>{token.replace('var:', '')}</div>
                </ButtonSecondary>{' '}
              </div>
            </Draggable>
          );
        })}
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Draggable
          onStop={(e, data) => onStopDragging(e, data, ' ')}
          onStart={onStartDragging}
          position={{ x: 0, y: 0 }}
        >
          <div>
            <div className='handle'></div>
            <ButtonSecondary className='handle my-4 cursor-move items-center gap-4'>
              <FontAwesomeIcon icon={faNoteSticky} />
              {'Text Field'}
            </ButtonSecondary>
          </div>
        </Draggable>
        <ButtonSecondary
          selected={false}
          className={`my-4 items-center gap-4
            ${input.value === '' ? 'cursor-not-allowed' : ''}
          `}
          onClick={() => setIsEdit(!isEdit)}
          disabled={input.value === ''}
          noHoverAnimation={input.value === ''}
        >
          <FontAwesomeIcon icon={isEdit ? faEye : faEdit} />
          {isEdit ? 'Switch to preview' : 'Switch to edit'}
        </ButtonSecondary>
      </div>
      {isEdit ? (
        <div className='bg-primary flex w-full items-center overflow-auto p-4' ref={editBoxRef}>
          {variableTextFormFields.map((field, index) => (
            <div
              key={index}
              ref={(ref) => {
                if (ref) {
                  editBoxTokensRefs.current[index] = ref;
                }
              }}
              className={`${isDragging ? 'outline' : ''}`}
            >
              {field.value.startsWith('var:') ? (
                <>
                  <ButtonSecondary
                    className='cursor-not-allowed'
                    onClick={() => {
                      setVariableTextFormFields(
                        variableTextFormFields.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    {field.value}
                  </ButtonSecondary>{' '}
                </>
              ) : (
                <TextFormField
                  fitContent
                  noPlaceholder
                  noLabel
                  index={index}
                  formFields={variableTextFormFields}
                  setFormFields={setVariableTextFormFields}
                />
              )}
            </div>
          ))}
          {variableTextFormFields.length === 0 && (
            <div className='text-gray-400'>Drag and drop fields here</div>
          )}
        </div>
      ) : (
        <div>{input.value}</div>
      )}
    </>
  );
};

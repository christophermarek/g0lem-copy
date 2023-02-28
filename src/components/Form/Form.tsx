import { Dispatch, SetStateAction, useState } from 'react';
import { ButtonSecondary } from '../buttonSecondary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { CheckBoxFormField } from './CheckboxFormField';
import { ImageFormField } from './ImageFormField';
import { useWindowSize } from 'usehooks-ts';
export interface FormField {
  name: string;
  value: string;
  file?: File;
  type: 'text' | 'image' | 'checkbox' | 'select' | 'number' | 'textarea';
  options?: { label: string; value: string }[];
  isEditable: boolean;
  visible?: boolean;
  justImage?: boolean;
  noLabel?: boolean;
  noSpan?: boolean;
  invisible?: boolean;
  spanCols?: string;
}
interface FormProps {
  children?: React.ReactNode;
  formFields: FormField[];
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  onSubmit?: () => void;
  submitButtonText?: string;
  noSubmitButton?: boolean;
  gridCols?: string;
  submitButtonInForm?: boolean;
  flex?: boolean;
  OutlineColor?: string;
}

export interface IndividualFormFieldProps {
  index: number;
  formFields: FormField[];
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  noLabel?: boolean;
  fitContent?: boolean;
  noPlaceholder?: boolean;
}
export const TextFormField: React.FC<IndividualFormFieldProps> = ({
  index,
  formFields,
  setFormFields,
  noLabel,
  fitContent,
  noPlaceholder,
}) => {
  const { name, value, isEditable, type } = formFields[index];

  const [width, setWidth] = useState<string>(value.length + 1 + 'ch');

  return (
    <div className={`flex flex-col text-xl  ${fitContent ? ' ' : 'w-full'}`}>
      <>
        {!noLabel && <label className=''>{name}</label>}
        <input
          style={{ width: fitContent ? width : '100%' }}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            const width = input.value.length + 1;
            setWidth(`${width}ch`);
          }}
          className={`bg-primary
            rounded-md  py-1 px-2
              ${isEditable ? 'border border-solid border-gray-400' : 'border-none'}
              `}
          type={'text'}
          value={value}
          placeholder={`${noPlaceholder ? '' : `Enter ${name}`}`}
          disabled={!isEditable}
          onChange={(e) => {
            if (type === 'number' && isNaN(Number(e.target.value))) return;
            const copy = [...formFields];
            copy[index] = {
              name: name,
              value: e.target.value,
              isEditable: isEditable,
              type: type,
            };
            setFormFields(copy);
          }}
        />
      </>
    </div>
  );
};

export const Form: React.FC<FormProps> = ({
  formFields,
  setFormFields,
  onSubmit,
  submitButtonText,
  children,
  noSubmitButton,
  gridCols,
  submitButtonInForm,
  flex,
  OutlineColor,
}) => {
  const fireSubmit = () => {
    onSubmit && onSubmit();
  };

  const { width } = useWindowSize();
  gridCols = width < 640 ? '1' : gridCols;

  return (
    <div className='grid'>
      <div
        className={`text-xl
        ${
          width < 640
            ? 'flex flex-col'
            : flex
            ? 'flex flex-row'
            : `grid grid-cols-${gridCols || '2'} items-center gap-x-2 gap-y-2`
        }
        `}
      >
        {formFields.map((field, index) => (
          <>
            {(field.visible === undefined || field.visible) && (
              <div
                key={`form-${index}`}
                className={` flex p-2 hover:outline hover:${OutlineColor}
                ${field.spanCols ? 'col-span-2' : ''}
                ${field.invisible ? 'invisible' : ''}
        ${field.type === 'checkbox' ? '' : ''}
              ${
                field.type === 'text' || field.type === 'number' || field.type === 'textarea'
                  ? 'flex-col'
                  : ''
              }
              ${
                field.type === 'image' && !field.justImage
                  ? (field.noSpan ? ' ' : ` ${gridCols === '1' ? '' : 'col-span-2'} `) +
                    'items-center justify-between gap-x-4'
                  : ''
              }           
              ${field.type === 'select' ? 'flex-col' : ''} 
            `}
              >
                <>
                  {field.type === 'image' && (
                    <>
                      <ImageFormField
                        key={`form-${index}`}
                        index={index}
                        formFields={formFields}
                        setFormFields={setFormFields}
                      />
                    </>
                  )}
                  {(field.type === 'text' || field.type === 'number') && (
                    <>
                      {!field.noLabel && <legend className=''>{field.name}</legend>}
                      <input
                        className={`bg-primary w-full rounded-md  py-1 px-2
              ${field.isEditable ? 'border border-solid border-gray-400' : 'border-none'}
              `}
                        type={'text'}
                        value={field.value}
                        placeholder={`Enter ${field.name}`}
                        disabled={!field.isEditable}
                        onChange={(e) => {
                          if (field.type === 'number' && isNaN(Number(e.target.value))) return;
                          const copy = [...formFields];
                          copy[index] = {
                            name: field.name,
                            value: e.target.value,
                            isEditable: field.isEditable,
                            type: field.type,
                          };
                          setFormFields(copy);
                        }}
                      />
                    </>
                  )}
                  {field.type === 'checkbox' && (
                    <>
                      <CheckBoxFormField
                        key={`form-${index}`}
                        index={index}
                        formFields={formFields}
                        setFormFields={setFormFields}
                      />
                    </>
                  )}
                  {field.type === 'select' && (
                    <>
                      <legend className=''>{field.name}</legend>
                      <select
                        className={`bg-primary w-full rounded-md  py-1 px-2
              ${field.isEditable ? 'border border-solid border-gray-400' : 'border-none'}
              `}
                        value={field.value}
                        disabled={!field.isEditable}
                        onChange={(e) => {
                          const copy = [...formFields];
                          copy[index] = {
                            name: field.name,
                            options: field.options,
                            value: e.target.value,
                            isEditable: field.isEditable,
                            type: field.type,
                          };
                          setFormFields(copy);
                        }}
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {field.type === 'textarea' && (
                    <>
                      {!field.noLabel && <legend className=''>{field.name}</legend>}
                      <textarea
                        rows={5}
                        className={`bg-primary w-full rounded-md  py-1 px-2
              ${field.isEditable ? 'border border-solid border-gray-400' : 'border-none'}
              `}
                        value={field.value}
                        disabled={!field.isEditable}
                        onChange={(e) => {
                          const copy = [...formFields];
                          copy[index] = {
                            name: field.name,
                            value: e.target.value,
                            isEditable: field.isEditable,
                            type: field.type,
                          };
                          setFormFields(copy);
                        }}
                      />
                    </>
                  )}
                </>
              </div>
            )}
          </>
        ))}
        {submitButtonInForm && (
          <ButtonSecondary
            selected={false}
            className=' w-full items-center self-end'
            onClick={fireSubmit}
          >
            <FontAwesomeIcon icon={faCircleCheck} />
            {submitButtonText}
          </ButtonSecondary>
        )}
      </div>
      {children}
      {!submitButtonInForm && !noSubmitButton && (
        <div className='my-2'>
          <ButtonSecondary
            selected={false}
            className='my-4 items-center gap-4'
            onClick={fireSubmit}
          >
            <FontAwesomeIcon icon={faCircleCheck} />
            {submitButtonText}
          </ButtonSecondary>
        </div>
      )}
    </div>
  );
};

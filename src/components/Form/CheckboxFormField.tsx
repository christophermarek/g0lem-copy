import { TextColors } from '../HeaderTabs';
import { IndividualFormFieldProps } from './Form';

export const CheckBoxFormField: React.FC<IndividualFormFieldProps> = ({
  index,
  formFields,
  setFormFields,
}) => {
  const { name, value, isEditable, type } = formFields[index];

  const toggleChecked = () => {
    const copy = [...formFields];
    copy[index] = {
      name: name,
      value: value === 'true' ? 'false' : 'true',
      isEditable: isEditable,
      type: type,
    };
    setFormFields(copy);
  };
  return (
    <div
      onClick={toggleChecked}
      className={`flex w-full cursor-pointer gap-4 text-xl  hover:outline ${
        value === 'true' ? TextColors.Jobs.primary + ' underline' : ''
      }`}
      //   style={value === 'true' ? { color:  } : {}}
      //   style={{ outline: 'solid', color: `${TextColors.Jobs.secondary}` }}
      //   style={{ color: 'red' }}
    >
      <input
        className={`bg-primary h-8 w-8 cursor-pointer rounded-md py-1 px-2
                ${isEditable ? 'border border-solid border-gray-400' : 'border-none'}
                `}
        type={'checkbox'}
        checked={value === 'true'}
        disabled={!isEditable}
        readOnly
      />
      <legend className=''>{name}</legend>
    </div>
  );
};

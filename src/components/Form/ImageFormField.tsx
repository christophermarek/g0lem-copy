import { ChangeEvent, useRef } from 'react';
import { IndividualFormFieldProps } from './Form';
// import useHover from 'usehooks-ts/dist/esm/useHover/useHover';
import { ButtonSecondary } from '../buttonSecondary';
import { useHover } from 'usehooks-ts';

export const ImageFormField: React.FC<IndividualFormFieldProps> = ({
  index,
  formFields,
  setFormFields,
}) => {
  const { name, value, isEditable, type, noLabel } = formFields[index];

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('imageCHanged');
    const { files } = e.target;
    if (files && files.length > 0) {
      // setImage(files[0]);
      setFormFields((prev) => {
        const newFormFields = [...prev];
        const imageField = newFormFields.find((field) => field.type === 'image');
        console.log('imageField', imageField);
        if (imageField) {
          imageField.value = URL.createObjectURL(files[0]);
          imageField.file = files[0];
        }
        return newFormFields;
      });
    }
  };
  const hoverRef = useRef(null);
  const isHover = useHover(hoverRef);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      {!noLabel && <legend className=''>{name}</legend>}
      <div ref={hoverRef}>
        <ButtonSecondary
          noHoverAnimation={!isEditable}
          className={`w-fit px-0 `}
          onClick={() => {
            if (isHover) {
              fileInput.current?.click();
            }
          }}
          selected={false}
        >
          <input
            type='file'
            ref={fileInput}
            onChange={handleImageChange}
            accept='/image/*'
            className='hidden'
          />
          <img src={value} className='h-14 w-14 object-scale-down' />
        </ButtonSecondary>
      </div>
    </>
  );
};

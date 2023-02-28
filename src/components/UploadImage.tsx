import { ChangeEvent, useRef } from 'react';
import { useHover } from 'usehooks-ts';
import { ButtonSecondary } from './buttonSecondary';

interface UploadImageProps {
  image: string;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const UploadImage: React.FC<UploadImageProps> = ({ image, handleImageChange }) => {
  return <></>;
};

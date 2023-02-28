import React from 'react';

interface ModalContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedModal: string;
  setSelectedModal: React.Dispatch<React.SetStateAction<string>>;
}
export const ModalContext = React.createContext<ModalContextProps>({
  isOpen: false,
  setIsOpen: () => {},
  selectedModal: '',
  setSelectedModal: () => {},
});

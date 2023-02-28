import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ModalContext } from '../../react/context/ModalContext';
import ReactDOM from 'react-dom';
import { Frame } from '../container';
import { ControlPane } from '../ControlPane';
import { TabColors } from '../HeaderTabs';
import { useOnClickOutside, useWindowSize } from 'usehooks-ts';
import { ControlPaneButton } from '../ControlPane/Button';

export interface ModalProps {
  title: string;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  parentBorderColor?: string;
  closeFunction?: () => void;
  openModalState?: boolean;
  noControlPane?: boolean;
  noClickOutside?: boolean;
  buttons?: ControlPaneButton[];
  width?: string;
  height?: string;
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  children,
  title,
  setOpenModal,
  parentBorderColor,
  closeFunction,
  openModalState,
  noControlPane,
  noClickOutside,
  buttons,
  width,
  height,
}) => {
  const ref = useRef(null);
  const { setIsOpen } = useContext(ModalContext);
  const [_portal, setPortal] = useState<Element | null>(document.querySelector('.modal-portal'));
  useEffect(() => {
    console.log('openModalState', openModalState);
    if (openModalState === undefined || openModalState) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [openModalState]);

  const closeModal = () => {
    setOpenModal(false);
    setIsOpen(false);
    if (closeFunction) {
      closeFunction();
    }
  };

  const handleClickOutside = () => {
    if (!noClickOutside) {
      console.log('clicked outside');

      closeModal();
    }
  };
  useOnClickOutside(ref, handleClickOutside);
  const { width: asScreenSize } = useWindowSize();

  return (
    <>
      {_portal
        ? ReactDOM.createPortal(
            <>
              <div
                className={`fixed z-50 
                ${height || 'fit-content'}
                ${asScreenSize < 768 ? 'w-full' : `${width || 'fit-content'}`}
              `}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  // maxHeight: '100vh',
                  overflowY: 'scroll',
                  padding: '0',
                }}
                ref={ref}
              >
                {!noControlPane ? (
                  <ControlPane
                    title={title}
                    hasChildrenBorder={true}
                    // modalPane={{ closeModal: closeModal }}
                    buttons={buttons || []}
                    isHeaderPane={true}
                    childrenPaddingOverride='px-0 py-0'
                    parentBorderColor={parentBorderColor}
                    childPaneOpen={false}
                  >
                    <>{children}</>
                  </ControlPane>
                ) : (
                  <Frame className='bg border-none'>{children}</Frame>
                )}
              </div>
            </>,
            _portal,
          )
        : children}
    </>
  );
};

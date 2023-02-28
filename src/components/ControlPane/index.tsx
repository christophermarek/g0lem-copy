import { Frame } from '../container';
import { useState } from 'react';
import { ControlPaneButton } from './Button';
import { ControlPaneTitle } from './Title';
import { ControlPaneTitleButtons } from './TitleButtons';

interface ControlPaneProps {
  title: string | React.ReactNode;
  buttons: ControlPaneButton[];
  children: React.ReactNode;
  childrenPaddingOverride?: string;
  isHeaderPane?: boolean;
  forceChildrenExpanded?: boolean;
  hasChildrenBorder: boolean;
  parentBorderColor?: string;

  modalPane?: {
    closeModal: () => void;
  };

  childPaneOpen?: boolean;
  childPaneTitle?: string;
  childPaneButtons?: ControlPaneButton[];

  noRoundedBottom?: boolean;

  injectedButtons?: React.ReactNode;
  injectedChildButtons?: React.ReactNode;
  widthOverride?: string;
}

export const ControlPane: React.FC<ControlPaneProps> = ({
  title,
  buttons,
  children,
  isHeaderPane,
  childrenPaddingOverride,
  forceChildrenExpanded,
  hasChildrenBorder,
  parentBorderColor,
  modalPane,

  childPaneOpen,
  childPaneTitle,
  childPaneButtons,
  noRoundedBottom,
  injectedButtons,
  injectedChildButtons,
  widthOverride,
}) => {
  const [isChildrenExpanded, setIsChildrenExpanded] = useState<boolean>(true);

  return (
    <>
      <Frame
        parentBorderColor={parentBorderColor}
        className={`flex flex-col border-none py-0 px-0 ${widthOverride ? widthOverride : ''}`}
      >
        <div>
          {/* menu and title */}
          <Frame
            parentBorderColor={parentBorderColor}
            className={`${
              !childPaneOpen ? 'flex items-center justify-between' : 'grid grid-cols-2'
            }   rounded-none py-0 px-0 `}
          >
            <ControlPaneTitle
              hasUnderline={false}
              title={title}
              isHeaderPane={isHeaderPane}
              forceChildrenExpanded={forceChildrenExpanded}
              isChildrenExpanded={isChildrenExpanded}
              setIsChildrenExpanded={setIsChildrenExpanded}
              modalPane={modalPane}
            />
            {childPaneOpen && childPaneTitle && (
              <ControlPaneTitle
                hasUnderline={true}
                title={childPaneTitle}
                isHeaderPane={isHeaderPane}
                forceChildrenExpanded={forceChildrenExpanded}
                isChildrenExpanded={isChildrenExpanded}
                setIsChildrenExpanded={setIsChildrenExpanded}
                modalPane={modalPane}
              />
            )}
          </Frame>

          {/* bottom buttons */}
          <Frame
            parentBorderColor={parentBorderColor}
            className={`flex flex-wrap rounded-none border-r-2 border-l-2 bg-gray-900 py-0 px-0`}
          >
            <ControlPaneTitleButtons
              isChildrenExpanded
              buttons={buttons}
              injectedButtons={injectedButtons}
            />
            {childPaneOpen && childPaneButtons && (
              <ControlPaneTitleButtons
                isChildrenExpanded
                buttons={childPaneButtons}
                injectedButtons={injectedChildButtons}
              />
            )}
          </Frame>
        </div>
        {/* children */}
        <Frame
          parentBorderColor={parentBorderColor}
          className={` ${noRoundedBottom ? 'rounded-none' : 'rounded-b-lg'} border-t-0 
          ${
            hasChildrenBorder
              ? 'border-b-2 border-r-2 border-l-2'
              : `${childPaneOpen ? 'border-b-0' : 'border-b-2 border-r-2 border-l-2'}    `
          }
           bg-gray-900
            ${childrenPaddingOverride ? childrenPaddingOverride : 'px-2 py-0'}
          `}
        >
          {isChildrenExpanded && <>{children}</>}
        </Frame>
      </Frame>
    </>
  );
};

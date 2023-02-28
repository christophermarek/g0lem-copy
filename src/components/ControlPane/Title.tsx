import {
  faCircleChevronDown,
  faCircleChevronUp,
  faX,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import { ControlPaneButton } from './Button';

interface ControlPaneTitleProps {
  title: string | React.ReactNode;
  isHeaderPane?: boolean;
  isChildrenExpanded?: boolean;
  setIsChildrenExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
  forceChildrenExpanded?: boolean;
  modalPane?: {
    closeModal: () => void;
  };

  hasUnderline: boolean;
}

export const ControlPaneTitle: React.FC<ControlPaneTitleProps> = ({
  title,
  isHeaderPane,
  forceChildrenExpanded,
  isChildrenExpanded,
  setIsChildrenExpanded,
  modalPane,
  hasUnderline,
}) => {
  return (
    <>
      {typeof title === 'string' ? (
        <>
          <div
            className={`ml-2 truncate py-2 text-3xl font-bold ${hasUnderline ? 'underline' : ''}`}
          >
            {title}
          </div>
          {!isChildrenExpanded && (
            <ControlPaneButton
              button={{
                icon: isChildrenExpanded ? faCircleChevronUp : faCircleChevronDown,
                text: isChildrenExpanded ? 'Close' : 'Open',
                widthOverride: 'w-fit',
                onClick: () =>
                  setIsChildrenExpanded &&
                  setIsChildrenExpanded(forceChildrenExpanded ? true : !isChildrenExpanded),
                isVisible: isHeaderPane ? false : forceChildrenExpanded ? false : true,
                selected: false,
              }}
              border='border-t-10 border-l-2 border-r-0 border-b-0'
              rounded={`rounded-none`}
            />
          )}
          <ControlPaneButton
            button={{
              icon: faXmarkCircle,
              text: 'Close',
              widthOverride: 'w-fit',
              onClick: () => modalPane?.closeModal(),
              isVisible: modalPane ? true : false,
              selected: false,
              isHidden: modalPane ? false : true,
            }}
            border='border-none'
            rounded={`rounded-none`}
          />
        </>
      ) : (
        <>{title}</>
      )}
    </>
  );
};

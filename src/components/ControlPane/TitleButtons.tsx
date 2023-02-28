import { ControlPaneButton } from './Button';

interface ControlTitleButtonsProps {
  buttons: ControlPaneButton[];
  isChildrenExpanded: boolean;
  isHidden?: boolean;
  injectedButtons?: React.ReactNode;
}

export const ControlPaneTitleButtons: React.FC<ControlTitleButtonsProps> = ({
  buttons,
  isChildrenExpanded,
  isHidden,
  injectedButtons,
}) => {
  return (
    <>
      {buttons &&
        buttons.map((button, buttonIndex) => (
          <ControlPaneButton
            key={buttonIndex}
            button={button}
            border={
              buttonIndex % 2 === 0 ? 'border-l-2 border-r-2 border-b-2' : 'border-r-2 border-b-2'
            }
            rounded={`${
              !isChildrenExpanded
                ? buttonIndex === buttons.length - 2 || buttonIndex === buttons.length - 1
                  ? buttonIndex === buttons.length - 2
                    ? 'rounded-bl-lg'
                    : 'rounded-br-lg'
                  : 'rounded-none'
                : 'rounded-none'
            }`}
          />
        ))}
      {injectedButtons}
    </>
  );
};

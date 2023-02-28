import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonSecondary } from '../buttonSecondary';

export interface ControlPaneButton {
  icon: any;
  text: string | React.ReactNode;
  isVisible: boolean;
  isHidden?: boolean;
  widthOverride?: string;
  borderConfigOverride?: string;
  roundedConfigOverride?: string;
  textSizeOverride?: string;
  onClick: () => void;
  selected: boolean;
}
export const ControlPaneButton = ({
  button,
  border,
  rounded,
}: {
  button: ControlPaneButton;
  border: string;
  rounded: string;
}) => {
  return (
    <ButtonSecondary
      selected={button.selected}
      hoverScaleDirection='y'
      className={`flex items-center justify-start 
                  gap-2 
                  ${button.widthOverride ? button.widthOverride : 'w-1/2'}
                  ${button.textSizeOverride ? button.textSizeOverride : 'text-2xl'}
                  ${button.roundedConfigOverride ? button.roundedConfigOverride : rounded}
                  ${button.isVisible ? 'visible' : 'invisible'}
                  ${button.isHidden ? 'hidden' : ''}
                  ${button.borderConfigOverride ? button.borderConfigOverride : border}
                  `}
      onClick={button.onClick}
    >
      <FontAwesomeIcon icon={button.icon} />
      {button.text}
    </ButtonSecondary>
  );
};

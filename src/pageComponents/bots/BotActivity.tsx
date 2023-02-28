import { ComponentPortalWrapper } from '../../components/ComponentPortalWrapper';
import { ControlPane } from '../../components/ControlPane';
import { TabColors } from '../../components/HeaderTabs';
import { ParentProps } from '../Parent';

interface BotActivityProps {}

export const BotActivity: React.FC<ParentProps & BotActivityProps> = ({
  botParent,
  teamParent,
}) => {
  return (
    <ComponentPortalWrapper portal='.portal2'>
      <ControlPane
        parentBorderColor={TabColors.Bots.secondary}
        title='Activity'
        buttons={[]}
        hasChildrenBorder={true}
      >
        Schedules ran Two tabs, one for job logs and one for schedule logs
      </ControlPane>
    </ComponentPortalWrapper>
  );
};

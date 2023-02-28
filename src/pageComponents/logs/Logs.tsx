import { ControlPane } from '../../components/ControlPane';
import { ParentProps } from '../Parent';

interface LogProps {}

export const Logs: React.FC<ParentProps & LogProps> = () => {
  return (
    <>
      <ControlPane isHeaderPane={true} title='Logs' hasChildrenBorder={false} buttons={[]}>
        LOGS
      </ControlPane>
    </>
  );
};

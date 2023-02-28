import { Frame } from '../container';

interface ControlPaneChildrenProps {
  children: React.ReactNode;
}
export const ControlPaneChildren: React.FC<ControlPaneChildrenProps> = ({ children }) => {
  return (
    <Frame
      parentBorderColor='border-none'
      className={`rounded-b-lg  border-t-0 border-l-2 border-r-2 border-b-2 bg-gray-900 py-0 px-2`}
    >
      {children}
    </Frame>
  );
};

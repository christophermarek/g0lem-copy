import ReactDOM from 'react-dom';
import { PropsWithChildren, useEffect, useState } from 'react';

interface ComponentPortalWrapperProps {
  portal: string;
}

export const ComponentPortalWrapper: React.FC<PropsWithChildren<ComponentPortalWrapperProps>> = ({
  children,
  portal,
}) => {
  const [_portal, setPortal] = useState<Element | null>(null);

  useEffect(() => {
    const _portal = document.querySelector(portal);
    setPortal(_portal);
  }, [portal]);

  return <>{_portal ? ReactDOM.createPortal(<>{children}</>, _portal) : children}</>;
};

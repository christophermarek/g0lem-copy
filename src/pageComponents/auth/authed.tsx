import { useSession } from 'next-auth/react';
import { LandingPage } from './LandingPage';

export const Auth = ({ children }: any): any => {
  const { data: sessionData } = useSession();

  return <>{<>{sessionData ? <>{children}</> : <LandingPage />}</>}</>;
};

import React from 'react';

interface HeaderNavProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}
export const HeaderNavContext = React.createContext<HeaderNavProps>({
  selectedTab: '',
  setSelectedTab: () => {},
});

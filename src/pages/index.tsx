import { type NextPage } from 'next';

import { ComponentPortalWrapper } from '../components/ComponentPortalWrapper';

export function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

const Home: NextPage = () => {
  return <ComponentPortalWrapper portal='.portal1'></ComponentPortalWrapper>;
};

export default Home;

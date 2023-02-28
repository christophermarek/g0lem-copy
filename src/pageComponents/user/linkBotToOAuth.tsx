import { bot, twitterOAuth } from '@prisma/client';
import { useState } from 'react';

interface LinkBotToOAuthInterface {
  bots: bot[];
  twitterOAuth: twitterOAuth[];
}
export const LinkBotToOAuth: React.FC<LinkBotToOAuthInterface> = ({ bots, twitterOAuth }) => {
  // will hold id's of the selected bot and oauth
  const [linkBotToAuthSelectedBot, setLinkBotToAuthSelectedBot] = useState<string>();
  const [linkBotToAuthSelectedOauth, setLinkBotToAuthSelectedOauth] = useState<string>();
  const linkBotToAuth = async () => {
    throw new Error('not implemented');
  };

  return (
    <form onSubmit={() => linkBotToAuth()}>
      <h1>Link bot to oauth</h1>
      <select
        value={linkBotToAuthSelectedBot}
        onChange={(e) => setLinkBotToAuthSelectedBot(e.target.value)}
      >
        {bots.map((bot) => (
          <>
            {bot.name !== '' && bot.name !== null && (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            )}
          </>
        ))}
        {bots.length === 0 && <option value=''>No bots</option>}
      </select>
      <select
        value={linkBotToAuthSelectedOauth}
        onChange={(e) => setLinkBotToAuthSelectedOauth(e.target.value)}
      >
        {twitterOAuth.map((oauth) => (
          <>
            {oauth.twitterId !== '' && oauth.twitterId !== null && (
              <option key={oauth.id} value={oauth.id}>
                {oauth.twitterUsername}
              </option>
            )}
          </>
        ))}
        {twitterOAuth.length === 0 ||
          (twitterOAuth.filter((client) => client.twitterId !== '' && client.twitterId !== null)
            .length === 0 && <option value=''>No oauth</option>)}
      </select>
      <button type='submit'>Link bot to oauth</button>
    </form>
  );
};

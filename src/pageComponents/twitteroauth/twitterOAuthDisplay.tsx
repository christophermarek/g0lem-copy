import { twitterOAuth } from '@prisma/client';
import { api } from '../../utils/api';

interface TwitterOAuthInterface {
  twitterOAuth: twitterOAuth[];
}

export const TwitterOAuth: React.FC<TwitterOAuthInterface> = ({ twitterOAuth }) => {
  const testTwitterLogin = api.twitterOAuth.testTwitterLogin.useMutation();
  return (
    <>
      Twitter OAUth
      <div className='row container'>
        Twitter OAuth:
        {twitterOAuth.map((oauth) => (
          <div key={oauth.id} className='row'>
            <div className='column'>id: {oauth.id}</div>
            <div className='column'>owner: user: {oauth.userId}</div>
            <div className='column'>controller bot: {oauth.botId}</div>
            <div className='column'>name {oauth.twitterName}</div>
            <div className='column'>username {oauth.twitterUsername}</div>
            <div className='column'>
              accessToken
              <input type='text' value={oauth.accessToken ? oauth.accessToken : ''} />{' '}
              <input
                type='button'
                value='copy'
                onClick={() => navigator.clipboard.writeText(oauth.accessToken || '')}
              />
            </div>
            <div className='column'>
              refreshToken
              <input type='text' value={oauth.refreshToken ? oauth.refreshToken : ''} />{' '}
              <input
                type='button'
                value='copy'
                onClick={() => navigator.clipboard.writeText(oauth.refreshToken || '')}
              />
            </div>
            <div className='column'>
              <a
                target={'_blank'}
                rel={'noreferrer'}
                href={`https://twitter.com/${oauth.twitterUsername}`}
              ></a>
            </div>
            <div className='column'>
              <input
                type='button'
                value='Test login'
                onClick={async () => {
                  const result = await testTwitterLogin.mutateAsync({
                    oAuthAccessToken: oauth.accessToken ? oauth.accessToken : '',
                  });
                  console.log(result);
                  alert(result);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

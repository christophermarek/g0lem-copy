import { NextApiRequest, NextApiResponse } from 'next';
import {
  redditClientId,
  redditClientSecret,
  redditOauthRedirectUri,
  redditUserAgent,
} from '../../../server/trpc/routers/oauth';
import { base64Encode } from '@firebase/util';
import snoowrap from 'snoowrap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!prisma) return res.status(400).send('prisma not defined');
  const { state, code, error } = req.query;

  console.log('state', state);
  if (error) return res.status(400).send({ error: error });

  if (!state || typeof state !== 'string') {
    return res.status(400).send('no state');
  }

  // this would trigger if user hits cancel or something
  if (!code || typeof code !== 'string') {
    prisma.oAuth.deleteMany({
      where: {
        state: state,
      },
    });
    return res.status(400).send('invalid code not');
  }
  const oauthByState = await prisma.oAuth.findMany({
    where: {
      state: state,
    },
  });

  if (!oauthByState || oauthByState.length == 0) return res.status(400).send('no oauthByState');
  // verify state
  if (oauthByState[0].state !== state) return res.status(400).send('state not verified');

  // now post reddit
  // https://www.reddit.com/api/v1/access_token
  // post data
  // grant_type=authorization_code&code=CODE&redirect_uri=URI

  // HEADER
  // authorizaion

  // let headers = new Headers();
  // headers.append('Content-Type', 'application/json');
  // headers.append('Authorization', base64Encode(`Basic ${redditClientId}:${redditClientSecret}`));
  // const postData = JSON.stringify({
  //   grant_type: 'authorization_code',
  //   code: code,
  //   redirect_uri: redditOauthRedirectUri,
  // });

  // var requestOptions = {
  //   URL: 'https://www.reddit.com/api/v1/access_token',
  //   method: 'POST',
  //   // headers: headers,
  //   headers: {
  //     Authorization: 'Basic ' + btoa(redditClientId + ':' + redditClientSecret),
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   // body: {`grant_type=authorization_code&code=${code}&redirect_uri=${redditOauthRedirectUri}`},
  //   body: new URLSearchParams({
  //     grant_type: 'authorization_code',
  //     code: code,
  //     redirect_uri: redditOauthRedirectUri,
  //   }),
  // };

  // console.log('headers', headers);
  // console.log('sending res', requestOptions);
  // const response = await fetch('https://www.reddit.com/api/v1/access_token', requestOptions);
  // console.log(response.url);
  // console.log(response);
  // if (response.status !== 200) {
  //   return res.status(400).send(response);
  // }
  // const data = await response.json();
  // if (data.error.unsupported_grant_type) {
  //   return res.status(400).send(data);
  // }
  // if (data.code === 'NO_TEXT') {
  //   return res.status(400).send(data);
  // }
  // if (data.error.invalid_grant) {
  //   return res.status(400).send(data);
  // }
  // console.log('data', data);
  // const { access_token, token_type, expires_in, scope, refresh_token } = data;

  console.log('clientid', redditClientId);
  console.log('clientsecret', redditClientSecret);
  const login = await snoowrap.fromAuthCode({
    code,
    userAgent: redditUserAgent,
    clientId: redditClientId,
    clientSecret: redditClientSecret,
    redirectUri: redditOauthRedirectUri,
  });
  // console.log('login', login);
  // const r = new snoowrap({
  //   userAgent: redditUserAgent,
  //   clientId: redditClientId,
  //   clientSecret: redditClientSecret,
  //   accessToken: access_token,
  //   refreshToken: refresh_token,
  // });
  console.log('login', login);
  console.log('login ac', login.accessToken);
  console.log('login ref', login.refreshToken);
  console.log('login exp', login.tokenExpiration);
  login
    .getMe()
    .then(async (user) => {
      try {
        if (prisma) {
          await prisma.oAuth.update({
            where: {
              id: oauthByState[0].id,
            },
            data: {
              accessToken: login.accessToken,
              refreshToken: login.refreshToken,
              expiresIn: login.tokenExpiration,

              authTypeAccountId: user.id,
              authTypeAccountUsername: user.name,
            },
          });
        }
        res.status(200).send({ message: 'success' });
      } catch (e) {
        res.status(403).send({ error: e, message: 'error saving oauth for reddit' });
      }
    })
    .catch((e) => {
      console.log('error', e);
      res.status(403).send({ error: e, message: 'error getting logged in user' });
    });
}

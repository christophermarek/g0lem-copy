import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';
import {
  twitterClientId,
  twitterClientSecret,
  twitterOauthRedirectUri,
} from '../../../server/trpc/routers/oauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!prisma) return res.status(400).send('prisma not defined');
  const { state, code } = req.query;

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

  if (!oauthByState) return res.status(400).send('no oauthByState');

  // verify state
  if (oauthByState[0].state !== state) return res.status(400).send('state not verified');

  const client = new TwitterApi({ clientId: twitterClientId, clientSecret: twitterClientSecret });
  const codeVerifier = oauthByState[0].code;
  try {
    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
    } = await client.loginWithOAuth2({ code, codeVerifier, redirectUri: twitterOauthRedirectUri });
    // {loggedClient} is an authenticated client in behalf of some user
    // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
    // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

    // Example request
    const { data: userObject } = await loggedClient.v2.me();
    await prisma.oAuth.update({
      where: {
        id: oauthByState[0].id,
      },
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: expiresIn,
        authTypeAccountId: userObject.id,
        authTypeAccountUsername: userObject.username,
      },
    });
  } catch (e) {
    res.status(403).send('Invalid verifier or access tokens!');
  }
  return res.status(200).json({ ok: true });
}

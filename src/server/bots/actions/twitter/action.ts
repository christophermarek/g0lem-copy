import { TwitterApi } from 'twitter-api-v2';
import { FireActionResponse } from '../../action';
import { PostTweetActionConfig, ReplyTweetActionConfig } from './config';

const getTwitterClient = async (
  connectorId: string,
): Promise<{
  client?: TwitterApi;
  success: boolean;
  message: string;
}> => {
  if (!prisma) return { success: false, message: 'db not connected' };
  const twitterAuth = await prisma.oAuth.findUnique({ where: { id: connectorId } });
  if (!twitterAuth) return { success: false, message: 'twitter auth not found' };
  if (!twitterAuth.accessToken || !twitterAuth.refreshToken)
    return { success: false, message: 'twitter auth not validated' };
  try {
    // first try to use the access token
    // const _t = new TwitterApi(twitterAuth.accessToken);
    // const loginCheck = await _t.currentUserV2(true);
    // console.log('loginCheck', loginCheck);
    // if (loginCheck.errors) {
    // console.log('access token error');
    // console.log('twitter auth error', loginCheck.errors);
    // need to refresh token in this case?
    const t = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    });
    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await t.refreshOAuth2Token(twitterAuth.refreshToken);
    refreshedClient.readWrite;
    await prisma.oAuth.updateMany({
      where: {
        id: connectorId,
      },
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
    return { client: refreshedClient, success: true, message: 'twitter client success' };
    // } else {
    // return { client: _t, success: true, message: 'twitter client success' };
    // }
  } catch (err) {
    console.log('twitter auth error', err);
    return { success: false, message: 'twitter auth error' + err };
  }
};

export const tweetAction = async (
  _actionConfig: PostTweetActionConfig,
): Promise<FireActionResponse> => {
  try {
    if (!prisma) return { success: false, message: 'db not connected' };
    const twitterClient = await getTwitterClient(_actionConfig.twitterOauthConnectorID);
    if (!twitterClient.success || !twitterClient.client)
      return { success: false, message: twitterClient.message };
    try {
      twitterClient.client.readWrite;
      const res = await twitterClient.client.v2.tweet(_actionConfig.tweet);
      if (res.errors) {
        return { success: true, message: 'tweet error: ' + res.errors.join(',') };
      } else {
        return { success: true, message: 'tweet sent' + res.data.id, actionOutput: res.data.id };
      }
    } catch (e) {
      console.log('tweetAction error', e);
      return { success: false, message: 'tweetAction error' };
    }
  } catch (e) {
    console.log('tweetAction error', e);
    return { success: false, message: 'tweetAction error' };
  }
};

export const replyTweetAction = async (
  _actionConfig: ReplyTweetActionConfig,
): Promise<FireActionResponse> => {
  try {
    const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID || '' });
    if (!prisma) return { success: false, message: 'db not connected' };

    const twitterClient = await getTwitterClient(_actionConfig.twitterOauthConnectorID);
    if (!twitterClient.success || !twitterClient.client)
      return { success: false, message: twitterClient.message };
    try {
      const res = await twitterClient.client.v2.reply(
        _actionConfig.tweet,
        _actionConfig.inReplyToTweetID,
      );
      if (res.errors) {
        return { success: true, message: 'tweet error: ' + res.errors.join(',') };
      } else {
        return { success: true, message: 'tweet sent' + res.data.id, actionOutput: res.data.id };
      }
    } catch (e) {
      console.log('replyTweetAction error', e);
      return { success: false, message: 'replyTweetAction error' };
    }
  } catch (e) {
    console.log('replyTweetAction error', e);
    return { success: false, message: 'replyTweetAction error higher level' };
  }
};

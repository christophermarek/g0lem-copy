import { TwitterApi } from 'twitter-api-v2';

export * as Twitter from './twitterController';
export const sendTweet = async (twitterApi: TwitterApi, tweet: string, _media_ids: string[]) => {
  return await twitterApi.v2.tweet(tweet);
};

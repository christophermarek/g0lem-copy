interface BaseTwitterActionConfig {
  twitterOauthConnectorID: string;
}

export interface PostTweetActionConfig extends BaseTwitterActionConfig {
  action: 'tweetAction';
  tweet: string;
}

export interface ReplyTweetActionConfig extends BaseTwitterActionConfig {
  action: 'replyTweetAction';
  tweet: string;
  inReplyToTweetID: string;
}

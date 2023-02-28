interface BaseRedditActionConfig {
  redditOauthConnectorID: string;
}

export interface RedditTextPostOnSubredditConfig extends BaseRedditActionConfig {
  action: 'textPostOnSubreddit';
  subredditName: string;
  title: string;
  text: string;
}

export interface RedditLinkPostOnSubredditConfig extends BaseRedditActionConfig {
  action: 'linkPostOnSubreddit';
  subredditName: string;
  title: string;
  url: string;
}

export interface RedditCommentOnPostConfig extends BaseRedditActionConfig {
  action: 'commentOnPost';
  postId: string;
  text: string;
}

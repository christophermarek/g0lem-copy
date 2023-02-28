import snoowrap from 'snoowrap';
import { redditUserAgent, redditClientId, redditClientSecret } from '../../../trpc/routers/oauth';
import { FireActionResponse } from '../../action';
import {
  RedditCommentOnPostConfig,
  RedditLinkPostOnSubredditConfig,
  RedditTextPostOnSubredditConfig,
} from './config';

const unpromise = async <T>(promise: Promise<T>) => {
  const result = await promise;
  return result as Omit<T, 'then' | 'catch' | 'finally'>;
};

const getRedditClient = async (
  connectorId: string,
): Promise<{
  client?: snoowrap;
  success: boolean;
  message: string;
}> => {
  if (!prisma) return { success: false, message: 'db not connected' };
  const redditAuth = await prisma.oAuth.findUnique({ where: { id: connectorId } });
  if (!redditAuth) return { success: false, message: 'reddit auth not found' };
  if (!redditAuth.accessToken || !redditAuth.refreshToken)
    return { success: false, message: 'reddit auth not validated' };
  try {
    const r = new snoowrap({
      userAgent: redditUserAgent,
      clientId: redditClientId,
      clientSecret: redditClientSecret,
      accessToken: redditAuth.accessToken,
      refreshToken: redditAuth.refreshToken,
    });
    return { client: r, success: true, message: 'reddit auth success' };
  } catch (err) {
    return { success: false, message: 'reddit auth error' + err };
  }
};

export const makeTextPostOnSubreddit = async (
  config: RedditTextPostOnSubredditConfig,
): Promise<FireActionResponse> => {
  const { redditOauthConnectorID, subredditName, title, text } = config;
  if (!prisma) return { success: false, message: 'db not connected' };

  const r = await getRedditClient(redditOauthConnectorID);
  if (!r.client) return { success: false, message: 'reddit client error' };
  return await r.client
    .submitSelfpost({ subredditName: subredditName, title: title, text: text })
    .then((post) => {
      return {
        success: true,
        message: 'reddit post success',
        data: { id: post.id, title: post.title, url: post.url },
        actionOutput: post.id,
      };
    })
    .catch((err) => {
      return { success: false, message: 'reddit post error' + err };
    });
};

export const makeLinkPostOnSubreddit = async (
  config: RedditLinkPostOnSubredditConfig,
): Promise<FireActionResponse> => {
  const { redditOauthConnectorID, subredditName, title, url } = config;
  if (!prisma) return { success: false, message: 'db not connected' };

  const r = await getRedditClient(redditOauthConnectorID);
  if (!r.client) return r;

  try {
    const post = await unpromise(
      r.client.submitLink({ subredditName: subredditName, title: title, url: url }),
    );
    return {
      success: true,
      message: 'reddit post success',
      data: { id: post.id, title: post.title, url: post.url },
      actionOutput: post.id,
    };
  } catch (err) {
    return { success: false, message: 'reddit post error' + err };
  }
};

export const makeCommentOnPost = async (
  config: RedditCommentOnPostConfig,
): Promise<FireActionResponse> => {
  const { redditOauthConnectorID, postId, text } = config;
  if (!prisma) return { success: false, message: 'db not connected' };

  const r = await getRedditClient(redditOauthConnectorID);
  if (!r.client) return r;

  try {
    const comment = await unpromise(r.client.getSubmission(postId).reply(text));
    return {
      success: true,
      message: 'reddit comment success',
      data: { id: comment.id },
      actionOutput: comment.id,
    };
  } catch (err) {
    return { success: false, message: 'reddit comment error' + err };
  }
};

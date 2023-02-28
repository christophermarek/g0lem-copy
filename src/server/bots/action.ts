import { OpenAiApi } from '../externalControllers/promptController';
import { WebhookClient } from 'discord.js';
import {
  RedditCommentOnPostConfig,
  RedditLinkPostOnSubredditConfig,
  RedditTextPostOnSubredditConfig,
} from './actions/reddit/config';
import {
  makeCommentOnPost,
  makeLinkPostOnSubreddit,
  makeTextPostOnSubreddit,
} from './actions/reddit/action';
import { replyTweetAction, tweetAction } from './actions/twitter/action';
import { PostTweetActionConfig, ReplyTweetActionConfig } from './actions/twitter/config';
import {
  GetCoinPriceAtTimeStampConfig,
  GetCoinPriceNUnitsAgoConfig,
  GetCurrentCoinPriceConfig,
} from './actions/market_prices/config';
import {
  getCoinPriceAtTimeStampAction,
  getCoinPriceNUnitsAgoAction,
  getCurrentCoinPriceAction,
} from './actions/market_prices/action';
import { actionData } from '../../utils/actions';

export * as Actions from './action';
export interface FireActionResponse {
  success: boolean;
  message: string;
  data?: any;
  actionOutput?: string;
}

export interface FireActionRequest {
  callerId: string;
  botId?: string;
  actionName: string;
  actionConfig: ActionConfigType;
}

export type ActionConfigType =
  | PostTweetActionConfig
  | ReplyTweetActionConfig
  | GenerateCompletionActionConfig
  | LocalPostActionConfig
  | DiscordWebhookActionConfig
  | RedditCommentOnPostConfig
  | RedditTextPostOnSubredditConfig
  | RedditLinkPostOnSubredditConfig
  | TextCleanupActionConfig
  | TextVariableActionConfig
  | GetCurrentCoinPriceConfig
  | GetCoinPriceAtTimeStampConfig
  | GetCoinPriceNUnitsAgoConfig;

export interface LocalPostActionConfig {
  action: 'localPostAction';
  post_text: string;
}

export interface GenerateCompletionActionConfig {
  action: 'generateCompletionAction';
  prompt: string;
  max_tokens: string;
  temperature: string;
  top_p: string;
  // _n: number;
  openAiApiKey: string;
}

export interface DiscordWebhookActionConfig {
  action: 'discordWebhookAction';
  webhookUrl: string;
  message: string;
}

export interface TextCleanupActionConfig {
  action: 'textCleanupAction';
  text: string;
  removeNewLines: boolean;
  trimStart: boolean;
  trimEnd: boolean;
}
export interface TextVariableActionConfig {
  action: 'textVariableAction';
  tokens: string[];
  // joinOn: string;
}

export interface ACTIONS {
  tweetAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  replyTweetAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  generateCompletionAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  localPostAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  discordWebhookAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  makeTextPostOnSubreddit(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  makeLinkPostOnSubreddit(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  makeCommentOnPost(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  textCleanupAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  textVariableAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  getCurrentCoinPriceAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  getCoinPriceAtTimeStampAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
  getCoinPriceNUnitsAgoAction(actionConfig: ActionConfigType): Promise<FireActionResponse>;
}

const actionFinder = (actionName: string) => {
  switch (actionName) {
    case 'tweetAction':
      return tweetAction;
    case 'replyTweetAction':
      return replyTweetAction;
    case 'generateCompletionAction':
      return generateCompletionAction;
    case 'localPostAction':
      return localPostAction;
    case 'discordWebhookAction':
      return discordWebhookAction;
    case 'textPostOnSubreddit':
      return makeTextPostOnSubreddit;
    case 'linkPostOnSubreddit':
      return makeLinkPostOnSubreddit;
    case 'commentOnPost':
      return makeCommentOnPost;
    case 'textCleanupAction':
      return textCleanupAction;
    case 'textVariableAction':
      return textVariableAction;
    case 'getCurrentCoinPriceAction':
      return getCurrentCoinPriceAction;
    case 'getCoinPriceAtTimeStampAction':
      return getCoinPriceAtTimeStampAction;
    case 'getCoinPriceNUnitsAgoAction':
      return getCoinPriceNUnitsAgoAction;

    default:
      return undefined;
  }
};

export const wrapFireAction = async ({
  callerId,
  botId,
  actionName,
  actionConfig,
}: FireActionRequest): Promise<FireActionResponse> => {
  console.log('wrapFireAction', { callerId, botId, actionName, actionConfig });
  // fire action
  // find associated Action
  if (!actionName || actionName.length === 0)
    return { success: false, message: 'actionName is undefined' };
  const action = actionFinder(actionName);
  if (action === undefined) return { success: false, message: 'action is undefined' };
  if (!prisma) return { success: false, message: 'db not connected' };
  if (!callerId || callerId.length === 0)
    return { success: false, message: 'callerId is undefined' };
  if (!actionConfig) return { success: false, message: 'actionConfig is undefined' };

  let _response: FireActionResponse;
  // have to do this for type inference
  switch (actionConfig.action) {
    case 'tweetAction':
      if (
        !actionConfig.twitterOauthConnectorID ||
        actionConfig.twitterOauthConnectorID.length === 0
      )
        return { success: false, message: 'actionConfig.twitterOauthConnectorID is undefined' };
      if (!actionConfig.tweet || actionConfig.tweet.length === 0)
        return { success: false, message: 'actionConfig.tweet is undefined' };
      _response = await tweetAction(actionConfig);
      break;
    case 'replyTweetAction':
      if (
        !actionConfig.twitterOauthConnectorID ||
        actionConfig.twitterOauthConnectorID.length === 0
      )
        return { success: false, message: 'actionConfig.twitterOauthConnectorID is undefined' };
      if (!actionConfig.tweet || actionConfig.tweet.length === 0)
        return { success: false, message: 'actionConfig.tweet is undefined' };
      if (!actionConfig.inReplyToTweetID || actionConfig.inReplyToTweetID.length === 0)
        return { success: false, message: 'actionConfig.inReplyToTweetID is undefined' };
      _response = await replyTweetAction(actionConfig);
      break;

    case 'generateCompletionAction':
      if (!actionConfig.prompt || actionConfig.prompt.length === 0)
        return { success: false, message: 'prompt is undefined' };
      if (!actionConfig.max_tokens) return { success: false, message: 'max_tokens is undefined' };
      if (!actionConfig.temperature) return { success: false, message: 'temperature is undefined' };
      if (!actionConfig.top_p) return { success: false, message: 'top_p is undefined' };
      if (!actionConfig.openAiApiKey || actionConfig.openAiApiKey.length === 0) {
        return { success: false, message: 'openAiApiKey is undefined' };
      }
      _response = await generateCompletionAction(actionConfig, callerId);
      break;
    case 'localPostAction':
      if (!actionConfig.post_text || actionConfig.post_text.length === 0)
        return { success: false, message: 'actionConfig.post_text is undefined' };
      _response = await localPostAction(actionConfig, callerId);
      break;
    case 'discordWebhookAction':
      if (!actionConfig.webhookUrl || actionConfig.webhookUrl.length === 0)
        return { success: false, message: 'actionConfig.webhookUrl is undefined' };
      if (!actionConfig.message || actionConfig.message.length === 0)
        return { success: false, message: 'actionConfig.message is undefined' };
      _response = await discordWebhookAction(actionConfig);
      break;
    case 'textPostOnSubreddit':
      if (!actionConfig.redditOauthConnectorID || actionConfig.redditOauthConnectorID.length === 0)
        return { success: false, message: 'actionConfig.redditOauthConnectorID is undefined' };
      if (!actionConfig.subredditName || actionConfig.subredditName.length === 0)
        return { success: false, message: 'actionConfig.subredditName is undefined' };
      if (!actionConfig.title || actionConfig.title.length === 0)
        return { success: false, message: 'actionConfig.title is undefined' };
      if (!actionConfig.text || actionConfig.text.length === 0)
        return { success: false, message: 'actionConfig.text is undefined' };
      _response = await makeTextPostOnSubreddit(actionConfig);
      break;
    case 'linkPostOnSubreddit':
      if (!actionConfig.redditOauthConnectorID || actionConfig.redditOauthConnectorID.length === 0)
        return { success: false, message: 'actionConfig.redditOauthConnectorID is undefined' };
      if (!actionConfig.subredditName || actionConfig.subredditName.length === 0)
        return { success: false, message: 'actionConfig.subredditName is undefined' };
      if (!actionConfig.title || actionConfig.title.length === 0)
        return { success: false, message: 'actionConfig.title is undefined' };
      if (!actionConfig.url || actionConfig.url.length === 0)
        return { success: false, message: 'actionConfig.url is undefined' };
      _response = await makeLinkPostOnSubreddit(actionConfig);
      break;
    case 'commentOnPost':
      if (!actionConfig.redditOauthConnectorID || actionConfig.redditOauthConnectorID.length === 0)
        return { success: false, message: 'actionConfig.redditOauthConnectorID is undefined' };
      if (!actionConfig.postId || actionConfig.postId.length === 0)
        return { success: false, message: 'actionConfig.postId is undefined' };
      if (!actionConfig.text || actionConfig.text.length === 0)
        return { success: false, message: 'actionConfig.text is undefined' };
      _response = await makeCommentOnPost(actionConfig);
      break;
    case 'textCleanupAction':
      if (!actionConfig.text || actionConfig.text.length === 0)
        return { success: false, message: 'actionConfig.text is undefined' };
      if (actionConfig.removeNewLines === undefined)
        return { success: false, message: 'actionConfig.removeNewLines is undefined' };
      if (actionConfig.trimStart === undefined)
        return { success: false, message: 'actionConfig.trimStart is undefined' };
      if (actionConfig.trimEnd === undefined)
        return { success: false, message: 'actionConfig.trimEnd is undefined' };
      _response = await textCleanupAction(actionConfig);
      break;
    case 'textVariableAction':
      if (!actionConfig.tokens || actionConfig.tokens.length === 0)
        return { success: false, message: 'actionConfig.tokens is 0' };
      // if (!actionConfig.joinOn || actionConfig.joinOn.length === 0)
      // return { success: false, message: 'actionConfig.joinOn is undefined' };
      _response = await textVariableAction(actionConfig);
      break;

    case 'getCurrentCoinPriceAction':
      if (!actionConfig.coinId || actionConfig.coinId.length === 0)
        return { success: false, message: 'actionConfig.coinId is undefined' };
      if (!actionConfig.currency || actionConfig.currency.length === 0)
        return { success: false, message: 'actionConfig.currency is undefined' };
      _response = await getCurrentCoinPriceAction(actionConfig);
      break;
    case 'getCoinPriceAtTimeStampAction':
      if (!actionConfig.coinId || actionConfig.coinId.length === 0)
        return { success: false, message: 'actionConfig.coinId is undefined' };
      if (!actionConfig.currency || actionConfig.currency.length === 0)
        return { success: false, message: 'actionConfig.currency is undefined' };
      if (!actionConfig.timestamp || actionConfig.timestamp.length === 0)
        return { success: false, message: 'actionConfig.timestamp is undefined' };
      _response = await getCoinPriceAtTimeStampAction(actionConfig);
      break;
    case 'getCoinPriceNUnitsAgoAction':
      if (!actionConfig.coinId || actionConfig.coinId.length === 0)
        return { success: false, message: 'actionConfig.coinId is undefined' };
      if (!actionConfig.currency || actionConfig.currency.length === 0)
        return { success: false, message: 'actionConfig.currency is undefined' };
      if (!actionConfig.unit || actionConfig.unit.length === 0)
        return { success: false, message: 'actionConfig.unit is undefined' };
      if (!actionConfig.n || actionConfig.n.length === 0)
        return { success: false, message: 'actionConfig.units is undefined' };
      _response = await getCoinPriceNUnitsAgoAction(actionConfig);
      break;

    default:
      _response = {
        success: false,
        message: `actionConfig.action is undefined`,
      };
      break;
  }

  let actionDisplayName;
  for (const [key, value] of Object.entries(actionData)) {
    if (key === actionName) {
      actionDisplayName = value;
      break;
    }
  }
  // insert log
  try {
    await prisma.actionLog.create({
      data: {
        callerId: callerId,
        botId: botId,
        actionName: actionName,
        actionDisplayName: actionDisplayName?.label ? actionDisplayName.label : 'No Display Name!',
        actionConfig: Object.entries(actionConfig)
          .map(([key, value]) => key + '=' + value)
          .join('&'),
        success: _response.success,
        message: _response.message,
      },
    });
    return _response;
  } catch (e) {
    return { success: false, message: 'fail to create action log in db' };
  }
};

export const localPostAction = async (
  _actionConfig: LocalPostActionConfig,
  callerId: string,
): Promise<FireActionResponse> => {
  try {
    if (!prisma) return { success: false, message: 'db not connected' };
    try {
      await prisma.testPost.create({
        data: {
          text: _actionConfig.post_text,
          userId: callerId,
        },
      });
      return {
        success: true,
        message: 'success create testPost',
        actionOutput: `Post: ${_actionConfig.post_text}`,
      };
    } catch (e) {
      return { success: false, message: 'fail to create testPost' };
    }
  } catch (e) {
    console.log('localPostAction error', e);
    return { success: false, message: 'fail localPostAction' };
  }
};

export const generateCompletionAction = async (
  actionConfig: GenerateCompletionActionConfig,
  callerId: string,
): Promise<FireActionResponse> => {
  const { prompt, max_tokens, temperature, top_p, openAiApiKey } = actionConfig;
  if (!prisma) return { success: false, message: 'db not connected' };

  // check if user has hit free token quota
  const user = await prisma.user.findUnique({
    where: {
      id: callerId,
    },
  });
  if (!user) return { success: false, message: 'user not found' };

  let _apiKey = openAiApiKey;
  if (openAiApiKey === 'g0lem') {
    // 0.00002 per token
    // want to limit users to 10 cents
    const tokenCost = 0.00002;

    // just add open ai api key input, add these on profile page
    // and make one option to use free, and say limited to 10 cents.

    if (user.completionTokenUsage && user.completionTokenUsage * tokenCost >= 0.1)
      return { success: false, message: 'You have hit the free token quota' };

    // check if current request will hit quota
    console.log('C');
    if ((prompt.split('').length / 4 + Number(max_tokens)) * tokenCost >= 0.1)
      return { success: false, message: 'This request will surpass the free token quota' };

    _apiKey = process.env.OPENAI_API_KEY || '';
  }
  console.log('apiKEY', _apiKey);
  console.log('config', actionConfig);

  const _n = 1;

  const { data, error } = await OpenAiApi.generateCompletion(
    prompt,
    Number(max_tokens),
    Number(temperature),
    Number(top_p),
    _n,
    _apiKey,
  );

  try {
    await prisma.user.update({
      where: {
        id: callerId,
      },
      data: {
        completionTokenUsage: {
          increment: data?.usage?.total_tokens ? data.usage.total_tokens : 0,
        },
      },
    });

    await prisma.savedCompletions.create({
      data: {
        prompt: prompt,
        max_tokens: max_tokens.toString(),
        temperature: temperature.toString(),
        top_p: top_p.toString(),
        n: _n.toString(),
        error: error ? error : '',
        userId: callerId,
        openAiId: data ? data.id : '',
        openAiObject: data ? data.object : '',
        openAiModel: data ? data.model : '',
        openAiCreated: data ? String(data.created) : '',
        openAiUsage: data?.usage ? { create: data.usage } : undefined,
        openAiChoices: data?.choices
          ? {
              create: data.choices.map((choice: any) => {
                return {
                  text: choice.text,
                  index: String(choice.index),
                  logprobs: choice.logprobs,
                  finish_reason: choice.finish_reason,
                };
              }),
            }
          : undefined,
      },
    });
  } catch (e) {
    console.log('generateCompletionAction error', e);
    return { success: false, message: 'Error saving completion to db' };
  }

  if (error) return { success: false, message: 'generateCompletionAction error' + error };

  if (!data || !data.choices || data.choices.length === 0) {
    return { success: false, message: 'generateCompletionAction error, no data' };
  }

  return {
    success: true,
    message: 'success generating completion action',
    data: data?.choices,
    actionOutput: data?.choices[0].text,
  };
};

export const discordWebhookAction = async (
  actionConfig: DiscordWebhookActionConfig,
): Promise<FireActionResponse> => {
  const { webhookUrl, message } = actionConfig;
  try {
    // const res = await axios.post(webhookUrl, {
    //   content: message,
    // });
    try {
      const client = new WebhookClient({ url: webhookUrl });
      const res = await client.send(message);
      return {
        success: true,
        message: 'success discordWebhookAction',
        actionOutput: `${res.content}`,
      };
    } catch (e) {
      return { success: false, message: 'discordWebhookAction webhookUrl error' };
    }
  } catch (e) {
    console.log('discordWebhookAction error', e);
    return { success: false, message: 'discordWebhookAction error' };
  }
};

export const textCleanupAction = async (
  actionConfig: TextCleanupActionConfig,
): Promise<FireActionResponse> => {
  const { text } = actionConfig;
  try {
    let cleanedText = text;
    if (actionConfig.removeNewLines) cleanedText = cleanedText.replace(/(\r\n|\n|\r)/gm, '');
    if (actionConfig.trimStart) cleanedText = cleanedText.trimStart();
    if (actionConfig.trimEnd) cleanedText = cleanedText.trimEnd();

    return {
      success: true,
      message: 'success textCleanupAction',
      data: cleanedText,
      actionOutput: cleanedText,
    };
  } catch (e) {
    console.log('textCleanupAction error', e);
    return { success: false, message: 'textCleanupAction error' };
  }
};

export const textVariableAction = async (
  actionConfig: TextVariableActionConfig,
): Promise<FireActionResponse> => {
  const { tokens } = actionConfig;
  if (!tokens) return { success: false, message: 'textVariableAction error, no tokens' };
  const text = tokens as unknown as string;
  // we join this with the variables in the job stage because
  // that is where we keep track of previous outputs
  // so tokens passed here is the completed string.
  // console.log('textVariableAction', tokens, joinOn);
  // let parsedTokens = JSON.parse(tokens as unknown as string);
  // console.log('textVariableAction parsed', parsedTokens, joinOn);
  // let _tokens = parsedTokens.tokens;
  // console.log('textVariableAction _tokens', _tokens, joinOn);
  try {
    // let text = _tokens.join(joinOn);
    // console.log('textVariableAction text output', text);
    return {
      success: true,
      message: 'success textVariableAction',
      data: text,
      actionOutput: text,
    };
  } catch (e) {
    console.log('textVariableAction error', e);
    return { success: false, message: 'textVariableAction error' };
  }
};

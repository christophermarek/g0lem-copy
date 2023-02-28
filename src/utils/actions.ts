import { JobStageAction } from '@prisma/client';
import { CompleteJobStage, CompleteJobStageAction } from '../../prisma/zod';
import { JobStage } from '../react/reducers/jobStageReducer';
import { ActionConfigType, Actions } from '../server/bots/action';

export interface InputField {
  label: string;
  type: string;
  description: string;
}
export const fieldData: { [field: string]: InputField | undefined } = {
  coinId: {
    label: 'Coin ID',
    type: 'text',
    description: `Coingecko coins list link:https://api.coingecko.com/api/v3/coins/list?include_platform=false`,
  },
  currency: {
    label: 'Currency',
    type: 'text',
    description: `Coingecko supported currencies link:https://api.coingecko.com/api/v3/simple/supported_vs_currencies`,
  },
  tokens: {
    label: ' ',
    type: 'text',
    description: ``,
  },
  timestamp: {
    label: 'Timestamp',
    type: 'text',
    description: `Unix timestamp in milliseconds link:https://www.epochconverter.com/`,
  },
  n: {
    label: 'How many units ago',
    type: 'text',
    description: `if unit is hour, n = 2 means 2 hours ago, etc. if unit is day, n = 1 means 1 day ago, n = 2 means 2 days ago`,
  },
  unit: {
    label: 'Unit',
    type: 'text',
    description: `hour or day`,
  },
  openAiApiKey: {
    label: 'OpenAI API Key',
    type: 'text',
    description: `g0lem allows you 10 cents usage. Then you must set your own OpenAI API Key in your user profile`,
  },
};

// combine this and the getEmptyActionConfigForAction and merge this with the explanation for each input
// this is only used on ui but keep separate for server side calls
export const actionData: { [action: string]: InputField | undefined } = {
  tweetAction: { label: 'Send Tweet', type: 'Connectors', description: 'Send a tweet' },
  replyTweetAction: {
    label: 'Reply to Tweet',
    type: 'Connectors',
    description: 'Reply to a tweet',
  },
  generateCompletionAction: {
    label: 'Generate Completion',
    type: 'AI',
    description:
      'OpenAi davinci-003 generate completion link:https://platform.openai.com/docs/api-reference/edits/create',
  },
  discordWebhookAction: {
    label: 'Send Discord Webhook',
    type: 'Connectors',
    description: 'Send a discord webhook',
  },
  textPostOnSubreddit: {
    label: 'Text Post on Subreddit',
    type: 'Connectors',
    description: 'Post a text post on a subreddit',
  },
  linkPostOnSubreddit: {
    label: 'Link Post on Subreddit',
    type: 'Connectors',
    description: 'Post a link post on a subreddit',
  },
  commentOnPost: {
    label: 'Comment on Reddit Post',
    type: 'Connectors',
    description: 'Comment on a Reddit post',
  },
  textCleanupAction: {
    label: 'Text Cleanup',
    type: 'Text',
    description: 'Clean up output from previous stage',
  },
  textVariableAction: {
    label: 'Text Variable',
    type: 'Text',
    description: 'Combine your text with the outputs from previous stages to create one output',
  },
  getCurrentCoinPriceAction: {
    label: 'Current Coin Price',
    type: 'External',
    description: 'Get Coingecko coin price at the time of execution',
  },
  getCoinPriceAtTimeStampAction: {
    label: 'Coin Price at Timestamp',
    type: 'External',
    description: 'Get Coingecko coin price at a specific timestamp, supports up to 30 days ago',
  },
  getCoinPriceNUnitsAgoAction: {
    label: 'Coin Price N Units Ago',
    type: 'External',
    description: 'Get Coingecko coin price N units ago, supports up to 30 days ago',
  },
};
export const allActionConfigsEmpty = () => {
  const configs: Actions.ActionConfigType[] = [];
  Object.keys(actionData).map((actionName) => {
    configs.push(getEmptyActionConfigForAction(actionName));
  });

  return configs;
};

export const getEmptyActionConfigForAction = (actionName: string): ActionConfigType => {
  switch (actionName) {
    case 'tweetAction':
      return { action: 'tweetAction', tweet: '', twitterOauthConnectorID: '' };
    case 'replyTweetAction':
      return {
        action: 'replyTweetAction',
        tweet: '',
        twitterOauthConnectorID: '',
        inReplyToTweetID: '',
      };
    case 'generateCompletionAction':
      return {
        action: 'generateCompletionAction',
        prompt: '',
        max_tokens: '',
        temperature: '',
        top_p: '',
        openAiApiKey: '',
      };
    case 'localPostAction':
      return { action: 'localPostAction', post_text: '' };
    case 'discordWebhookAction':
      return { action: 'discordWebhookAction', webhookUrl: '', message: '' };
    case 'textPostOnSubreddit':
      return {
        action: 'textPostOnSubreddit',
        redditOauthConnectorID: '',
        subredditName: '',
        title: '',
        text: '',
      };
    case 'linkPostOnSubreddit':
      return {
        action: 'linkPostOnSubreddit',
        redditOauthConnectorID: '',
        subredditName: '',
        title: '',
        url: '',
      };
    case 'commentOnPost':
      return {
        action: 'commentOnPost',
        redditOauthConnectorID: '',
        postId: '',
        text: '',
      };
    case 'textCleanupAction':
      return {
        action: 'textCleanupAction',
        text: '',
        removeNewLines: true,
        trimStart: true,
        trimEnd: true,
      };
    case 'textVariableAction':
      return {
        action: 'textVariableAction',
        tokens: [],
        // joinOn: '',
      };

    case 'getCurrentCoinPriceAction':
      return {
        action: 'getCurrentCoinPriceAction',
        coinId: 'bitcoin',
        currency: 'usd',
      };
    case 'getCoinPriceAtTimeStampAction':
      return {
        action: 'getCoinPriceAtTimeStampAction',
        coinId: 'bitcoin',
        currency: 'usd',
        timestamp: '',
      };
    case 'getCoinPriceNUnitsAgoAction':
      return {
        action: 'getCoinPriceNUnitsAgoAction',
        coinId: 'bitcoin',
        currency: 'usd',
        n: '',
        unit: 'day',
      };

    default:
      return { action: 'tweetAction', tweet: '', twitterOauthConnectorID: '' };
  }
};

export const modelCost = '0.0200';

export const estimateCost = (
  action: { frontendAction: JobStage['actions'][0] } | { apiAction: CompleteJobStageAction },
  previousStage:
    | { frontendAction: JobStage | undefined }
    | { apiAction: CompleteJobStage | undefined },
) => {
  let _prompt;
  let _maxTokens;
  if ('frontendAction' in action && 'frontendAction' in previousStage) {
    const _action = action.frontendAction;
    const _previousStage = previousStage.frontendAction;

    // Prices are per 1,000 tokens. You can think of tokens as pieces of words, where 1,000 tokens is about 750 words. This paragraph is 35 tokens.
    // num_tokens(prompt) + max_tokens * max(n, best_of)
    const maxTokens = _action.inputs.find((input) => input.inputName === 'max_tokens')?.value;
    const prompt = _action.inputs.find((input) => input.inputName === 'prompt');

    if (!prompt?.value) return 0;
    if (!maxTokens) return 0;
    _maxTokens = maxTokens;
    if (!prompt.isManualInput) {
      const promptFromPreviousStage = _previousStage?.actions
        .find((action) => action.name === 'textVariableAction')
        ?.inputs.find((input) => input.inputName === 'tokens')?.value;
      if (!promptFromPreviousStage) return 0;
      // #DELIMITER#var: remove this from the prompt
      _prompt = { value: promptFromPreviousStage.replace('#DELIMITER#var:', '') };
    } else {
      _prompt = prompt;
    }
    //  $0.0200  / 1K tokens  =  0.00002 per token
    const costPerToken = Number(modelCost) / 1000;

    // a token is 4 characters
    return ((_prompt.value.split('').length / 4 + Number(maxTokens) * 1) * costPerToken).toFixed(6);
  } else if ('apiAction' in action && 'apiAction' in previousStage) {
    const _action = action.apiAction;
    const _previousStage = previousStage.apiAction;
    const maxTokens = _action.inputs.find((input) => input.name === 'max_tokens')?.inputValue;
    const prompt = _action.inputs.find((input) => input.name === 'prompt');
    _maxTokens = maxTokens;
    if (!prompt) return 0;
    if (!maxTokens) return 0;
    if (!prompt.isManualInput && _previousStage) {
      const promptFromPreviousStage = _previousStage.stageActions
        .find((action) => action.name === 'textVariableAction')
        ?.inputs.find((input) => input.name === 'tokens')?.inputValue;
      if (!promptFromPreviousStage) return 0;
      console.log('promptFromPreviousStage', promptFromPreviousStage);
      // #DELIMITER#var: remove this from the prompt
      _prompt = { value: promptFromPreviousStage.replace('#DELIMITER#var:', '') }.value;
    } else {
      _prompt = prompt.inputValue;
    }
    //  $0.0200  / 1K tokens  =  0.00002 per token
    const costPerToken = Number(modelCost) / 1000;

    // a token is 4 characters
    return ((_prompt.split('').length / 4 + Number(maxTokens) * 1) * costPerToken).toFixed(6);
  } else {
    return 0;
  }
};

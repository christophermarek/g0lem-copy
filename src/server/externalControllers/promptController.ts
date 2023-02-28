import {
  Configuration,
  CreateCompletionResponse,
  ImagesResponseDataInner,
  OpenAIApi,
} from 'openai';

export * as OpenAiApi from './promptController';
export enum PROMPT_ERRORS {
  COMPLETION_ERROR = 'NO_COMPLETION_ERROR',
  COMPLETION_FAIL = 'COMPLETION_FAIL_ERROR',
  GENERATE_IMAGE_ERROR = 'GENERATE_IMAGE_ERROR',
  INVALID_API_KEY = 'API key is invalid',
}

export interface GenerateCompletionResponse {
  data?: CreateCompletionResponse;
  error?: PROMPT_ERRORS;
}

export const testApiKey = async (apiKey: string): Promise<boolean> => {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const test = await openai.listModels();
    return true;
  } catch (error) {
    return false;
  }
};

export const generateCompletion = async (
  _prompt: string,
  _max_tokens: number,
  _temperature: number,
  _top_p: number,
  _n: number,
  apiKey: string,
): Promise<GenerateCompletionResponse> => {
  const configuration = new Configuration({
    apiKey,
  });
  try {
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: _prompt,
      temperature: Number(_temperature),
      max_tokens: Number(_max_tokens),
      top_p: Number(_top_p),
      n: Number(_n),
      // frequency_penalty: 0.0,
      // presence_penalty: 0.0,
      // stop: ['\n\n'],
    });
    completion.data.usage?.total_tokens;
    const data = completion.data;
    // return everything so we can store to db
    return { data: completion.data, error: undefined };
  } catch (e) {
    console.log(e);
    return { data: undefined, error: (PROMPT_ERRORS.INVALID_API_KEY + apiKey) as PROMPT_ERRORS };
  }
};

export enum IMAGE_SIZE_VALUES {
  '1024x1024' = '1024x1024',
  '512x512' = '512x512',
  '256x256' = '256x256',
}
export enum RESPONSE_FORMAT_VALUES {
  'url' = 'url',
  'b64_json' = 'b64_json',
}
export interface GenerateImageResponse {
  data: {
    created: number;
    urls: string[];
  };
  error?: PROMPT_ERRORS;
}
export const generateImage = async (
  _prompt: string,
  _n: number,
  _size: IMAGE_SIZE_VALUES,
  _response_format: RESPONSE_FORMAT_VALUES,
): Promise<GenerateImageResponse> => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const { data } = await openai.createImage({
      prompt: _prompt,
      n: _n,
      size: _size,
      response_format: _response_format,
    });
    const obj = {
      data: {
        created: data.created,
        urls: data.data.map((item: ImagesResponseDataInner) => (item.url ? item.url : '')),
      },
    };

    return obj;
  } catch (e) {
    return { data: { created: 0, urls: [] }, error: PROMPT_ERRORS.GENERATE_IMAGE_ERROR };
  }
};

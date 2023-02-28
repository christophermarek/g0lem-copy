import { z } from 'zod';
import { OpenAiApi } from '../../externalControllers/promptController';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const openAiRouter = createTRPCRouter({
  generateCompletion: protectedProcedure
    .input(
      z.object({
        _prompt: z.string(),
        _max_tokens: z.number(),
        _temperature: z.number(),
        _top_p: z.number(),
        _n: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      // const data = await OpenAiApi.generateCompletion(
      //   input._prompt,
      //   input._max_tokens,
      //   input._temperature,
      //   input._top_p,
      //   input._n,
      // );
      // if (data.error) {
      //   return { data: {}, success: false };
      // } else {
      //   return { data: data, success: true };
      // }
    }),
  generateImage: protectedProcedure
    .input(
      z.object({
        _prompt: z.string(),
        _n: z.number(),
        _size: z.string(),
        _response_format: z.string(),
      }),
    )

    .mutation(async ({ input }) => {
      const emptyResponse: OpenAiApi.GenerateImageResponse = {
        data: {
          created: 0,
          urls: [],
        },
      };
      if (input._size in OpenAiApi.IMAGE_SIZE_VALUES) {
        if (input._response_format in OpenAiApi.RESPONSE_FORMAT_VALUES) {
          const data = await OpenAiApi.generateImage(
            input._prompt,
            input._n,
            input._size as OpenAiApi.IMAGE_SIZE_VALUES,
            input._response_format as OpenAiApi.RESPONSE_FORMAT_VALUES,
          );

          if (data.error) {
            return { data: emptyResponse, success: false };
          } else {
            return { data: data, success: true };
          }
        } else {
          return { data: emptyResponse, success: false };
        }
      } else {
        return { data: emptyResponse, success: false };
      }
    }),
});

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import {
  getCoinGeckoCurrencies,
  getCoingeckoCoinList,
  getCurrentCoinPriceForCurrency,
} from '../../externalControllers/coingeckoController';
import { ApiReturn } from '../root';

export const marketDataRouter = createTRPCRouter({
  getCoinList: protectedProcedure.query(async (): Promise<ApiReturn<string[]>> => {
    const { success, data } = await getCoingeckoCoinList();
    if (success && data && 'coinsList' in data) {
      return { success, data: data.coinsList, message: 'Success fetching coins list' };
    } else {
      return { success, message: 'Error fetching coins list' };
    }
  }),
  getCurrencyList: protectedProcedure.query(async (): Promise<ApiReturn<string[]>> => {
    const { data } = await getCoinGeckoCurrencies();
    if (!data || !('currencies' in data))
      return { success: false, message: 'Error fetching currencies list' };

    return { success: true, data: data.currencies, message: 'Success fetching currencies list' };
  }),

  getCurrentCoinPriceForCurrency: protectedProcedure
    .input(
      z.object({
        coinId: z.string(),
        currency: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<ApiReturn<number>> => {
      if (!input.coinId || !input.currency) {
        return { success: false, message: 'Missing coinId or currency' };
      }
      const { data } = await getCoinGeckoCurrencies();
      if (!data || !('currencies' in data)) {
        return { success: false, message: 'Error fetching currencies list' };
      }
      if (!data.currencies.includes(input.currency)) {
        return { success: false, message: 'Invalid currency' };
      }
      const toCurrency = input.currency as Currency;

      const { success, data: coinPriceData } = await getCurrentCoinPriceForCurrency(
        input.coinId,
        toCurrency,
      );
      if (success && coinPriceData && 'currentCoinPriceForCurrency' in coinPriceData) {
        return {
          success,
          data: coinPriceData.currentCoinPriceForCurrency,
          message: 'Success fetching coin price',
        };
      } else {
        return { success, message: 'Error fetching coin price' };
      }
    }),
});

//1. Import coingecko-api
import CoinGecko from 'coingecko-api';
export * as CoinGeckoController from './coingeckoController';

type currentCoinPrice = Record<Currency & string, number>;
export interface CoinGeckoResponse {
  success: boolean;
  data?:
    | { coinsList: string[] }
    | { currentCoinPriceForCurrency: number }
    | { currentCoinPrice: currentCoinPrice }
    | { currencies: string[] }
    | { coinPriceAtTimeStamp: number };

  error?: string;
}
const CoinGeckoClient = new CoinGecko();

export const getCoinPriceAtTimeStamp = async (
  coinID: string,
  currency: Currency,
  timestamp: string,
): Promise<CoinGeckoResponse> => {
  const interval = 'hourly';

  // calculate how many days ago the timestamp is
  const daysAgo = Math.floor((Date.now() - Number(timestamp)) / (1000 * 60 * 60 * 24));

  const chartRange = await CoinGeckoClient.coins.fetchMarketChart(coinID, {
    vs_currency: currency,
    days: String(daysAgo),
    interval,
  });
  if (chartRange.data) {
    // prices is an array of [unix timestamp, price] pairs
    // now find the price at the hour for yesterday
    const foundPrice = chartRange.data.prices.find((price) => {
      return price[0] >= Number(timestamp);
    });
    if (foundPrice) {
      return { success: true, data: { coinPriceAtTimeStamp: Number(foundPrice[1].toFixed(2)) } };
    } else {
      return { success: false, error: 'Error fetching coin price' };
    }
  } else {
    return { success: false, error: 'Error fetching coin price' };
  }
};

export const getCurrentCoinPriceForCurrency = async (
  coinId: string,
  currency: Currency,
): Promise<CoinGeckoResponse> => {
  const { data } = await getCurrentCoinPrice(coinId);
  if (!data || !('currentCoinPrice' in data)) {
    return { success: false, error: 'Error fetching coin price' };
  }
  const price = Number(data.currentCoinPrice[currency].toFixed(2));

  return { success: true, data: { currentCoinPriceForCurrency: price } };
};

export const getCurrentCoinPrice = async (coin: string): Promise<CoinGeckoResponse> => {
  try {
    const response = await CoinGeckoClient.coins.fetch(coin, {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false,
    });
    return {
      success: true,
      data: { currentCoinPrice: response.data.market_data.current_price },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error fetching coin price',
    };
  }
};

export const getCoingeckoCoinList = async (): Promise<CoinGeckoResponse> => {
  // this will just be the list of tickers for now
  // there is no need for all of them its like 2000 coins
  //   let data = await CoinGeckoClient.coins.list();

  return {
    success: true,
    data: { coinsList: ['bitcoin', 'ethereum', 'bnb'] },
  };
};

export const getCoinGeckoCurrencies = async (): Promise<CoinGeckoResponse> => {
  return {
    success: true,
    data: { currencies: ['usd', 'eur', 'gbp', 'cad', 'sats', 'btc', 'eth'] },
  };
};

import { CoinGeckoController } from '../../../externalControllers/coingeckoController';
import { FireActionResponse } from '../../action';
import {
  GetCoinPriceAtTimeStampConfig,
  GetCoinPriceNUnitsAgoConfig,
  GetCurrentCoinPriceConfig,
} from './config';

export const getCurrentCoinPriceAction = async (
  _actionConfig: GetCurrentCoinPriceConfig,
): Promise<FireActionResponse> => {
  const price = await CoinGeckoController.getCurrentCoinPriceForCurrency(
    _actionConfig.coinId,
    _actionConfig.currency,
  );

  if (price.data && 'currentCoinPriceForCurrency' in price.data) {
    const currentPriceInCurrency = price.data.currentCoinPriceForCurrency;
    return {
      success: true,
      data: {
        currentPriceInCurrency,
      },
      actionOutput: String(currentPriceInCurrency),
      message: `Current price of ${_actionConfig.coinId} is ${currentPriceInCurrency} ${_actionConfig.currency}`,
    };
  } else {
    return {
      success: false,
      message: 'Error fetching coin price',
    };
  }
};

export const getCoinPriceAtTimeStampAction = async (
  _actionConfig: GetCoinPriceAtTimeStampConfig,
): Promise<FireActionResponse> => {
  const price = await CoinGeckoController.getCoinPriceAtTimeStamp(
    _actionConfig.coinId,
    _actionConfig.currency,
    _actionConfig.timestamp,
  );

  if (price.data && 'coinPriceAtTimeStamp' in price.data) {
    const priceAtTimeStampInCurrency = price.data.coinPriceAtTimeStamp;
    return {
      success: true,
      data: {
        priceAtTimeStampInCurrency,
      },
      actionOutput: String(priceAtTimeStampInCurrency),
      message: `Price of ${_actionConfig.coinId} at ${_actionConfig.timestamp} is ${priceAtTimeStampInCurrency} ${_actionConfig.currency}`,
    };
  } else {
    return {
      success: false,
      message: 'Error fetching coin price',
    };
  }
};

export const getCoinPriceNUnitsAgoAction = async (
  _actionConfig: GetCoinPriceNUnitsAgoConfig,
): Promise<FireActionResponse> => {
  const { n, unit } = _actionConfig;
  // 3600000 = 1 hour in milliseconds
  // 86400000 = 1 day in milliseconds
  const timestamp = new Date().getTime() - Number(n) * (unit === 'hour' ? 3600000 : 86400000);

  const price = await CoinGeckoController.getCoinPriceAtTimeStamp(
    _actionConfig.coinId,
    _actionConfig.currency,
    String(timestamp),
  );

  if (price.data && 'coinPriceAtTimeStamp' in price.data) {
    const priceNUnitsAgoInCurrency = price.data.coinPriceAtTimeStamp;
    return {
      success: true,
      data: {
        priceNUnitsAgoInCurrency,
      },
      actionOutput: String(priceNUnitsAgoInCurrency),
      message: `Price of ${_actionConfig.coinId} ${_actionConfig.n} ${_actionConfig.unit} ago is ${priceNUnitsAgoInCurrency} ${_actionConfig.currency}`,
    };
  } else {
    return {
      success: false,
      message: 'Error fetching coin price',
    };
  }
};

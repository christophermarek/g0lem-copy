export interface GetCurrentCoinPriceConfig {
  action: 'getCurrentCoinPriceAction';
  coinId: string;
  currency: Currency;
}

export interface GetCoinPriceAtTimeStampConfig {
  action: 'getCoinPriceAtTimeStampAction';
  coinId: string;
  currency: Currency;
  timestamp: string;
}

export interface GetCoinPriceNUnitsAgoConfig {
  action: 'getCoinPriceNUnitsAgoAction';
  coinId: string;
  currency: Currency;
  n: string;
  unit: unit;
}

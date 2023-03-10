type Currency =
  | 'aed'
  | 'ars'
  | 'aud'
  | 'bch'
  | 'bdt'
  | 'bhd'
  | 'bmd'
  | 'bnb'
  | 'brl'
  | 'btc'
  | 'cad'
  | 'chf'
  | 'clp'
  | 'cny'
  | 'czk'
  | 'dkk'
  | 'eos'
  | 'eth'
  | 'eur'
  | 'gbp'
  | 'hkd'
  | 'huf'
  | 'idr'
  | 'ils'
  | 'inr'
  | 'jpy'
  | 'krw'
  | 'kwd'
  | 'lkr'
  | 'ltc'
  | 'mmk'
  | 'mxn'
  | 'myr'
  | 'ngn'
  | 'nok'
  | 'nzd'
  | 'php'
  | 'pkr'
  | 'pln'
  | 'rub'
  | 'sar'
  | 'sek'
  | 'sgd'
  | 'thb'
  | 'try'
  | 'twd'
  | 'uah'
  | 'usd'
  | 'vef'
  | 'vnd'
  | 'xag'
  | 'xau'
  | 'xdr'
  | 'xlm'
  | 'xrp'
  | 'zar'
  | 'bits'
  | 'link'
  | 'sats';

const currencies = [
  'aed',
  'ars',
  'aud',
  'bch',
  'bdt',
  'bhd',
  'bmd',
  'bnb',
  'brl',
  'btc',
  'cad',
  'chf',
  'clp',
  'cny',
  'czk',
  'dkk',
  'eos',
  'eth',
  'eur',
  'gbp',
  'hkd',
  'huf',
  'idr',
  'ils',
  'inr',
  'jpy',
  'krw',
  'kwd',
  'lkr',
  'ltc',
  'mmk',
  'mxn',
  'myr',
  'ngn',
  'nok',
  'nzd',
  'php',
  'pkr',
  'pln',
  'rub',
  'sar',
  'sek',
  'sgd',
  'thb',
  'try',
  'twd',
  'uah',
  'usd',
  'vef',
  'vnd',
  'xag',
  'xau',
  'xdr',
  'xlm',
  'xrp',
  'zar',
  'bits',
  'link',
  'sats',
] as const;

type unit = 'hour' | 'day';
const units = ['hour', 'day'] as const;

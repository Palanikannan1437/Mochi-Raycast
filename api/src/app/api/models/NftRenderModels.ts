export interface ResponseIndexerNFTCollectionTickersData {
  address?: string;
  collection_image?: string;
  items?: number;
  marketplaces?: string[];
  name?: string;
  owners?: number;
  price_change_1d?: string;
  price_change_30d?: string;
  price_change_7d?: string;
  tickers?: ResponseIndexerTickers;
}

export interface ResponseIndexerTickers {
  prices?: ResponseIndexerPrice[];
  times?: string[];
  timestamps?: number[];
}

export interface ResponseIndexerPrice {
  amount?: string;
  token?: ResponseIndexerToken;
}

export interface ResponseIndexerToken {
  address?: string;
  decimals?: number;
  is_native?: boolean;
  symbol?: string;
}

export type Coin = {
  id: string
  name: string
  symbol: string
  market_cap_rank: number
  image: CoinImage
  market_data: MarketData
  tickers: TickerData[]
  description: CoinDescription
}

export type CoinPrice = {
  symbol: string
  price: string
}

export type TickerData = {
  base: string
  target: string
  last: number
  coinID: string
  target_coin_id: string
}

type MarketData = {
  current_price: { [key: string]: number }
  market_cap: { [key: string]: number }
  price_change_percentage_1h_in_currency: { [key: string]: number }
  price_change_percentage_24h_in_currency: { [key: string]: number }
  price_change_percentage_7d_in_currency: { [key: string]: number }
}

type CoinImage = {
  thumb: string
  small: string
  large: string
}

type CoinDescription = {
  en: string
}

export type CoinComparisionData = {
  times: string[]
  ratios: number[]
  base_coin: Coin
  target_coin: Coin
  base_coin_suggestions: Coin[]
  target_coin_suggestions: Coin[]
  from: string
  to: string
}

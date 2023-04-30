
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

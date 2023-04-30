export type CoinData = {
  metadata: CoinMetadata;
  data: CoinCoreData[];
}

export type CoinMetadata = {
  page: number;
  size: number;
  total: number;
}

export type CoinCoreData = {
  id: string;
  address: string;
  symbol: string;
  chain_id: string;
  discord_bot_supported: boolean;
  coin_gecko_id: string;
  name: string;
  chain: Chain;
  created_at: string;
  erc_format: string;
  is_native: boolean;
}

export type Chain = {
  id: string;
  name: string;
  short_name: string;
  coin_gecko_id: string;
  currency: string;
}

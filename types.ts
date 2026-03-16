export interface Product {
  id: string;
  name: string;
  sku: string;
  priceUsd: number;
  quantity: number;
}

export interface ExchangeRate {
  rate: number;
  lastUpdated: string;
  source: string;
}

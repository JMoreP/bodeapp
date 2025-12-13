export interface Product {
  id: string;
  name: string;
  sku: string;
  priceUsd: number;
  image: string;
  quantity: number;
}

export interface ExchangeRate {
  rate: number;
  lastUpdated: string;
  trend: number;
}

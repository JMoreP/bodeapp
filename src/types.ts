export type Category = string;

export interface Product {
  id?: string;
  name: string;
  category: Category;
  bulkCost: number;     // Costo por Bulto ($)
  unitsPerBulk: number; // Unidades por Bulto
  profitMargin: number; // % de Ganancia (ej. 0.3 para 30%)
  stock: number;        // Stock actual (Unidades)
  popularity: number;   // Contador de popularidad
  discountThreshold?: number; // Cantidad mínima para descuento
  discountRate?: number;      // % de descuento (ej. 0.05 para 5%)
}

export interface Config {
  exchangeRate: number; // Tasa del Día (Bs/$)
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export interface Debt {
  id?: string;
  clientName: string;
  amountUsd: number;
  date: number; // timestamp
}

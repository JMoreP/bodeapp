import React from 'react';
import { Product } from '../types';
import { Plus, Minus } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  exchangeRate: number;
  onQuantityChange: (id: string, delta: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  exchangeRate,
  onQuantityChange,
}) => {
  return (
    <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e0e0e0] dark:border-border-dark overflow-hidden flex flex-col shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f2f4] dark:bg-[#243420] border-b border-[#e0e0e0] dark:border-border-dark">
              <th className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold uppercase tracking-wider w-[40%]">
                Product
              </th>
              <th className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold uppercase tracking-wider w-[20%] text-right">
                Price (USD)
              </th>
              <th className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold uppercase tracking-wider w-[20%] text-center">
                Qty
              </th>
              <th className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold uppercase tracking-wider w-[20%] text-right">
                Subtotal (Bs.)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e0e0] dark:divide-border-dark">
            {products.map((product) => {
              const subtotalBs = product.priceUsd * product.quantity * exchangeRate;
              const isSelected = product.quantity > 0;

              return (
                <tr
                  key={product.id}
                  className={`group hover:bg-[#f8f9fa] dark:hover:bg-[#243420] transition-colors ${isSelected
                    ? 'bg-[#f0f9ff]/50 dark:bg-[#2c4724]/30 border-l-4 border-l-primary'
                    : 'border-l-4 border-l-transparent'
                    }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[#111418] dark:text-white font-medium text-sm">
                          {product.name}
                        </span>
                        <span className="text-text-secondary-light dark:text-[#7f9f76] text-xs">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[#111418] dark:text-[#cbd5e1] font-medium text-sm">
                      ${product.priceUsd.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onQuantityChange(product.id, -1)}
                        className="w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#2c4724] text-[#111418] dark:text-white hover:bg-[#d0d0d0] dark:hover:bg-[#3f6534] flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <input
                        className={`w-10 text-center bg-transparent font-semibold text-sm focus:outline-none ${isSelected ? 'text-[#111418] dark:text-white' : 'text-text-secondary-light dark:text-text-secondary-light'
                          }`}
                        readOnly
                        type="text"
                        value={product.quantity}
                      />
                      <button
                        onClick={() => onQuantityChange(product.id, 1)}
                        className="w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#2c4724] text-[#111418] dark:text-white hover:bg-[#d0d0d0] dark:hover:bg-[#3f6534] flex items-center justify-center transition-colors"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-bold text-sm ${isSelected
                        ? 'text-[#111418] dark:text-white'
                        : 'text-text-secondary-light dark:text-text-secondary-light'
                        }`}
                    >
                      {subtotalBs.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      Bs.
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-[#f8f9fa] dark:bg-[#20321a] border-t border-[#e0e0e0] dark:border-border-dark flex items-center justify-center">
        <button className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium hover:text-primary transition-colors">
          Load more products
        </button>
      </div>
    </div>
  );
};

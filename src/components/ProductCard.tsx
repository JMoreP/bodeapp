import React from 'react';
import { Product, Config } from '../types';

interface Props {
  product: Product;
  config: Config;
  onAdd: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ product, config, onAdd, onEdit }) => {
  const unitPriceCost = product.bulkCost / product.unitsPerBulk;
  const salePriceUsd = unitPriceCost * (1 + product.profitMargin);
  const salePriceBs = salePriceUsd * config.exchangeRate;

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className={`bg-white border-b border-slate-200 p-2 sm:p-4 flex items-center justify-between gap-1 sm:gap-4 transition-colors ${!isOutOfStock ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-90'}`}
    >
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold uppercase shrink-0 text-xs sm:text-base">
          {product.name.substring(0, 2)}
        </div>
        <div className="truncate">
          <h3 className="text-[11px] sm:text-base font-bold text-slate-800 leading-tight truncate">{product.name}</h3>
          <span className="text-[9px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide truncate block">
            {product.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
        <div className="flex flex-col text-right">
          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">USD</span>
          <span className="text-[11px] sm:text-base font-black text-slate-900">${salePriceUsd.toFixed(2)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bs</span>
          <span className="text-[10px] sm:text-sm font-bold text-emerald-600">Bs {salePriceBs.toFixed(1)}</span>
        </div>
        <div className="flex flex-col text-center min-w-[24px] sm:min-w-[60px]">
          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stock</span>
          <span className={`text-[11px] sm:text-base font-black ${product.stock > 10 ? 'text-slate-700' : 'text-red-500'}`}>
            {product.stock}
          </span>
        </div>
      </div>

      <div className="shrink-0 ml-1 sm:ml-2 flex items-center">
        {isOutOfStock ? (
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-sm transition-all bg-amber-500 hover:bg-amber-600 text-white active:scale-95 flex items-center justify-center shadow-sm"
            title="Reabastecer"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span className="hidden sm:inline ml-2">Reabastecer</span>
          </button>
        ) : (
          <button
            onClick={() => onAdd(product)}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-[11px] sm:text-sm transition-all bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-sm"
          >
            <span className="sm:hidden">Añadir</span>
            <span className="hidden sm:inline">+ Añadir</span>
          </button>
        )}
      </div>
    </div>
  );
};

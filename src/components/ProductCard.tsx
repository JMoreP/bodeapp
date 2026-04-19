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
      className={`bg-white border-b border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between transition-colors ${!isOutOfStock ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-90'}`}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold uppercase shrink-0">
          {product.name.substring(0, 2)}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 leading-tight">{product.name}</h3>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="flex gap-6 sm:ml-auto mr-6 items-center mt-3 sm:mt-0">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Precio $</span>
          <span className="text-base font-black text-slate-900">${salePriceUsd.toFixed(2)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Precio Bs</span>
          <span className="text-sm font-bold text-emerald-600">Bs {salePriceBs.toFixed(2)}</span>
        </div>
        <div className="flex flex-col text-center min-w-[60px]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stock</span>
          <span className={`text-base font-black ${product.stock > 10 ? 'text-slate-700' : 'text-red-500'}`}>
            {product.stock}
          </span>
        </div>
      </div>

      <div className="shrink-0 mt-3 sm:mt-0 flex gap-2">
        {isOutOfStock ? (
          <button
            onClick={() => onEdit(product)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all bg-amber-500 hover:bg-amber-600 text-white active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Reabastecer
          </button>
        ) : (
          <button
            onClick={() => onAdd(product)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-sm"
          >
            + Añadir
          </button>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  exchangeRate: number;
}

export const InventoryTable: React.FC<Props> = ({ products, onEdit, onDelete, exchangeRate }) => {
  return (
    <div className="space-y-1">
      {/* Vista Desktop - Tabla Compacta */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="p-3">Producto</th>
                <th className="p-3">Categoría</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-right">Costo Bulto</th>
                <th className="p-3 text-right">Unids/Bulto</th>
                <th className="p-3 text-right text-emerald-600">Profit Unit ($/Bs)</th>
                <th className="p-3 text-right text-blue-600">Profit Bulto ($/Bs)</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-xs">
              {products.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center font-bold text-slate-300">Inventario vacío</td></tr>
              ) : (
                products.map(product => {
                  const unitCost = product.bulkCost / product.unitsPerBulk;
                  const unitProfit = unitCost * product.profitMargin;
                  const bulkProfit = unitProfit * product.unitsPerBulk;
                  
                  return (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-black text-slate-900">{product.name}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-tighter">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-black ${product.stock > 10 ? 'text-slate-800' : 'text-red-500'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-500">${product.bulkCost.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-400">{product.unitsPerBulk}</td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col">
                          <span className="font-black text-emerald-600">${unitProfit.toFixed(2)}</span>
                          <span className="text-[9px] font-bold text-emerald-400">Bs. {(unitProfit * exchangeRate).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col">
                          <span className="font-black text-blue-600">${bulkProfit.toFixed(2)}</span>
                          <span className="text-[9px] font-bold text-blue-400">Bs. {(bulkProfit * exchangeRate).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => onEdit(product)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-1.5 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                          <button onClick={() => { if (window.confirm('¿Eliminar?')) if (product.id) onDelete(product.id); }} className="bg-red-50 text-red-400 hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista Mobile - Lista Ultra Compacta */}
      <div className="md:hidden space-y-1">
        {products.length === 0 ? (
          <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm text-xs font-bold uppercase">Vacío</div>
        ) : (
          products.map(product => {
            const unitCost = product.bulkCost / product.unitsPerBulk;
            const unitProfit = unitCost * product.profitMargin;
            const unitPrice = unitCost + unitProfit;

            return (
              <div key={product.id} className="bg-white px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm hover:border-blue-200 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${product.stock > 5 ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
                    <h4 className="font-black text-slate-800 text-[11px] truncate uppercase leading-tight">{product.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 ml-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{product.category}</span>
                    <span className="text-[9px] font-black text-blue-500">Unit: ${unitPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className={`text-sm font-black leading-none ${product.stock > 10 ? 'text-slate-800' : 'text-red-500'}`}>
                      {product.stock}
                    </span>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">STOCK</p>
                  </div>
                  
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(product)} className="bg-slate-50 text-slate-400 p-2 rounded-lg active:bg-blue-50 active:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onClick={() => { if (window.confirm('¿Eliminar?')) if (product.id) onDelete(product.id); }} className="bg-slate-50 text-slate-400 p-2 rounded-lg active:bg-red-50 active:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

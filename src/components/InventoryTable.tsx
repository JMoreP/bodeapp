import React from 'react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const InventoryTable: React.FC<Props> = ({ products, onEdit, onDelete }) => {
  return (
    <>
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold text-center">Stock</th>
                <th className="p-4 font-semibold text-right">Costo Bulto</th>
                <th className="p-4 font-semibold text-right">Unids/Bulto</th>
                <th className="p-4 font-semibold text-right">Costo Unidad</th>
                <th className="p-4 font-semibold text-right">Ganancia</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No hay productos registrados en el inventario.
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const unitCost = product.bulkCost / product.unitsPerBulk;
                  return (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{product.name}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-bold ${product.stock > 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4 text-right">${product.bulkCost.toFixed(2)}</td>
                      <td className="p-4 text-right">{product.unitsPerBulk}</td>
                      <td className="p-4 text-right">${unitCost.toFixed(2)}</td>
                      <td className="p-4 text-right text-emerald-600 font-semibold">
                        {(product.profitMargin * 100).toFixed(0)}%
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onEdit(product)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
                                if(product.id) onDelete(product.id);
                              }
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                          >
                            Eliminar
                          </button>
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

      <div className="md:hidden space-y-1.5">
        {products.length === 0 ? (
          <div className="p-4 text-center text-slate-400 bg-white rounded-lg border border-slate-200 text-sm">
            No hay productos registrados en el inventario.
          </div>
        ) : (
          products.map(product => {
            const unitCost = product.bulkCost / product.unitsPerBulk;
            return (
              <div key={product.id} className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-1.5 sm:gap-2">
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-[10px] sm:text-xs leading-tight truncate">{product.name}</h4>
                  <span className="text-[8px] text-slate-500 uppercase font-semibold tracking-wide truncate block">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex flex-col text-right">
                    <span className="text-[7px] text-slate-400 font-bold uppercase leading-none mb-0.5">Bulto</span>
                    <span className="text-[10px] font-black text-slate-800 leading-none">${product.bulkCost.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[7px] text-slate-400 font-bold uppercase leading-none mb-0.5">Unid</span>
                    <span className="text-[10px] font-black text-slate-800 leading-none">${unitCost.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col text-center w-7 sm:w-8">
                    <span className="text-[7px] text-slate-400 font-bold uppercase leading-none mb-0.5">Stock</span>
                    <span className={`text-[10px] font-black leading-none ${product.stock > 10 ? 'text-slate-700' : 'text-red-500'}`}>
                      {product.stock}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button 
                    onClick={() => onEdit(product)}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-1.5 rounded-md flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
                        if(product.id) onDelete(product.id);
                      }
                    }}
                    className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-md flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </>
  );
};

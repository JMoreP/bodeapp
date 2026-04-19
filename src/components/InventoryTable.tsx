import React from 'react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const InventoryTable: React.FC<Props> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
  );
};

import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Product } from '../types';

interface Props {
  onClose: () => void;
  categories: string[];
  editingProduct?: Product;
}

export const InventoryForm: React.FC<Props> = ({ onClose, categories, editingProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    bulkCost: '',
    unitsPerBulk: '',
    profitMargin: '',
    stock: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        bulkCost: editingProduct.bulkCost.toString(),
        unitsPerBulk: editingProduct.unitsPerBulk.toString(),
        profitMargin: (editingProduct.profitMargin * 100).toString(),
        stock: editingProduct.stock.toString()
      });
    }
  }, [editingProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextState = { ...prev, [name]: value };
      if (!editingProduct && name === 'unitsPerBulk' && (!prev.stock || prev.stock === prev.unitsPerBulk)) {
        nextState.stock = value;
      }
      return nextState;
    });
  };

  const handleAddBulk = () => {
    const units = parseInt(formData.unitsPerBulk) || 0;
    const currentStock = parseInt(formData.stock) || 0;
    setFormData(prev => ({
      ...prev,
      stock: (currentStock + units).toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        category: formData.category || 'General',
        bulkCost: parseFloat(formData.bulkCost) || 0,
        unitsPerBulk: parseInt(formData.unitsPerBulk) || 1,
        profitMargin: (parseFloat(formData.profitMargin) || 0) / 100,
        stock: parseInt(formData.stock) || 0,
      };

      if (editingProduct && editingProduct.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Stock y producto actualizados!');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          popularity: 0
        });
        toast.success('Producto agregado al inventario!');
      }

      onClose();
    } catch (error) {
      console.error('Error guardando producto: ', error);
      toast.error('Hubo un error guardando el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl relative max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-1 rounded-md sm:bg-transparent">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-sm sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-6 flex items-center gap-1.5 sm:gap-2 pr-6 sm:pr-0">
          {editingProduct ? (
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          ) : (
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          )}
          {editingProduct ? 'Actualizar Producto / Reabastecer' : 'Añadir Producto al Inventario'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            <div>
              <label className="block text-[11px] sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1">Nombre del Producto</label>
              <input required name="name" value={formData.name} onChange={handleChange} disabled={!!editingProduct} className={`w-full p-2 sm:p-3 text-xs sm:text-base border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black ${editingProduct ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50'}`} placeholder="Ej. Harina Pan" />
              {editingProduct && <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 block">El nombre es un identificador único y no se puede cambiar.</span>}
            </div>
            <div>
              <label className="block text-[11px] sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1">Categoría</label>
              <input required list="category-list" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 sm:p-3 text-xs sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black" placeholder="Selecciona o escribe nueva..." />
              <datalist id="category-list">
                {categories.map((cat, i) => (
                  <option key={i} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-[11px] sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1">Costo del Bulto ($)</label>
              <input required type="number" step="0.01" name="bulkCost" value={formData.bulkCost} onChange={handleChange} className="w-full p-2 sm:p-3 text-xs sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" placeholder="Costo total de la caja" />
            </div>
            <div>
              <label className="block text-[11px] sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1">Unidades por Bulto</label>
              <input required type="number" name="unitsPerBulk" value={formData.unitsPerBulk} onChange={handleChange} className="w-full p-2 sm:p-3 text-xs sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" placeholder="¿Cuántos trae?" />
            </div>
            <div>
              <label className="block text-[11px] sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1">% de Ganancia</label>
              <input required type="number" name="profitMargin" value={formData.profitMargin} onChange={handleChange} placeholder="Ej. 30 (para 30%)" className="w-full p-2 sm:p-3 text-xs sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black" />
            </div>
            <div>
              <label className="block text-[11px] sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1">Stock Actual (Físico)</label>
              <div className="flex gap-2">
                <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 sm:p-3 text-xs sm:text-base bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold" placeholder="Cantidad física actual" />
                {editingProduct && (
                  <button type="button" onClick={handleAddBulk} className="px-2 sm:px-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-colors shrink-0" title="Sumar un bulto al stock actual">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Bulto
                  </button>
                )}
              </div>
            </div>
          </div>
          <button disabled={isSubmitting} type="submit" className={`w-full mt-2 sm:mt-4 px-4 sm:px-6 py-2.5 sm:py-4 font-bold text-sm sm:text-lg rounded-lg sm:rounded-xl transition-all shadow-md sm:shadow-lg text-white ${isSubmitting ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 active:scale-95'}`}>
            {isSubmitting ? 'Guardando...' : (editingProduct ? 'Actualizar Producto y Stock' : 'Guardar Producto Nuevo')}
          </button>
        </form>
      </div>
    </div>
  );
};

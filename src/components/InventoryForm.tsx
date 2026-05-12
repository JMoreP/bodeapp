import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Product } from '../types';
import { useTenant } from '../contexts/TenantContext';

interface Props {
  onClose: () => void;
  categories: string[];
  editingProduct?: Product;
  exchangeRate: number;
  existingProducts: Product[];
}

export const InventoryForm: React.FC<Props> = ({ onClose, categories, editingProduct, exchangeRate, existingProducts }) => {
  const { tenantId } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    bulkCost: '',
    unitsPerBulk: '',
    profitMargin: '',
    stock: '',
    discountThreshold: '',
    discountRate: ''
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
        stock: editingProduct.stock.toString(),
        discountThreshold: editingProduct.discountThreshold?.toString() || '',
        discountRate: editingProduct.discountRate ? (editingProduct.discountRate * 100).toString() : ''
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

  const preview = useMemo(() => {
    const bulkCost = parseFloat(formData.bulkCost) || 0;
    const unitsPerBulk = parseInt(formData.unitsPerBulk) || 1;
    const margin = (parseFloat(formData.profitMargin) || 0) / 100;

    const unitCost = bulkCost / unitsPerBulk;
    const unitProfit = unitCost * margin;
    const unitPrice = unitCost + unitProfit;

    return {
      unitPriceUsd: unitPrice,
      unitPriceBs: unitPrice * exchangeRate
    };
  }, [formData, exchangeRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !tenantId) return;

    const nameExists = existingProducts.some(p =>
      p.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
      p.id !== editingProduct?.id
    );

    if (nameExists) {
      toast.error('Ya existe un producto con ese nombre.');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category.trim() || 'General',
        bulkCost: parseFloat(formData.bulkCost) || 0,
        unitsPerBulk: parseInt(formData.unitsPerBulk) || 1,
        profitMargin: (parseFloat(formData.profitMargin) || 0) / 100,
        stock: parseInt(formData.stock) || 0,
        discountThreshold: formData.discountThreshold ? parseInt(formData.discountThreshold) : null,
        discountRate: formData.discountRate ? (parseFloat(formData.discountRate) / 100) : null
      };

      if (editingProduct && editingProduct.id) {
        await updateDoc(doc(db, 'tenants', tenantId, 'products', editingProduct.id), productData);
        toast.success('¡Producto actualizado!');
      } else {
        await addDoc(collection(db, 'tenants', tenantId, 'products'), { ...productData, popularity: 0 });
        toast.success('¡Producto registrado!');
      }
      onClose();
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-2xl relative max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-xl sm:text-2xl font-black text-black mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          {editingProduct ? 'Editar Producto' : 'Añadir al Inventario'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1.5 ml-1">Nombre del Producto</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="Harina Pan..." />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1.5 ml-1">Categoría</label>
              <input required list="category-list" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="Ej. Víveres" />
              <datalist id="category-list">
                {categories.map((cat, i) => <option key={i} value={cat} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1.5 ml-1">Unids por Bulto</label>
              <input required type="number" name="unitsPerBulk" value={formData.unitsPerBulk} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="¿Cuántas trae el bulto?" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1.5 ml-1">Costo Bulto ($)</label>
              <input required type="number" step="0.01" name="bulkCost" value={formData.bulkCost} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1.5 ml-1">Stock Actual (Físico)</label>
              <div className="flex gap-2">
                <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" />
                {editingProduct && (
                  <button type="button" onClick={handleAddBulk} className="px-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase transition-transform active:scale-95 shadow-sm">+Bulto</button>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 ml-1">% Ganancia</label>
              <input required type="number" name="profitMargin" value={formData.profitMargin} onChange={handleChange} className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-sm font-black text-emerald-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all" />
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
              <div className="col-span-2">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Ofertas por Volumen</h4>
              </div>
              <div>
                <label className="block text-[9px] font-black text-black uppercase tracking-wider mb-1 ml-1">A partir de (unid)</label>
                <input type="number" name="discountThreshold" value={formData.discountThreshold} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="Ej. 6" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-black uppercase tracking-wider mb-1 ml-1">% Descuento</label>
                <input type="number" name="discountRate" value={formData.discountRate} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="Ej. 10" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 shadow-sm text-center">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Precio Venta $</p>
              <p className="text-2xl font-black text-black">${preview.unitPriceUsd.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100 shadow-sm text-center">
              <p className="text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Precio Venta Bs</p>
              <p className="text-2xl font-black text-black">Bs. {preview.unitPriceBs.toFixed(1)}</p>
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-xl text-white mt-4 ${isSubmitting ? 'bg-slate-400' : 'bg-black hover:bg-slate-900 active:scale-95'}`}>
            {isSubmitting ? 'Guardando...' : (editingProduct ? 'Confirmar Cambios' : 'Registrar Producto')}
          </button>
        </form>
      </div>
    </div>
  );
};

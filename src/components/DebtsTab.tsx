import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Debt, Config, Product } from '../types';

interface Props {
  config: Config;
  products: Product[];
}

export const DebtsTab: React.FC<Props> = ({ config, products }) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newClient, setNewClient] = useState('');
  const [newAmountUsd, setNewAmountUsd] = useState('');
  const [newAmountBs, setNewAmountBs] = useState('');
  const [paidAmountUsd, setPaidAmountUsd] = useState('');
  
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const [abonoModal, setAbonoModal] = useState<{ isOpen: boolean, debt: Debt | null }>({ isOpen: false, debt: null });
  const [abonoAmountUsd, setAbonoAmountUsd] = useState('');
  const [abonoAmountBs, setAbonoAmountBs] = useState('');

  const [addDebtModal, setAddDebtModal] = useState<{ isOpen: boolean, debt: Debt | null }>({ isOpen: false, debt: null });
  const [extraAmountUsd, setExtraAmountUsd] = useState('');
  const [extraAmountBs, setExtraAmountBs] = useState('');

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, debtId: string | null }>({ isOpen: false, debtId: null });
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'debts'), (snap) => {
      const data: Debt[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Debt));
      data.sort((a, b) => b.date - a.date);
      setDebts(data);
    });
    return () => unsub();
  }, []);

  const existingClients = useMemo(() => {
    const names = new Set(debts.map(d => d.clientName));
    return Array.from(names);
  }, [debts]);

  const handleAddUsdChange = (val: string, setter: (v: string) => void, setterBs: (v: string) => void) => {
    setter(val);
    if (!val) { setterBs(''); return; }
    const num = parseFloat(val);
    if (!isNaN(num)) setterBs((num * config.exchangeRate).toFixed(2));
  };

  const handleAddBsChange = (val: string, setter: (v: string) => void, setterUsd: (v: string) => void) => {
    setter(val);
    if (!val) { setterUsd(''); return; }
    const num = parseFloat(val);
    if (!isNaN(num)) setterUsd((num / config.exchangeRate).toFixed(2));
  };

  const handleProductSelect = (product: Product, setterUsd: (v: string) => void, setterBs: (v: string) => void) => {
    const unitCost = product.bulkCost / product.unitsPerBulk;
    const salePrice = unitCost * (1 + product.profitMargin);
    setterUsd(salePrice.toFixed(2));
    setterBs((salePrice * config.exchangeRate).toFixed(2));
  };

  const filteredProducts = (queryStr: string) => {
    if (!queryStr.trim()) return [];
    return products.filter(p => p.name.toLowerCase().includes(queryStr.toLowerCase())).slice(0, 5);
  };

  const finalNewDebtUsd = useMemo(() => {
    const total = parseFloat(newAmountUsd) || 0;
    const paid = parseFloat(paidAmountUsd) || 0;
    return Math.max(0, total - paid);
  }, [newAmountUsd, paidAmountUsd]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || finalNewDebtUsd <= 0) return toast.error('Datos incompletos');
    
    try {
      const existingDebt = debts.find(d => d.clientName.toLowerCase().trim() === newClient.toLowerCase().trim());

      if (existingDebt) {
        const newTotal = existingDebt.amountUsd + finalNewDebtUsd;
        await updateDoc(doc(db, 'debts', existingDebt.id!), { 
          amountUsd: newTotal,
          date: Date.now()
        });
        toast.success(`Añadido a la cuenta de ${existingDebt.clientName}`);
      } else {
        await addDoc(collection(db, 'debts'), {
          clientName: newClient.trim(),
          amountUsd: finalNewDebtUsd,
          date: Date.now()
        });
        toast.success('Nueva deuda registrada');
      }

      setNewClient('');
      setNewAmountUsd('');
      setNewAmountBs('');
      setPaidAmountUsd('');
      setProductSearchQuery('');
    } catch (err) {
      toast.error('Error al registrar');
    }
  };

  const confirmExtraDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDebtModal.debt) return;
    const amount = parseFloat(extraAmountUsd);
    if (isNaN(amount) || amount <= 0) return toast.error('Monto inválido');
    
    try {
      const newTotal = addDebtModal.debt.amountUsd + amount;
      await updateDoc(doc(db, 'debts', addDebtModal.debt.id!), { 
        amountUsd: newTotal,
        date: Date.now()
      });
      toast.success(`+ $${amount.toFixed(2)}`);
      setAddDebtModal({ isOpen: false, debt: null });
      setExtraAmountUsd('');
      setExtraAmountBs('');
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const openAbonoModal = (debt: Debt) => {
    setAbonoModal({ isOpen: true, debt });
    setAbonoAmountUsd('');
    setAbonoAmountBs('');
  };

  const handleAbonoUsdChange = (val: string) => {
    setAbonoAmountUsd(val);
    if (!val) { setAbonoAmountBs(''); return; }
    const num = parseFloat(val);
    if (!isNaN(num)) setAbonoAmountBs((num * config.exchangeRate).toFixed(2));
  };

  const handleAbonoBsChange = (val: string) => {
    setAbonoAmountBs(val);
    if (!val) { setAbonoAmountUsd(''); return; }
    const num = parseFloat(val);
    if (!isNaN(num)) setAbonoAmountUsd((num / config.exchangeRate).toFixed(2));
  };

  const confirmAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abonoModal.debt) return;
    const amount = parseFloat(abonoAmountUsd);
    if (isNaN(amount) || amount <= 0) return toast.error('Monto inválido');
    const debt = abonoModal.debt;
    const newTotal = debt.amountUsd - amount;
    try {
      if (newTotal <= 0) {
        await deleteDoc(doc(db, 'debts', debt.id!));
        toast.success(`Deuda de ${debt.clientName} saldada`);
      } else {
        await updateDoc(doc(db, 'debts', debt.id!), { amountUsd: newTotal });
        toast.success(`Abono: -$${amount.toFixed(2)}`);
      }
      setAbonoModal({ isOpen: false, debt: null });
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.debtId) return;
    try {
      await deleteDoc(doc(db, 'debts', deleteModal.debtId));
      toast.success('Deuda eliminada');
    } catch (err) {
      toast.error('Error al eliminar');
    } finally {
      setDeleteModal({ isOpen: false, debtId: null });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3 pb-8 px-1">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-lg font-black text-slate-900">Deudas</h2>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cuentas por cobrar</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-red-600">${debts.reduce((acc, d) => acc + d.amountUsd, 0).toFixed(2)}</span>
          <p className="text-[8px] font-black text-slate-400 uppercase">Total</p>
        </div>
      </div>

      {/* Formulario Ultra Compacto */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] font-black text-black uppercase tracking-widest mb-1 ml-0.5">Cliente</label>
              <input 
                type="text" list="clients-list" placeholder="Nombre..." 
                value={newClient} onChange={e => setNewClient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-black font-bold text-xs outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
              <datalist id="clients-list">
                {existingClients.map(name => <option key={name} value={name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-[8px] font-black text-black uppercase tracking-widest mb-1 ml-0.5">Producto (Auto)</label>
              <input 
                type="text" placeholder="Buscar..." 
                value={productSearchQuery} onChange={e => setProductSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-black font-bold text-xs outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 grid grid-cols-2 gap-1.5">
              <input 
                type="number" step="0.01" placeholder="Monto $"
                value={newAmountUsd}
                onChange={e => handleAddUsdChange(e.target.value, setNewAmountUsd, setNewAmountBs)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-black font-black text-xs outline-none"
                required
              />
              <input 
                type="number" step="0.01" placeholder="Monto Bs"
                value={newAmountBs}
                onChange={e => handleAddBsChange(e.target.value, setNewAmountBs, setNewAmountUsd)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-black font-bold text-xs outline-none"
                required
              />
            </div>
            <input 
              type="number" step="0.01" placeholder="Abono $"
              value={paidAmountUsd} onChange={e => setPaidAmountUsd(e.target.value)}
              className="w-full px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 font-black text-xs outline-none"
            />
          </div>

          <button type="submit" className="w-full bg-black text-white py-2 rounded-lg font-black text-xs transition-all active:scale-95 shadow-sm">
            Registrar Deuda
          </button>
        </form>
      </div>

      {/* Lista de Deudas Ultra Compacta */}
      <div className="space-y-1">
        {debts.length === 0 ? (
          <div className="p-10 text-center text-slate-300 bg-white rounded-xl border border-slate-100 font-black text-[10px] uppercase">Sin deudas</div>
        ) : (
          debts.map(debt => (
            <div key={debt.id} className="bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between gap-3 hover:border-blue-200 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 text-[11px] truncate uppercase leading-tight">{debt.clientName}</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(debt.date).toLocaleDateString()}</p>
              </div>
              
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-red-600 leading-none">${debt.amountUsd.toFixed(2)}</p>
                <p className="text-[7px] font-black text-slate-400 mt-0.5">Bs. {(debt.amountUsd * config.exchangeRate).toFixed(0)}</p>
              </div>

              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={() => { setAddDebtModal({ isOpen: true, debt }); setExtraAmountUsd(''); setExtraAmountBs(''); }}
                  className="bg-blue-50 text-blue-600 w-7 h-7 rounded-md flex items-center justify-center active:scale-95 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                </button>
                <button 
                  onClick={() => openAbonoModal(debt)}
                  className="bg-emerald-50 text-emerald-600 px-2 h-7 rounded-md font-black text-[9px] uppercase active:scale-95 transition-colors"
                >
                  Abonar
                </button>
                <button 
                  onClick={() => { setDeleteModal({ isOpen: true, debtId: debt.id! }); }}
                  className="bg-slate-50 text-slate-400 hover:text-red-500 w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modales Compactos */}
      {addDebtModal.isOpen && addDebtModal.debt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-5 rounded-xl shadow-2xl border border-slate-100 w-full max-w-xs relative">
            <h3 className="text-sm font-black text-slate-900 mb-1">Añadir Deuda</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-4">{addDebtModal.debt.clientName}</p>
            <form onSubmit={confirmExtraDebt} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.01" placeholder="USD" value={extraAmountUsd} onChange={e => handleAddUsdChange(e.target.value, setExtraAmountUsd, setExtraAmountBs)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-black outline-none" required autoFocus />
                <input type="number" step="0.01" placeholder="Bs" value={extraAmountBs} onChange={e => handleAddBsChange(e.target.value, setExtraAmountBs, setExtraAmountUsd)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-black outline-none" required />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddDebtModal({ isOpen: false, debt: null })} className="flex-1 py-2 bg-slate-100 text-slate-500 font-black rounded-lg text-[10px] uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-black rounded-lg text-[10px] uppercase shadow-md">Sumar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {abonoModal.isOpen && abonoModal.debt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-5 rounded-xl shadow-2xl border border-slate-100 w-full max-w-xs relative">
            <h3 className="text-sm font-black text-slate-900 mb-1">Abonar</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-3">{abonoModal.debt.clientName}</p>
            <div className="bg-red-50 p-3 rounded-lg mb-4 text-center">
              <span className="text-xl font-black text-red-600">${abonoModal.debt.amountUsd.toFixed(2)}</span>
            </div>
            <form onSubmit={confirmAbono} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.01" placeholder="USD" value={abonoAmountUsd} onChange={e => handleAbonoUsdChange(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-black outline-none" required autoFocus />
                <input type="number" step="0.01" placeholder="Bs" value={abonoAmountBs} onChange={e => handleAbonoBsChange(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-black outline-none" required />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAbonoModal({ isOpen: false, debt: null })} className="flex-1 py-2 bg-slate-100 text-slate-500 font-black rounded-lg text-[10px] uppercase">Cerrar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white font-black rounded-lg text-[10px] uppercase shadow-md">Pagar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-slate-100 w-full max-w-xs text-center">
            <h3 className="text-sm font-black text-slate-900 mb-2">¿Eliminar?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteModal({ isOpen: false, debtId: null })} className="flex-1 py-2 bg-slate-100 text-slate-500 font-black rounded-lg text-[10px] uppercase">No</button>
              <button onClick={confirmDelete} className="flex-1 py-2 bg-red-500 text-white font-black rounded-lg text-[10px] uppercase shadow-md">Sí</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

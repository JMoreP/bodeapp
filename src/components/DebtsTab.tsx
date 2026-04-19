import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Debt, Config } from '../types';

export const DebtsTab: React.FC<{ config: Config }> = ({ config }) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newClient, setNewClient] = useState('');
  const [newAmountUsd, setNewAmountUsd] = useState('');
  const [newAmountBs, setNewAmountBs] = useState('');

  const [abonoModal, setAbonoModal] = useState<{ isOpen: boolean, debt: Debt | null }>({ isOpen: false, debt: null });
  const [abonoAmountUsd, setAbonoAmountUsd] = useState('');
  const [abonoAmountBs, setAbonoAmountBs] = useState('');

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

  const handleAddUsdChange = (val: string) => {
    setNewAmountUsd(val);
    if (!val) { setNewAmountBs(''); return; }
    const num = parseFloat(val);
    if (!isNaN(num)) setNewAmountBs((num * config.exchangeRate).toFixed(2));
  };

  const handleAddBsChange = (val: string) => {
    setNewAmountBs(val);
    if (!val) { setNewAmountUsd(''); return; }
    const num = parseFloat(val);
    if (!isNaN(num)) setNewAmountUsd((num / config.exchangeRate).toFixed(2));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newAmountUsd) return;
    
    try {
      await addDoc(collection(db, 'debts'), {
        clientName: newClient,
        amountUsd: parseFloat(newAmountUsd),
        date: Date.now()
      });
      setNewClient('');
      setNewAmountUsd('');
      setNewAmountBs('');
      toast.success('Deuda registrada');
    } catch (err) {
      toast.error('Error al registrar');
    }
  };

  const openAbonoModal = (debt: Debt) => {
    setAbonoModal({ isOpen: true, debt });
    setAbonoAmountUsd('');
    setAbonoAmountBs('');
  };

  const closeAbonoModal = () => {
    setAbonoModal({ isOpen: false, debt: null });
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
        toast.success(`¡Deuda de ${debt.clientName} saldada!`);
      } else {
        await updateDoc(doc(db, 'debts', debt.id!), { amountUsd: newTotal });
        toast.success(`Abono registrado. Resta: $${newTotal.toFixed(2)}`);
      }
      closeAbonoModal();
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, debtId: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.debtId) return;
    
    try {
      await deleteDoc(doc(db, 'debts', deleteModal.debtId));
      toast.success('Deuda eliminada permanentemente');
    } catch (err) {
      toast.error('Error al eliminar');
    } finally {
      setDeleteModal({ isOpen: false, debtId: null });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-300 relative">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-800">Deudas / Fiados</h2>
        <p className="text-sm text-slate-500">Gestión de clientes pendientes por pagar</p>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Registrar Nueva Deuda</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            placeholder="Nombre del Cliente" 
            value={newClient}
            onChange={e => setNewClient(e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex gap-2">
            <div className="relative w-24">
              <span className="absolute left-2 top-2 text-xs font-bold text-slate-400">$</span>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={newAmountUsd}
                onChange={e => handleAddUsdChange(e.target.value)}
                className="w-full p-2 pl-5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="relative w-28">
              <span className="absolute left-2 top-2 text-xs font-bold text-slate-400">Bs</span>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={newAmountBs}
                onChange={e => handleAddBsChange(e.target.value)}
                className="w-full p-2 pl-7 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-3 sm:px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm">
              Añadir
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        {debts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-sm">
            No hay deudas pendientes.
          </div>
        ) : (
          debts.map(debt => {
            const amountBs = debt.amountUsd * config.exchangeRate;
            return (
              <div key={debt.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{debt.clientName}</h4>
                  <span className="text-[10px] sm:text-xs text-slate-500">{new Date(debt.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-col text-right shrink-0">
                  <span className="font-black text-red-500 text-sm sm:text-base leading-none">${debt.amountUsd.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">Bs. {amountBs.toFixed(2)}</span>
                </div>

                <div className="flex gap-1.5 shrink-0 ml-1 sm:ml-2">
                  <button 
                    onClick={() => openAbonoModal(debt)}
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1.5 sm:p-2 rounded-lg font-bold text-[10px] sm:text-xs transition-colors h-full flex items-center justify-center"
                    title="Abonar / Pagar"
                  >
                    Abonar
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(debt.id!)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center"
                    title="Eliminar registro"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {abonoModal.isOpen && abonoModal.debt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm relative animate-in zoom-in duration-200">
            <button onClick={closeAbonoModal} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-1 rounded-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-lg font-black text-slate-800 mb-1">Abonar a cuenta</h3>
            <p className="text-sm font-semibold text-slate-500 mb-4 truncate">Cliente: <span className="text-blue-600">{abonoModal.debt.clientName}</span></p>
            
            <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 mb-1">Deuda actual:</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-black text-red-500">${abonoModal.debt.amountUsd.toFixed(2)}</span>
                <span className="text-sm font-bold text-slate-400">Bs. {(abonoModal.debt.amountUsd * config.exchangeRate).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={confirmAbono} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto a abonar:</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">$</span>
                    <input 
                      type="number" step="0.01" placeholder="USD" 
                      value={abonoAmountUsd} onChange={e => handleAbonoUsdChange(e.target.value)}
                      className="w-full p-2.5 pl-7 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      required
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Bs</span>
                    <input 
                      type="number" step="0.01" placeholder="Bs" 
                      value={abonoAmountBs} onChange={e => handleAbonoBsChange(e.target.value)}
                      className="w-full p-2.5 pl-8 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-md transition-all active:scale-95 text-sm">
                Confirmar Abono
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm relative animate-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 text-center mb-2">¿Eliminar Deuda?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Esta acción no se puede deshacer. El registro del fiado se borrará permanentemente de la base de datos.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, debtId: null })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md shadow-red-200 transition-all active:scale-95 text-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Toaster, toast } from 'react-hot-toast';
import { ProductCard } from './ProductCard';
import { InventoryForm } from './InventoryForm';
import { InventoryTable } from './InventoryTable';
import { DebtsTab } from './DebtsTab';
import { useCart } from '../hooks/useCart';
import { Product, Config } from '../types';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<Config>({ exchangeRate: 36.5 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'debts'>('sales');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [manualRate, setManualRate] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { cartItems, addToCart, removeFromCart, updateQuantity, totals, finalizeSale, clearCart } = useCart(config);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = query 
      ? products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
      : [...products].sort((a, b) => b.popularity - a.popularity);
    return result;
  }, [products, searchQuery]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (except for specific cases)
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      // Global Shortcuts
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === '1') { setActiveTab('sales'); return; }
      if (e.key === '2') { setActiveTab('inventory'); return; }
      if (e.key === '3') { setActiveTab('debts'); return; }

      if (activeTab === 'sales') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
            addToCart(filteredProducts[selectedIndex]);
            setSearchQuery('');
            searchInputRef.current?.blur();
          } else if (filteredProducts.length > 0 && searchQuery) {
            addToCart(filteredProducts[0]);
            setSearchQuery('');
            searchInputRef.current?.blur();
          } else if (cartItems.length > 0 && !searchQuery) {
            finalizeSale();
          }
          return;
        }
        if (e.key === 'Escape') {
          if (isInput) {
            setSearchQuery('');
            searchInputRef.current?.blur();
          } else {
            clearCart();
          }
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (isInput) searchInputRef.current?.blur();
          setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          return;
        }
        if ((e.key === '+' || e.key === ' ') && (selectedIndex >= 0 || !isInput)) {
          e.preventDefault();
          const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
          if (filteredProducts[targetIndex]) {
            addToCart(filteredProducts[targetIndex]);
            if (isInput) {
              setSearchQuery('');
              searchInputRef.current?.blur();
            }
          }
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cartItems, filteredProducts, selectedIndex, finalizeSale, clearCart, addToCart]);

  const inventoryProducts = useMemo(() => {
    let filtered = products;
    if (inventoryCategoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === inventoryCategoryFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }
    return filtered;
  }, [products, inventoryCategoryFilter, searchQuery]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats);
  }, [products]);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
    });

    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Config;
        setConfig(prev => ({ ...prev, ...data }));
        setManualRate(data.exchangeRate.toString());
      }
    });

    fetchOfficialRate(false);

    return () => {
      unsubscribeProducts();
      unsubscribeConfig();
    };
  }, []);

  const fetchOfficialRate = async (forceUpdate = true) => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares');
      const data = await response.json();
      const officialRate = data.find((item: any) => item.fuente === 'oficial');

      if (officialRate) {
        if (forceUpdate) {
          setConfig(prev => ({ ...prev, exchangeRate: officialRate.promedio }));
          setManualRate(officialRate.promedio.toString());
          await setDoc(doc(db, 'config', 'global'), { exchangeRate: officialRate.promedio }, { merge: true });
          toast.success(`Tasa actualizada: Bs. ${officialRate.promedio}`);
        }
      }
    } catch (error) {
      console.error('Error fetching BCV rate:', error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  const handleSaveManualRate = async () => {
    const rate = parseFloat(manualRate);
    if (!isNaN(rate) && rate > 0) {
      setConfig(prev => ({ ...prev, exchangeRate: rate }));
      await setDoc(doc(db, 'config', 'global'), { exchangeRate: rate }, { merge: true });
      setIsEditingRate(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowInventoryModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error eliminando el producto');
    }
  };

  const handleCloseModal = () => {
    setShowInventoryModal(false);
    setEditingProduct(undefined);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-display overflow-hidden select-none">
      <Toaster position="bottom-right" toastOptions={{ className: 'text-sm font-bold shadow-xl rounded-xl', duration: 4000 }} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                B
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight hidden lg:block">BodegaApp</h1>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <button onClick={() => { setActiveTab('sales'); setSearchQuery(''); }} className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ventas</button>
              <button onClick={() => { setActiveTab('inventory'); setSearchQuery(''); }} className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Inventario</button>
              <button onClick={() => { setActiveTab('debts'); setSearchQuery(''); }} className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'debts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Deudas</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tasa Dólar</span>
              <div className="flex items-center gap-1.5">
                {isEditingRate ? (
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.01" value={manualRate} onChange={(e) => setManualRate(e.target.value)} className="w-20 p-1 border border-slate-300 rounded text-sm text-slate-800 outline-none" />
                    <button onClick={handleSaveManualRate} className="text-emerald-600 bg-emerald-50 p-1 rounded hover:bg-emerald-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></button>
                    <button onClick={() => setIsEditingRate(false)} className="text-slate-400 hover:text-red-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                  </div>
                ) : (
                  <>
                    {isLoadingRate ? (
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-emerald-600 font-black cursor-pointer hover:underline" onClick={() => { setManualRate(config.exchangeRate.toString()); setIsEditingRate(true); }}>Bs. {config.exchangeRate.toFixed(2)}</span>
                    )}
                    <button onClick={() => fetchOfficialRate(true)} className="text-slate-400 hover:text-emerald-600 transition-colors ml-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></button>
                  </>
                )}
              </div>
            </div>

            {activeTab === 'inventory' && (
              <button onClick={() => setShowInventoryModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                <span>Añadir</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'sales' ? (
            <>
              <div className="p-3 sm:p-6 pb-2 sticky top-0 z-20 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200/50">
                <div className="relative max-w-2xl mx-auto">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar producto... (Presiona /)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 sm:p-4 pl-10 sm:pl-12 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm text-sm sm:text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900"
                  />
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 pb-24 md:pb-6">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto mt-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      config={config} 
                      onAdd={addToCart} 
                      onEdit={handleEditClick}
                      isSelected={index === selectedIndex}
                    />
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-16 text-center text-slate-400">
                      <p className="font-bold">No se encontraron productos.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activeTab === 'inventory' ? (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
              <div className="p-4 md:p-6 pb-3 sticky top-0 z-20 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Inventario General</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control de Stock y Precios</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        placeholder="Buscar en inventario..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 text-slate-800 text-sm rounded-xl shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold"
                      />
                      <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <select
                      value={inventoryCategoryFilter}
                      onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-blue-500 p-2.5 outline-none font-black cursor-pointer shadow-sm"
                    >
                      <option value="All">Todas</option>
                      {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-4 pb-24 md:pb-6">
                <InventoryTable
                  products={inventoryProducts}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteProduct}
                  exchangeRate={config.exchangeRate}
                />
              </div>
            </div>
          ) : activeTab === 'debts' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
              <DebtsTab config={config} products={products} />
            </div>
          ) : null}
        </div>
      </div>

      {showInventoryModal && (
        <InventoryForm
          onClose={handleCloseModal}
          categories={uniqueCategories}
          editingProduct={editingProduct}
          exchangeRate={config.exchangeRate}
          existingProducts={products}
        />
      )}

      {activeTab === 'sales' && (
        <div className="w-full md:w-80 bg-white border-l border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col z-40 absolute bottom-0 md:relative md:h-screen max-h-[38vh] md:max-h-screen rounded-t-2xl md:rounded-none md:mt-4">
          <div className="p-2 sm:p-3 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
            <div className="leading-tight">
              <h2 className="text-xs font-black text-slate-900">CUENTA CLIENTE</h2>
              <p className="text-[8px] text-slate-900 font-black uppercase tracking-tight">{cartItems.length} PROD.</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-slate-900">${totals.totalUsd.toFixed(2)}</span>
              <p className="text-[9px] font-bold text-emerald-600">Bs. {totals.totalBs.toFixed(0)}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 bg-slate-50/30">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-6">
                <svg className="w-6 h-6 mb-1 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p className="text-[8px] font-black uppercase tracking-widest">Vacío</p>
              </div>
            ) : (
              cartItems.map(item => {
                const hasDiscount = item.discountThreshold && item.cartQuantity >= item.discountThreshold;
                const appliedRate = hasDiscount ? (item.discountRate || 0) : 0;
                const itemUsd = (item.bulkCost / item.unitsPerBulk) * (1 + item.profitMargin) * item.cartQuantity * (1 - appliedRate);
                const itemBs = itemUsd * config.exchangeRate;
                return (
                  <div key={item.id} className="bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-1.5">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-[9px] truncate uppercase leading-none">{item.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <button onClick={() => updateQuantity(item.id!, item.cartQuantity - 1)} className="w-4 h-4 bg-slate-100 rounded-md flex items-center justify-center text-black font-black text-[8px]">-</button>
                        <span className="font-black text-[9px] w-3 text-center text-black">{item.cartQuantity}</span>
                        <button onClick={() => updateQuantity(item.id!, item.cartQuantity + 1)} className="w-4 h-4 bg-slate-100 rounded-md flex items-center justify-center text-black font-black text-[8px]">+</button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col text-right px-1 border-l border-slate-50 min-w-[50px]">
                      <p className="text-[10px] font-black text-slate-900 leading-none">${itemUsd.toFixed(2)}</p>
                      <p className="text-[7px] font-bold text-emerald-600">Bs. {itemBs.toFixed(0)}</p>
                    </div>

                    <button onClick={() => removeFromCart(item.id!)} className="w-6 h-6 flex items-center justify-center text-slate-200 hover:text-red-500 transition-colors shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2 bg-white border-t border-slate-100 shrink-0">
            <button onClick={() => finalizeSale()} disabled={cartItems.length === 0} className={`w-full py-2.5 rounded-lg font-black text-xs transition-all ${cartItems.length === 0 ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg active:scale-95'}`}>Finalizar Venta</button>
            {cartItems.length > 0 && <button onClick={clearCart} className="w-full mt-1.5 text-slate-400 hover:text-slate-600 font-bold text-[8px] uppercase tracking-widest">Vaciar</button>}
          </div>
        </div>
      )}
    </div>
  );
};

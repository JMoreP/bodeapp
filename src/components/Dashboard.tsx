import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ProductCard } from './ProductCard';
import { InventoryForm } from './InventoryForm';
import { InventoryTable } from './InventoryTable';
import { useCart } from '../hooks/useCart';
import { Product, Config } from '../types';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<Config>({ exchangeRate: 36.5, discountRate: 0.05 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [manualRate, setManualRate] = useState('');
  
  const { cartItems, addToCart, removeFromCart, updateQuantity, totals, finalizeSale, clearCart } = useCart(config);

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

    // Solo buscar si no hay tasa configurada inicialmente
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
          alert(`Tasa actualizada desde el BCV: Bs. ${officialRate.promedio}`);
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

  // Filtrado de Ventas (por nombre)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...products].sort((a, b) => b.popularity - a.popularity);
    }
    const lowerQuery = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.category.toLowerCase().includes(lowerQuery));
  }, [products, searchQuery]);

  // Filtrado de Inventario (por Categoría)
  const inventoryProducts = useMemo(() => {
    if (inventoryCategoryFilter === 'All') return products;
    return products.filter(p => p.category === inventoryCategoryFilter);
  }, [products, inventoryCategoryFilter]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats);
  }, [products]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowInventoryModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      // No alertar en éxito porque firebase actualiza la UI automáticamente
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error eliminando el producto');
    }
  };

  const handleCloseModal = () => {
    setShowInventoryModal(false);
    setEditingProduct(undefined);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                B
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight hidden lg:block">BodegaApp</h1>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Ventas
              </button>
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Inventario
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tasa Dólar</span>
              <div className="flex items-center gap-1.5">
                {isEditingRate ? (
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" step="0.01" 
                      value={manualRate} onChange={(e) => setManualRate(e.target.value)}
                      className="w-20 p-1 border border-slate-300 rounded text-sm text-slate-800 outline-none"
                    />
                    <button onClick={handleSaveManualRate} className="text-emerald-600 bg-emerald-50 p-1 rounded hover:bg-emerald-100" title="Guardar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button onClick={() => setIsEditingRate(false)} className="text-slate-400 hover:text-red-500 p-1" title="Cancelar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ) : (
                  <>
                    {isLoadingRate ? (
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span 
                        className="text-emerald-600 font-black cursor-pointer hover:underline" 
                        title="Clic para editar manualmente"
                        onClick={() => {
                          setManualRate(config.exchangeRate.toString());
                          setIsEditingRate(true);
                        }}
                      >
                        Bs. {config.exchangeRate.toFixed(2)}
                      </span>
                    )}
                    <button onClick={() => fetchOfficialRate(true)} className="text-slate-400 hover:text-emerald-600 transition-colors ml-1" title="Actualizar desde BCV API">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <button 
              onClick={() => setShowInventoryModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm hover:shadow-blue-200 active:scale-95 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Añadir</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          
          {activeTab === 'sales' ? (
            <>
              <div className="mb-6 relative max-w-2xl mx-auto">
                <input 
                  type="text"
                  placeholder="Buscar producto por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900"
                />
                <svg className="w-6 h-6 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    config={config} 
                    onAdd={addToCart} 
                    onEdit={handleEditClick}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-1">No hay productos</h3>
                    <p className="text-slate-500">
                      {products.length === 0 ? 'Añade productos en el inventario primero.' : 'No se encontraron resultados.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Inventario General</h2>
                  <p className="text-slate-500">Administración de stock y precios</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
                  <span className="text-sm font-semibold text-slate-600 px-2">Categoría:</span>
                  <select 
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none font-semibold cursor-pointer"
                  >
                    <option value="All">Todas las categorías</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <InventoryTable 
                products={inventoryProducts} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteProduct} 
              />
            </div>
          )}

        </div>
      </div>

      {showInventoryModal && (
        <InventoryForm 
          onClose={handleCloseModal} 
          categories={uniqueCategories}
          editingProduct={editingProduct}
        />
      )}

      {activeTab === 'sales' && (
        <div className="w-full md:w-96 bg-white border-l border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col z-20 absolute bottom-0 md:relative md:h-screen max-h-[50vh] md:max-h-screen">
          <div className="p-5 border-b border-slate-100 bg-white">
            <h2 className="text-xl font-black text-slate-800">Cuenta de Cliente</h2>
            <p className="text-sm text-slate-500 font-medium">{cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en cola</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p className="text-sm font-medium">Agrega productos al carrito</p>
              </div>
            ) : (
              cartItems.map(item => {
                const itemUsd = (item.bulkCost/item.unitsPerBulk) * (1+item.profitMargin) * item.cartQuantity * (item.cartQuantity >= 6 ? 1 - config.discountRate : 1);
                const itemBs = itemUsd * config.exchangeRate;
                
                return (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.name}</h4>
                      <div className="text-xs font-semibold text-emerald-600 mb-2">
                        {item.cartQuantity >= 6 ? `¡Descuento ${(config.discountRate * 100)}%!` : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id!, item.cartQuantity - 1)} className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors">-</button>
                        <span className="font-black text-sm w-4 text-center text-slate-700">{item.cartQuantity}</span>
                        <button onClick={() => updateQuantity(item.id!, item.cartQuantity + 1)} className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors">+</button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-black text-slate-800">${itemUsd.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-600">Bs. {itemBs.toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.id!)} className="text-red-400 hover:text-red-600 transition-colors p-1 bg-red-50 rounded-lg mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-5 bg-white border-t border-slate-200 shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 font-bold text-sm">Total USD</span>
              <span className="text-2xl font-black text-slate-900">${totals.totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-bold text-sm">Total Bs</span>
              <span className="text-lg font-black text-emerald-600">Bs. {totals.totalBs.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => finalizeSale()}
              disabled={cartItems.length === 0}
              className={`w-full py-3.5 rounded-xl text-lg font-black transition-all ${
                cartItems.length === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95'
              }`}
            >
              Finalizar Venta
            </button>
            
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="w-full mt-2 py-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors rounded-lg hover:bg-slate-50">
                Vaciar carrito
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProductTable } from './components/ProductTable';
import { SummaryPanel } from './components/SummaryPanel';
import { Inventory } from './components/Inventory';
import { INITIAL_PRODUCTS } from './constants';
import { Product, ExchangeRate } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'inventory'>('calculator');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');

  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares');
      const data = await response.json();

      // Find the official BCV rate
      const officialRate = data.find((item: any) => item.fuente === 'oficial');

      if (officialRate) {
        setExchangeRate({
          rate: officialRate.promedio,
          lastUpdated: officialRate.fechaActualizacion,
          source: 'BCV Oficial'
        });
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Fallback or error handling could go here
    } finally {
      setIsLoadingRate(false);
    }
  };

  React.useEffect(() => {
    fetchExchangeRate();
  }, []);

  const handleManualRateChange = (newRate: number) => {
    setExchangeRate({
      rate: newRate,
      lastUpdated: new Date().toISOString(),
      source: 'Manual Override'
    });
  };

  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, p.quantity + delta);
          return { ...p, quantity: newQty };
        }
        return p;
      })
    );
  };

  const handleClearSelection = () => {
    setProducts((prev) => prev.map((p) => ({ ...p, quantity: 0 })));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <>
      <div className="flex h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Header />

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-32 lg:pb-6">
            {activeTab === 'calculator' ? (
              <div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-300">
                {/* Left Column: Search & Table */}
                <div className="flex-1 flex flex-col gap-6 min-h-0">
                  <div className="w-full">
                    <label className="flex flex-col h-12 w-full">
                      <div className="flex w-full flex-1 items-stretch rounded-full h-full border border-[#e0e0e0] dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all shadow-sm">
                        <div className="text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center pl-4 pr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                          className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-[#111418] dark:text-white focus:outline-0 placeholder:text-text-secondary-light dark:placeholder:text-[#5c7252] px-2 text-base font-normal leading-normal"
                          placeholder="Search products by name, SKU or category..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </label>
                  </div>

                  <ProductTable
                    products={filteredProducts}
                    exchangeRate={exchangeRate?.rate || 0}
                    onQuantityChange={handleQuantityChange}
                  />
                </div>

                {/* Right Column: Summary & Rate */}
                <SummaryPanel
                  products={products}
                  exchangeRate={exchangeRate}
                  isLoadingRate={isLoadingRate}
                  onClearSelection={handleClearSelection}
                  onRefreshRate={fetchExchangeRate}
                  onManualRateChange={handleManualRateChange}
                />
              </div>
            ) : (
              <div className="h-full animate-in fade-in space-y-4 duration-300">
                <Inventory
                  products={products}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default App;

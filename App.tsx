import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProductTable } from './components/ProductTable';
import { SummaryPanel } from './components/SummaryPanel';
import { INITIAL_PRODUCTS, INITIAL_EXCHANGE_RATE } from './constants';
import { Product } from './types';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [exchangeRate] = useState(INITIAL_EXCHANGE_RATE);

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
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-32 lg:pb-6">
          <div className="flex flex-col xl:flex-row gap-6 h-full">
            {/* Left Column: Search & Table */}
            <div className="flex-1 flex flex-col gap-6 min-h-0">
              <div className="w-full">
                <label className="flex flex-col h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-full h-full border border-[#e0e0e0] dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all shadow-sm">
                    <div className="text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center pl-4 pr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
                exchangeRate={exchangeRate}
                onQuantityChange={handleQuantityChange}
              />
            </div>

            {/* Right Column: Summary & Rate */}
            <SummaryPanel
              products={products}
              exchangeRate={exchangeRate}
              onClearSelection={handleClearSelection}
            />
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default App;

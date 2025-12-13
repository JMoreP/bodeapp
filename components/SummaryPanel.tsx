import React from 'react';
import { Product } from '../types';
import { Pencil, RefreshCw, TrendingUp, Receipt } from 'lucide-react';

interface SummaryPanelProps {
  products: Product[];
  exchangeRate: number;
  onClearSelection: () => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  products,
  exchangeRate,
  onClearSelection,
}) => {
  const selectedCount = products.reduce((acc, p) => acc + p.quantity, 0);
  const subtotalUsd = products.reduce((acc, p) => acc + p.priceUsd * p.quantity, 0);
  const totalBs = subtotalUsd * exchangeRate;

  return (
    <div className="w-full xl:w-[360px] flex-shrink-0 flex flex-col gap-6 xl:sticky xl:top-6 xl:self-start">
      {/* Exchange Rate Card */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#1e2b1a] to-[#0f180c] border border-border-dark relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <RefreshCw size={96} className="text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-secondary-dark text-sm font-medium uppercase tracking-wider">
              Exchange Rate (USD/VES)
            </p>
            <button className="text-text-secondary-dark hover:text-primary transition-colors">
              <Pencil size={16} />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-white text-4xl font-bold tracking-tight">
              {exchangeRate.toFixed(2)} Bs.
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-primary bg-primary/10 px-2 py-0.5 rounded text-xs font-bold">
              <TrendingUp size={12} className="mr-1" />
              +0.5%
            </span>
            <span className="text-text-secondary-light text-xs">Updated 15m ago</span>
          </div>
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e0e0e0] dark:border-border-dark flex flex-col flex-1 shadow-sm h-min">
        <div className="p-6 border-b border-[#e0e0e0] dark:border-border-dark">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold">Total Calculation</h3>
        </div>
        <div className="p-6 flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center text-text-secondary-light dark:text-[#cbd5e1]">
            <span className="text-sm font-medium">Selected Items</span>
            <span className="text-sm font-bold">{selectedCount}</span>
          </div>
          <div className="flex justify-between items-center text-text-secondary-light dark:text-[#cbd5e1]">
            <span className="text-sm font-medium">Subtotal (USD)</span>
            <span className="text-sm font-medium">${subtotalUsd.toFixed(2)}</span>
          </div>
          <div className="h-px w-full bg-[#e0e0e0] dark:bg-border-dark my-2"></div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[#111418] dark:text-white text-base font-bold">
                Total Amount
              </span>
              <span className="text-text-secondary-light text-xs">in Bolivars (VES)</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-primary text-2xl font-black tracking-tight drop-shadow-sm">
                {totalBs.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                Bs.
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#f0f2f4] dark:bg-[#20321a] rounded-b-xl flex flex-col gap-3">
          <button className="w-full py-3 px-4 bg-primary hover:bg-[#3dd015] active:bg-[#32b010] text-primary-content font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
            <Receipt size={20} />
            Generate Quote
          </button>
          <button
            onClick={onClearSelection}
            className="w-full py-3 px-4 bg-transparent border border-[#e0e0e0] dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-[#e2e8f0] dark:hover:bg-border-dark font-bold rounded-lg transition-colors text-sm"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

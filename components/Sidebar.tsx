import React from 'react';
import { Calculator, Package, History, Settings, LogOut, DollarSign } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-20 lg:w-64 flex-shrink-0 flex flex-col justify-between border-r border-[#e0e0e0] dark:border-border-dark bg-surface-light dark:bg-background-dark transition-all duration-300">
      <div className="flex flex-col gap-4 p-4">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#2c4724]"></div>
            <div className="absolute inset-0 flex items-center justify-center text-primary-content font-bold text-xl">
              <DollarSign size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="flex flex-col hidden lg:flex">
            <h1 className="text-[#111418] dark:text-white text-base font-bold leading-normal tracking-tight">
              CalcBo
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-normal leading-normal">
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 mt-4">
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-full bg-[#2c4724] dark:bg-primary text-white dark:text-primary-content group transition-colors"
            href="#"
          >
            <Calculator size={24} className="dark:fill-primary-content" />
            <span className="text-sm font-bold leading-normal hidden lg:block">Calculator</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-[#f0f2f4] dark:hover:bg-surface-dark transition-colors"
            href="#"
          >
            <Package size={24} />
            <span className="text-sm font-medium leading-normal hidden lg:block">Inventory</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-[#f0f2f4] dark:hover:bg-surface-dark transition-colors"
            href="#"
          >
            <History size={24} />
            <span className="text-sm font-medium leading-normal hidden lg:block">History</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-[#f0f2f4] dark:hover:bg-surface-dark transition-colors"
            href="#"
          >
            <Settings size={24} />
            <span className="text-sm font-medium leading-normal hidden lg:block">Settings</span>
          </a>
        </nav>
      </div>

      <div className="p-4">
        <button className="flex items-center gap-3 px-3 py-3 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-[#f0f2f4] dark:hover:bg-surface-dark transition-colors w-full">
          <LogOut size={24} />
          <span className="text-sm font-medium leading-normal hidden lg:block">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

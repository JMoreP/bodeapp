import React from 'react';
import { Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 px-6 py-5 border-b border-[#e0e0e0] dark:border-border-dark flex items-center justify-between bg-surface-light dark:bg-background-dark z-10">
      <div>
        <h2 className="text-[#111418] dark:text-white text-2xl lg:text-3xl font-black leading-tight tracking-tight">
          Product Calculator
        </h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium mt-1">
          Manage exchange rates & quotes
        </p>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f2f4] dark:bg-surface-dark rounded-full border border-[#e0e0e0] dark:border-border-dark">
          <Calendar size={20} className="text-text-secondary-light dark:text-text-secondary-dark" />
          <span className="text-[#111418] dark:text-white text-sm font-medium">Oct 24, 2023</span>
        </div>
        <div
          className="h-10 w-10 bg-center bg-cover rounded-full border-2 border-primary cursor-pointer"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsBfgOOzyV0V7sl6lxC72ZZ0oW29XjT-1ysQy4it8GB5xza4GIE0koapquy6ZEdcbOgEi88BZ2Ej5o_zIqwlp_ej6Y4uJ0pm9WzZV0pAeKV4eiI1Tp5C-d2HxfpnS7qPIM5_diZOayDb9RmPrQmRuQ_PG4ZolekCYY-G06kOJS45U5kfSIDzgg2CFVIuJcQ_QBdndG8inaWiLLH__Au4FHP-RrOiA7m3TIpO89msrnlJaBXoJJrugikXPs5e9Yio1L4hs7OXklIBs')",
          }}
        ></div>
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import { ActiveTab } from '@/lib/types';
import { Send, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickRefresh: () => void;
  isRefreshing: boolean;
  onOpenTelegramModal: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  onQuickRefresh,
  isRefreshing,
  onOpenTelegramModal,
}: NavbarProps) {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'ទិដ្ឋភាពទូទៅ' },
    { id: 'gold', label: 'តម្លៃមាស' },
    { id: 'currency', label: 'អត្រាប្ដូរប្រាក់' },
    { id: 'fuel', label: 'តម្លៃប្រេង' },
    { id: 'ict', label: 'វិភាគ ICT' },
    { id: 'news', label: 'ព័ត៌មានទីផ្សារ' },
    { id: 'history', label: 'ប្រវត្តិ ២០' },
    { id: 'telegram', label: 'Telegram' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          onClick={() => onTabChange('overview')}
          className="text-lg sm:text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <span className="text-amber-400 font-extrabold tracking-normal">KH</span>
          <span>Market Pulse</span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-sm ${
                  isActive
                    ? 'text-amber-400 border-amber-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action button + quick refresh */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onQuickRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors disabled:opacity-50"
            title="ធ្វើបច្ចុប្បន្នភាពទិន្នន័យ (Refresh Market Data)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={onOpenTelegramModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">ផ្ញើទៅ Telegram</span>
            <span className="sm:hidden">Telegram</span>
          </button>
        </div>
      </div>

      {/* Mobile Subnavigation Strip */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-900 bg-slate-950/95 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

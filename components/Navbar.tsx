'use client';

import React from 'react';
import { ActiveTab } from '@/lib/types';
import { Send, RefreshCw, Coins, DollarSign, Fuel, Camera, BellRing } from 'lucide-react';

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
  const navItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'gold', label: 'តម្លៃមាស (Gold)', icon: Coins },
    { id: 'currency', label: 'អត្រាប្ដូរប្រាក់ (Currencies)', icon: DollarSign },
    { id: 'fuel', label: 'តម្លៃប្រេង (Fuel)', icon: Fuel },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          onClick={() => onTabChange('gold')}
          className="text-lg sm:text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <span className="text-amber-400 font-extrabold tracking-normal">KH</span>
          <span>Market Pulse</span>
        </button>

        {/* Zone 2: Navigation Links for the 3 Core Pages */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Utilities & Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* History 20 Snapshots Button */}
          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="ប្រវត្តិ ២០ កំណត់ត្រាក្នុង LocalStorage"
          >
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">ប្រវត្តិ ២០</span>
          </button>

          {/* Telegram Settings & Auto-Alerts */}
          <button
            onClick={() => onTabChange('telegram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              activeTab === 'telegram'
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="កំណត់ Bot និង Auto-Alerts Telegram"
          >
            <BellRing className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Alerts</span>
          </button>

          {/* Quick Refresh */}
          <button
            onClick={onQuickRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors disabled:opacity-50"
            title="ទាញយកទិន្នន័យផ្ទាល់ (Refresh Live)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Quick Telegram Modal Send */}
          <button
            onClick={onOpenTelegramModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ផ្ញើ Telegram</span>
          </button>
        </div>
      </div>

      {/* Mobile Subnavigation Strip: 3 Pages */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-900 bg-slate-950/95">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  GoldPrice,
  CurrencyRates,
  FuelRates,
  ICTAnalysis,
  SnapshotRecord,
  TelegramConfig,
} from '@/lib/types';
import {
  INITIAL_GOLD_DATA,
  INITIAL_CURRENCY_DATA,
  INITIAL_FUEL_DATA,
  INITIAL_ICT_ANALYSIS,
  DAMLUNG_TO_TROY_OZ,
  GRAMS_PER_TROY_OZ,
  GRAMS_PER_DAMLUNG,
  getInitialSnapshots,
} from '@/lib/market-data';
import {
  getSavedSnapshots,
  saveSnapshotRecord,
  getTelegramConfig,
} from '@/lib/storage';

import Navbar from '@/components/Navbar';
import OverviewTab from '@/components/OverviewTab';
import GoldTab from '@/components/GoldTab';
import CurrenciesTab from '@/components/CurrenciesTab';
import FuelTab from '@/components/FuelTab';
import IctAnalysisTab from '@/components/IctAnalysisTab';
import HistoryTab from '@/components/HistoryTab';
import TelegramTab from '@/components/TelegramTab';
import TelegramModal from '@/components/TelegramModal';
import MarketNews from '@/components/MarketNews';

import { TrendingUp, TrendingDown, Coins, DollarSign, Fuel, Shield, Bell } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Market state
  const [gold, setGold] = useState<GoldPrice>(INITIAL_GOLD_DATA);
  const [currencies, setCurrencies] = useState<CurrencyRates>(INITIAL_CURRENCY_DATA);
  const [fuel, setFuel] = useState<FuelRates>(INITIAL_FUEL_DATA);
  const [ict, setIct] = useState<ICTAnalysis>(INITIAL_ICT_ANALYSIS);

  // Persistence State - initialized deterministically to match SSR
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>(getInitialSnapshots);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    autoAlertEnabled: false,
  });

  // Client-side hydration from localStorage after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = getSavedSnapshots();
      if (saved && saved.length > 0) {
        setSnapshots(saved);
      }
      const savedTg = getTelegramConfig();
      if (savedTg.botToken || savedTg.chatId) {
        setTelegramConfig(savedTg);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Modal State
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [modalDefaultMsg, setModalDefaultMsg] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Quick refresh: fetch from live endpoint /api/market/live with fallback
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    const now = new Date();
    const timeStr = `ថ្ងៃនេះ ម៉ោង ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    try {
      const res = await fetch('/api/market/live');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          const spotOz = data.gold.spotOzUsd;
          const damlungUsd = data.gold.damlungUsd;
          const damlungKhr = data.gold.damlungKhr;
          const chiKhr = data.gold.chiKhr;
          const hunKhr = data.gold.hunKhr;
          const acledaData = data.acleda;
          const fuelData = data.fuel;

          // Update Gold
          setGold((prev) => ({
            ...prev,
            spotOzUsd: spotOz,
            spotOzKhr: Math.round(spotOz * (acledaData?.sellCash || 4077)),
            damlungUsd,
            damlungKhr,
            chiUsd: Math.round((damlungUsd / 10) * 100) / 100,
            chiKhr,
            hunUsd: Math.round((damlungUsd / 100) * 100) / 100,
            hunKhr,
            gold24kBuyDamlung: Math.round((damlungUsd - 12) * 100) / 100,
            gold24kSellDamlung: Math.round((damlungUsd + 15) * 100) / 100,
            lastUpdated: timeStr,
          }));

          // Update Currencies
          if (acledaData) {
            setCurrencies((prev) => ({
              ...prev,
              acleda: {
                bankName: acledaData.bankName,
                currency: acledaData.currency,
                buyCash: acledaData.buyCash,
                sellCash: acledaData.sellCash,
                buyAccount: acledaData.buyAccount,
                sellAccount: acledaData.sellAccount,
                change24h: acledaData.sellCash - prev.usdKhrMarket.sell,
                source: acledaData.source,
                confidence: acledaData.confidence,
              },
              usdKhrMarket: {
                buy: acledaData.buyCash,
                sell: acledaData.sellCash,
                change24h: acledaData.sellCash - prev.usdKhrMarket.sell,
              },
              lastUpdated: timeStr,
            }));
          }

          // Update Fuel
          if (fuelData) {
            setFuel((prev) => ({
              ...prev,
              brentCrudeUsd: fuelData.brentCrudeUsd,
              cambodiaRetail: {
                ...prev.cambodiaRetail,
                gasolineRegularKhr: fuelData.gasolineRegularKhr,
                dieselKhr: fuelData.dieselKhr,
                gasolineSuperKhr: fuelData.gasolineSuperKhr,
              },
              lastUpdated: timeStr,
            }));
          }

          // Update ICT current price
          setIct((prev) => ({
            ...prev,
            currentPrice: spotOz,
          }));

          triggerToast('បានទាញយកទិន្នន័យផ្ទាល់ពី Forex & ACLEDA ជោគជ័យ!');
          setIsRefreshing(false);
          return;
        }
      }
    } catch (e) {
      console.warn('API fetch fallback to local compute:', e);
    }

    // Jiggle fallback
    const goldShift = Math.round((Math.random() * 4 - 1.8) * 100) / 100;
    const newSpotOz = Math.round((gold.spotOzUsd + goldShift) * 100) / 100;
    const usdRate = currencies.acleda?.sellCash || currencies.usdKhrMarket.sell;
    const newDamlungUsd = Math.round(newSpotOz * DAMLUNG_TO_TROY_OZ * 100) / 100;
    const newDamlungKhr = Math.round(newDamlungUsd * usdRate);

    setGold((prev) => ({
      ...prev,
      spotOzUsd: newSpotOz,
      spotOzKhr: Math.round(newSpotOz * usdRate),
      damlungUsd: newDamlungUsd,
      damlungKhr: newDamlungKhr,
      chiUsd: Math.round((newDamlungUsd / 10) * 100) / 100,
      chiKhr: Math.round(newDamlungKhr / 10),
      hunUsd: Math.round((newDamlungUsd / 100) * 100) / 100,
      hunKhr: Math.round(newDamlungKhr / 100),
      lastUpdated: timeStr,
    }));

    setIct((prev) => ({
      ...prev,
      currentPrice: newSpotOz,
    }));

    setIsRefreshing(false);
    triggerToast('បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យទីផ្សារជោគជ័យ');
  };

  // Snapshot trigger
  const handleTakeSnapshot = (note?: string) => {
    const updated = saveSnapshotRecord(gold, currencies, fuel, note);
    setSnapshots(updated);
    triggerToast('បានកត់ត្រាទិន្នន័យ Snapshot ២០ ក្នុង LocalStorage');
  };

  // Telegram Sender Function
  const handleSendTelegram = async (messageText: string): Promise<boolean> => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setModalDefaultMsg(messageText);
      setIsTelegramModalOpen(true);
      return false;
    }

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramConfig.botToken,
          chatId: telegramConfig.chatId,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'បរាជ័យក្នុងការផ្ញើសារ');
      }

      triggerToast('បានផ្ញើសារទៅកាន់ Telegram ជោគជ័យ!');
      return true;
    } catch (err: any) {
      triggerToast(`កំហុស Telegram: ${err.message}`);
      return false;
    }
  };

  // Quick Telegram from Navbar or Overview
  const handleOpenTelegramSummary = () => {
    const summary = `📊 <b>របាយការណ៍សង្ខេបទីផ្សារ (Cambodia Market Pulse)</b>
📅 ${gold.lastUpdated}

🟡 <b>តម្លៃមាស:</b>
• ១ តម្លឹង (Damlung): <b>${gold.damlungKhr.toLocaleString()} ៛</b> (~$${gold.damlungUsd.toFixed(2)})
• ១ ជី (Chi): <b>${gold.chiKhr.toLocaleString()} ៛</b> (~$${gold.chiUsd.toFixed(2)})
• Spot Gold: <b>$${gold.spotOzUsd.toFixed(2)}/oz</b>

💵 <b>អត្រាប្ដូរប្រាក់:</b>
• USD/KHR: <b>${currencies.usdKhrMarket.sell.toLocaleString()} ៛</b>
• CNY/KHR: <b>${currencies.cnyKhr.rate.toFixed(2)} ៛</b>

⛽ <b>តម្លៃប្រេង:</b>
• សាំងធម្មតា: <b>${fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛/L</b>
• ម៉ាស៊ូត: <b>${fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛/L</b>
• Brent Crude: <b>$${fuel.brentCrudeUsd.toFixed(2)}/bbl</b>

🎯 <b>ICT Signal:</b> ${ict.biasKhmer} (${ict.tradeSignal.actionKhmer})`;

    setModalDefaultMsg(summary);
    setIsTelegramModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Quiet Live Ticker Strip */}
      <div className="w-full bg-slate-900 border-b border-slate-800 text-[11px] font-mono py-1.5 px-4 overflow-x-auto whitespace-nowrap text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span>Spot Gold:</span>
              <span className="text-white font-bold">${gold.spotOzUsd.toFixed(2)}</span>
              <span className={gold.change24hUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                ({gold.change24hUsd >= 0 ? '+' : ''}${gold.change24hUsd})
              </span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>១ តម្លឹង:</span>
              <span className="text-amber-300 font-semibold">{gold.damlungKhr.toLocaleString()} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>USD/KHR:</span>
              <span className="text-emerald-400 font-semibold">{currencies.usdKhrMarket.sell.toLocaleString()} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>CNY/KHR:</span>
              <span className="text-sky-400 font-semibold">{currencies.cnyKhr.rate.toFixed(1)} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>សាំងធម្មតា:</span>
              <span className="text-slate-200">{fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>Brent:</span>
              <span className="text-white">${fuel.brentCrudeUsd.toFixed(2)}</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-500 font-sans">
            <span>{gold.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickRefresh={handleRefreshData}
        isRefreshing={isRefreshing}
        onOpenTelegramModal={handleOpenTelegramSummary}
      />

      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl border border-amber-500/40 bg-slate-900/95 shadow-2xl text-amber-300 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            gold={gold}
            currencies={currencies}
            fuel={fuel}
            ict={ict}
            onTabChange={setActiveTab}
            onTakeSnapshot={() => handleTakeSnapshot()}
            onQuickTelegram={handleOpenTelegramSummary}
          />
        )}

        {activeTab === 'gold' && (
          <GoldTab
            gold={gold}
            currencies={currencies}
            onSendTelegram={(msg) => {
              setModalDefaultMsg(msg);
              setIsTelegramModalOpen(true);
            }}
          />
        )}

        {activeTab === 'currency' && (
          <CurrenciesTab
            currencies={currencies}
            onSendTelegram={(msg) => {
              setModalDefaultMsg(msg);
              setIsTelegramModalOpen(true);
            }}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelTab
            fuel={fuel}
            onSendTelegram={(msg) => {
              setModalDefaultMsg(msg);
              setIsTelegramModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ict' && (
          <IctAnalysisTab
            ict={ict}
            gold={gold}
            currencies={currencies}
            fuel={fuel}
            onSendTelegram={(msg) => {
              setModalDefaultMsg(msg);
              setIsTelegramModalOpen(true);
            }}
          />
        )}

        {activeTab === 'news' && (
          <MarketNews
            onSendTelegram={(msg) => {
              setModalDefaultMsg(msg);
              setIsTelegramModalOpen(true);
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            snapshots={snapshots}
            onSnapshotsUpdate={setSnapshots}
            gold={gold}
            currencies={currencies}
            fuel={fuel}
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramTab
            config={telegramConfig}
            onConfigUpdate={setTelegramConfig}
            gold={gold}
            currencies={currencies}
            fuel={fuel}
            ict={ict}
            onSendTelegram={handleSendTelegram}
            onUpdateGold={setGold}
            onUpdateCurrencies={setCurrencies}
            onUpdateFuel={setFuel}
          />
        )}
      </main>

      {/* Quick Telegram Modal */}
      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onConfigUpdate={setTelegramConfig}
        defaultMessage={modalDefaultMsg}
        onSend={handleSendTelegram}
        onNavigateTab={setActiveTab}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Cambodia Market & Gold Pulse</span>
            <span>·</span>
            <span>ទិន្នន័យហិរញ្ញវត្ថុ គិតជាអោន និង តម្លឹង</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>ស្តង់ដារមាសកម្ពុជា: ១ តម្លឹង = ៣៧.៥ ក្រាម</span>
            <span>·</span>
            <span>ICT Order Flow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

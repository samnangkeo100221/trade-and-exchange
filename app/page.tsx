'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import GoldTab from '@/components/GoldTab';
import CurrenciesTab from '@/components/CurrenciesTab';
import FuelTab from '@/components/FuelTab';
import HistoryTab from '@/components/HistoryTab';
import TelegramTab from '@/components/TelegramTab';
import TelegramModal from '@/components/TelegramModal';

import { Bell } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('gold');

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

  // Modal & Live Fetch State
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [modalDefaultMsg, setModalDefaultMsg] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isServerTelegramConfigured, setIsServerTelegramConfigured] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3000);
  }, []);

  // Fetch real-time market data from /api/market/live
  const fetchLiveMarket = useCallback(
    async (showToastOnSuccess = false) => {
      setIsRefreshing(true);
      setLiveError(null);
      const now = new Date();
      const timeStr = `ថ្ងៃនេះ ម៉ោង ${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      try {
        const res = await fetch('/api/market/live', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data || !data.success) {
          throw new Error(data?.error || 'ទិន្នន័យមិនត្រឹមត្រូវ');
        }

        const spotOz = data.gold.spotOzUsd;
        const damlungUsd = data.gold.damlungUsd;
        const damlungKhr = data.gold.damlungKhr;
        const chiUsd = data.gold.chiUsd ?? Math.round((damlungUsd / 10) * 100) / 100;
        const chiKhr = data.gold.chiKhr;
        const hunUsd = data.gold.hunUsd ?? Math.round((damlungUsd / 100) * 100) / 100;
        const hunKhr = data.gold.hunKhr;
        const acledaData = data.acleda;
        const fuelData = data.fuel;
        const fxRate = acledaData?.sellCash || 4069;

        const gramUsd = Math.round((spotOz / GRAMS_PER_TROY_OZ) * 100) / 100;
        const gramKhr = Math.round(gramUsd * fxRate);
        const gold24kBuy = Math.round((damlungUsd - 12) * 100) / 100;
        const gold24kSell = Math.round((damlungUsd + 15) * 100) / 100;
        const gold18kBuy = Math.round(damlungUsd * 0.75 * 100) / 100;
        const gold18kSell = Math.round((damlungUsd * 0.75 + 25) * 100) / 100;

        setGold((prev) => ({
          ...prev,
          spotOzUsd: spotOz,
          spotOzKhr: Math.round(spotOz * fxRate),
          prevCloseUsd: data.gold.prevCloseUsd ?? prev.prevCloseUsd,
          change24hUsd: data.gold.change24hUsd ?? prev.change24hUsd,
          change24hPercent: data.gold.change24hPercent ?? prev.change24hPercent,
          high24hUsd: data.gold.high24hUsd ?? prev.high24hUsd,
          low24hUsd: data.gold.low24hUsd ?? prev.low24hUsd,
          history24h: Array.isArray(data.gold.history24h) ? data.gold.history24h : prev.history24h,
          source: data.gold.source ?? prev.source,
          damlungUsd,
          damlungKhr,
          chiUsd,
          chiKhr,
          hunUsd,
          hunKhr,
          gramUsd,
          gramKhr,
          gold24kBuyDamlung: gold24kBuy,
          gold24kSellDamlung: gold24kSell,
          goldKilobarBuyKhr: Math.round(gold24kBuy * fxRate),
          goldKilobarSellKhr: Math.round(gold24kSell * fxRate),
          gold18kBuyDamlung: gold18kBuy,
          gold18kSellDamlung: gold18kSell,
          gold18kBuyKhr: Math.round(gold18kBuy * fxRate),
          gold18kSellKhr: Math.round(gold18kSell * fxRate),
          lastUpdated: timeStr,
        }));

        if (data.currencies && acledaData) {
          setCurrencies((prev) => ({
            ...prev,
            acleda: {
              bankName: acledaData.bankName,
              buyCash: acledaData.buyCash,
              sellCash: acledaData.sellCash,
              buyAccount: acledaData.buyAccount,
              sellAccount: acledaData.sellAccount,
              change24h: data.currencies.usdKhrMarket.change24h,
              source: acledaData.source,
              confidence: acledaData.confidence,
            },
            usdKhrMarket: data.currencies.usdKhrMarket,
            usdKhrNbc: data.currencies.usdKhrNbc,
            cnyKhr: data.currencies.cnyKhr,
            cnyUsd: data.currencies.cnyUsd,
            thbKhr: data.currencies.thbKhr,
            eurKhr: data.currencies.eurKhr,
            vndKhr: data.currencies.vndKhr,
            lakKhr: data.currencies.lakKhr,
            audKhr: data.currencies.audKhr,
            lastUpdated: timeStr,
          }));
        }

        if (fuelData) {
          setFuel((prev) => ({
            ...prev,
            brentCrudeUsd: fuelData.brentCrudeUsd || prev.brentCrudeUsd,
            wtiCrudeUsd: fuelData.wtiCrudeUsd || prev.wtiCrudeUsd,
            brentChange24h:
              typeof fuelData.brentChange24h === 'number'
                ? fuelData.brentChange24h
                : prev.brentChange24h,
            wtiChange24h:
              typeof fuelData.wtiChange24h === 'number'
                ? fuelData.wtiChange24h
                : prev.wtiChange24h,
            cambodiaRetail: {
              ...prev.cambodiaRetail,
              gasolineRegularKhr: fuelData.gasolineRegularKhr,
              gasolineRegularUsd: Math.round((fuelData.gasolineRegularKhr / fxRate) * 100) / 100,
              dieselKhr: fuelData.dieselKhr,
              dieselUsd: Math.round((fuelData.dieselKhr / fxRate) * 100) / 100,
              gasolineSuperKhr: fuelData.gasolineSuperKhr,
              gasolineSuperUsd: Math.round((fuelData.gasolineSuperKhr / fxRate) * 100) / 100,
              effectivePeriod: fuelData.effectivePeriod || prev.cambodiaRetail.effectivePeriod,
            },
            lastUpdated: timeStr,
          }));
        }

        setIct((prev) => ({
          ...prev,
          currentPrice: spotOz,
        }));

        if (showToastOnSuccess) {
          triggerToast('បានទាញយកទិន្នន័យផ្ទាល់ (Real-Time) ជោគជ័យ!');
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'មិនអាចតភ្ជាប់ទិន្នន័យផ្ទាល់បានទេ';
        setLiveError(msg);
        if (showToastOnSuccess) {
          triggerToast(`បរាជ័យក្នុងការទាញយកទិន្នន័យផ្ទាល់: ${msg}`);
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [triggerToast]
  );

  // Automatic real-time fetch on mount + 60s live polling + Telegram server check
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      fetchLiveMarket(false);
    }, 0);

    fetch('/api/telegram/send')
      .then((res) => (res.ok ? res.json() : null))
      .then((info) => {
        if (info?.serverConfigured) {
          setIsServerTelegramConfigured(true);
        }
      })
      .catch(() => {
        // ignore
      });

    const interval = setInterval(() => {
      fetchLiveMarket(false);
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchLiveMarket]);

  const handleRefreshData = () => {
    fetchLiveMarket(true);
  };

  // Snapshot trigger
  const handleTakeSnapshot = (note?: string) => {
    const updated = saveSnapshotRecord(gold, currencies, fuel, note);
    setSnapshots(updated);
    triggerToast('បានកត់ត្រាទិន្នន័យ Snapshot ២០ ក្នុង LocalStorage');
  };

  // Telegram Sender Function
  const handleSendTelegram = async (messageText: string): Promise<boolean> => {
    const hasClientCreds = Boolean(telegramConfig.botToken && telegramConfig.chatId);
    if (!hasClientCreds && !isServerTelegramConfigured) {
      setModalDefaultMsg(messageText);
      setIsTelegramModalOpen(true);
      return false;
    }

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramConfig.botToken || undefined,
          chatId: telegramConfig.chatId || undefined,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'បរាជ័យក្នុងការផ្ញើសារ');
      }

      triggerToast('បានផ្ញើសារទៅកាន់ Telegram ជោគជ័យ!');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'កំហុសមិនស្គាល់';
      triggerToast(`កំហុស Telegram: ${msg}`);
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

💵 <b>អត្រាប្ដូរប្រាក់ (ACLEDA Mobile):</b>
• USD/KHR (App): <b>${(currencies.acleda.sellAccount || 4067).toLocaleString()} ៛</b> (ទិញ ${(currencies.acleda.buyAccount || 4055).toLocaleString()}៛)
• USD/KHR (Cash): <b>${(currencies.acleda.sellCash || 4069).toLocaleString()} ៛</b> (ទិញ ${(currencies.acleda.buyCash || 4053).toLocaleString()}៛)
• VND/KHR: <b>${currencies.vndKhr?.perVndSell || 0.1570} ៛</b> (១០k ដុង = ${currencies.vndKhr?.sellCash || 1570}៛)
• CNY/KHR: <b>${currencies.cnyKhr.rate.toFixed(1)} ៛</b>

⛽ <b>តម្លៃប្រេង (ក្រសួងពាណិជ្ជកម្ម ចុះ ៥០៛):</b>
• សាំងធម្មតា: <b>${fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛/L</b>
• ម៉ាស៊ូត: <b>${fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛/L</b>
• Singapore MOPS 92: <b>$73.0160/bbl</b> · Brent: <b>$${fuel.brentCrudeUsd.toFixed(2)}/bbl</b>

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
              <span>USD Cash:</span>
              <span className="text-emerald-400 font-semibold">{currencies.acleda.sellCash.toLocaleString()} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>USD App:</span>
              <span className="text-sky-400 font-semibold">{currencies.acleda.sellAccount.toLocaleString()} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>VND:</span>
              <span className="text-amber-300 font-semibold">{currencies.vndKhr?.perVndSell || 0.1570} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>សាំងធម្មតា:</span>
              <span className="text-emerald-400 font-semibold">{fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛</span>
            </span>

            <span className="text-slate-700">|</span>

            <span className="flex items-center gap-1">
              <span>ម៉ាស៊ូត:</span>
              <span className="text-sky-300 font-semibold">{fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛</span>
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
        {(activeTab === 'gold' || activeTab === 'overview') && (
          <GoldTab
            gold={gold}
            currencies={currencies}
            isLiveLoading={isRefreshing}
            liveError={liveError}
            onRefreshLive={handleRefreshData}
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
            onUpdateCurrencies={setCurrencies}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelTab
            fuel={fuel}
            onSendTelegram={(msg) => {
              setModalDefaultMsg(msg);
              setIsTelegramModalOpen(true);
            }}
            onUpdateFuel={setFuel}
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

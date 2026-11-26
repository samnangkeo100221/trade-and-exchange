'use client';

import React, { useState } from 'react';
import { CurrencyRates } from '@/lib/types';
import {
  DollarSign,
  ArrowRightLeft,
  Send,
  Building2,
  ShieldCheck,
  CreditCard,
  Banknote,
  Globe,
  Activity,
  Bot,
  Loader2,
  Target,
  Newspaper,
  Edit3,
  RotateCcw,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import ChartComponent from './ChartComponent';
import MarketNews from './MarketNews';

interface CurrenciesTabProps {
  currencies: CurrencyRates;
  onSendTelegram: (text: string) => void;
  onUpdateCurrencies?: React.Dispatch<React.SetStateAction<CurrencyRates>>;
}

export default function CurrenciesTab({
  currencies,
  onSendTelegram,
  onUpdateCurrencies,
}: CurrenciesTabProps) {
  // ACLEDA Converter State
  const [amount, setAmount] = useState<number>(100);
  const [direction, setDirection] = useState<'FOREIGN_TO_KHR' | 'KHR_TO_FOREIGN'>('FOREIGN_TO_KHR');
  const [selectedCurrency, setSelectedCurrency] = useState<
    'USD_APP' | 'USD_CASH' | 'VND' | 'LAK' | 'AUD' | 'EUR' | 'CNY' | 'THB'
  >('USD_APP');

  // Manual Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    buyApp: currencies.acleda.buyAccount || 4055,
    sellApp: currencies.acleda.sellAccount || 4067,
    buyCash: currencies.acleda.buyCash || 4053,
    sellCash: currencies.acleda.sellCash || 4069,
    nbcOfficial: currencies.usdKhrNbc.official || 4059,
    vndBuy: currencies.vndKhr?.perVndBuy || 0.1545,
    vndSell: currencies.vndKhr?.perVndSell || 0.1570,
    lakBuy: currencies.lakKhr?.perLakBuy || 0.1699,
    lakSell: currencies.lakKhr?.perLakSell || 0.1998,
    audBuy: currencies.audKhr?.buyCash || 2415.59,
    audSell: currencies.audKhr?.sellCash || 3002.92,
    eurBuy: currencies.eurKhr?.buyCash || 4158.38,
    eurSell: currencies.eurKhr?.sellCash || 4752.59,
    cnyBuy: currencies.cnyKhr?.buyCash || 583.0,
    cnySell: currencies.cnyKhr?.sellCash || 599.0,
    thbBuy: currencies.thbKhr?.buyCash || 118.0,
    thbSell: currencies.thbKhr?.sellCash || 123.0,
  });

  // AI Analysis State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const acleda = currencies.acleda;

  // Real data directly extracted from ACLEDA Mobile App Screenshot
  const acledaBoardCards = [
    {
      id: 'usd-app',
      isSpecialApp: true,
      headerBadge: 'អត្រាពិសេសសម្រាប់ប្រតិបត្តិការលើអេស៊ីលីដាអែប',
      flag: '🇺🇸',
      currencyName: 'ដុល្លារអាមេរិក',
      currencyCode: 'USD (ACLEDA App)',
      buyRate: currencies.acleda.buyAccount || 4055.0,
      sellRate: currencies.acleda.sellAccount || 4067.0,
      unit: 'KHR',
      subtext: 'ប្រតិបត្តិការតាមទូរស័ព្ទ / Electronic Transfer',
    },
    {
      id: 'usd-cash',
      isSpecialApp: false,
      headerBadge: 'សាច់ប្រាក់ (Cash / Counter)',
      flag: '🇺🇸',
      currencyName: 'ដុល្លារអាមេរិក',
      currencyCode: 'USD (សាច់ប្រាក់)',
      buyRate: currencies.acleda.buyCash || 4053.0,
      sellRate: currencies.acleda.sellCash || 4069.0,
      unit: 'KHR',
      subtext: 'ប្តូរសាច់ប្រាក់ផ្ទាល់តាមបញ្ជរបេឡាធនាគារ',
    },
    {
      id: 'vnd',
      isSpecialApp: false,
      headerBadge: null,
      flag: '🇻🇳',
      currencyName: 'ដុងវៀតណាម',
      currencyCode: 'VND',
      buyRate: currencies.vndKhr?.perVndBuy || 0.1545,
      sellRate: currencies.vndKhr?.perVndSell || 0.1570,
      unit: 'KHR',
      subtext: '១០,០០០ ដុង = ១,៥៤៥ ៛ / ១,៥៧០ ៛',
    },
    {
      id: 'lak',
      isSpecialApp: false,
      headerBadge: null,
      flag: '🇱🇦',
      currencyName: 'គីបឡាវ',
      currencyCode: 'LAK',
      buyRate: currencies.lakKhr?.perLakBuy || 0.1699,
      sellRate: currencies.lakKhr?.perLakSell || 0.1998,
      unit: 'KHR',
      subtext: '១,០០០ គីប = ១៦៩.៩ ៛ / ១៩៩.៨ ៛',
    },
    {
      id: 'aud',
      isSpecialApp: false,
      headerBadge: null,
      flag: '🇦🇺',
      currencyName: 'ដុល្លារអូស្ត្រាលី',
      currencyCode: 'AUD',
      buyRate: currencies.audKhr?.buyCash || 2415.59,
      sellRate: currencies.audKhr?.sellCash || 3002.92,
      unit: 'KHR',
      subtext: 'ដុល្លារអូស្ត្រាលីសាច់ប្រាក់',
    },
    {
      id: 'eur',
      isSpecialApp: false,
      headerBadge: null,
      flag: '🇪🇺',
      currencyName: 'អឺរ៉ូ',
      currencyCode: 'EUR',
      buyRate: currencies.eurKhr?.buyCash || 4158.38,
      sellRate: currencies.eurKhr?.sellCash || 4752.59,
      unit: 'KHR',
      subtext: 'សហភាពអឺរ៉ុបសាច់ប្រាក់',
    },
    {
      id: 'cny',
      isSpecialApp: false,
      headerBadge: null,
      flag: '🇨🇳',
      currencyName: 'យ៉ន់ចិន',
      currencyCode: 'CNY',
      buyRate: currencies.cnyKhr?.buyCash || 583.0,
      sellRate: currencies.cnyKhr?.sellCash || 599.0,
      unit: 'KHR',
      subtext: 'យាន់ចិនសាច់ប្រាក់',
    },
    {
      id: 'thb',
      isSpecialApp: false,
      headerBadge: null,
      flag: '🇹🇭',
      currencyName: 'បាតថៃ',
      currencyCode: 'THB',
      buyRate: currencies.thbKhr?.buyCash || 118.0,
      sellRate: currencies.thbKhr?.sellCash || 123.0,
      unit: 'KHR',
      subtext: 'បាតថៃសាច់ប្រាក់',
    },
  ];

  // Selected currency rate for converter
  const getCurrencyRates = () => {
    switch (selectedCurrency) {
      case 'USD_APP':
        return {
          name: 'USD (អេស៊ីលីដាអែប)',
          buy: currencies.acleda.buyAccount || 4055.0,
          sell: currencies.acleda.sellAccount || 4067.0,
          unitMultiplier: 1,
        };
      case 'USD_CASH':
        return {
          name: 'USD (សាច់ប្រាក់)',
          buy: currencies.acleda.buyCash || 4053.0,
          sell: currencies.acleda.sellCash || 4069.0,
          unitMultiplier: 1,
        };
      case 'VND':
        return {
          name: 'VND (ដុង)',
          buy: currencies.vndKhr?.perVndBuy || 0.1545,
          sell: currencies.vndKhr?.perVndSell || 0.1570,
          unitMultiplier: 1,
        };
      case 'LAK':
        return {
          name: 'LAK (គីប)',
          buy: currencies.lakKhr?.perLakBuy || 0.1699,
          sell: currencies.lakKhr?.perLakSell || 0.1998,
          unitMultiplier: 1,
        };
      case 'AUD':
        return {
          name: 'AUD (ដុល្លារអូស្ត្រាលី)',
          buy: currencies.audKhr?.buyCash || 2415.59,
          sell: currencies.audKhr?.sellCash || 3002.92,
          unitMultiplier: 1,
        };
      case 'EUR':
        return {
          name: 'EUR (អឺរ៉ូ)',
          buy: currencies.eurKhr?.buyCash || 4158.38,
          sell: currencies.eurKhr?.sellCash || 4752.59,
          unitMultiplier: 1,
        };
      case 'CNY':
        return {
          name: 'CNY (យ៉ន់)',
          buy: currencies.cnyKhr?.buyCash || 583.0,
          sell: currencies.cnyKhr?.sellCash || 599.0,
          unitMultiplier: 1,
        };
      case 'THB':
        return {
          name: 'THB (បាត)',
          buy: currencies.thbKhr?.buyCash || 118.0,
          sell: currencies.thbKhr?.sellCash || 123.0,
          unitMultiplier: 1,
        };
    }
  };

  const currentRates = getCurrencyRates();
  const buyRate = currentRates.buy;
  const sellRate = currentRates.sell;
  const unitMult = currentRates.unitMultiplier;

  // Calculation
  const convertedKhr = direction === 'FOREIGN_TO_KHR' ? (amount * buyRate) / unitMult : 0;
  const convertedForeign =
    direction === 'KHR_TO_FOREIGN' ? (sellRate > 0 ? (amount * unitMult) / sellRate : 0) : 0;

  // Save Manual Form Updates
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCurrencies) {
      const now = new Date();
      const timeStr = `កែប្រែដោយដៃ ម៉ោង ${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      onUpdateCurrencies((prev) => ({
        ...prev,
        acleda: {
          ...prev.acleda,
          buyCash: Number(editForm.buyCash),
          sellCash: Number(editForm.sellCash),
          buyAccount: Number(editForm.buyApp),
          sellAccount: Number(editForm.sellApp),
          source: 'តារាងអត្រាប្ដូរប្រាក់ ACLEDA (កែសម្រួលដោយអ្នកប្រើប្រាស់)',
        },
        usdKhrMarket: {
          buy: Number(editForm.buyCash),
          sell: Number(editForm.sellCash),
          change24h: 0,
        },
        usdKhrNbc: {
          official: Number(editForm.nbcOfficial),
          change24h: 0,
        },
        vndKhr: {
          rate: Number(editForm.vndSell) * 10000,
          perVndBuy: Number(editForm.vndBuy),
          perVndSell: Number(editForm.vndSell),
          buyCash: Number(editForm.vndBuy) * 10000,
          sellCash: Number(editForm.vndSell) * 10000,
          change24h: 0,
        },
        lakKhr: {
          rate: Number(editForm.lakSell) * 1000,
          perLakBuy: Number(editForm.lakBuy),
          perLakSell: Number(editForm.lakSell),
          buyCash: Number(editForm.lakBuy) * 1000,
          sellCash: Number(editForm.lakSell) * 1000,
          change24h: 0,
        },
        audKhr: {
          rate: Number(editForm.audSell),
          buyCash: Number(editForm.audBuy),
          sellCash: Number(editForm.audSell),
          change24h: 0,
        },
        eurKhr: {
          ...prev.eurKhr,
          rate: Number(editForm.eurSell),
          buyCash: Number(editForm.eurBuy),
          sellCash: Number(editForm.eurSell),
        },
        cnyKhr: {
          ...prev.cnyKhr,
          rate: Number(editForm.cnySell),
          buyCash: Number(editForm.cnyBuy),
          sellCash: Number(editForm.cnySell),
        },
        thbKhr: {
          ...prev.thbKhr,
          rate: Number(editForm.thbSell),
          buyCash: Number(editForm.thbBuy),
          sellCash: Number(editForm.thbSell),
        },
        lastUpdated: timeStr,
      }));
    }
    setIsEditModalOpen(false);
  };

  const handleResetToOfficial = () => {
    if (onUpdateCurrencies) {
      onUpdateCurrencies((prev) => ({
        ...prev,
        acleda: {
          bankName: 'ធនាគារ អេស៊ីលីដា ភីអិលស៊ី (ACLEDA Bank Plc.)',
          buyCash: 4053,
          sellCash: 4069,
          buyAccount: 4055,
          sellAccount: 4067,
          change24h: 0,
          source: 'តារាងអត្រាប្ដូរប្រាក់ផ្លូវការ ACLEDA Mobile',
          confidence: '100% (ACLEDA Mobile Official)',
        },
        usdKhrMarket: { buy: 4053, sell: 4069, change24h: 0 },
        usdKhrNbc: { official: 4059, change24h: 0 },
        vndKhr: {
          rate: 1570,
          perVndBuy: 0.1545,
          perVndSell: 0.1570,
          buyCash: 1545,
          sellCash: 1570,
          change24h: 0,
        },
        lakKhr: {
          rate: 199.8,
          perLakBuy: 0.1699,
          perLakSell: 0.1998,
          buyCash: 169.9,
          sellCash: 199.8,
          change24h: 0,
        },
        audKhr: {
          rate: 3002.92,
          buyCash: 2415.59,
          sellCash: 3002.92,
          change24h: 0,
        },
        eurKhr: {
          rate: 4752.59,
          buyCash: 4158.38,
          sellCash: 4752.59,
          buyAccount: 4300.0,
          sellAccount: 4650.0,
          change24h: 0,
        },
        cnyKhr: {
          rate: 599.0,
          buyCash: 583.0,
          sellCash: 599.0,
          buyAccount: 587.0,
          sellAccount: 595.0,
          change24h: 0,
        },
        thbKhr: {
          rate: 123.0,
          buyCash: 118.0,
          sellCash: 123.0,
          buyAccount: 119.0,
          sellAccount: 122.0,
          change24h: 0,
        },
        lastUpdated: '២០-វិច្ឆិកា-២០២៦ | ម៉ោង ០៤:១៥ ល្ងាច',
      }));
      setEditForm({
        buyApp: 4055,
        sellApp: 4067,
        buyCash: 4053,
        sellCash: 4069,
        nbcOfficial: 4059,
        vndBuy: 0.1545,
        vndSell: 0.157,
        lakBuy: 0.1699,
        lakSell: 0.1998,
        audBuy: 2415.59,
        audSell: 3002.92,
        eurBuy: 4158.38,
        eurSell: 4752.59,
        cnyBuy: 583.0,
        cnySell: 599.0,
        thbBuy: 118.0,
        thbSell: 123.0,
      });
    }
    setIsEditModalOpen(false);
  };

  // Request AI Analysis from server
  const handleRequestAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: 'USDKHR',
          currentPrice: acleda.sellCash,
          high24h: acleda.sellCash + 4,
          low24h: acleda.buyCash - 3,
          timeframe: 'Daily',
          contextData: {
            acledaBuyApp: acleda.buyAccount,
            acledaSellApp: acleda.sellAccount,
            acledaBuyCash: acleda.buyCash,
            acledaSellCash: acleda.sellCash,
            nbcOfficial: currencies.usdKhrNbc.official,
            dxy: 104.25,
            vndRate: currencies.vndKhr?.perVndSell,
            lakRate: currencies.lakKhr?.perLakSell,
            audRate: currencies.audKhr?.sellCash,
            eurRate: currencies.eurKhr?.sellCash,
            cnyRate: currencies.cnyKhr?.sellCash,
            thbRate: currencies.thbKhr?.sellCash,
            strategy: 'NBC Peg Intervention + IMS/RSI + MA (20,50,200)',
          },
        }),
      });
      const data = await res.json();
      if (data.analysisText) {
        setAiReport(data.analysisText);
      }
    } catch {
      setAiReport('បរាជ័យក្នុងការទាញយកការវិភាគ AI សូមព្យាយាមម្តងទៀត');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTelegramCurrencyReport = () => {
    const text = `🏦 <b>របាយការណ៍អត្រាប្ដូរប្រាក់ផ្លូវការ ACLEDA Mobile</b>
📅 កាលបរិច្ឆេទ: ២០-វិច្ឆិកា-២០២៦ | ម៉ោង ០៤:១៥ ល្ងាច
✅ ប្រភព: តារាងអត្រាប្ដូរប្រាក់ផ្លូវការ ACLEDA Mobile

🇰🇭 <b>១. អត្រាប្ដូរប្រាក់ USD/KHR:</b>
📱 <b>អត្រាពិសេសលើអេស៊ីលីដាអែប (App):</b>
• ទិញចូល: <b>${(currencies.acleda.buyAccount || 4055).toLocaleString(undefined, { minimumFractionDigits: 2 })} ៛</b>
• លក់ចេញ: <b>${(currencies.acleda.sellAccount || 4067).toLocaleString(undefined, { minimumFractionDigits: 2 })} ៛</b>

💵 <b>សាច់ប្រាក់ (Cash / Counter):</b>
• ទិញចូល: <b>${(currencies.acleda.buyCash || 4053).toLocaleString(undefined, { minimumFractionDigits: 2 })} ៛</b>
• លក់ចេញ: <b>${(currencies.acleda.sellCash || 4069).toLocaleString(undefined, { minimumFractionDigits: 2 })} ៛</b>
• អត្រាផ្លូវការធនាគារជាតិ (NBC): <b>${currencies.usdKhrNbc.official.toLocaleString()} ៛</b>

🌐 <b>២. អត្រារូបិយប័ណ្ណបរទេស (ACLEDA Mobile):</b>
• 🇻🇳 VND (ដុងវៀតណាម): ទិញ <b>${currencies.vndKhr?.perVndBuy || 0.1545} ៛</b> · លក់ <b>${currencies.vndKhr?.perVndSell || 0.157} ៛</b> (១០,០០០ ដុង = ${currencies.vndKhr?.buyCash || 1545}៛ / ${currencies.vndKhr?.sellCash || 1570}៛)
• 🇱🇦 LAK (គីបឡាវ): ទិញ <b>${currencies.lakKhr?.perLakBuy || 0.1699} ៛</b> · លក់ <b>${currencies.lakKhr?.perLakSell || 0.1998} ៛</b>
• 🇦🇺 AUD (ដុល្លារអូស្ត្រាលី): ទិញ <b>${(currencies.audKhr?.buyCash || 2415.59).toLocaleString()} ៛</b> · លក់ <b>${(currencies.audKhr?.sellCash || 3002.92).toLocaleString()} ៛</b>
• 🇪🇺 EUR (អឺរ៉ូ): ទិញ <b>${(currencies.eurKhr?.buyCash || 4158.38).toLocaleString()} ៛</b> · លក់ <b>${(currencies.eurKhr?.sellCash || 4752.59).toLocaleString()} ៛</b>
• 🇨🇳 CNY (យ៉ន់ចិន): ទិញ <b>${currencies.cnyKhr?.buyCash || 583.0} ៛</b> · លក់ <b>${currencies.cnyKhr?.sellCash || 599.0} ៛</b>
• 🇹🇭 THB (បាតថៃ): ទិញ <b>${currencies.thbKhr?.buyCash || 118.0} ៛</b> · លក់ <b>${currencies.thbKhr?.sellCash || 123.0} ៛</b>

⚖️ <i>ចំណាំ៖ អត្រាប្ដូរប្រាក់នេះត្រូវបានកំណត់ឡើងក្នុងគោលបំណងជម្រាបជូនជាព័ត៌មានប៉ុណ្ណោះ និងអាចមានការប្រែប្រួល ។</i>`;

    onSendTelegram(text);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              ទំព័រអត្រាប្ដូរប្រាក់ (Exchange Rates: ACLEDA Mobile ផ្លូវការ)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ទិន្នន័យជាក់ស្ដែងពីកម្មវិធី ACLEDA Mobile (USD, VND, LAK, AUD, EUR, CNY, THB)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onUpdateCurrencies && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>កែសម្រួលអត្រា</span>
            </button>
          )}

          <button
            onClick={handleTelegramCurrencyReport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0 shadow-sm shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
            <span>ផ្ញើអត្រាប្ដូរប្រាក់ទៅ Telegram</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Authentic ACLEDA Mobile Exchange Rate Board (Exact Screenshot Recreation) */}
      <div className="space-y-4">
        {/* Mobile Header Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-5 shadow-2xl space-y-5">
          {/* Top Title Bar like the Mobile App */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {/* ACLEDA Eagle Emblem Simulation */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xs">
                🦅
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>អត្រាប្ដូរប្រាក់ (ACLEDA Exchange Rates)</span>
                </div>
                <div className="text-xs text-emerald-400 font-mono">
                  ធនាគារ អេស៊ីលីដា ភីអិលស៊ី · ACLEDA Bank Plc.
                </div>
              </div>
            </div>

            {/* Exact Timestamp Badge from Screenshot */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>២០-វិច្ឆិកា-២០២៦ | ម៉ោង ០៤:១៥ ល្ងាច</span>
            </div>
          </div>

          {/* Table Column Labels */}
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5 sm:col-span-4">រូបិយប័ណ្ណ (Currency)</div>
            <div className="col-span-3 sm:col-span-4 text-center sm:text-right">
              អត្រាទិញ (Buy)
            </div>
            <div className="col-span-4 sm:col-span-4 text-right">អត្រាលក់ (Sell)</div>
          </div>

          {/* Cards List Matching Mobile Screen */}
          <div className="space-y-3">
            {acledaBoardCards.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl p-4 transition-all duration-150 border ${
                  item.isSpecialApp
                    ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Badge for App / Cash */}
                {item.headerBadge && (
                  <div className="mb-2 pb-2 border-b border-slate-800/80 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                        item.isSpecialApp ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {item.isSpecialApp ? (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Banknote className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{item.headerBadge}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.subtext}</span>
                  </div>
                )}

                <div className="grid grid-cols-12 items-center gap-2">
                  {/* Currency Name & Flag */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="Flag">
                      {item.flag}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm sm:text-base">
                        {item.currencyName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <span>{item.currencyCode}</span>
                        {!item.headerBadge && item.subtext && (
                          <span className="hidden sm:inline text-[11px] text-slate-500">
                            · {item.subtext}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buying Rate */}
                  <div className="col-span-3 sm:col-span-4 text-center sm:text-right font-mono tabular-nums">
                    <div className="text-sm sm:text-lg font-bold text-emerald-400">
                      {typeof item.buyRate === 'number' && item.buyRate >= 100
                        ? item.buyRate.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : item.buyRate.toFixed(4)}{' '}
                      <span className="text-xs font-normal text-slate-400">KHR</span>
                    </div>
                  </div>

                  {/* Selling Rate */}
                  <div className="col-span-4 sm:col-span-4 text-right font-mono tabular-nums">
                    <div className="text-sm sm:text-lg font-bold text-amber-300">
                      {typeof item.sellRate === 'number' && item.sellRate >= 100
                        ? item.sellRate.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : item.sellRate.toFixed(4)}{' '}
                      <span className="text-xs font-normal text-slate-400">KHR</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Official Bottom Disclaimer from Screenshot */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 leading-relaxed font-sans">
            <p>
              អត្រាប្ដូរប្រាក់នេះត្រូវបានកំណត់ឡើងក្នុងគោលបំណងជម្រាបជូនជាព័ត៌មានប៉ុណ្ណោះ
              និងអាចមានការប្រែប្រួល ។
            </p>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              អត្រាផ្លូវការធនាគារជាតិនៃកម្ពុជា (NBC Official):{' '}
              <span className="text-white font-bold">
                {currencies.usdKhrNbc.official.toLocaleString()} ៛
              </span>{' '}
              · សន្ទស្សន៍ DXY: <span className="text-sky-400 font-bold">104.25</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Trend Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>
              ២. ក្រាបនិន្នាការ Trend + Strategy, IMS (RSI) & Moving Averages (MA20, MA50, MA200)
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">ACLEDA USD/KHR</span>
        </div>

        <ChartComponent
          assetName="អត្រាប្ដូរប្រាក់ធនាគារអេស៊ីលីដា (USD/KHR)"
          symbol="ACLEDA_USDKHR"
          currentPrice={acleda.sellCash}
          currencyPrefix=""
          currencySuffix=" ៛"
          isKhr={true}
        />
      </div>

      {/* SECTION 3: Technical Synthesis & Forecast */}
      <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              ៣. ការផ្តល់ការវិភាគ សំយោគ និង ការព្យាករណ៍ ឡើង/ចុះ (Technical Synthesis & Forecast)
            </h2>
          </div>

          <button
            onClick={handleRequestAiAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
          >
            {isAiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isAiLoading ? 'កំពុងសំយោគ...' : 'សុំការវិភាគបន្ថែមពី Gemini AI'}</span>
          </button>
        </div>

        {/* Synthesis Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ការព្យាករណ៍អត្រាប្ដូរប្រាក់
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
              <span>ស្ថិរភាព (STABLE)</span>
            </div>
            <div className="text-xs font-mono text-emerald-300">
              កម្រិតជឿជាក់: <b>៩៤%</b>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              ចន្លោះ ៤,០៥០ - ៤,០៦៩ ៛ តាមអន្តរាគមន៍ NBC
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Moving Averages (MA)
            </div>
            <div className="text-sm font-bold text-white">ចលនាលំនឹងតាម MA</div>
            <div className="text-xs font-mono space-y-0.5 text-slate-300">
              <div>
                MA20: <span className="text-sky-300 font-bold">4,064 ៛</span>
              </div>
              <div>
                MA50: <span className="text-amber-300 font-bold">4,066 ៛</span>
              </div>
              <div>
                MA200: <span className="text-purple-300 font-bold">4,069 ៛</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              សន្ទស្សន៍ IMS / RSI (14)
            </div>
            <div className="text-2xl font-black font-mono text-purple-300 tabular-nums">51.2</div>
            <div className="text-xs text-purple-300 font-sans">
              លំនឹងពេញលេញ (Neutral Equilibrium)
            </div>
            <div className="text-[11px] text-slate-400 font-sans">គ្មានសម្ពាធអតិផរណារូបិយវត្ថុ</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5 font-mono text-xs">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-sans">
              យុទ្ធសាស្ត្ររូបិយវត្ថុ (Policy)
            </div>
            <div>
              Support NBC:{' '}
              <span className="text-emerald-400 font-bold">{currencies.usdKhrNbc.official} ៛</span>
            </div>
            <div>
              Resistance ទីផ្សារ: <span className="text-rose-400 font-bold">4,070 ៛</span>
            </div>
            <div>
              App Spread:{' '}
              <span className="text-sky-300 font-bold">
                {currencies.acleda.sellAccount - currencies.acleda.buyAccount} ៛ (12៛)
              </span>
            </div>
            <div>
              Cash Spread:{' '}
              <span className="text-amber-300 font-bold">
                {currencies.acleda.sellCash - currencies.acleda.buyCash} ៛ (16៛)
              </span>
            </div>
          </div>
        </div>

        {/* Synthesis Commentary */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="font-semibold text-emerald-300 font-sans flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ការសំយោគរួម (Executive Synthesis for Exchange Rates):</span>
          </div>
          <p>
            • <b>ការវាយតម្លៃអត្រាអេស៊ីលីដា និង ប្រាក់រៀល៖</b> ធនាគារ អេស៊ីលីដា
            ផ្តល់អត្រាពិសេសលើអេស៊ីលីដាអែប ទិញចូល <b>{currencies.acleda.buyAccount.toLocaleString()} ៛</b>{' '}
            និងលក់ចេញ <b>{currencies.acleda.sellAccount.toLocaleString()} ៛</b>{' '}
            (ចំណេញជាងសាច់ប្រាក់)។ អត្រាសាច់ប្រាក់គឺ ទិញចូល{' '}
            <b>{currencies.acleda.buyCash.toLocaleString()} ៛</b> និងលក់ចេញ{' '}
            <b>{currencies.acleda.sellCash.toLocaleString()} ៛</b>។
            អត្រាផ្លូវការធនាគារជាតិនៃកម្ពុជា (NBC) គឺ{' '}
            <b>{currencies.usdKhrNbc.official.toLocaleString()} ៛</b> បង្ហាញពីស្ថិរភាពខ្ពស់។
          </p>
        </div>

        {aiReport && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/50 space-y-2 text-xs text-slate-200">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Bot className="w-4 h-4" />
              <span>ការវិភាគលម្អិតពី Gemini AI Engine</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed font-sans">{aiReport}</div>
          </div>
        )}
      </div>

      {/* SECTION 4: Interactive Multi-Currency Calculator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>៤. ម៉ាស៊ីនគណនាប្ដូរប្រាក់តាមអត្រាអេស៊ីលីដា (ACLEDA Currency Calculator)</span>
          </h2>

          {/* Currency Selector */}
          <div className="flex flex-wrap rounded-lg border border-slate-700 bg-slate-950 p-0.5 text-xs font-mono">
            {[
              { id: 'USD_APP', label: 'USD (App)' },
              { id: 'USD_CASH', label: 'USD (Cash)' },
              { id: 'VND', label: 'VND' },
              { id: 'LAK', label: 'LAK' },
              { id: 'AUD', label: 'AUD' },
              { id: 'EUR', label: 'EUR' },
              { id: 'CNY', label: 'CNY' },
              { id: 'THB', label: 'THB' },
            ].map((curr) => (
              <button
                key={curr.id}
                onClick={() => setSelectedCurrency(curr.id as any)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedCurrency === curr.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              {direction === 'FOREIGN_TO_KHR'
                ? `ទឹកប្រាក់ ${currentRates.name}:`
                : 'ទឹកប្រាក់រៀល (KHR ៛):'}
            </label>
            <div className="flex rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
              <input
                type="number"
                min="0.1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2.5 bg-transparent font-mono text-white text-base focus:outline-none"
              />
              <span className="bg-slate-900 text-slate-400 px-3 text-xs flex items-center border-l border-slate-700 font-mono">
                {direction === 'FOREIGN_TO_KHR' ? currentRates.name : 'KHR'}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center pt-2 md:pt-4">
            <button
              onClick={() =>
                setDirection(direction === 'FOREIGN_TO_KHR' ? 'KHR_TO_FOREIGN' : 'FOREIGN_TO_KHR')
              }
              className="p-2.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
              title="ផ្លាស់ប្ដូរទិសដៅប្ដូរប្រាក់ (Swap)"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              {direction === 'FOREIGN_TO_KHR'
                ? 'ទឹកប្រាក់រៀលដែលទទួលបាន (KHR):'
                : `ទឹកប្រាក់ ${currentRates.name} ដែលទទួលបាន:`}
            </label>
            <div className="flex rounded-lg border border-emerald-500/40 bg-slate-950 p-2.5 items-center justify-between">
              <div className="font-mono text-emerald-400 text-xl font-bold tabular-nums">
                {direction === 'FOREIGN_TO_KHR'
                  ? `${Math.round(convertedKhr).toLocaleString()} ៛`
                  : `${convertedForeign.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })} ${currentRates.name}`}
              </div>
              <span className="text-xs text-slate-400 font-sans">
                (អត្រា {direction === 'FOREIGN_TO_KHR' ? buyRate : sellRate} ៛)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Rate Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  កែសម្រួលអត្រាប្ដូរប្រាក់ (Edit ACLEDA Rates)
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="p-5 space-y-4 text-xs font-mono max-h-[75vh] overflow-y-auto"
            >
              {/* USD App */}
              <div>
                <label className="block text-slate-300 font-sans mb-1 font-semibold text-emerald-400">
                  USD អត្រាលើអេស៊ីលីដាអែប (App):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">ទិញចូល (Buy):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.buyApp}
                      onChange={(e) =>
                        setEditForm({ ...editForm, buyApp: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-emerald-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">លក់ចេញ (Sell):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.sellApp}
                      onChange={(e) =>
                        setEditForm({ ...editForm, sellApp: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300"
                    />
                  </div>
                </div>
              </div>

              {/* USD Cash */}
              <div>
                <label className="block text-slate-300 font-sans mb-1 font-semibold text-sky-400">
                  USD សាច់ប្រាក់ (Cash):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">ទិញចូល (Buy):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.buyCash}
                      onChange={(e) =>
                        setEditForm({ ...editForm, buyCash: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-emerald-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">លក់ចេញ (Sell):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.sellCash}
                      onChange={(e) =>
                        setEditForm({ ...editForm, sellCash: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300"
                    />
                  </div>
                </div>
              </div>

              {/* Foreign Currencies */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-300 font-sans font-semibold">
                    VND (ដុង) ក្នុង ១ ដុង:
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    value={editForm.vndSell}
                    onChange={(e) =>
                      setEditForm({ ...editForm, vndSell: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-300 font-sans font-semibold">
                    LAK (គីប) ក្នុង ១ គីប:
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    value={editForm.lakSell}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lakSell: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-300 font-sans font-semibold">AUD (ដុល្លារអូស្ត្រាលី):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.audSell}
                    onChange={(e) =>
                      setEditForm({ ...editForm, audSell: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-300 font-sans font-semibold">EUR (អឺរ៉ូ):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.eurSell}
                    onChange={(e) =>
                      setEditForm({ ...editForm, eurSell: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-300 font-sans font-semibold">CNY (យ៉ន់ចិន):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.cnySell}
                    onChange={(e) =>
                      setEditForm({ ...editForm, cnySell: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-300 font-sans font-semibold">THB (បាតថៃ):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.thbSell}
                    onChange={(e) =>
                      setEditForm({ ...editForm, thbSell: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={handleResetToOfficial}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>កំណត់ឡើងវិញ (Official)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>រក្សាទុក</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 5: Currency Market News Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-400" />
            <span>៥. ព័ត៌មានទីផ្សាររូបិយប័ណ្ណជាក់លាក់ (Currency & Macro News)</span>
          </h2>
          <span className="text-xs text-slate-400">គោលនយោបាយរូបិយវត្ថុ NBC, ប្រាក់រៀល, យាន់, និង DXY</span>
        </div>

        <MarketNews
          onSendTelegram={onSendTelegram}
          isWidgetMode={true}
          defaultCategory="currency"
        />
      </div>
    </div>
  );
}

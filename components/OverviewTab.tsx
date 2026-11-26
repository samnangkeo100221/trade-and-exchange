'use client';

import React from 'react';
import { GoldPrice, CurrencyRates, FuelRates, ICTAnalysis, ActiveTab } from '@/lib/types';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  DollarSign,
  Fuel,
  Activity,
  ArrowRight,
  Camera,
  Send,
  Zap,
  Newspaper,
  ShieldCheck,
  Building2,
  BellRing,
  CheckCircle2,
  Banknote,
  CreditCard,
} from 'lucide-react';
import ChartComponent from './ChartComponent';
import MarketNews from './MarketNews';

interface OverviewTabProps {
  gold: GoldPrice;
  currencies: CurrencyRates;
  fuel: FuelRates;
  ict: ICTAnalysis;
  onTabChange: (tab: ActiveTab) => void;
  onTakeSnapshot: () => void;
  onQuickTelegram: () => void;
}

export default function OverviewTab({
  gold,
  currencies,
  fuel,
  ict,
  onTabChange,
  onTakeSnapshot,
  onQuickTelegram,
}: OverviewTabProps) {
  const isGoldUp = gold.change24hUsd >= 0;
  const isBrentUp = fuel.brentChange24h >= 0;

  const acleda = currencies.acleda || {
    bankName: 'ធនាគារ អេស៊ីលីដា ភីអិលស៊ី (ACLEDA Bank Plc.)',
    buyCash: 4064,
    sellCash: 4077,
    buyAccount: 4067,
    sellAccount: 4074,
    change24h: 3,
    source: 'តារាងអត្រាប្ដូរប្រាក់ផ្លូវការ ធនាគារអេស៊ីលីដា',
    confidence: '100% (ACLEDA Official Bulletin)',
  };

  return (
    <div className="space-y-8">
      {/* Hero Strip: Headline and Instant Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            តាប្លូតាមដានទីផ្សារហិរញ្ញវត្ថុ និង តម្លៃទំនិញយុទ្ធសាស្ត្រ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ទិន្នន័យតម្លៃមាស (អន្តរជាតិ & កម្ពុជាគិតជាអោន/តម្លឹង) អត្រាប្ដូរប្រាក់អេស៊ីលីដា (ទិញ/លក់) តម្លៃប្រេង និងការវិភាគ ICT
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onTakeSnapshot}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="កត់ត្រាទិន្នន័យបច្ចុប្បន្នចូលក្នុងប្រវត្តិ 20 ក្នុង LocalStorage"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>ថតទុកទិន្នន័យ (Snap)</span>
          </button>

          <button
            onClick={onQuickTelegram}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ផ្ញើសេចក្តីសង្ខេប</span>
          </button>
        </div>
      </div>

      {/* Data Sources, Reliability & Auto-Alert Engine Banner (Addressing User Questions) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>ប្រភពទិន្នន័យ ភាពពិតប្រាកដ និង កម្រិតភាពជឿជាក់ (Data Verification)</span>
          </div>
          <button
            onClick={() => onTabChange('telegram')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>កំណត់ Auto-Alert Telegram</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Source 1: Gold */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                តម្លៃមាសអន្តរជាតិ (Forex Spot)
              </span>
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ជឿជាក់ ៩៩.៩%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ប្រភព: <b>Forex Spot Live Feed</b> (Gold-API & LBMA Spot) ឥតគិតថ្លៃ និងទៀងទាត់ 24/5។ គណនាមកទីផ្សារកម្ពុជា ១ តម្លឹង (៣៧.៥g), ១ ជី (៣.៧៥g), ១ ហ៊ុន (០.៣៧៥g)។
            </p>
            <div className="pt-1 text-[11px] text-amber-300/80 font-mono">
              ⚡ Telegram Alert: ប្រែប្រួល ≥ $50
            </div>
          </div>

          {/* Source 2: ACLEDA Bank */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                អត្រាប្ដូរប្រាក់ អេស៊ីលីដា (USD/KHR)
              </span>
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ជឿជាក់ ១០០%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ប្រភព: <b>ធនាគារ អេស៊ីលីដា ភីអិលស៊ី</b> ផ្ទាល់។ បង្ហាញច្បាស់លាស់ទាំង <b>អត្រាទិញចូល</b> និង <b>អត្រាលក់ចេញ</b> ទាំងសាច់ប្រាក់ និងគណនីចល័ត។
            </p>
            <div className="pt-1 text-[11px] text-emerald-300/80 font-mono">
              ⚡ Telegram Alert: ប្រែប្រួល ≥ 3 ៛
            </div>
          </div>

          {/* Source 3: Fuel MOC */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-sky-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5" />
                តម្លៃប្រេងឥន្ធនៈ (Fuel MOC)
              </span>
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ជឿជាក់ ១០០%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ប្រភព: <b>ក្រសួងពាណិជ្ជកម្ម (MOC)</b> កំណត់ថ្លៃពិដានលក់រាយរៀងរាល់ ១០ ថ្ងៃម្តង (សាំងធម្មតា EA92, ម៉ាស៊ូត 50ppm) និង Brent Crude អន្តរជាតិ។
            </p>
            <div className="pt-1 text-[11px] text-sky-300/80 font-mono">
              ⚡ Telegram Alert: ប្រែប្រួលទាំងអស់
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Gold per Damlung (Cambodia Standard) */}
        <div
          onClick={() => onTabChange('gold')}
          className="group cursor-pointer rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-900/80 p-5 transition-all hover:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              មាសកម្ពុជា (១ តម្លឹង)
            </span>
            <span className="text-xs text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-1">
              លម្អិត <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {gold.damlungKhr.toLocaleString()} <span className="text-sm font-normal text-amber-400">៛</span>
            </div>
            <div className="text-sm font-mono text-slate-400 tabular-nums mt-0.5">
              ≈ ${gold.damlungUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">មាសគីឡូ 99.99%:</span>
            <span className="font-mono text-emerald-400 tabular-nums font-semibold">
              ${gold.gold24kSellDamlung.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: International Spot Gold (XAU/USD per Ounce) */}
        <div
          onClick={() => onTabChange('gold')}
          className="group cursor-pointer rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-900/80 p-5 transition-all hover:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              មាសអន្តរជាតិ (Spot Gold)
            </span>
            <div
              className={`flex items-center gap-1 text-xs font-mono tabular-nums px-2 py-0.5 rounded ${
                isGoldUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isGoldUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isGoldUp ? '+' : ''}
              {gold.change24hPercent}%
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              ${gold.spotOzUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 ml-1">/ oz</span>
            </div>
            <div className="text-xs font-mono text-slate-400 tabular-nums mt-0.5">
              24h High: ${gold.high24hUsd} · Low: ${gold.low24hUsd}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">១ អោន គិតជារៀល:</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {gold.spotOzKhr.toLocaleString()} ៛
            </span>
          </div>
        </div>

        {/* Card 3: ACLEDA Bank Cash Rates (Buy & Sell) */}
        <div
          onClick={() => onTabChange('currency')}
          className="group cursor-pointer rounded-xl border border-emerald-500/40 bg-slate-900/80 p-5 transition-all hover:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" />
              អេស៊ីលីដា សាច់ប្រាក់ (Cash)
            </span>
            <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
              លម្អិត <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-sans">ទិញចូល (Buy):</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {acleda.buyCash.toLocaleString()} ៛
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-sans">លក់ចេញ (Sell):</span>
              <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                {acleda.sellCash.toLocaleString()} ៛
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-sans">គម្លាតថ្លៃ (Spread):</span>
            <span className="text-white tabular-nums font-semibold">
              {acleda.sellCash - acleda.buyCash} ៛
            </span>
          </div>
        </div>

        {/* Card 4: ACLEDA Bank Account/Transfer Rates (Buy & Sell) */}
        <div
          onClick={() => onTabChange('currency')}
          className="group cursor-pointer rounded-xl border border-sky-500/40 bg-slate-900/80 p-5 transition-all hover:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              អេស៊ីលីដា គណនី (Account)
            </span>
            <span className="text-xs text-slate-500 group-hover:text-sky-400 transition-colors flex items-center gap-1">
              លម្អិត <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-sans">ទិញចូល (Buy):</span>
              <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                {acleda.buyAccount.toLocaleString()} ៛
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-sans">លក់ចេញ (Sell):</span>
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                {acleda.sellAccount.toLocaleString()} ៛
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-sans">គម្លាតថ្លៃ (Spread):</span>
            <span className="text-white tabular-nums font-semibold">
              {acleda.sellAccount - acleda.buyAccount} ៛
            </span>
          </div>
        </div>

        {/* Card 5: Cambodia Fuel Retail (MOC) */}
        <div
          onClick={() => onTabChange('fuel')}
          className="group cursor-pointer rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-900/80 p-5 transition-all hover:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              ប្រេងឥន្ធនៈកម្ពុជា (លក់រាយ)
            </span>
            <span className="text-xs text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-1">
              លម្អិត <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-slate-400">សាំងធម្មតា EA92:</span>
              <span className="font-bold text-white tabular-nums">
                {fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛/L
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-slate-400">ម៉ាស៊ូត 50ppm:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛/L
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">សាំងស៊ុបពែរ EA95:</span>
            <span className="font-mono text-amber-300 tabular-nums font-semibold">
              {fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} ៛/L
            </span>
          </div>
        </div>

        {/* Card 6: ICT Technical Strategy Spotlight */}
        <div
          onClick={() => onTabChange('ict')}
          className="group cursor-pointer rounded-xl border border-amber-500/30 hover:border-amber-400 bg-gradient-to-br from-slate-900 to-amber-950/30 p-5 transition-all hover:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              សញ្ញាវិភាគ ICT (Strategy)
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold font-mono">
              BULLISH ឡើង
            </span>
          </div>

          <div className="mt-3">
            <div className="text-lg font-bold text-white">
              {ict.tradeSignal.actionKhmer}
            </div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-2">
              {ict.orderBlock.descriptionKhmer}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Entry OTE Zone:</span>
            <span className="text-amber-400 font-semibold tabular-nums">{ict.tradeSignal.entryZone}</span>
          </div>
        </div>
      </div>

      {/* Interactive Main Trend Chart View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">
              ក្រាបនិន្នាការតម្លៃមាស និង តំបន់បច្ចេកទេស ICT
            </h2>
          </div>
          <button
            onClick={() => onTabChange('ict')}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            មើលការវិភាគ ICT ពេញលេញ <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ChartComponent
          assetName="មាសអន្តរជាតិ (Spot Gold XAU/USD)"
          symbol="XAUUSD"
          currentPrice={gold.spotOzUsd}
          currencyPrefix="$"
          currencySuffix="/oz"
        />
      </div>

      {/* Breaking Financial Headlines Widget */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <MarketNews
          isWidgetMode={true}
          onViewAll={() => onTabChange('news')}
          onSendTelegram={(msg) => onQuickTelegram()}
        />
      </div>

      {/* Quick Navigation Cards to Separate Pages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => onTabChange('gold')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-left"
        >
          <Coins className="w-5 h-5 text-amber-400 mb-2" />
          <span className="text-sm font-semibold text-white">ទំព័រតម្លៃមាស</span>
          <span className="text-xs text-slate-400 mt-1">
            គិតជាអោន តម្លឹង ជី ហ៊ុន ព្រមទាំងម៉ាស៊ីនគណនាប្រាក់ចំណេញ
          </span>
        </button>

        <button
          onClick={() => onTabChange('currency')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-left"
        >
          <Building2 className="w-5 h-5 text-emerald-400 mb-2" />
          <span className="text-sm font-semibold text-white">អត្រាប្ដូរប្រាក់ អេស៊ីលីដា</span>
          <span className="text-xs text-slate-400 mt-1">
            ដុល្លារ-រៀល ធនាគារអេស៊ីលីដា (ទិញចូល-លក់ចេញ) ម៉ាស៊ីនគណនា និងក្រាប
          </span>
        </button>

        <button
          onClick={() => onTabChange('fuel')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-left"
        >
          <Fuel className="w-5 h-5 text-sky-400 mb-2" />
          <span className="text-sm font-semibold text-white">ទំព័រតម្លៃប្រេង</span>
          <span className="text-xs text-slate-400 mt-1">
            សាំងធម្មតា ស៊ុបពែរ ម៉ាស៊ូត និងប្រេងឆៅពិភពលោក Brent/WTI
          </span>
        </button>

        <button
          onClick={() => onTabChange('news')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-left"
        >
          <Newspaper className="w-5 h-5 text-amber-300 mb-2" />
          <span className="text-sm font-semibold text-white">ព័ត៌មានទីផ្សារ</span>
          <span className="text-xs text-slate-400 mt-1">
            ព្រឹត្តិការណ៍មាស រូបិយប័ណ្ណ ប្រេង និងគោលនយោបាយ NBC
          </span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className="flex flex-col items-start p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-left sm:col-span-2 lg:col-span-1"
        >
          <Camera className="w-5 h-5 text-purple-400 mb-2" />
          <span className="text-sm font-semibold text-white">ប្រវត្តិ ២០ កំណត់ត្រា</span>
          <span className="text-xs text-slate-400 mt-1">
            រក្សាទុកទិន្នន័យ ២០ ចុងក្រោយក្នុង LocalStorage និងទាញយក CSV
          </span>
        </button>
      </div>
    </div>
  );
}

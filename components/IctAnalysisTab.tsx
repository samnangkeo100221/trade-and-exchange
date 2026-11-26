'use client';

import React, { useState } from 'react';
import { ICTAnalysis, GoldPrice, CurrencyRates, FuelRates } from '@/lib/types';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Send,
  ShieldAlert,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import ChartComponent from './ChartComponent';

interface IctAnalysisTabProps {
  ict: ICTAnalysis;
  gold: GoldPrice;
  currencies: CurrencyRates;
  fuel: FuelRates;
  onSendTelegram: (text: string) => void;
}

interface AssetIctData {
  name: string;
  price: number;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  biasKhmer: string;
  signalAction: string;
  entryZone: string;
  stopLoss: number;
  tp1: number;
  tp2: number;
  rr: string;
  obLow: number;
  obHigh: number;
  fvgLow: number;
  fvgHigh: number;
  bsl: number;
  ssl: number;
  bos: number;
  summary: string;
}

export default function IctAnalysisTab({
  ict,
  gold,
  currencies,
  fuel,
  onSendTelegram,
}: IctAnalysisTabProps) {
  const [selectedAsset, setSelectedAsset] = useState<'XAUUSD' | 'USDKHR' | 'BRENT'>('XAUUSD');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Asset configurations for ICT
  const assetConfigs: Record<'XAUUSD' | 'USDKHR' | 'BRENT', AssetIctData> = {
    XAUUSD: {
      name: 'មាសអន្តរជាតិ (Spot Gold XAU/USD)',
      price: gold.spotOzUsd,
      bias: 'BULLISH',
      biasKhmer: 'ឡើង (Bullish និន្នាការកើនឡើង)',
      signalAction: 'រង់ចាំទិញ / Long ក្នុងតំបន់ Discount OTE',
      entryZone: '$2,674.00 - $2,679.00',
      stopLoss: 2663.50,
      tp1: 2700.00,
      tp2: 2715.00,
      rr: '1 : 2.8',
      obLow: 2670.00,
      obHigh: 2676.50,
      fvgLow: 2677.20,
      fvgHigh: 2683.00,
      bsl: 2710.00,
      ssl: 2660.00,
      bos: 2682.00,
      summary: 'រចនាសម្ព័ន្ធទីផ្សារ Bullish Order Flow។ Smart Money បាន sweep យក SSL នៅ $2660 រួចបង្កើត BOS ទៅលើ។ យុទ្ធសាស្ត្រល្អគឺរង់ចាំ Retracement ចូល Discount Zone (FVG & Bullish OB) ដើម្បីចូល Buy/Long។',
    },
    USDKHR: {
      name: 'ដុល្លារ-រៀល (USD/KHR Exchange Rate)',
      price: currencies.usdKhrMarket.sell,
      bias: 'NEUTRAL',
      biasKhmer: 'រង់ចាំ / ស្ថិរភាព (Range-Bound / Neutral)',
      signalAction: 'រង់ចាំមើល (Wait / Range Trade)',
      entryZone: '4,058 ៛ - 4,065 ៛',
      stopLoss: 4050,
      tp1: 4075,
      tp2: 4085,
      rr: '1 : 2.0',
      obLow: 4055,
      obHigh: 4060,
      fvgLow: 4062,
      fvgHigh: 4068,
      bsl: 4085,
      ssl: 4052,
      bos: 4072,
      summary: 'អត្រាប្ដូរប្រាក់ USD/KHR កំពុងស្ថិតក្នុងតំបន់ Consolidation ចន្លោះ 4,055 - 4,080 ៛ ដោយមានការគ្រប់គ្រងអតិផរណា និងអន្តរាគមន៍ពីធនាគារជាតិនៃកម្ពុជា (NBC)។',
    },
    BRENT: {
      name: 'ប្រេងឆៅពិភពលោក (Brent Crude Oil)',
      price: fuel.brentCrudeUsd,
      bias: 'BULLISH',
      biasKhmer: 'ឡើងស្រាល (Mild Bullish Rebound)',
      signalAction: 'ទិញសាកល្បង (Long Pullback)',
      entryZone: '$73.50 - $74.00',
      stopLoss: 72.20,
      tp1: 76.50,
      tp2: 78.00,
      rr: '1 : 2.5',
      obLow: 73.00,
      obHigh: 73.80,
      fvgLow: 73.90,
      fvgHigh: 74.30,
      bsl: 76.80,
      ssl: 72.50,
      bos: 74.20,
      summary: 'តម្លៃប្រេងឆៅ Brent បាន retest លើតំបន់ Demand Zone / Bullish OB នៅ $73.00។ កម្លាំងទិញត្រឡប់មកវិញដោយសារការកាត់បន្ថយការផ្គត់ផ្គង់របស់ OPEC+។',
    },
  };

  const assetConfig: AssetIctData = assetConfigs[selectedAsset];

  // Call server-side Gemini API
  const handleGenerateAiAnalysis = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: selectedAsset,
          currentPrice: assetConfig.price,
          timeframe: '4H / Daily',
          contextData: {
            bias: assetConfig.bias,
            entry: assetConfig.entryZone,
            sl: assetConfig.stopLoss,
            tp: assetConfig.tp1,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'បរាជ័យក្នុងការវិភាគ');
      }

      setAiReport(data.analysisText);
    } catch (err: any) {
      setAiError(err.message || 'កំហុសបច្ចេកទេសក្នុងការវិភាគ AI');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Telegram Signal Alert
  const handleSendSignalTelegram = () => {
    const text = `🎯 <b>សញ្ញាវិភាគបច្ចេកទេស ICT (Inner Circle Trader)</b>
📊 ទ្រព្យសកម្ម: <b>${assetConfig.name}</b>
💰 តម្លៃបច្ចុប្បន្ន: <b>${assetConfig.price}</b>

🧭 <b>និន្នាការទីផ្សារ (Bias):</b> ${assetConfig.biasKhmer}
⚡ <b>សកម្មភាព (Signal):</b> <b>${assetConfig.signalAction}</b>

📍 <b>កម្រិតបច្ចេកទេសសំខាន់ៗ:</b>
• តំបន់ចូល (Entry Zone): <code>${assetConfig.entryZone}</code>
• កាត់ខាត (Stop Loss): <code>${assetConfig.stopLoss}</code>
• យកចំណេញ TP1: <code>${assetConfig.tp1}</code>
• យកចំណេញ TP2: <code>${assetConfig.tp2}</code>
• Risk / Reward: <b>${assetConfig.rr}</b>

📦 <b>តំបន់ ICT:</b>
• Order Block (OB): ${assetConfig.obLow} - ${assetConfig.obHigh}
• Fair Value Gap (FVG): ${assetConfig.fvgLow} - ${assetConfig.fvgHigh}
• Buy-Side Liquidity (BSL): ${assetConfig.bsl}

💡 <b>ការសន្និដ្ឋាន:</b>
${assetConfig.summary}`;

    onSendTelegram(text);
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              ការវិភាគបច្ចេកទេសតាមយុទ្ធសាស្ត្រ ICT (Inner Circle Trader)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Order Block (OB), Fair Value Gap (FVG), Liquidity Sweeps, Market Structure Shift (MSS) និង OTE Entry
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSendSignalTelegram}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span>ផ្ញើសញ្ញា ICT ទៅ Telegram</span>
          </button>
        </div>
      </div>

      {/* Asset Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => {
            setSelectedAsset('XAUUSD');
            setAiReport(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            selectedAsset === 'XAUUSD'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>មាស XAU/USD</span>
          <span className="text-xs font-mono font-normal">(${gold.spotOzUsd})</span>
        </button>

        <button
          onClick={() => {
            setSelectedAsset('USDKHR');
            setAiReport(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            selectedAsset === 'USDKHR'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>ដុល្លារ-រៀល USD/KHR</span>
          <span className="text-xs font-mono font-normal">({currencies.usdKhrMarket.sell}៛)</span>
        </button>

        <button
          onClick={() => {
            setSelectedAsset('BRENT');
            setAiReport(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            selectedAsset === 'BRENT'
              ? 'bg-sky-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>ប្រេងឆៅ Brent</span>
          <span className="text-xs font-mono font-normal">(${fuel.brentCrudeUsd})</span>
        </button>
      </div>

      {/* Primary ICT Signal Card & Key Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Signal & Bias Matrix */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                ICT Market Bias & Direction
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">{assetConfig.name}</h2>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                assetConfig.bias === 'BULLISH'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : assetConfig.bias === 'BEARISH'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              {assetConfig.bias === 'BULLISH' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : assetConfig.bias === 'BEARISH' ? (
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              ) : (
                <Compass className="w-4 h-4 text-amber-400" />
              )}
              {assetConfig.bias} (
              {assetConfig.bias === 'BULLISH' ? 'ឡើង' : assetConfig.bias === 'BEARISH' ? 'ចុះ' : 'រង់ចាំ'})
            </div>
          </div>

          {/* Action Recommendation Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400">ផែនការសកម្មភាពដែលបានណែនាំ (Action Signal):</div>
            <div className="text-lg font-bold text-amber-400 mt-1">{assetConfig.signalAction}</div>
            <div className="text-xs text-slate-300 mt-1.5 leading-relaxed">{assetConfig.summary}</div>
          </div>

          {/* ICT Core Structure Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {/* Order Block */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-emerald-500/30">
              <div className="flex items-center gap-1.5 text-emerald-400 font-sans font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>Bullish Order Block (OB)</span>
              </div>
              <div className="text-base font-bold text-white mt-1 tabular-nums">
                {assetConfig.obLow} - {assetConfig.obHigh}
              </div>
              <div className="text-xs font-sans text-slate-400 mt-1">
                តំបន់ Smart Money Accumulation (Discount Zone)
              </div>
            </div>

            {/* Fair Value Gap */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-sky-500/30">
              <div className="flex items-center gap-1.5 text-sky-400 font-sans font-semibold">
                <Target className="w-3.5 h-3.5" />
                <span>Fair Value Gap (FVG)</span>
              </div>
              <div className="text-base font-bold text-white mt-1 tabular-nums">
                {assetConfig.fvgLow} - {assetConfig.fvgHigh}
              </div>
              <div className="text-xs font-sans text-slate-400 mt-1">
                ចន្លោះ Imbalance រង់ចាំតម្លៃ Retest មកបំពេញ
              </div>
            </div>

            {/* Liquidity Target BSL */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-rose-500/30">
              <div className="text-rose-400 font-sans font-semibold">Buy-Side Liquidity (BSL)</div>
              <div className="text-base font-bold text-white mt-1 tabular-nums">{assetConfig.bsl}</div>
              <div className="text-xs font-sans text-slate-400 mt-1">Equal Highs / គោលដៅដេញថ្លៃ</div>
            </div>

            {/* Liquidity Target SSL */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 font-sans font-semibold">Sell-Side Liquidity (SSL)</div>
              <div className="text-base font-bold text-white mt-1 tabular-nums">{assetConfig.ssl}</div>
              <div className="text-xs font-sans text-slate-400 mt-1">Swing Lows / បាន Swept រួចរាល់</div>
            </div>
          </div>
        </div>

        {/* Right: Trade Setup & Execution Parameters */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-3">
              ការកំណត់ចំណុចចូល និង គ្រប់គ្រងហានិភ័យ (Trade Setup)
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-sans text-slate-300">តំបន់ចូល (Entry Zone):</span>
                <span className="text-amber-400 font-bold tabular-nums text-sm">{assetConfig.entryZone}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-rose-500/20">
                <span className="font-sans text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  កាត់ខាត (Stop Loss):
                </span>
                <span className="text-rose-400 font-bold tabular-nums text-sm">{assetConfig.stopLoss}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-emerald-500/20">
                <span className="font-sans text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  យកចំណេញ TP1:
                </span>
                <span className="text-emerald-400 font-bold tabular-nums text-sm">{assetConfig.tp1}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-emerald-500/20">
                <span className="font-sans text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  យកចំណេញ TP2:
                </span>
                <span className="text-emerald-400 font-bold tabular-nums text-sm">{assetConfig.tp2}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-sans text-slate-300">ផលចំណេញធៀបនឹងហានិភ័យ (R:R):</span>
                <span className="text-white font-bold tabular-nums text-sm">{assetConfig.rr}</span>
              </div>
            </div>
          </div>

          {/* AI Generation Trigger */}
          <div className="pt-2">
            <button
              onClick={handleGenerateAiAnalysis}
              disabled={isGeneratingAi}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-60 shadow-md shadow-amber-500/10"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'កំពុងវិភាគដោយ AI...' : 'បង្កើតការវិភាគ ICT ដោយ Gemini AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Output Display if requested */}
      {aiError && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 text-xs">
          {aiError}
        </div>
      )}

      {aiReport && (
        <div className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>របាយការណ៍វិភាគបច្ចេកទេស ICT លម្អិត (បង្កើតដោយ Gemini AI)</span>
            </div>
            <button
              onClick={() => onSendTelegram(aiReport)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-medium border border-amber-500/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ផ្ញើការវិភាគនេះទៅ Telegram</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {aiReport}
          </div>
        </div>
      )}

      {/* Trend Chart with ICT Overlay */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white">
          ក្រាបបច្ចេកទេសទៀនជប៉ុន (Candlestick) ជាមួយ ICT Overlay
        </h3>
        <ChartComponent
          assetName={assetConfig.name}
          symbol={selectedAsset}
          currentPrice={assetConfig.price}
          currencyPrefix={selectedAsset === 'USDKHR' ? '' : '$'}
          currencySuffix={selectedAsset === 'USDKHR' ? ' ៛' : selectedAsset === 'XAUUSD' ? '/oz' : '/bbl'}
          isKhr={selectedAsset === 'USDKHR'}
        />
      </div>

      {/* Educational Guide for Cambodian Users on ICT Strategy */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          ចំណេះដឹងយុទ្ធសាស្ត្រ ICT (Inner Circle Trader) សម្រាប់ទីផ្សារហិរញ្ញវត្ថុ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-amber-400 font-semibold">1. Order Block (OB)</div>
            <p className="leading-relaxed text-slate-400">
              ជាតំបន់ដែលស្ថាប័នហិរញ្ញវត្ថុធំៗ (Smart Money/Banks) បានប្រមូលទិញ (Accumulate) ឬលក់ចេញ (Distribute)។ ពេលតម្លៃវិលមកតំបន់នេះ គឺជាឱកាសចូលទិញក្នុងតម្លៃថោក (Discount)។
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-sky-400 font-semibold">2. Fair Value Gap (FVG)</div>
            <p className="leading-relaxed text-slate-400">
              កើតឡើងនៅពេលតម្លៃហក់ឡើង ឬចុះលឿនពេក (Displacement) បង្កើតចន្លោះប្រហោងអតុល្យភាពរវាងទៀនទី១ និងទី៣។ ទីផ្សារតែងតែមាននិន្នាការត្រឡប់មក retest បំពេញចន្លោះ FVG នេះ។
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-rose-400 font-semibold">3. Liquidity Sweeps (BSL/SSL)</div>
            <p className="leading-relaxed text-slate-400">
              ទីផ្សារត្រូវការ thanh khoản (Liquidity) ពី Stop Loss របស់អ្នកជួញដូររាយរង។ Smart Money នឹងរុញតម្លៃទៅស៊ី Stop Loss លើកំពូល (BSL) ឬបាត (SSL) មុនពេលប្តូរទិសដៅពិតប្រាកដ។
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

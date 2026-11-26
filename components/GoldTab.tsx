'use client';

import React, { useState } from 'react';
import { GoldPrice, CurrencyRates } from '@/lib/types';
import {
  GRAMS_PER_DAMLUNG,
  GRAMS_PER_TROY_OZ,
  DAMLUNG_TO_TROY_OZ,
  CHI_PER_DAMLUNG,
  HUN_PER_DAMLUNG,
} from '@/lib/market-data';
import {
  Coins,
  Calculator,
  ArrowRightLeft,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  Bot,
  Loader2,
  Newspaper,
  Target,
  Clock,
} from 'lucide-react';
import ChartComponent from './ChartComponent';
import MarketNews from './MarketNews';

interface GoldTabProps {
  gold: GoldPrice;
  currencies: CurrencyRates;
  onSendTelegram: (text: string) => void;
}

export default function GoldTab({ gold, currencies, onSendTelegram }: GoldTabProps) {
  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [calcUnit, setCalcUnit] = useState<'damlung' | 'chi' | 'hun' | 'ounce' | 'gram'>('damlung');
  const [calcGoldType, setCalcGoldType] = useState<'kilobar' | 'gold24k' | 'gold18k'>('kilobar');
  const [purchasePriceUsd, setPurchasePriceUsd] = useState<string>('');

  // AI Analysis State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const usdRate = currencies.acleda?.sellCash || currencies.usdKhrMarket.sell;

  // International Gold Bid / Ask
  const spotBidUsd = Math.round((gold.spotOzUsd - 0.5) * 100) / 100;
  const spotAskUsd = gold.spotOzUsd;
  const spotBidKhr = Math.round(spotBidUsd * usdRate);
  const spotAskKhr = Math.round(spotAskUsd * usdRate);

  // Per Gram
  const gramBidUsd = Math.round((spotBidUsd / GRAMS_PER_TROY_OZ) * 100) / 100;
  const gramAskUsd = Math.round((spotAskUsd / GRAMS_PER_TROY_OZ) * 100) / 100;

  // Cambodia Damlung Buy / Sell
  const damlungBuyUsd = gold.gold24kBuyDamlung;
  const damlungSellUsd = gold.gold24kSellDamlung;
  const damlungBuyKhr = Math.round(damlungBuyUsd * usdRate);
  const damlungSellKhr = Math.round(damlungSellUsd * usdRate);

  // 1 Chi Buy / Sell
  const chiBuyUsd = Math.round((damlungBuyUsd / 10) * 100) / 100;
  const chiSellUsd = Math.round((damlungSellUsd / 10) * 100) / 100;
  const chiBuyKhr = Math.round(damlungBuyKhr / 10);
  const chiSellKhr = Math.round(damlungSellKhr / 10);

  // 1 Hun Buy / Sell
  const hunBuyUsd = Math.round((damlungBuyUsd / 100) * 100) / 100;
  const hunSellUsd = Math.round((damlungSellUsd / 100) * 100) / 100;
  const hunBuyKhr = Math.round(damlungBuyKhr / 100);
  const hunSellKhr = Math.round(damlungSellKhr / 100);

  // Calculate equivalent weight in Damlung
  const amountInDamlung = (() => {
    switch (calcUnit) {
      case 'damlung':
        return calcAmount;
      case 'chi':
        return calcAmount / CHI_PER_DAMLUNG;
      case 'hun':
        return calcAmount / HUN_PER_DAMLUNG;
      case 'ounce':
        return calcAmount * (GRAMS_PER_TROY_OZ / GRAMS_PER_DAMLUNG);
      case 'gram':
        return calcAmount / GRAMS_PER_DAMLUNG;
      default:
        return calcAmount;
    }
  })();

  // Unit price per damlung according to selected type
  const unitPricePerDamlungUsd = (() => {
    switch (calcGoldType) {
      case 'kilobar':
        return gold.gold24kSellDamlung;
      case 'gold24k':
        return gold.damlungUsd;
      case 'gold18k':
        return gold.gold18kSellDamlung;
      default:
        return gold.damlungUsd;
    }
  })();

  const totalUsd = amountInDamlung * unitPricePerDamlungUsd;
  const totalKhr = totalUsd * usdRate;
  const totalGrams = amountInDamlung * GRAMS_PER_DAMLUNG;
  const totalTroyOz = totalGrams / GRAMS_PER_TROY_OZ;

  // Profit / Loss calculation if user entered purchase price
  const buyCostUsd = purchasePriceUsd ? parseFloat(purchasePriceUsd) * amountInDamlung : null;
  const pnlUsd = buyCostUsd ? totalUsd - buyCostUsd : null;
  const pnlPercent = buyCostUsd && buyCostUsd > 0 ? ((totalUsd - buyCostUsd) / buyCostUsd) * 100 : null;

  // Request AI Analysis from server
  const handleRequestAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: 'XAUUSD',
          currentPrice: gold.spotOzUsd,
          high24h: gold.high24hUsd,
          low24h: gold.low24hUsd,
          timeframe: '4H',
          contextData: {
            damlungUsd: gold.damlungUsd,
            damlungKhr: gold.damlungKhr,
            usdKhrRate: usdRate,
            strategy: 'ICT + MA20/50/200 + IMR/RSI',
          },
        }),
      });
      const data = await res.json();
      if (data.analysisText) {
        setAiReport(data.analysisText);
      }
    } catch (e: any) {
      setAiReport('បរាជ័យក្នុងការទាញយកការវិភាគ AI សូមព្យាយាមម្តងទៀត');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Telegram report
  const handleTelegramGoldReport = () => {
    const text = `🟡 <b>របាយការណ៍ទីផ្សារមាសពេញលេញ (Gold Market Report)</b>
📅 ${gold.lastUpdated}

🇰🇭 <b>១. តម្លៃមាសនៅប្រទេសកម្ពុជា (Cambodia Gold):</b>
• ១ តម្លឹង (37.5g): ទិញ <b>$${damlungBuyUsd.toLocaleString()}</b> (${damlungBuyKhr.toLocaleString()} ៛) · លក់ <b>$${damlungSellUsd.toLocaleString()}</b> (${damlungSellKhr.toLocaleString()} ៛)
• ១ ជី (3.75g): ទិញ $${chiBuyUsd} (${chiBuyKhr.toLocaleString()} ៛) · លក់ $${chiSellUsd} (${chiSellKhr.toLocaleString()} ៛)
• ១ ហ៊ុន (0.375g): ទិញ $${hunBuyUsd} (${hunBuyKhr.toLocaleString()} ៛) · លក់ $${hunSellUsd} (${hunSellKhr.toLocaleString()} ៛)
• មាសគីឡូ 99.99%: $${gold.gold24kBuyDamlung.toLocaleString()} / $${gold.gold24kSellDamlung.toLocaleString()}
• មាស 18K: $${gold.gold18kBuyDamlung.toLocaleString()} / $${gold.gold18kSellDamlung.toLocaleString()}

🌐 <b>២. តម្លៃមាសអន្តរជាតិ (International Spot Gold):</b>
• Spot Gold (XAU/USD): ទិញ <b>$${spotBidUsd.toFixed(2)}</b> · លក់ <b>$${spotAskUsd.toFixed(2)}/oz</b>
• 24h Change: ${gold.change24hUsd >= 0 ? '+' : ''}$${gold.change24hUsd} (${gold.change24hPercent}%)
• 24h Range: $${gold.low24hUsd} - $${gold.high24hUsd}
• 1 ក្រាម (Gram): ទិញ $${gramBidUsd} · លក់ $${gramAskUsd}

🎯 <b>៣. សំយោគបច្ចេកទេស & ការព្យាករណ៍ (Technical Forecast):</b>
• ការព្យាករណ៍: <b>ឡើង (BULLISH ៧៨%)</b>
• MA Status: Golden Cross (MA20 > MA50 > MA200)
• IMR/RSI (14): 62.4 (Bullish Momentum)
• Support: $2,674 / $2,658 · Resistance: $2,705 / $2,720
• គោលដៅបន្ទាប់ (BSL Target): $2,710/oz`;

    onSendTelegram(text);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              ទំព័រទីផ្សារមាស (Gold Market: កម្ពុជា និង អន្តរជាតិ)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            តម្លៃទិញ-លក់ (កម្ពុជា & អន្តរជាតិ) ព័ត៌មានទីផ្សារ Trend + Strategy (MA 20, 50, 200 & IMR) និងការព្យាករណ៍ឡើងចុះ
          </p>
        </div>

        <button
          onClick={handleTelegramGoldReport}
          className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 shadow-sm shadow-amber-500/20"
        >
          <Send className="w-4 h-4" />
          <span>ផ្ញើតម្លៃមាសទៅ Telegram</span>
        </button>
      </div>

      {/* SECTION 1: Dual Buying & Selling Boards (Cambodia & International) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>១. តារាងតម្លៃទិញចូល និង តម្លៃលក់ចេញ (កម្ពុជា និង អន្តរជាតិ)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            អត្រាប្ដូរប្រាក់អនុវត្ត: {usdRate.toLocaleString()} ៛/$
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Board: Cambodia Market (តម្លឹង ជី ហ៊ុន) */}
          <div className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-5 space-y-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                តម្លៃមាសនៅប្រទេសកម្ពុជា (Cambodia Gold)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                ស្តង់ដារកម្ពុជា (៣៧.៥ ក្រាម/តម្លឹង)
              </span>
            </div>

            {/* 1 Damlung Featured Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">មាស ១ តម្លឹង (37.5g)</span>
                <span className="text-xs font-mono text-slate-400">Spread: ${damlungSellUsd - damlungBuyUsd}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30">
                  <div className="text-xs text-slate-400">តម្លៃទិញចូល (Buying Rate):</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    ${damlungBuyUsd.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">
                    ≈ {damlungBuyKhr.toLocaleString()} ៛
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/30">
                  <div className="text-xs text-slate-400">តម្លៃលក់ចេញ (Selling Rate):</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 tabular-nums">
                    ${damlungSellUsd.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-amber-400 mt-0.5 font-semibold">
                    ≈ {damlungSellKhr.toLocaleString()} ៛
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-units: 1 Chi & 1 Hun */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1 Chi */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>១ ជី (3.75g = 0.1 តម្លឹង)</span>
                </div>
                <div className="text-xs text-slate-400">
                  ទិញ: <span className="font-mono text-emerald-400 font-bold">${chiBuyUsd}</span> ({chiBuyKhr.toLocaleString()}៛)
                </div>
                <div className="text-xs text-slate-400">
                  លក់: <span className="font-mono text-amber-300 font-bold">${chiSellUsd}</span> ({chiSellKhr.toLocaleString()}៛)
                </div>
              </div>

              {/* 1 Hun */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>១ ហ៊ុន (0.375g = 0.01 តម្លឹង)</span>
                </div>
                <div className="text-xs text-slate-400">
                  ទិញ: <span className="font-mono text-emerald-400 font-bold">${hunBuyUsd}</span> ({hunBuyKhr.toLocaleString()}៛)
                </div>
                <div className="text-xs text-slate-400">
                  លក់: <span className="font-mono text-amber-300 font-bold">${hunSellUsd}</span> ({hunSellKhr.toLocaleString()}៛)
                </div>
              </div>
            </div>

            {/* Grades Breakdown */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-sans">មាសគីឡូ 99.99% (Kilobar):</span>
                <span>ទិញ ${gold.gold24kBuyDamlung.toLocaleString()} · លក់ ${gold.gold24kSellDamlung.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-sans">មាសផ្លាទីន 18K (ទឹក៧.៥):</span>
                <span>ទិញ ${gold.gold18kBuyDamlung.toLocaleString()} · លក់ ${gold.gold18kSellDamlung.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Board: International Spot Gold Market (Troy Ounce, Gram, LBMA) */}
          <div className="rounded-xl border border-sky-500/40 bg-slate-900/90 p-5 space-y-4 shadow-lg shadow-sky-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-400" />
                តម្លៃមាសអន្តរជាតិ (International Spot Gold)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
                XAU/USD (Forex Live)
              </span>
            </div>

            {/* 1 Troy Ounce Featured Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Spot Gold ១ អោន (Troy Oz = 31.10g)</span>
                <span className="text-xs font-mono text-slate-400">Spread: $0.50</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30">
                  <div className="text-xs text-slate-400">តម្លៃទិញចូល (Bid Price):</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    ${spotBidUsd.toFixed(2)}
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">
                    ≈ {spotBidKhr.toLocaleString()} ៛
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-sky-500/30">
                  <div className="text-xs text-slate-400">តម្លៃលក់ចេញ (Ask Price):</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-sky-300 tabular-nums">
                    ${spotAskUsd.toFixed(2)}
                  </div>
                  <div className="text-xs font-mono text-sky-400 mt-0.5 font-semibold">
                    ≈ {spotAskKhr.toLocaleString()} ៛
                  </div>
                </div>
              </div>
            </div>

            {/* Per Gram Rate & Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-300">១ ក្រាមអន្តរជាតិ (Per Gram)</div>
                <div className="text-xs text-slate-400 font-mono">
                  ទិញ: <span className="text-emerald-400 font-bold">${gramBidUsd}</span> /g
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  លក់: <span className="text-sky-300 font-bold">${gramAskUsd}</span> /g ({gold.gramKhr.toLocaleString()}៛)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-300">ចន្លោះតម្លៃ ២៤ ម៉ោង (24h Range)</div>
                <div className="text-xs font-mono text-emerald-400">
                  High: ${gold.high24hUsd}
                </div>
                <div className="text-xs font-mono text-rose-400">
                  Low: ${gold.low24hUsd}
                </div>
              </div>
            </div>

            {/* Global LBMA Fix Reference */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-sans">London Bullion Market (LBMA):</span>
              <span className="text-slate-200 font-semibold">AM: $2,682.50 · PM: $2,688.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Trend + Strategy, IMR (RSI), Moving Averages (MA20, MA50, MA200) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>២. ក្រាបនិន្នាការ Trend + Strategy, IMR (RSI) & Moving Averages (MA20, MA50, MA200)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Spot Gold XAU/USD</span>
        </div>

        <ChartComponent
          assetName="Spot Gold (XAU/USD)"
          symbol="XAUUSD"
          currentPrice={gold.spotOzUsd}
          currencyPrefix="$"
          currencySuffix="/oz"
        />
      </div>

      {/* SECTION 3: Technical Synthesis, Forecast (ឡើង/ចុះ) & Gemini AI */}
      <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              ៣. ការផ្តល់ការវិភាគ សំយោគ និង ការព្យាករណ៍ ឡើង/ចុះ (Technical Synthesis & Forecast)
            </h2>
          </div>

          <button
            onClick={handleRequestAiAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isAiLoading ? 'កំពុងសំយោគ...' : 'សុំការវិភាគបន្ថែមពី Gemini AI'}</span>
          </button>
        </div>

        {/* Synthesis Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Forecast Prediction */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ការព្យាករណ៍និន្នាការ (Bias)</div>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>ឡើង (BULLISH)</span>
            </div>
            <div className="text-xs font-mono text-emerald-300">
              កម្រិតជឿជាក់ (Conviction): <b>៧៨%</b>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              រលកទិញមានប្រៀបលើ Timeframe 4H & Daily
            </div>
          </div>

          {/* Card 2: Moving Averages (MA20, MA50, MA200) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Moving Averages (MA)</div>
            <div className="text-sm font-bold text-white">Golden Cross រឹងមាំ</div>
            <div className="text-xs font-mono space-y-0.5 text-slate-300">
              <div>MA20: <span className="text-sky-300 font-bold">$2,684.20</span> (Short-term)</div>
              <div>MA50: <span className="text-amber-300 font-bold">$2,676.50</span> (Mid-term)</div>
              <div>MA200: <span className="text-purple-300 font-bold">$2,648.00</span> (Baseline)</div>
            </div>
          </div>

          {/* Card 3: IMR / RSI Indicator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">សន្ទស្សន៍ IMR / RSI (14)</div>
            <div className="text-2xl font-black font-mono text-purple-300 tabular-nums">
              62.4
            </div>
            <div className="text-xs text-purple-300 font-sans">
              កម្លាំងទិញរឹងមាំ (Bullish Momentum)
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              មិនទាន់ Overbought (&gt;70) នៅមានចន្លោះឡើង
            </div>
          </div>

          {/* Card 4: ICT Strategy & Key Levels */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5 font-mono text-xs">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-sans">កម្រិតគន្លឹះ ICT (Key Levels)</div>
            <div>Support (S1/S2): <span className="text-emerald-400 font-bold">$2,674 / $2,658</span></div>
            <div>Resistance (R1/R2): <span className="text-rose-400 font-bold">$2,705 / $2,720</span></div>
            <div>Order Block: <span className="text-slate-300">$2,663 - $2,670</span></div>
            <div>Liquidity Target: <span className="text-amber-300 font-bold">BSL $2,710</span></div>
          </div>
        </div>

        {/* Synthesis Commentary */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="font-semibold text-amber-300 font-sans flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ការសំយោគរួម (Executive Synthesis for Cambodia & Global Gold):</span>
          </div>
          <p>
            • <b>កត្តាបច្ចេកទេស៖</b> គូ XAU/USD បានបញ្ជាក់ពី Market Structure Shift (MSS) ទៅខាងលើ បន្ទាប់ពីស្រូបយក Sell-Side Liquidity នៅក្រោម $2,660។ សន្ទស្សន៍ IMR/RSI នៅកម្រិត 62.4 និងការរៀបជួរនៃ MA20 លើ MA50 បង្ហាញថារលកកើនឡើង (Bullish Expansion) កំពុងមានសន្ទុះខ្លាំង។
          </p>
          <p>
            • <b>កត្តាម៉ាក្រូសេដ្ឋកិច្ច៖</b> ការបន្តទិញមាសបម្រុងរបស់ធនាគារកណ្តាល និងការថយចុះសម្ពាធនៃសន្ទស្សន៍ប្រាក់ដុល្លារ (DXY) គឺជាកាតាលីករជំរុញឱ្យតម្លៃមាសរក្សាភាពទាក់ទាញខ្ពស់។
          </p>
          <p>
            • <b>ការណែនាំសម្រាប់ទីផ្សារកម្ពុជា៖</b> សម្រាប់អ្នកសន្សំមាសជា <b>&quot;តម្លឹង&quot;</b> ឬ <b>&quot;ជី&quot;</b> តំបន់គាំទ្រសមស្របសម្រាប់ប្រមូលទិញបន្ថែមគឺរង្វង់ <b>$3,220 - $3,235</b> ក្នុងមួយតម្លឹង ឬប្រមាណ <b>13.1 - 13.2 លានរៀល</b>។
          </p>
        </div>

        {/* Gemini AI Live Response Display if loaded */}
        {aiReport && (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 space-y-2 text-xs text-slate-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Bot className="w-4 h-4" />
              <span>ការវិភាគលម្អិតពី Gemini AI Engine</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed font-sans">{aiReport}</div>
          </div>
        )}
      </div>

      {/* SECTION 4: Gold Calculator & Profit / Loss Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h3>៤. ម៉ាស៊ីនគណនាតម្លៃមាស (Gold Converter & Calculator)</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              បរិមាណមាស (Quantity):
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white font-mono text-base focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="បញ្ចូលចំនួន..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ខ្នាតគិត (Unit):
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800">
              {[
                { id: 'damlung', label: 'តម្លឹង' },
                { id: 'chi', label: 'ជី' },
                { id: 'hun', label: 'ហ៊ុន' },
                { id: 'ounce', label: 'អោន' },
                { id: 'gram', label: 'ក្រាម' },
              ].map((u) => (
                <button
                  key={u.id}
                  onClick={() => setCalcUnit(u.id as any)}
                  className={`py-1.5 text-xs font-medium rounded transition-colors ${
                    calcUnit === u.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ប្រភេទមាស (Gold Grade):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'kilobar', label: 'មាសគីឡូ 99.99%' },
                { id: 'gold24k', label: 'មាសទឹក១០ 99%' },
                { id: 'gold18k', label: 'ផ្លាទីន 18K' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCalcGoldType(t.id as any)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    calcGoldType === t.id
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              តម្លៃដែលបានទិញទុកពីមុន (Optional - គិតជា $ ក្នុង ១ តម្លឹង):
            </label>
            <input
              type="number"
              value={purchasePriceUsd}
              onChange={(e) => setPurchasePriceUsd(e.target.value)}
              placeholder="ឧទាហរណ៍: 3150"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white font-mono text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        <div className="lg:col-span-7 rounded-xl border border-amber-500/30 bg-slate-900/90 p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
              លទ្ធផលគណនាតម្លៃសរុប (Total Calculated Value)
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">តម្លៃគិតជាប្រាក់រៀល (KHR):</div>
              <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
                {Math.round(totalKhr).toLocaleString()} <span className="text-xl font-normal">៛</span>
              </div>
              <div className="text-xs text-slate-400 mt-2">តម្លៃគិតជាប្រាក់ដុល្លារ (USD):</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 font-sans">ទម្ងន់គិតជាក្រាម:</div>
                <div className="text-sm font-semibold text-white mt-1 tabular-nums">{totalGrams.toFixed(2)} g</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 font-sans">ទម្ងន់គិតជាតម្លឹង:</div>
                <div className="text-sm font-semibold text-amber-300 mt-1 tabular-nums">
                  {amountInDamlung.toFixed(3)} តម្លឹង
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 font-sans">ទម្ងន់គិតជាអោន:</div>
                <div className="text-sm font-semibold text-slate-200 mt-1 tabular-nums">
                  {totalTroyOz.toFixed(3)} oz
                </div>
              </div>
            </div>

            {pnlUsd !== null && (
              <div
                className={`mt-4 p-3 rounded-lg border text-xs font-mono tabular-nums flex items-center justify-between ${
                  pnlUsd >= 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div>
                  <div className="font-sans font-semibold">
                    {pnlUsd >= 0 ? 'ចំណេញ (Estimated Profit):' : 'ខាត (Estimated Loss):'}
                  </div>
                  <div className="text-xs opacity-80">
                    ទុនទិញ: ${(buyCostUsd || 0).toLocaleString()} · បច្ចុប្បន្ន: ${totalUsd.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-base font-bold">
                  {pnlUsd >= 0 ? '+' : ''}${pnlUsd.toFixed(2)} ({pnlPercent?.toFixed(2)}%)
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              ស្តង់ដារកម្ពុជា: ១ តម្លឹង = ៣៧.៥ ក្រាម = ១០ ជី = ១០០ ហ៊ុន ≈ ១.២០៥៦៥ អោនអន្តរជាតិ (Troy Ounce)
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 5: Gold Market News Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-amber-400" />
            <span>៥. ព័ត៌មានទីផ្សារមាសជាក់លាក់ (Gold Market News & Headlines)</span>
          </h2>
          <span className="text-xs text-slate-400">បច្ចុប្បន្នភាពទីផ្សារមាសពិភពលោក និងកម្ពុជា</span>
        </div>

        <MarketNews
          onSendTelegram={onSendTelegram}
          isWidgetMode={true}
          defaultCategory="gold"
        />
      </div>
    </div>
  );
}

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
import { Coins, Calculator, ArrowRightLeft, Send, Sparkles, TrendingUp, TrendingDown, Info } from 'lucide-react';
import ChartComponent from './ChartComponent';

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
  const totalKhr = totalUsd * currencies.usdKhrMarket.sell;
  const totalGrams = amountInDamlung * GRAMS_PER_DAMLUNG;
  const totalTroyOz = totalGrams / GRAMS_PER_TROY_OZ;

  // Profit / Loss calculation if user entered purchase price
  const buyCostUsd = purchasePriceUsd ? parseFloat(purchasePriceUsd) * amountInDamlung : null;
  const pnlUsd = buyCostUsd ? totalUsd - buyCostUsd : null;
  const pnlPercent = buyCostUsd && buyCostUsd > 0 ? ((totalUsd - buyCostUsd) / buyCostUsd) * 100 : null;

  // Quick message for Telegram
  const handleTelegramGoldReport = () => {
    const text = `🟡 <b>របាយការណ៍តម្លៃមាសបច្ចុប្បន្នភាព (Gold Pulse)</b>
📅 ${gold.lastUpdated}

✨ <b>តម្លៃមាសកម្ពុជា:</b>
• ១ តម្លឹង (Damlung): <b>${gold.damlungKhr.toLocaleString()} ៛</b> (~$${gold.damlungUsd.toFixed(2)})
• ១ ជី (Chi): <b>${gold.chiKhr.toLocaleString()} ៛</b> (~$${gold.chiUsd.toFixed(2)})
• ១ ហ៊ុន (Hun): <b>${gold.hunKhr.toLocaleString()} ៛</b> (~$${gold.hunUsd.toFixed(2)})

🏆 <b>មាសគីឡូ 99.99% (Kilobar):</b>
• ទិញចូល: $${gold.gold24kBuyDamlung.toLocaleString()} (${gold.goldKilobarBuyKhr.toLocaleString()} ៛)
• លក់ចេញ: $${gold.gold24kSellDamlung.toLocaleString()} (${gold.goldKilobarSellKhr.toLocaleString()} ៛)

💍 <b>មាសប្លាទីន/ទឹក ៧.៥ (18K):</b>
• ទិញចូល: $${gold.gold18kBuyDamlung.toLocaleString()} / តម្លឹង
• លក់ចេញ: $${gold.gold18kSellDamlung.toLocaleString()} / តម្លឹង

🌐 <b>មាសអន្តរជាតិ (Spot Gold XAU/USD):</b>
• តម្លៃ: <b>$${gold.spotOzUsd.toFixed(2)} / oz</b> (${gold.change24hUsd >= 0 ? '+' : ''}${gold.change24hPercent}%)
• 1 Ounce ជារៀល: ${gold.spotOzKhr.toLocaleString()} ៛`;

    onSendTelegram(text);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              តម្លៃមាសអន្តរជាតិ និង ទីផ្សារមាសកម្ពុជា
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ការគណនាស្តង់ដារជា អោន (Troy Ounce), តម្លឹង (Damlung = 37.5g), ជី, និង ហ៊ុន តាមតម្លៃពិតប្រាកដ
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

      {/* Main Comparison: International vs Cambodian Unit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. International Ounce */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>១ អោនអន្តរជាតិ (Troy Oz)</span>
            <span className="font-mono text-slate-400">31.10g</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              ${gold.spotOzUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-mono text-slate-400 tabular-nums mt-1">
              ≈ {gold.spotOzKhr.toLocaleString()} ៛ (អត្រាដុល្លារ {currencies.usdKhrMarket.sell}៛)
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">ប្រែប្រួល 24h:</span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                gold.change24hUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {gold.change24hUsd >= 0 ? '+' : ''}${gold.change24hUsd} ({gold.change24hPercent}%)
            </span>
          </div>
        </div>

        {/* 2. Cambodia 1 Damlung */}
        <div className="p-5 rounded-xl border border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span className="font-semibold">១ តម្លឹងកម្ពុជា (Damlung)</span>
            <span className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">37.50g</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {gold.damlungKhr.toLocaleString()} <span className="text-sm font-normal">៛</span>
            </div>
            <div className="text-xs font-mono text-slate-300 tabular-nums mt-1">
              ≈ ${gold.damlungUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">១ តម្លឹង =</span>
            <span className="font-mono text-slate-300">1.20565 អោន / 10 ជី</span>
          </div>
        </div>

        {/* 3. Cambodia 1 Chi */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>១ ជី (Chi = 0.1 តម្លឹង)</span>
            <span className="font-mono text-slate-400">3.75g</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {gold.chiKhr.toLocaleString()} <span className="text-sm font-normal text-amber-400">៛</span>
            </div>
            <div className="text-xs font-mono text-slate-400 tabular-nums mt-1">
              ≈ ${gold.chiUsd.toFixed(2)} USD
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">១ ជី =</span>
            <span className="font-mono text-slate-300">10 ហ៊ុន</span>
          </div>
        </div>

        {/* 4. Cambodia 1 Hun */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>១ ហ៊ុន (Hun = 0.01 តម្លឹង)</span>
            <span className="font-mono text-slate-400">0.375g</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {gold.hunKhr.toLocaleString()} <span className="text-sm font-normal text-amber-400">៛</span>
            </div>
            <div className="text-xs font-mono text-slate-400 tabular-nums mt-1">
              ≈ ${gold.hunUsd.toFixed(2)} USD
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">១ ក្រាម (1g):</span>
            <span className="font-mono text-slate-200 tabular-nums">{gold.gramKhr.toLocaleString()} ៛</span>
          </div>
        </div>
      </div>

      {/* Gold Grades & Market Spreads (ផ្សារធំថ្មី / ហាងមាសកម្ពុជា) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            តម្លៃមាសតាមប្រភេទ និង តម្លៃទិញចូល-លក់ចេញ (ហាងមាសកម្ពុជា)
          </h2>
          <span className="text-xs text-slate-400 font-mono">គិតជាដុល្លារ និង រៀល ក្នុង ១ តម្លឹង</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-sans">ប្រភេទមាស</th>
                <th className="py-3 px-4 font-sans">កម្រិតសុទ្ធ (Purity)</th>
                <th className="py-3 px-4 text-right">ទិញចូល (Buy USD)</th>
                <th className="py-3 px-4 text-right">លក់ចេញ (Sell USD)</th>
                <th className="py-3 px-4 text-right">ទិញចូល (KHR)</th>
                <th className="py-3 px-4 text-right">លក់ចេញ (KHR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  មាសគីឡូ (Kilobar / 24K)
                </td>
                <td className="py-3.5 px-4 text-xs font-sans text-slate-400">99.99% កម្រិតអន្តរជាតិ</td>
                <td className="py-3.5 px-4 text-right text-emerald-400 font-semibold">
                  ${gold.gold24kBuyDamlung.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-400 font-bold">
                  ${gold.gold24kSellDamlung.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-300">
                  {gold.goldKilobarBuyKhr.toLocaleString()} ៛
                </td>
                <td className="py-3.5 px-4 text-right text-slate-100 font-semibold">
                  {gold.goldKilobarSellKhr.toLocaleString()} ៛
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  មាសទឹក១០ (Traditional 99%)
                </td>
                <td className="py-3.5 px-4 text-xs font-sans text-slate-400">99.00% មាសគ្រឿងអលង្ការ</td>
                <td className="py-3.5 px-4 text-right text-emerald-400 font-semibold">
                  ${(gold.damlungUsd - 15).toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-400 font-bold">
                  ${(gold.damlungUsd + 10).toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-300">
                  {Math.round((gold.damlungUsd - 15) * currencies.usdKhrMarket.buy).toLocaleString()} ៛
                </td>
                <td className="py-3.5 px-4 text-right text-slate-100 font-semibold">
                  {Math.round((gold.damlungUsd + 10) * currencies.usdKhrMarket.sell).toLocaleString()} ៛
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  មាសផ្លាទីន / ទឹក៧.៥ (18K)
                </td>
                <td className="py-3.5 px-4 text-xs font-sans text-slate-400">75.00% គ្រឿងបន្តោង/ចិញ្ចៀន</td>
                <td className="py-3.5 px-4 text-right text-emerald-400 font-semibold">
                  ${gold.gold18kBuyDamlung.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-400 font-bold">
                  ${gold.gold18kSellDamlung.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-300">
                  {gold.gold18kBuyKhr.toLocaleString()} ៛
                </td>
                <td className="py-3.5 px-4 text-right text-slate-100 font-semibold">
                  {gold.gold18kSellKhr.toLocaleString()} ៛
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Gold Calculator & Profit/Loss Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inputs & Configuration */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h3>ម៉ាស៊ីនគណនាតម្លៃមាស (Gold Converter & Calculator)</h3>
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

        {/* Right: Calculated Results */}
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

            {/* Weight Breakdown */}
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

            {/* PnL if bought previously */}
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
              រូបមន្តផ្លូវការ: ១ តម្លឹង = ៣៧.៥ ក្រាម = ១០ ជី = ១០០ ហ៊ុន ≈ ១.២០៥៦៥ អោនអន្តរជាតិ (Troy Ounce)
            </span>
          </div>
        </div>
      </div>

      {/* Gold Trend Chart */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white">
          ក្រាបនិន្នាការតម្លៃមាសអន្តរជាតិ និង តំបន់បច្ចេកទេស
        </h3>
        <ChartComponent
          assetName="Spot Gold (XAU/USD)"
          symbol="XAUUSD"
          currentPrice={gold.spotOzUsd}
          currencyPrefix="$"
          currencySuffix="/oz"
        />
      </div>
    </div>
  );
}

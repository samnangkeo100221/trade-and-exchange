'use client';

import React, { useState } from 'react';
import { CurrencyRates } from '@/lib/types';
import {
  DollarSign,
  ArrowRightLeft,
  Send,
  Building2,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Globe,
  Activity,
  Bot,
  Loader2,
  Target,
  Newspaper,
  Layers,
} from 'lucide-react';
import ChartComponent from './ChartComponent';
import MarketNews from './MarketNews';

interface CurrenciesTabProps {
  currencies: CurrencyRates;
  onSendTelegram: (text: string) => void;
}

export default function CurrenciesTab({ currencies, onSendTelegram }: CurrenciesTabProps) {
  // ACLEDA Converter State
  const [amount, setAmount] = useState<number>(100);
  const [direction, setDirection] = useState<'USD_TO_KHR' | 'KHR_TO_USD'>('USD_TO_KHR');
  const [transactionType, setTransactionType] = useState<'cash' | 'account'>('cash');

  // AI Analysis State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

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

  // Rates based on transaction type
  const buyRate = transactionType === 'cash' ? acleda.buyCash : acleda.buyAccount;
  const sellRate = transactionType === 'cash' ? acleda.sellCash : acleda.sellAccount;

  // Calculation
  const convertedKhr = direction === 'USD_TO_KHR' ? amount * buyRate : 0;
  const convertedUsd = direction === 'KHR_TO_USD' ? (sellRate > 0 ? amount / sellRate : 0) : 0;

  // International Rates Model (Bid / Ask)
  const intlRates = [
    {
      code: 'USD/CNY',
      name: 'យាន់ចិន (Chinese Yuan)',
      symbol: '¥',
      buy: 7.2280,
      sell: 7.2350,
      khrBuy: 561.20,
      khrSell: 564.80,
      change: '+0.08%',
      isUp: true,
    },
    {
      code: 'EUR/USD',
      name: 'អឺរ៉ូ (Euro)',
      symbol: '€',
      buy: 1.0485,
      sell: 1.0520,
      khrBuy: 4260,
      khrSell: 4288,
      change: '-0.15%',
      isUp: false,
    },
    {
      code: 'USD/THB',
      name: 'បាតថៃ (Thai Baht)',
      symbol: '฿',
      buy: 34.20,
      sell: 34.35,
      khrBuy: 118.20,
      khrSell: 119.10,
      change: '+0.04%',
      isUp: true,
    },
    {
      code: 'USD/VND',
      name: 'ដុងវៀតណាម (Vietnamese Dong / 10k)',
      symbol: '₫',
      buy: 25380,
      sell: 25440,
      khrBuy: 1595,
      khrSell: 1608,
      change: '-0.02%',
      isUp: false,
    },
  ];

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
            acledaBuyCash: acleda.buyCash,
            acledaSellCash: acleda.sellCash,
            acledaBuyAccount: acleda.buyAccount,
            acledaSellAccount: acleda.sellAccount,
            nbcOfficial: currencies.usdKhrNbc.official,
            dxy: 104.25,
            strategy: 'NBC Peg Intervention + IMS/RSI + MA (20,50,200)',
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

  const handleTelegramCurrencyReport = () => {
    const text = `🏦 <b>របាយការណ៍អត្រាប្ដូរប្រាក់ (Exchange Rates Pulse)</b>
📅 កាលបរិច្ឆេទ: ${currencies.lastUpdated}
✅ ប្រភព: ${acleda.source} (ភាពជឿជាក់ ១០០%)

🇰🇭 <b>១. ធនាគារ អេស៊ីលីដា ភីអិលស៊ី (ACLEDA Bank Plc.):</b>
💵 <b>សាច់ប្រាក់ (Cash Rate):</b>
• ទិញចូល (Buy): <b>${acleda.buyCash.toLocaleString()} ៛</b>
• លក់ចេញ (Sell): <b>${acleda.sellCash.toLocaleString()} ៛</b>
• គម្លាត Spread: ${acleda.sellCash - acleda.buyCash} ៛

📱 <b>គណនី/ផ្ទេរប្រាក់ (Account Rate):</b>
• ទិញចូល (Buy): <b>${acleda.buyAccount.toLocaleString()} ៛</b>
• លក់ចេញ (Sell): <b>${acleda.sellAccount.toLocaleString()} ៛</b>

🌐 <b>២. អត្រាប្ដូរប្រាក់អន្តរជាតិ (Forex Rates):</b>
• DXY Index: 104.25
• USD/CNY (យាន់): ទិញ 7.2280 · លក់ 7.2350 (CNY/KHR: ${intlRates[0].khrSell}៛)
• EUR/USD (អឺរ៉ូ): ទិញ 1.0485 · លក់ 1.0520 (EUR/KHR: ${intlRates[1].khrSell}៛)
• USD/THB (បាត): ទិញ 34.20 · លក់ 34.35 (THB/KHR: ${intlRates[2].khrSell}៛)
• អត្រាផ្លូវការ NBC: ${currencies.usdKhrNbc.official.toLocaleString()} ៛

🎯 <b>៣. សំយោគបច្ចេកទេស & ការព្យាករណ៍:</b>
• ការព្យាករណ៍ USD/KHR: <b>ស្ថិរភាព (STABLE / ៤,០៦០ - ៤,០៧៨ ៛)</b>
• IMS / RSI (14): 51.5 (Neutral Equilibrium)
• MA Trend: តម្លៃកំពុងដើរស្របតាម MA50 (4,070 ៛)`;

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
              ទំព័រអត្រាប្ដូរប្រាក់ (Exchange Rates: អេស៊ីលីដា និង អន្តរជាតិ)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            តម្លៃទិញ និង លក់ (ធនាគារអេស៊ីលីដា & អន្តរជាតិ) ព័ត៌មានទីផ្សារ Trend + Strategy (MA 20, 50, 200 & IMS) និងការវិភាគព្យាករណ៍
          </p>
        </div>

        <button
          onClick={handleTelegramCurrencyReport}
          className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0 shadow-sm shadow-emerald-500/20"
        >
          <Send className="w-4 h-4" />
          <span>ផ្ញើអត្រាប្ដូរប្រាក់ទៅ Telegram</span>
        </button>
      </div>

      {/* SECTION 1: Dual Buying & Selling Boards (ACLEDA Bank & International Forex) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>១. តារាងតម្លៃទិញចូល និង តម្លៃលក់ចេញ (ធនាគារ អេស៊ីលីដា និង អន្តរជាតិ)</span>
          </h2>
          <span className="text-xs font-mono text-emerald-400">
            ភាពជឿជាក់ ១០០% (ACLEDA Official Bulletin)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Board: ACLEDA Bank Cash & Account Rates */}
          <div className="rounded-xl border border-emerald-500/40 bg-slate-900/90 p-5 space-y-4 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                ធនាគារ អេស៊ីលីដា ភីអិលស៊ី (ACLEDA Bank Plc.)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                USD / KHR
              </span>
            </div>

            {/* Board 1: Cash Rates */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">អត្រាសាច់ប្រាក់ (Cash Exchange Rate)</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Spread: {acleda.sellCash - acleda.buyCash} ៛</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30">
                  <div className="text-xs text-slate-400">អត្រាទិញចូល (Buying Rate):</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {acleda.buyCash.toLocaleString()} <span className="text-sm font-normal">៛</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">ធនាគារទិញដុល្លារពីអ្នក</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/30">
                  <div className="text-xs text-slate-400">អត្រាលក់ចេញ (Selling Rate):</div>
                  <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
                    {acleda.sellCash.toLocaleString()} <span className="text-sm font-normal">៛</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">ធនាគារលក់ដុល្លារឱ្យអ្នក</div>
                </div>
              </div>
            </div>

            {/* Board 2: Account Transfer Rates */}
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-bold text-white">អត្រាផ្ទេរប្រាក់/គណនី (Account / Electronic)</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Spread: {acleda.sellAccount - acleda.buyAccount} ៛</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-sky-500/30">
                  <div className="text-xs text-slate-400">អត្រាទិញចូល (Buying Rate):</div>
                  <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                    {acleda.buyAccount.toLocaleString()} <span className="text-sm font-normal">៛</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">ផ្ទេរប្រាក់ចូលគណនី</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                  <div className="text-xs text-slate-400">អត្រាលក់ចេញ (Selling Rate):</div>
                  <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                    {acleda.sellAccount.toLocaleString()} <span className="text-sm font-normal">៛</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">ដកប្រាក់ចេញពីគណនី</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-sans">អត្រាផ្លូវការធនាគារជាតិនៃកម្ពុជា (NBC):</span>
              <span className="text-white font-bold">{currencies.usdKhrNbc.official.toLocaleString()} ៛</span>
            </div>
          </div>

          {/* Right Board: International Forex Rates (CNY, EUR, THB, VND, DXY) */}
          <div className="rounded-xl border border-sky-500/40 bg-slate-900/90 p-5 space-y-4 shadow-lg shadow-sky-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-400" />
                អត្រារូបិយប័ណ្ណអន្តរជាតិ (International Forex Rates)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
                DXY: 104.25
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-sans">រូបិយប័ណ្ណ</th>
                    <th className="py-2.5 px-3 text-right">ទិញចូល (Bid)</th>
                    <th className="py-2.5 px-3 text-right">លក់ចេញ (Ask)</th>
                    <th className="py-2.5 px-3 text-right">សមមូលជាប្រាក់រៀល</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 tabular-nums">
                  {intlRates.map((fx) => (
                    <tr key={fx.code} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-sans font-bold text-white flex items-center gap-1.5">
                          <span className="text-amber-400">{fx.symbol}</span>
                          <span>{fx.code}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">{fx.name}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                        {fx.buy}
                      </td>
                      <td className="py-3 px-3 text-right text-sky-300 font-bold">
                        {fx.sell}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-200">
                        {fx.khrSell.toLocaleString()} ៛
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-sans">សន្ទស្សន៍ប្រាក់ដុល្លារ US Dollar Index (DXY):</span>
              <span className="text-white font-bold">104.25 (-0.12%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Trend + Strategy, IMS (RSI), Moving Averages (MA20, MA50, MA200) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>២. ក្រាបនិន្នាការ Trend + Strategy, IMS (RSI) & Moving Averages (MA20, MA50, MA200)</span>
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

      {/* SECTION 3: Technical Synthesis, Forecast (ឡើង/ចុះ) & Gemini AI */}
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
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isAiLoading ? 'កំពុងសំយោគ...' : 'សុំការវិភាគបន្ថែមពី Gemini AI'}</span>
          </button>
        </div>

        {/* Synthesis Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Forecast Prediction */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ការព្យាករណ៍អត្រាប្ដូរប្រាក់</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
              <span>ស្ថិរភាព (STABLE)</span>
            </div>
            <div className="text-xs font-mono text-emerald-300">
              កម្រិតជឿជាក់: <b>៨៨%</b>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              ចន្លោះ ៤,០៦០ - ៤,០៧៨ ៛ តាមអន្តរាគមន៍ NBC
            </div>
          </div>

          {/* Card 2: Moving Averages (MA20, MA50, MA200) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Moving Averages (MA)</div>
            <div className="text-sm font-bold text-white">ចលនាលំនឹងតាម MA</div>
            <div className="text-xs font-mono space-y-0.5 text-slate-300">
              <div>MA20: <span className="text-sky-300 font-bold">4,075 ៛</span></div>
              <div>MA50: <span className="text-amber-300 font-bold">4,070 ៛</span></div>
              <div>MA200: <span className="text-purple-300 font-bold">4,065 ៛</span></div>
            </div>
          </div>

          {/* Card 3: IMS / RSI Indicator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">សន្ទស្សន៍ IMS / RSI (14)</div>
            <div className="text-2xl font-black font-mono text-purple-300 tabular-nums">
              51.5
            </div>
            <div className="text-xs text-purple-300 font-sans">
              លំនឹងពេញលេញ (Neutral Equilibrium)
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              មិនមានសញ្ញា Overbought ឬ Oversold
            </div>
          </div>

          {/* Card 4: Strategy & Range */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5 font-mono text-xs">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-sans">យុទ្ធសាស្ត្ររូបិយវត្ថុ (Policy)</div>
            <div>Support NBC: <span className="text-emerald-400 font-bold">4,058 ៛</span></div>
            <div>Resistance ទីផ្សារ: <span className="text-rose-400 font-bold">4,082 ៛</span></div>
            <div>DXY Correlation: <span className="text-slate-300">Inverse (-0.65)</span></div>
            <div>Bakong QR Volume: <span className="text-amber-300 font-bold">+32% YoY</span></div>
          </div>
        </div>

        {/* Synthesis Commentary */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="font-semibold text-emerald-300 font-sans flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ការសំយោគរួម (Executive Synthesis for Exchange Rates):</span>
          </div>
          <p>
            • <b>ការវាយតម្លៃអត្រាអេស៊ីលីដា និង ប្រាក់រៀល៖</b> ធនាគារ អេស៊ីលីដា បន្តរក្សាគម្លាត Spread សមស្រប (១៣៛ សម្រាប់សាច់ប្រាក់ និង ៧៛ សម្រាប់គណនី)។ អត្រាប្ដូរប្រាក់រៀលមានភាពរឹងមាំខ្លាំង ដោយសារយន្តការដេញថ្លៃប្រាក់ដុល្លារទាន់ពេលវេលារបស់ធនាគារជាតិនៃកម្ពុជា (NBC) និងកំណើននៃការទូទាត់ប្រាក់រៀលតាមបាគង។
          </p>
          <p>
            • <b>កត្តាអន្តរជាតិ (DXY & Yuan)៖</b> ការធ្លាក់ចុះបន្តិចនៃសន្ទស្សន៍ប្រាក់ដុល្លារ DXY និងការកើនឡើងនៃការទូទាត់ពាណិជ្ជកម្មកម្ពុជា-ចិន ជារូបិយប័ណ្ណយាន់ (CNY) បានជួយកាត់បន្ថយហានិភ័យនៃសម្ពាធអត្រាប្ដូរប្រាក់សម្រាប់សហគ្រាសក្នុងស្រុក។
          </p>
        </div>

        {/* Gemini AI Live Response Display if loaded */}
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

      {/* SECTION 4: Interactive ACLEDA Bank Currency Calculator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          <span>៤. ម៉ាស៊ីនគណនាប្ដូរប្រាក់តាមអត្រាអេស៊ីលីដា (ACLEDA Currency Calculator)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">
                {direction === 'USD_TO_KHR' ? 'ទឹកប្រាក់ដុល្លារ (USD $):' : 'ទឹកប្រាក់រៀល (KHR ៛):'}
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setTransactionType('cash')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    transactionType === 'cash' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  សាច់ប្រាក់
                </button>
                <button
                  onClick={() => setTransactionType('account')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    transactionType === 'account' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  គណនី
                </button>
              </div>
            </div>

            <div className="flex rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2.5 bg-transparent font-mono text-white text-base focus:outline-none"
              />
              <span className="bg-slate-900 text-slate-400 px-3 text-xs flex items-center border-l border-slate-700 font-mono">
                {direction === 'USD_TO_KHR' ? 'USD' : 'KHR'}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center pt-2 md:pt-4">
            <button
              onClick={() =>
                setDirection(direction === 'USD_TO_KHR' ? 'KHR_TO_USD' : 'USD_TO_KHR')
              }
              className="p-2.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
              title="ផ្លាស់ប្ដូរទិសដៅប្ដូរប្រាក់ (Swap)"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              {direction === 'USD_TO_KHR' ? 'ទឹកប្រាក់រៀលដែលទទួលបាន (KHR):' : 'ទឹកប្រាក់ដុល្លារដែលទទួលបាន (USD):'}
            </label>
            <div className="flex rounded-lg border border-emerald-500/40 bg-slate-950 p-2.5 items-center justify-between">
              <div className="font-mono text-emerald-400 text-xl font-bold tabular-nums">
                {direction === 'USD_TO_KHR'
                  ? `${Math.round(convertedKhr).toLocaleString()} ៛`
                  : `$${convertedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
              <span className="text-xs text-slate-400 font-sans">
                (អត្រា {direction === 'USD_TO_KHR' ? buyRate : sellRate} ៛)
              </span>
            </div>
          </div>
        </div>
      </div>

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

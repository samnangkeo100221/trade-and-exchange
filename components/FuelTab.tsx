'use client';

import React, { useState } from 'react';
import { FuelRates } from '@/lib/types';
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  Send,
  Gauge,
  Car,
  DollarSign,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Activity,
  Bot,
  Loader2,
  Target,
  Newspaper,
  Layers,
  Globe,
  Info,
} from 'lucide-react';
import ChartComponent from './ChartComponent';
import MarketNews from './MarketNews';

interface FuelTabProps {
  fuel: FuelRates;
  onSendTelegram: (text: string) => void;
}

export default function FuelTab({ fuel, onSendTelegram }: FuelTabProps) {
  // Fuel Calculator State
  const [distanceKm, setDistanceKm] = useState<number>(150); // e.g. Phnom Penh to Kampot
  const [consumptionRate, setConsumptionRate] = useState<number>(7.5); // Liters per 100km
  const [selectedFuelType, setSelectedFuelType] = useState<'regular' | 'super' | 'diesel'>('regular');
  const [selectedChartAsset, setSelectedChartAsset] = useState<'brent' | 'cambodia'>('brent');

  // AI Analysis State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Domestic Gas Station Companies Table Data
  const domesticCompanies = [
    {
      name: 'PTT Cambodia (ភីធីធី)',
      brand: 'PTT',
      badge: 'ស្តង់ដារថៃ',
      superKhr: 4650,
      regularKhr: 4150,
      dieselKhr: 4000,
      note: 'សាំង PTT Performa គុណភាពខ្ពស់',
    },
    {
      name: 'TotalEnergies Cambodia (តូតាល់)',
      brand: 'TotalEnergies',
      badge: 'ស្តង់ដារបារាំង',
      superKhr: 4690,
      regularKhr: 4150,
      dieselKhr: 4050,
      note: 'Excellium Formula សន្សំសំចៃម៉ាស៊ីន',
    },
    {
      name: 'Tela Cambodia (តេលា)',
      brand: 'Tela',
      badge: 'ក្រុមហ៊ុនឈានមុខកម្ពុជា',
      superKhr: 4650,
      regularKhr: 4150,
      dieselKhr: 4000,
      note: 'បណ្តាញស្ថានីយច្រើនជាងគេទូទាំងប្រទេស',
    },
    {
      name: 'Caltex (Chevron Cambodia)',
      brand: 'Caltex',
      badge: 'ស្តង់ដារអាមេរិក',
      superKhr: 4680,
      regularKhr: 4150,
      dieselKhr: 4000,
      note: 'Techron Cleaning Technology',
    },
    {
      name: 'Sokimex Petroleum (សូគីម៉ិច)',
      brand: 'Sokimex',
      badge: 'ក្រុមហ៊ុនក្នុងស្រុក',
      superKhr: 4620,
      regularKhr: 4140,
      dieselKhr: 3990,
      note: 'តម្លៃសមរម្យ តាមបណ្តាខេត្ត',
    },
    {
      name: 'Bright Petroleum (ប្រាយ)',
      brand: 'Bright',
      badge: 'តម្លៃសន្សំ',
      superKhr: 4600,
      regularKhr: 4130,
      dieselKhr: 3980,
      note: 'តម្លៃលក់ប្រកួតប្រជែង',
    },
  ];

  // International Benchmarks
  const brentBid = Math.round((fuel.brentCrudeUsd - 0.2) * 100) / 100;
  const brentAsk = fuel.brentCrudeUsd;
  const wtiBid = Math.round((fuel.wtiCrudeUsd - 0.2) * 100) / 100;
  const wtiAsk = fuel.wtiCrudeUsd;

  // Wholesale / Import Estimate vs Retail Ceiling
  const wholesaleRegularKhr = 3520;
  const wholesaleDieselKhr = 3390;
  const wholesaleSuperKhr = 3980;

  // Calculator
  const unitPriceKhr =
    selectedFuelType === 'regular'
      ? fuel.cambodiaRetail.gasolineRegularKhr
      : selectedFuelType === 'super'
      ? fuel.cambodiaRetail.gasolineSuperKhr
      : fuel.cambodiaRetail.dieselKhr;

  const unitPriceUsd =
    selectedFuelType === 'regular'
      ? fuel.cambodiaRetail.gasolineRegularUsd
      : selectedFuelType === 'super'
      ? fuel.cambodiaRetail.gasolineSuperUsd
      : fuel.cambodiaRetail.dieselUsd;

  const totalLiters = (distanceKm * consumptionRate) / 100;
  const totalTripCostKhr = totalLiters * unitPriceKhr;
  const totalTripCostUsd = totalLiters * unitPriceUsd;
  const costPerKmKhr = distanceKm > 0 ? totalTripCostKhr / distanceKm : 0;

  // Request AI Analysis from server
  const handleRequestAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: 'BRENT',
          currentPrice: fuel.brentCrudeUsd,
          high24h: fuel.brentCrudeUsd + 1.2,
          low24h: fuel.brentCrudeUsd - 0.9,
          timeframe: 'Daily',
          contextData: {
            brentUsd: fuel.brentCrudeUsd,
            wtiUsd: fuel.wtiCrudeUsd,
            cambodiaRegularKhr: fuel.cambodiaRetail.gasolineRegularKhr,
            cambodiaDieselKhr: fuel.cambodiaRetail.dieselKhr,
            strategy: 'MOC Formula + OPEC+ Quota + IMS/RSI + MA (20,50,200)',
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

  const handleTelegramFuelReport = () => {
    const text = `⛽ <b>របាយការណ៍ទីផ្សារប្រេងឥន្ធនៈពេញលេញ (Fuel Market Pulse)</b>
📅 កាលបរិច្ឆេទកំណត់ដោយក្រសួងពាណិជ្ជកម្ម: ${fuel.cambodiaRetail.effectivePeriod}

🇰🇭 <b>១. តម្លៃប្រេងលក់រាយ និង ថ្លៃដើមនាំចូលនៅកម្ពុជា:</b>
• សាំងធម្មតា EA92: <b>${fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.gasolineRegularUsd}) [ថ្លៃដើម: ${wholesaleRegularKhr.toLocaleString()} ៛]
• ម៉ាស៊ូត 50ppm (Diesel): <b>${fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.dieselUsd}) [ថ្លៃដើម: ${wholesaleDieselKhr.toLocaleString()} ៛]
• សាំងស៊ុបពែរ EA95: <b>${fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.gasolineSuperUsd})

🌍 <b>២. តម្លៃប្រេងឆៅពិភពលោក (Global Crude Oil Benchmarks):</b>
• Brent Crude: ទិញ <b>$${brentBid.toFixed(2)}</b> · លក់ <b>$${brentAsk.toFixed(2)}/bbl</b> (${fuel.brentChange24h >= 0 ? '+' : ''}${fuel.brentChange24h}%)
• WTI Crude: ទិញ <b>$${wtiBid.toFixed(2)}</b> · លក់ <b>$${wtiAsk.toFixed(2)}/bbl</b>
• Singapore MOPS 92: $84.20/bbl

🎯 <b>៣. សំយោគបច្ចេកទេស & ការព្យាករណ៍តម្លៃជុំបន្ទាប់:</b>
• ការព្យាករណ៍ MOC ជុំបន្ទាប់: <b>ចុះ (BEARISH ថយចុះ ៣០ - ៥០ ៛)</b>
• កម្រិតជឿជាក់: ៧២%
• IMS / RSI: 48.2 (Neutral) · MA Trend: តម្លៃស្ថិតក្រោម MA50 ($75.40)`;

    onSendTelegram(text);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950/20 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              ទំព័រតម្លៃប្រេង (Fuel Market: អន្តរជាតិ និង នៅកម្ពុជា)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            តម្លៃទិញ និង លក់ (ម៉ាស៊ូត & សាំង), ថ្លៃកំណត់របស់ក្រុមហ៊ុនក្នុងស្រុក និងក្រសួងពាណិជ្ជកម្ម (MOC), Trend + Strategy (MA & IMS), និងការព្យាករណ៍
          </p>
        </div>

        <button
          onClick={handleTelegramFuelReport}
          className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shrink-0 shadow-sm shadow-sky-500/20"
        >
          <Send className="w-4 h-4" />
          <span>ផ្ញើតម្លៃប្រេងទៅ Telegram</span>
        </button>
      </div>

      {/* SECTION 1: Dual Buying & Selling Boards (Cambodia Retail & International Benchmarks) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Fuel className="w-4 h-4 text-sky-400" />
            <span>១. តារាងតម្លៃទិញចូល (ថ្លៃដើម) និង តម្លៃលក់ចេញ ម៉ាស៊ូត & សាំង (អន្តរជាតិ និង នៅខ្មែរ)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            សុពលភាព: {fuel.cambodiaRetail.effectivePeriod}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Board: Cambodia Retail (MOC) */}
          <div className="rounded-xl border border-sky-500/40 bg-slate-900/90 p-5 space-y-4 shadow-lg shadow-sky-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-400" />
                តម្លៃប្រេងឥន្ធនៈនៅកម្ពុជា (Cambodia Retail & Wholesale)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
                ពិដានកំណត់ដោយ MOC
              </span>
            </div>

            {/* Gasoline Regular EA92 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">សាំងធម្មតា EA92 (Regular)</span>
                <span className="text-xs font-mono text-slate-400">${fuel.cambodiaRetail.gasolineRegularUsd} /L</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400">ថ្លៃដើមនាំចូល/ទិញដុំ:</div>
                  <div className="text-lg font-bold font-mono text-slate-300 tabular-nums">
                    {wholesaleRegularKhr.toLocaleString()} ៛
                  </div>
                  <div className="text-[11px] text-slate-500">~$0.86 /L</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-sky-500/30">
                  <div className="text-[11px] text-slate-400">តម្លៃលក់រាយពិដាន:</div>
                  <div className="text-xl font-bold font-mono text-sky-300 tabular-nums">
                    {fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛
                  </div>
                  <div className="text-[11px] text-sky-400 font-semibold">$1.02 /L</div>
                </div>
              </div>
            </div>

            {/* Diesel 50ppm */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">ប្រេងម៉ាស៊ូត 50ppm (Diesel)</span>
                <span className="text-xs font-mono text-slate-400">${fuel.cambodiaRetail.dieselUsd} /L</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400">ថ្លៃដើមនាំចូល/ទិញដុំ:</div>
                  <div className="text-lg font-bold font-mono text-slate-300 tabular-nums">
                    {wholesaleDieselKhr.toLocaleString()} ៛
                  </div>
                  <div className="text-[11px] text-slate-500">~$0.83 /L</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                  <div className="text-[11px] text-slate-400">តម្លៃលក់រាយពិដាន:</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                    {fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">$0.98 /L</div>
                </div>
              </div>
            </div>

            {/* Gasoline Super EA95 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="font-sans text-slate-300">សាំងស៊ុបពែរ EA95:</span>
              <span className="text-amber-300 font-bold tabular-nums">
                {fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} ៛/L (${fuel.cambodiaRetail.gasolineSuperUsd})
              </span>
            </div>
          </div>

          {/* Right Board: International Benchmarks (Brent, WTI, MOPS) */}
          <div className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-5 space-y-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                តម្លៃប្រេងឆៅអន្តរជាតិ (International Benchmarks)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                USD / Barrel
              </span>
            </div>

            {/* Brent Crude Featured Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">ប្រេងឆៅ Brent Crude Oil (ICE Benchmark)</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    fuel.brentChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {fuel.brentChange24h >= 0 ? '+' : ''}{fuel.brentChange24h}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400">តម្លៃទិញចូល (Bid):</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    ${brentBid.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">ក្នុង ១ បារ៉ែល</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/30">
                  <div className="text-xs text-slate-400">តម្លៃលក់ចេញ (Ask):</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 tabular-nums">
                    ${brentAsk.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">ក្នុង ១ បារ៉ែល</div>
                </div>
              </div>
            </div>

            {/* WTI & MOPS Singapore */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-300">WTI Crude (សហរដ្ឋអាមេរិក)</div>
                <div className="text-xs text-slate-400 font-mono">
                  ទិញ: <span className="text-emerald-400 font-bold">${wtiBid.toFixed(2)}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  លក់: <span className="text-amber-300 font-bold">${wtiAsk.toFixed(2)}</span> /bbl
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-300">MOPS Singapore (Platts)</div>
                <div className="text-xs text-slate-400 font-mono">
                  Mogas 92: <span className="text-sky-300 font-bold">$84.20</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Gasoil 10ppm: <span className="text-emerald-300 font-bold">$86.10</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-sans">ខ្នាតគិត:</span>
              <span className="text-slate-200">១ បារ៉ែល (Barrel) = ១៥៨.៩៨ លីត្រ</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Domestic Oil Companies vs MOC Formula */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              <span>២. ការកំណត់ថ្លៃលក់របស់ក្រុមហ៊ុនក្នុងស្រុក និង រូបមន្តក្រសួងពាណិជ្ជកម្ម (MOC)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ប្រៀបធៀបថ្លៃលក់ជាក់ស្តែងតាមស្ថានីយធំៗធៀបនឹងថ្លៃពិដានរបស់រាជរដ្ឋាភិបាល
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
            ពិដាន MOC: ៤,១៥០៛ / ៤,០០០៛
          </span>
        </div>

        {/* MOC Formula Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Info className="w-4 h-4" />
            <span>រូបមន្តកំណត់ថ្លៃលក់រាយរបស់ក្រសួងពាណិជ្ជកម្ម (MOC Bi-monthly Formula):</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 font-mono text-[11px] text-amber-300 overflow-x-auto">
            ថ្លៃលក់រាយ = [(ថ្លៃមធ្យម MOPS សិង្ហបុរី ១០ ថ្ងៃ + ថ្លៃដឹកជញ្ជូន និងធានារ៉ាប់រង Premium) × អត្រាប្ដូរប្រាក់] + ពន្ធគយ + អាករពិសេស + អាករ VAT 10% + ថ្លៃប្រតិបត្តិការ ($0.04/L) - ការឧបត្ថម្ភធន ($0.04/L)
          </div>
          <p className="text-[11px] text-slate-400">
            * ក្រសួងពាណិជ្ជកម្មប្រកាសថ្លៃពិដានថ្មីរៀងរាល់ <b>១០ ថ្ងៃម្តង</b> (ថ្ងៃទី ០១, ១១, និង ២១ នៃខែនីមួយៗ)។ ស្ថានីយប្រេងឥន្ធនៈមិនត្រូវបានអនុញ្ញាតឱ្យលក់លើសថ្លៃពិដាននេះឡើយ ប៉ុន្តែអាចលក់ទាបជាងបាន។
          </p>
        </div>

        {/* Domestic Companies Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-sans">ក្រុមហ៊ុនប្រេងឥន្ធនៈ</th>
                <th className="py-3 px-4 font-sans">ស្តង់ដារ</th>
                <th className="py-3 px-4 text-right">សាំងធម្មតា EA92</th>
                <th className="py-3 px-4 text-right">ម៉ាស៊ូត 50ppm</th>
                <th className="py-3 px-4 text-right">សាំងស៊ុបពែរ EA95</th>
                <th className="py-3 px-4 font-sans">លក្ខណៈពិសេស</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              {domesticCompanies.map((c) => (
                <tr key={c.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">{c.badge}</td>
                  <td className="py-3 px-4 text-right font-bold text-sky-300">
                    {c.regularKhr.toLocaleString()} ៛
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {c.dieselKhr.toLocaleString()} ៛
                  </td>
                  <td className="py-3 px-4 text-right text-amber-300">
                    {c.superKhr.toLocaleString()} ៛
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Trend + Strategy, IMS (RSI), Moving Averages (MA20, MA50, MA200) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>៣. ក្រាបនិន្នាការ Trend + Strategy, IMS (RSI) & Moving Averages (MA20, MA50, MA200)</span>
          </h2>
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedChartAsset('brent')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedChartAsset === 'brent' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Brent Crude ($/bbl)
            </button>
            <button
              onClick={() => setSelectedChartAsset('cambodia')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedChartAsset === 'cambodia' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              ប្រេងកម្ពុជា (៛/L)
            </button>
          </div>
        </div>

        {selectedChartAsset === 'brent' ? (
          <ChartComponent
            assetName="Brent Crude Oil (អន្តរជាតិ)"
            symbol="BRENT"
            currentPrice={fuel.brentCrudeUsd}
            currencyPrefix="$"
            currencySuffix="/bbl"
          />
        ) : (
          <ChartComponent
            assetName="សាំងធម្មតា EA92 (លក់រាយកម្ពុជា)"
            symbol="MOC_REGULAR"
            currentPrice={fuel.cambodiaRetail.gasolineRegularKhr}
            currencyPrefix=""
            currencySuffix=" ៛"
            isKhr={true}
          />
        )}
      </div>

      {/* SECTION 4: Technical Synthesis, Forecast (ឡើង/ចុះ) & Gemini AI */}
      <div className="rounded-xl border border-sky-500/30 bg-slate-900/90 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">
              ៤. ការផ្តល់ការវិភាគ សំយោគ និង ការព្យាករណ៍ ឡើង/ចុះ (Technical Synthesis & Forecast)
            </h2>
          </div>

          <button
            onClick={handleRequestAiAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-sky-400" />}
            <span>{isAiLoading ? 'កំពុងសំយោគ...' : 'សុំការវិភាគបន្ថែមពី Gemini AI'}</span>
          </button>
        </div>

        {/* Synthesis Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Forecast Prediction */}
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ការព្យាករណ៍តម្លៃ MOC ជុំបន្ទាប់</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-6 h-6 text-rose-400" />
              <span>ចុះ (BEARISH)</span>
            </div>
            <div className="text-xs font-mono text-rose-300">
              រំពឹងថយចុះ: <b>៣០ - ៥០ ៛/L</b> (ជឿជាក់ ៧២%)
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              តម្លៃមធ្យម MOPS សិង្ហបុរី ១០ ថ្ងៃមាននិន្នាការធ្លាក់បន្តិច
            </div>
          </div>

          {/* Card 2: Moving Averages (MA20, MA50, MA200) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Moving Averages (Brent)</div>
            <div className="text-sm font-bold text-white">ស្ថិតក្រោម MA50</div>
            <div className="text-xs font-mono space-y-0.5 text-slate-300">
              <div>MA20: <span className="text-sky-300 font-bold">$74.10</span></div>
              <div>MA50: <span className="text-amber-300 font-bold">$75.40</span> (Resistance)</div>
              <div>MA200: <span className="text-purple-300 font-bold">$78.80</span></div>
            </div>
          </div>

          {/* Card 3: IMS / RSI Indicator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">សន្ទស្សន៍ IMS / RSI (14)</div>
            <div className="text-2xl font-black font-mono text-purple-300 tabular-nums">
              48.2
            </div>
            <div className="text-xs text-purple-300 font-sans">
              លំនឹងកណ្តាល (Neutral Momentum)
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              កម្លាំងលក់ស្រាល (Bearish Tilt)
            </div>
          </div>

          {/* Card 4: Strategy & Range */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5 font-mono text-xs">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-sans">កម្រិតគន្លឹះ Brent Oil</div>
            <div>Support (S1): <span className="text-emerald-400 font-bold">$71.50/bbl</span></div>
            <div>Resistance (R1): <span className="text-rose-400 font-bold">$76.20/bbl</span></div>
            <div>OPEC+ Quota: <span className="text-slate-300">កាត់បន្ថយ ២.២M bpd</span></div>
            <div>US Crude Inventory: <span className="text-amber-300 font-bold">+1.8M bbl</span></div>
          </div>
        </div>

        {/* Synthesis Commentary */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="font-semibold text-sky-300 font-sans flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ការសំយោគរួម (Executive Synthesis for Cambodia & Global Fuel):</span>
          </div>
          <p>
            • <b>កត្តាតម្លៃប្រេងឆៅពិភពលោក (Global Market):</b> តម្លៃ Brent Crude ($74.45) កំពុងជួបនឹងកម្រិតរារាំង MA50 ($75.40)។ ទោះបីជា OPEC+ បានបន្តកាត់បន្ថយការផ្គត់ផ្គង់ក្តី ប៉ុន្តែកំណើនស្តុកប្រេងឆៅនៅសហរដ្ឋអាមេរិក និងតម្រូវការយឺតយ៉ាវនៅអឺរ៉ុប បានកំណត់មិនឱ្យតម្លៃហក់ឡើងខ្ពស់គំហុកឡើយ។
          </p>
          <p>
            • <b>ការវាយតម្លៃសម្រាប់កម្ពុជា (MOC Retail Ceiling):</b> ដោយសារថ្លៃមធ្យម MOPS សិង្ហបុរីក្នុងជុំ ១០ ថ្ងៃនេះមានស្ថិរភាពថយចុះបន្តិចបន្តួច ការព្យាករណ៍បង្ហាញថាតម្លៃលក់រាយសាំង និងម៉ាស៊ូតនៅកម្ពុជាសម្រាប់ជុំបន្ទាប់អាចនឹង <b>ថយចុះប្រមាណ ៣០ ទៅ ៥០ រៀលក្នុងមួយលីត្រ</b>។
          </p>
        </div>

        {/* Gemini AI Live Response Display if loaded */}
        {aiReport && (
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/50 space-y-2 text-xs text-slate-200">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Bot className="w-4 h-4" />
              <span>ការវិភាគលម្អិតពី Gemini AI Engine</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed font-sans">{aiReport}</div>
          </div>
        )}
      </div>

      {/* SECTION 5: Trip Fuel Cost Calculator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Car className="w-4 h-4 text-sky-400" />
          <span>៥. ម៉ាស៊ីនគណនាថ្លៃប្រេងសម្រាប់ធ្វើដំណើរ (Trip Fuel Cost Calculator)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              ចម្ងាយផ្លូវធ្វើដំណើរ (គីឡូម៉ែត្រ / km):
            </label>
            <input
              type="number"
              min="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 font-mono text-white text-base focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              កម្រិតស៊ីប្រេង (លីត្រ ក្នុង ១០០ គ.ម):
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={consumptionRate}
              onChange={(e) => setConsumptionRate(Math.max(0.5, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 font-mono text-white text-base focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              ប្រភេទប្រេងដែលប្រើប្រាស់:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'regular', label: 'សាំងធម្មតា' },
                { id: 'super', label: 'ស៊ុបពែរ' },
                { id: 'diesel', label: 'ម៉ាស៊ូត' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFuelType(f.id as any)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    selectedFuelType === f.id
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-400 font-sans">តម្រូវការប្រេងសរុប:</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {totalLiters.toFixed(2)} លីត្រ (Liters)
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-sans">ចំណាយសរុបគិតជារៀល:</div>
            <div className="text-2xl font-black text-sky-400 tabular-nums">
              {Math.round(totalTripCostKhr).toLocaleString()} ៛
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-sans">ចំណាយសរុបគិតជាដុល្លារ:</div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">
              ${totalTripCostUsd.toFixed(2)} USD
            </div>
          </div>

          <div className="text-right">
            <div className="text-slate-400 font-sans">ថ្លៃដើមក្នុង ១ គីឡូម៉ែត្រ:</div>
            <div className="text-amber-300 font-bold tabular-nums">
              {Math.round(costPerKmKhr)} ៛/km
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Fuel Market News Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-sky-400" />
            <span>៦. ព័ត៌មានទីផ្សារប្រេងជាក់លាក់ (Fuel, OPEC+ & Geopolitics News)</span>
          </h2>
          <span className="text-xs text-slate-400">OPEC+, តម្លៃប្រេងឆៅពិភពលោក និងក្រសួងពាណិជ្ជកម្ម</span>
        </div>

        <MarketNews
          onSendTelegram={onSendTelegram}
          isWidgetMode={true}
          defaultCategory="fuel"
        />
      </div>
    </div>
  );
}

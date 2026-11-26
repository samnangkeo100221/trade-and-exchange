'use client';

import React, { useState } from 'react';
import { FuelRates } from '@/lib/types';
import {
  Fuel,
  Send,
  Car,
  Building2,
  ShieldCheck,
  Activity,
  Bot,
  Loader2,
  Target,
  Newspaper,
  Globe,
  Info,
  Edit3,
  RotateCcw,
  Check,
  X,
  TrendingDown,
  Award,
} from 'lucide-react';
import ChartComponent from './ChartComponent';
import MarketNews from './MarketNews';

interface FuelTabProps {
  fuel: FuelRates;
  onSendTelegram: (text: string) => void;
  onUpdateFuel?: React.Dispatch<React.SetStateAction<FuelRates>>;
}

export default function FuelTab({ fuel, onSendTelegram, onUpdateFuel }: FuelTabProps) {
  // Fuel Calculator State
  const [distanceKm, setDistanceKm] = useState<number>(150); // e.g. Phnom Penh to Kampot
  const [consumptionRate, setConsumptionRate] = useState<number>(7.5); // Liters per 100km
  const [selectedFuelType, setSelectedFuelType] = useState<'regular' | 'super' | 'diesel'>('regular');
  const [selectedChartAsset, setSelectedChartAsset] = useState<'brent' | 'cambodia'>('cambodia');

  // Manual Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    regularKhr: fuel.cambodiaRetail.gasolineRegularKhr || 3700,
    dieselKhr: fuel.cambodiaRetail.dieselKhr || 3500,
    superKhr: fuel.cambodiaRetail.gasolineSuperKhr || 4200,
    brentUsd: fuel.brentCrudeUsd || 73.01,
    wtiUsd: fuel.wtiCrudeUsd || 70.5,
    effectivePeriod:
      fuel.cambodiaRetail.effectivePeriod || '២១ ដល់ ៣០ មេសា (សេចក្តីជូនដំណឹងក្រសួងពាណិជ្ជកម្ម)',
  });

  // AI Analysis State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Domestic Gas Station Companies Table Data (synced with official MOC ceiling)
  const domesticCompanies = [
    {
      name: 'PTT Cambodia (ភីធីធី)',
      brand: 'PTT',
      badge: 'ស្តង់ដារថៃ',
      superKhr: fuel.cambodiaRetail.gasolineSuperKhr,
      regularKhr: fuel.cambodiaRetail.gasolineRegularKhr,
      dieselKhr: fuel.cambodiaRetail.dieselKhr,
      note: 'សាំង PTT Performa គុណភាពខ្ពស់',
    },
    {
      name: 'TotalEnergies Cambodia (តូតាល់)',
      brand: 'TotalEnergies',
      badge: 'ស្តង់ដារបារាំង',
      superKhr: fuel.cambodiaRetail.gasolineSuperKhr + 40,
      regularKhr: fuel.cambodiaRetail.gasolineRegularKhr,
      dieselKhr: fuel.cambodiaRetail.dieselKhr,
      note: 'Excellium Formula សន្សំសំចៃម៉ាស៊ីន',
    },
    {
      name: 'Tela Cambodia (តេលា)',
      brand: 'Tela',
      badge: 'ក្រុមហ៊ុនឈានមុខកម្ពុជា',
      superKhr: fuel.cambodiaRetail.gasolineSuperKhr,
      regularKhr: fuel.cambodiaRetail.gasolineRegularKhr,
      dieselKhr: fuel.cambodiaRetail.dieselKhr,
      note: 'បណ្តាញស្ថានីយច្រើនជាងគេទូទាំងប្រទេស',
    },
    {
      name: 'Caltex Cambodia (កាល់តិច)',
      brand: 'Caltex',
      badge: 'ស្តង់ដារអាមេរិក',
      superKhr: fuel.cambodiaRetail.gasolineSuperKhr + 30,
      regularKhr: fuel.cambodiaRetail.gasolineRegularKhr,
      dieselKhr: fuel.cambodiaRetail.dieselKhr,
      note: 'Techron Cleaning Technology',
    },
    {
      name: 'Sokimex Petroleum (សូគីម៉ិច)',
      brand: 'Sokimex',
      badge: 'ក្រុមហ៊ុនក្នុងស្រុក',
      superKhr: fuel.cambodiaRetail.gasolineSuperKhr - 20,
      regularKhr: fuel.cambodiaRetail.gasolineRegularKhr - 10,
      dieselKhr: fuel.cambodiaRetail.dieselKhr - 10,
      note: 'តម្លៃសមរម្យ តាមបណ្តាខេត្ត',
    },
    {
      name: 'Bright Petroleum (ប្រាយ)',
      brand: 'Bright',
      badge: 'តម្លៃសន្សំ',
      superKhr: fuel.cambodiaRetail.gasolineSuperKhr - 40,
      regularKhr: fuel.cambodiaRetail.gasolineRegularKhr - 20,
      dieselKhr: fuel.cambodiaRetail.dieselKhr - 20,
      note: 'តម្លៃលក់ប្រកួតប្រជែង',
    },
  ];

  // International Benchmarks
  const brentBid = Math.round((fuel.brentCrudeUsd - 0.25) * 100) / 100;
  const brentAsk = fuel.brentCrudeUsd;
  const wtiBid = Math.round((fuel.wtiCrudeUsd - 0.25) * 100) / 100;
  const wtiAsk = fuel.wtiCrudeUsd;

  // Wholesale / Import Estimate vs Retail Ceiling
  const wholesaleRegularKhr = 3280;
  const wholesaleDieselKhr = 3090;

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

  // Save manual edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFuel) {
      const now = new Date();
      const timeStr = `កែប្រែដោយដៃ ម៉ោង ${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      const reg = Number(editForm.regularKhr);
      const die = Number(editForm.dieselKhr);
      const sup = Number(editForm.superKhr);
      const brent = Number(editForm.brentUsd);
      const wti = Number(editForm.wtiUsd);

      onUpdateFuel((prev) => ({
        ...prev,
        brentCrudeUsd: brent,
        wtiCrudeUsd: wti,
        cambodiaRetail: {
          ...prev.cambodiaRetail,
          gasolineRegularKhr: reg,
          gasolineRegularUsd: Math.round((reg / 4069) * 100) / 100,
          dieselKhr: die,
          dieselUsd: Math.round((die / 4069) * 100) / 100,
          gasolineSuperKhr: sup,
          gasolineSuperUsd: Math.round((sup / 4069) * 100) / 100,
          effectivePeriod: editForm.effectivePeriod,
        },
        lastUpdated: timeStr,
      }));
    }
    setIsEditModalOpen(false);
  };

  const handleResetToOfficial = () => {
    if (onUpdateFuel) {
      onUpdateFuel((prev) => ({
        ...prev,
        brentCrudeUsd: 73.01,
        wtiCrudeUsd: 70.5,
        cambodiaRetail: {
          gasolineRegularKhr: 3700,
          gasolineRegularUsd: 0.91,
          gasolineSuperKhr: 4200,
          gasolineSuperUsd: 1.03,
          dieselKhr: 3500,
          dieselUsd: 0.86,
          effectivePeriod: '២១ ដល់ ៣០ មេសា (សេចក្តីជូនដំណឹងក្រសួងពាណិជ្ជកម្ម)',
          changeRegularKhr: -50,
          changeDieselKhr: -50,
        },
        lastUpdated: 'សេចក្តីជូនដំណឹងផ្លូវការក្រសួងពាណិជ្ជកម្ម (ចុះថ្លៃ ៥០៛)',
      }));
      setEditForm({
        regularKhr: 3700,
        dieselKhr: 3500,
        superKhr: 4200,
        brentUsd: 73.01,
        wtiUsd: 70.5,
        effectivePeriod: '២១ ដល់ ៣០ មេសា (សេចក្តីជូនដំណឹងក្រសួងពាណិជ្ជកម្ម)',
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
            cambodiaSuperKhr: fuel.cambodiaRetail.gasolineSuperKhr,
            effectivePeriod: fuel.cambodiaRetail.effectivePeriod,
            strategy: 'MOC Bi-monthly Formula + Singapore MOPS ($73.01 / $80.42)',
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

  const handleTelegramFuelReport = () => {
    const text = `⛽ <b>របាយការណ៍តម្លៃប្រេងឥន្ធនៈផ្លូវការ (MOC Fuel Report)</b>
🏛️ ក្រសួងពាណិជ្ជកម្ម (Ministry of Commerce Cambodia)
📅 សុពលភាពអនុវត្ត: <b>${fuel.cambodiaRetail.effectivePeriod}</b>

🇰🇭 <b>១. តម្លៃលក់រាយនៅតាមស្ថានីយ (អនុវត្តទូទាំងប្រទេស):</b>
• 🟢 <b>ប្រេងសាំងធម្មតា EA92:</b> <b>${fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛/លីត្រ</b> (ចុះថ្លៃ ៥០៛ / ~$${fuel.cambodiaRetail.gasolineRegularUsd})
• 🔵 <b>ប្រេងម៉ាស៊ូត Gasoil 10ppm:</b> <b>${fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛/លីត្រ</b> (ចុះថ្លៃ ៥០៛ / ~$${fuel.cambodiaRetail.dieselUsd})
• 🟡 <b>សាំងស៊ុបពែរ EA95:</b> <b>${fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} ៛/លីត្រ</b> (~$${fuel.cambodiaRetail.gasolineSuperUsd})

🌏 <b>២. តម្លៃមធ្យមភាគទីផ្សារអន្តរជាតិ (Singapore MOPS):</b>
• សាំងធម្មតា Gasoline 92: <b>$73.0160/ធុង</b> ($0.4592/លីត្រ)
• ប្រេងម៉ាស៊ូត Gasoil 10ppm: <b>$80.4200/ធុង</b> ($0.5058/លីត្រ)
• ប្រេងឆៅ Brent Crude: <b>$${fuel.brentCrudeUsd.toFixed(2)}/bbl</b>
• ប្រេងឆៅ WTI Crude: <b>$${fuel.wtiCrudeUsd.toFixed(2)}/bbl</b>

🎯 <b>៣. សេចក្តីសង្ខេប:</b>
• តម្លៃប្រេងសាំងធម្មតា និងប្រេងម៉ាស៊ូតបានចុះថ្លៃ ៥០៛ ក្នុងមួយលីត្រ
• គ្រប់ស្ថានីយប្រេងឥន្ធនៈទូទាំងប្រទេសត្រូវលក់តាម ឬក្រោមតម្លៃពិដាននេះ`;

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
              ទំព័រតម្លៃប្រេង (Fuel Market: សេចក្តីជូនដំណឹងក្រសួងពាណិជ្ជកម្ម)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            តម្លៃលក់រាយប្រេងឥន្ធនៈនៅតាមស្ថានីយ (ក្រសួងពាណិជ្ជកម្ម) & តម្លៃអន្តរជាតិ Singapore MOPS
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onUpdateFuel && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>កែសម្រួលថ្លៃប្រេង</span>
            </button>
          )}

          <button
            onClick={handleTelegramFuelReport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shrink-0 shadow-sm shadow-sky-500/20"
          >
            <Send className="w-4 h-4" />
            <span>ផ្ញើតម្លៃប្រេងទៅ Telegram</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Official MOC Announcement Board (Authentic Document Recreation from Screenshot 3) */}
      <div className="rounded-2xl border border-sky-500/40 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg text-white font-bold text-lg">
              🏛️
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ក្រសួងពាណិជ្ជកម្ម (Ministry of Commerce)</span>
              </div>
              <div className="text-xs text-sky-400 font-mono">
                នាយកដ្ឋានអភិវឌ្ឍន៍ទីផ្សារឯកជន · ព្រះរាជាណាចក្រកម្ពុជា
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>សេចក្តីជូនដំណឹងផ្លូវការ (ចុះថ្លៃ ៥០រ)</span>
          </div>
        </div>

        {/* Official Headline Notice */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-3">
          <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
            សេចក្តីជូនដំណឹងស្តីពី៖ តម្លៃលក់រាយប្រេងឥន្ធនៈនៅតាមស្ថានីយ
            ដែលត្រូវអនុវត្តចាប់ពីថ្ងៃទី២១ ដល់ថ្ងៃទី៣០
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Gasoline Regular */}
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">ប្រេងសាំងធម្មតា (Gasoline 92)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  ចុះថ្លៃ ៥០៛
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-emerald-400 tabular-nums">
                {fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()}{' '}
                <span className="text-base font-normal text-slate-400">រៀល/លីត្រ</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                ~${fuel.cambodiaRetail.gasolineRegularUsd} USD/L (ថ្លៃពិដាន)
              </div>
            </div>

            {/* Diesel */}
            <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">ប្រេងម៉ាស៊ូត (Gasoil 10ppm)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                  ចុះថ្លៃ ៥០៛
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-sky-400 tabular-nums">
                {fuel.cambodiaRetail.dieselKhr.toLocaleString()}{' '}
                <span className="text-base font-normal text-slate-400">រៀល/លីត្រ</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                ~${fuel.cambodiaRetail.dieselUsd} USD/L (ថ្លៃពិដាន)
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
            <span>សាំងស៊ុបពែរ EA95 (Super): <b className="text-amber-300">{fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} ៛/L</b></span>
            <span>សុពលភាព: <b className="text-white">{fuel.cambodiaRetail.effectivePeriod}</b></span>
          </div>
        </div>

        {/* International MOPS Table from Screenshot */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              តារាងថ្លៃលក់រាយប្រេងឥន្ធនៈនៅលើទីផ្សារអន្តរជាតិ (Singapore MOPS Platts / USD/Barrel)
            </span>
            <span className="text-sky-400 font-mono">Singapore Benchmarks</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">កាលបរិច្ឆេទ (Date)</th>
                  <th className="py-2.5 px-3 text-right">ប្រេងសាំងធម្មតា/ធុង (Gasoline 92)</th>
                  <th className="py-2.5 px-3 text-right">ប្រេងម៉ាស៊ូត/ធុង (Gasoil 10ppm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 tabular-nums">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-300">១១ មេសា</td>
                  <td className="py-2 px-3 text-right text-slate-300">$70.37/bbl</td>
                  <td className="py-2 px-3 text-right text-slate-300">$78.45/bbl</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-300">១៤ មេសា</td>
                  <td className="py-2 px-3 text-right text-slate-300">$72.40/bbl</td>
                  <td className="py-2 px-3 text-right text-slate-300">$79.97/bbl</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-300">១៥ មេសា</td>
                  <td className="py-2 px-3 text-right text-slate-300">$73.16/bbl</td>
                  <td className="py-2 px-3 text-right text-slate-300">$80.72/bbl</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-300">១៦ មេសា</td>
                  <td className="py-2 px-3 text-right text-slate-300">$73.79/bbl</td>
                  <td className="py-2 px-3 text-right text-slate-300">$80.93/bbl</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-300">១៧ មេសា</td>
                  <td className="py-2 px-3 text-right text-slate-300">$74.96/bbl</td>
                  <td className="py-2 px-3 text-right text-slate-300">$81.93/bbl</td>
                </tr>
                <tr className="bg-slate-950 font-bold border-t border-slate-700">
                  <td className="py-2.5 px-3 text-amber-300">មធ្យមភាគ ១៥ ថ្ងៃ (15-Day Average):</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">$73.0160/bbl</td>
                  <td className="py-2.5 px-3 text-right text-sky-400">$80.4200/bbl</td>
                </tr>
                <tr className="bg-slate-950 text-slate-300 border-t border-slate-800 font-semibold">
                  <td className="py-2 px-3">មធ្យមភាគគិតជា (ដុល្លារ/លីត្រ):</td>
                  <td className="py-2 px-3 text-right text-emerald-300">$0.4592 /L</td>
                  <td className="py-2 px-3 text-right text-sky-300">$0.5058 /L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Domestic Gas Stations Comparison Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              <span>២. តម្លៃលក់ជាក់ស្តែងតាមស្ថានីយក្នុងស្រុក (PTT, Total, Tela, Caltex, Sokimex)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ប្រៀបធៀបថ្លៃលក់តាមបណ្តាញស្ថានីយធំៗធៀបនឹងថ្លៃពិដានរបស់រាជរដ្ឋាភិបាល
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
            ពិដាន MOC: {fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()}៛ /{' '}
            {fuel.cambodiaRetail.dieselKhr.toLocaleString()}៛
          </span>
        </div>

        {/* Domestic Companies Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-sans">ក្រុមហ៊ុនប្រេងឥន្ធនៈ</th>
                <th className="py-3 px-4 font-sans">ស្តង់ដារ</th>
                <th className="py-3 px-4 text-right">សាំងធម្មតា EA92</th>
                <th className="py-3 px-4 text-right">ម៉ាស៊ូត 10ppm</th>
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

      {/* SECTION 3: Trend Chart */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>៣. ក្រាបនិន្នាការ Trend + Strategy, IMS (RSI) & Moving Averages (MA20, MA50, MA200)</span>
          </h2>
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedChartAsset('cambodia')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedChartAsset === 'cambodia'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400'
              }`}
            >
              ប្រេងកម្ពុជា (៛/L)
            </button>
            <button
              onClick={() => setSelectedChartAsset('brent')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedChartAsset === 'brent' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Brent Crude ($/bbl)
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

      {/* SECTION 4: Technical Synthesis & AI */}
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
            {isAiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>{isAiLoading ? 'កំពុងសំយោគ...' : 'សុំការវិភាគបន្ថែមពី Gemini AI'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ស្ថានភាពតម្លៃ MOC
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
              <TrendingDown className="w-6 h-6 text-emerald-400" />
              <span>ចុះថ្លៃ ៥០៛</span>
            </div>
            <div className="text-xs font-mono text-emerald-300">
              សាំងចុះ <b>៥០៛</b> · ម៉ាស៊ូតចុះ <b>៥០៛</b>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              សាំង 3,700៛ / ម៉ាស៊ូត 3,500៛
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Singapore MOPS 92
            </div>
            <div className="text-2xl font-bold font-mono text-sky-300">$73.01/bbl</div>
            <div className="text-xs font-mono text-slate-300">
              ម៉ាស៊ូត 10ppm: <span className="text-emerald-300 font-bold">$80.42/bbl</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              សន្ទស្សន៍ IMS / RSI (14)
            </div>
            <div className="text-2xl font-black font-mono text-purple-300 tabular-nums">48.2</div>
            <div className="text-xs text-purple-300 font-sans">ស្ថិរភាពល្អ (Cooling Down)</div>
            <div className="text-[11px] text-slate-400 font-sans">តម្លៃធ្លាក់ចុះស្របទីផ្សារ</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5 font-mono text-xs">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-sans">
              កម្រិតគន្លឹះ Brent Oil
            </div>
            <div>
              Support (S1): <span className="text-emerald-400 font-bold">$71.50/bbl</span>
            </div>
            <div>
              Resistance (R1): <span className="text-rose-400 font-bold">$75.80/bbl</span>
            </div>
            <div>
              OPEC+ គោលនយោបាយ: <span className="text-slate-300">ផ្គត់ផ្គង់មានតុល្យភាព</span>
            </div>
          </div>
        </div>

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
            <label className="text-xs font-medium text-slate-300">ប្រភេទប្រេងដែលប្រើប្រាស់:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'regular', label: 'សាំងធម្មតា', price: fuel.cambodiaRetail.gasolineRegularKhr },
                { id: 'super', label: 'ស៊ុបពែរ', price: fuel.cambodiaRetail.gasolineSuperKhr },
                { id: 'diesel', label: 'ម៉ាស៊ូត', price: fuel.cambodiaRetail.dieselKhr },
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
                  <div>{f.label}</div>
                  <div className="text-[10px] font-mono">{f.price.toLocaleString()}៛</div>
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

      {/* Manual Fuel Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  កែសម្រួលថ្លៃប្រេងឥន្ធនៈ (Edit Fuel Prices)
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
              <div>
                <label className="block text-slate-300 font-sans mb-1 font-semibold">
                  សាំងធម្មតា EA92 (៛/L):
                </label>
                <input
                  type="number"
                  value={editForm.regularKhr}
                  onChange={(e) =>
                    setEditForm({ ...editForm, regularKhr: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-sky-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-sans mb-1 font-semibold">
                  ប្រេងម៉ាស៊ូត 10ppm (៛/L):
                </label>
                <input
                  type="number"
                  value={editForm.dieselKhr}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dieselKhr: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-sans mb-1 font-semibold">
                  សាំងស៊ុបពែរ EA95 (៛/L):
                </label>
                <input
                  type="number"
                  value={editForm.superKhr}
                  onChange={(e) =>
                    setEditForm({ ...editForm, superKhr: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-300 font-sans font-semibold">Brent Crude ($/bbl):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.brentUsd}
                    onChange={(e) =>
                      setEditForm({ ...editForm, brentUsd: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-300 font-sans font-semibold">WTI Crude ($/bbl):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.wtiUsd}
                    onChange={(e) =>
                      setEditForm({ ...editForm, wtiUsd: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-sans mb-1 font-semibold">
                  កាលបរិច្ឆេទសុពលភាព:
                </label>
                <input
                  type="text"
                  value={editForm.effectivePeriod}
                  onChange={(e) => setEditForm({ ...editForm, effectivePeriod: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={handleResetToOfficial}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>កំណត់ឡើងវិញ (MOC)</span>
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs"
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

      {/* SECTION 6: Fuel Market News Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-sky-400" />
            <span>៦. ព័ត៌មានទីផ្សារប្រេងជាក់លាក់ (Fuel, OPEC+ & Geopolitics News)</span>
          </h2>
          <span className="text-xs text-slate-400">OPEC+, ស្តុកប្រេង EIA, មជ្ឈិមបូព៌ា និងក្រសួងពាណិជ្ជកម្ម</span>
        </div>

        <MarketNews onSendTelegram={onSendTelegram} isWidgetMode={true} defaultCategory="fuel" />
      </div>
    </div>
  );
}

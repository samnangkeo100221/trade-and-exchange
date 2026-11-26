'use client';

import React, { useState } from 'react';
import { FuelRates } from '@/lib/types';
import { Fuel, TrendingUp, TrendingDown, Send, Gauge, Car, DollarSign, Calendar, MapPin } from 'lucide-react';
import ChartComponent from './ChartComponent';

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

  const handleTelegramFuelReport = () => {
    const text = `⛽ <b>របាយការណ៍តម្លៃប្រេងឥន្ធនៈ (Fuel Pulse)</b>
📅 កាលបរិច្ឆេទកំណត់ដោយក្រសួងពាណិជ្ជកម្ម: ${fuel.cambodiaRetail.effectivePeriod}

🇰🇭 <b>តម្លៃប្រេងលក់រាយនៅកម្ពុជា (Retail Cambodia):</b>
• សាំងធម្មតា EA92: <b>${fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.gasolineRegularUsd})
• សាំងស៊ុបពែរ EA95: <b>${fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.gasolineSuperUsd})
• ម៉ាស៊ូត 50ppm (Diesel): <b>${fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.dieselUsd})

🌍 <b>តម្លៃប្រេងឆៅពិភពលោក (Global Crude Oil):</b>
• Brent Crude: <b>$${fuel.brentCrudeUsd.toFixed(2)}/bbl</b> (${fuel.brentChange24h >= 0 ? '+' : ''}${fuel.brentChange24h}%)
• WTI Crude: <b>$${fuel.wtiCrudeUsd.toFixed(2)}/bbl</b> (${fuel.wtiChange24h >= 0 ? '+' : ''}${fuel.wtiChange24h}%)`;

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
              តម្លៃប្រេងឥន្ធនៈកម្ពុជា និង អន្តរជាតិ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            សេចក្តីប្រកាសក្រសួងពាណិជ្ជកម្ម (MOC) សាំងធម្មតា ស៊ុបពែរ ម៉ាស៊ូត និងប្រេងឆៅ Brent/WTI
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

      {/* Cambodia Retail Ceiling Prices (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Regular Gasoline */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              សាំងធម្មតា (Regular EA92)
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">RON 92</span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} <span className="text-base font-normal text-sky-400">៛/L</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              ≈ ${fuel.cambodiaRetail.gasolineRegularUsd} USD / លីត្រ
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">ប្រែប្រួលជុំចុងក្រោយ:</span>
            <span className="font-mono text-emerald-400 font-semibold tabular-nums">
              {fuel.cambodiaRetail.changeRegularKhr} ៛
            </span>
          </div>
        </div>

        {/* Super Gasoline */}
        <div className="p-5 rounded-xl border border-amber-500/30 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              សាំងស៊ុបពែរ (Premium EA95)
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              RON 95
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
              {fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} <span className="text-base font-normal text-amber-400">៛/L</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              ≈ ${fuel.cambodiaRetail.gasolineSuperUsd} USD / លីត្រ
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">សម្រាប់រថយន្តទំនើប:</span>
            <span className="font-mono text-slate-300">Octane 95</span>
          </div>
        </div>

        {/* Diesel */}
        <div className="p-5 rounded-xl border border-emerald-500/30 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              ម៉ាស៊ូត (Diesel 50ppm)
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
              DO 50ppm
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-emerald-300 tabular-nums">
              {fuel.cambodiaRetail.dieselKhr.toLocaleString()} <span className="text-base font-normal text-emerald-400">៛/L</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              ≈ ${fuel.cambodiaRetail.dieselUsd} USD / លីត្រ
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">ប្រែប្រួលជុំចុងក្រោយ:</span>
            <span className="font-mono text-emerald-400 font-semibold tabular-nums">
              {fuel.cambodiaRetail.changeDieselKhr} ៛
            </span>
          </div>
        </div>
      </div>

      {/* Global Crude Oil Benchmarks */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-sky-400" />
          តម្លៃប្រេងឆៅពិភពលោក (International Crude Benchmarks)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Brent Crude Oil (សមុទ្រខាងជើង)</div>
              <div className="text-xs text-slate-400">ស្តង់ដារកំណត់តម្លៃប្រេងនៅអាស៊ី និងអឺរ៉ុប</div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-2xl font-bold text-white">${fuel.brentCrudeUsd.toFixed(2)}</div>
              <div
                className={`text-xs flex items-center justify-end gap-1 ${
                  fuel.brentChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {fuel.brentChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {fuel.brentChange24h >= 0 ? '+' : ''}${fuel.brentChange24h}/bbl
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">WTI Crude Oil (អាមេរិកាំង)</div>
              <div className="text-xs text-slate-400">West Texas Intermediate Benchmark</div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-2xl font-bold text-white">${fuel.wtiCrudeUsd.toFixed(2)}</div>
              <div
                className={`text-xs flex items-center justify-end gap-1 ${
                  fuel.wtiChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {fuel.wtiChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {fuel.wtiChange24h >= 0 ? '+' : ''}${fuel.wtiChange24h}/bbl
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Fuel Consumption Calculator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Car className="w-4 h-4 text-sky-400" />
          ម៉ាស៊ីនគណនាចំណាយប្រេងសម្រាប់ការធ្វើដំណើរ (Fuel Trip Calculator)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ចម្ងាយផ្លូវធ្វើដំណើរ (Distance in Kilometers):
              </label>
              <div className="flex rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
                <input
                  type="number"
                  min="1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-transparent text-white font-mono text-sm focus:outline-none"
                />
                <span className="bg-slate-900 text-slate-400 px-3 text-xs flex items-center border-l border-slate-700">
                  km
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                កម្រិតស៊ីប្រេងរបស់យានយន្ត (Liters / 100km):
              </label>
              <div className="flex rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={consumptionRate}
                  onChange={(e) => setConsumptionRate(Math.max(0.5, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-transparent text-white font-mono text-sm focus:outline-none"
                />
                <span className="bg-slate-900 text-slate-400 px-3 text-xs flex items-center border-l border-slate-700">
                  L/100km
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ប្រភេទប្រេងប្រើប្រាស់:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'regular', label: 'សាំងធម្មតា' },
                  { id: 'super', label: 'ស៊ុបពែរ' },
                  { id: 'diesel', label: 'ម៉ាស៊ូត' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedFuelType(t.id as any)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors ${
                      selectedFuelType === t.id
                        ? 'bg-sky-500/10 border-sky-400 text-sky-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
                សរុបការចំណាយថ្លៃប្រេងប៉ាន់ស្មាន
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400">ចំណាយគិតជារៀល (KHR):</div>
                  <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
                    {Math.round(totalTripCostKhr).toLocaleString()} <span className="text-sm font-normal text-sky-400">៛</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400">ចំណាយគិតជាដុល្លារ (USD):</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
                    ${totalTripCostUsd.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="font-sans text-slate-400">បរិមាណប្រេងសរុប:</span>
                  <span className="text-white font-semibold tabular-nums">{totalLiters.toFixed(2)} Liters</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="font-sans text-slate-400">ចំណាយក្នុង ១ គីឡូម៉ែត្រ:</span>
                  <span className="text-sky-300 font-semibold tabular-nums">{Math.round(costPerKmKhr)} ៛/km</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500">
              * ការគណនានេះផ្អែកលើតម្លៃប្រេងលក់រាយដែលកំណត់ដោយក្រសួងពាណិជ្ជកម្មកម្ពុជា
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Trend Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">ក្រាបនិន្នាការតម្លៃប្រេង</h3>
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedChartAsset('brent')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                selectedChartAsset === 'brent'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Brent Crude ($/bbl)
            </button>
            <button
              onClick={() => setSelectedChartAsset('cambodia')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                selectedChartAsset === 'cambodia'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              សាំងកម្ពុជា (៛/L)
            </button>
          </div>
        </div>

        {selectedChartAsset === 'brent' ? (
          <ChartComponent
            assetName="ប្រេងឆៅពិភពលោក Brent Crude Oil"
            symbol="BRENT"
            currentPrice={fuel.brentCrudeUsd}
            currencyPrefix="$"
            currencySuffix="/bbl"
          />
        ) : (
          <ChartComponent
            assetName="តម្លៃសាំងធម្មតា EA92 នៅកម្ពុជា"
            symbol="KH_RON92"
            currentPrice={fuel.cambodiaRetail.gasolineRegularKhr}
            currencyPrefix=""
            currencySuffix=" ៛"
            isKhr={true}
          />
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { SnapshotRecord, GoldPrice, CurrencyRates, FuelRates } from '@/lib/types';
import {
  saveSnapshotRecord,
  deleteSnapshot,
  clearAndResetSnapshots,
} from '@/lib/storage';
import {
  Clock,
  Camera,
  Download,
  Trash2,
  RotateCcw,
  Plus,
  Coins,
  DollarSign,
  Fuel,
  CheckCircle,
} from 'lucide-react';

interface HistoryTabProps {
  snapshots: SnapshotRecord[];
  onSnapshotsUpdate: (updated: SnapshotRecord[]) => void;
  gold: GoldPrice;
  currencies: CurrencyRates;
  fuel: FuelRates;
}

export default function HistoryTab({
  snapshots,
  onSnapshotsUpdate,
  gold,
  currencies,
  fuel,
}: HistoryTabProps) {
  const [customNote, setCustomNote] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleTakeSnapshot = () => {
    const updated = saveSnapshotRecord(gold, currencies, fuel, customNote || undefined);
    onSnapshotsUpdate(updated);
    setCustomNote('');
    showToast('បានកត់ត្រាទិន្នន័យ Snapshot ថ្មីជោគជ័យ (រក្សាទុក ២០ កំណត់ត្រា)');
  };

  const handleDelete = (id: string) => {
    const updated = deleteSnapshot(id);
    onSnapshotsUpdate(updated);
    showToast('បានលុបកំណត់ត្រា');
  };

  const handleReset = () => {
    if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យប្រវត្តិ ២០ ឡើងវិញមែនទេ?')) {
      const resetList = clearAndResetSnapshots();
      onSnapshotsUpdate(resetList);
      showToast('បានកំណត់ឡើងវិញ');
    }
  };

  const handleExportCsv = () => {
    if (!snapshots.length) return;
    const headers = [
      'ID',
      'Date',
      'Time',
      'Gold_Spot_USD',
      'Gold_Damlung_USD',
      'Gold_Damlung_KHR',
      'USD_KHR_Market',
      'CNY_KHR',
      'Fuel_Regular_KHR',
      'Fuel_Diesel_KHR',
      'Brent_Crude_USD',
      'Note',
    ];

    const rows = snapshots.map((s) => [
      s.id,
      s.dateFormatted,
      s.timeFormatted,
      s.goldSpotOzUsd,
      s.goldDamlungUsd,
      s.goldDamlungKhr,
      s.usdKhrMarket,
      s.cnyKhr,
      s.fuelRegularKhr,
      s.fuelDieselKhr,
      s.brentUsd,
      `"${s.note || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cambodia_market_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('បានទាញយកឯកសារ CSV ជោគជ័យ');
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(snapshots, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cambodia_market_history_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('បានទាញយកឯកសារ JSON ជោគជ័យ');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              ប្រវត្តិទិន្នន័យទីផ្សារ (រក្សាទុក ២០ កំណត់ត្រានៅក្នុង LocalStorage)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ទិន្នន័យត្រូវបានរក្សាទុកក្នុងកុំព្យូទ័រ/ទូរស័ព្ទរបស់អ្នកដោយផ្ទាល់ មិនបាត់បង់ពេល Refresh និងអាចទាញយកបាន
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>ទាញយក CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>ទាញយក JSON</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
            title="កំណត់ឡើងវិញ ២០ កំណត់ត្រា"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Snapshot Controller Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="បញ្ចូលចំណាំសម្រាប់ Snapshot នេះ (ឧ. តម្លៃក្រោយពេលប្រកាសអត្រាការប្រាក់...)"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={handleTakeSnapshot}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-sm shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>ថតទុកទិន្នន័យឥឡូវនេះ (Take Snapshot)</span>
          </button>
        </div>
      </div>

      {/* Toast feedback */}
      {successToast && (
        <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* High-Density Data Grid (20 items max) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span>តារាង ២០ កំណត់ត្រាចុងក្រោយ</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {snapshots.length} / 20 កំណត់ត្រា
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">LocalStorage Auto-Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 uppercase tracking-wider font-sans">
                <th className="py-3 px-3.5">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="py-3 px-3.5 text-right">មាស Spot ($/oz)</th>
                <th className="py-3 px-3.5 text-right">១ តម្លឹង (KHR)</th>
                <th className="py-3 px-3.5 text-right">១ តម្លឹង (USD)</th>
                <th className="py-3 px-3.5 text-right">USD/KHR</th>
                <th className="py-3 px-3.5 text-right">CNY/KHR</th>
                <th className="py-3 px-3.5 text-right">សាំង EA92</th>
                <th className="py-3 px-3.5 text-right">ម៉ាស៊ូត</th>
                <th className="py-3 px-3.5 text-right">Brent ($)</th>
                <th className="py-3 px-3.5 font-sans">ចំណាំ</th>
                <th className="py-3 px-3 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              {snapshots.map((item, index) => {
                const nextItem = snapshots[index + 1];
                const goldDelta = nextItem ? item.goldSpotOzUsd - nextItem.goldSpotOzUsd : 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date & Time */}
                    <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                      <div className="font-semibold text-white">{item.dateFormatted}</div>
                      <div className="text-slate-500 text-[11px]">{item.timeFormatted}</div>
                    </td>

                    {/* Gold Spot */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="text-amber-400 font-bold">${item.goldSpotOzUsd.toFixed(2)}</div>
                      {nextItem && (
                        <div
                          className={`text-[10px] ${
                            goldDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {goldDelta >= 0 ? '+' : ''}
                          {goldDelta.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Gold Damlung KHR */}
                    <td className="py-3 px-3.5 text-right text-slate-100 font-semibold whitespace-nowrap">
                      {item.goldDamlungKhr.toLocaleString()} ៛
                    </td>

                    {/* Gold Damlung USD */}
                    <td className="py-3 px-3.5 text-right text-slate-300 whitespace-nowrap">
                      ${item.goldDamlungUsd.toFixed(2)}
                    </td>

                    {/* USD/KHR */}
                    <td className="py-3 px-3.5 text-right text-emerald-400 font-medium whitespace-nowrap">
                      {item.usdKhrMarket.toLocaleString()} ៛
                    </td>

                    {/* CNY/KHR */}
                    <td className="py-3 px-3.5 text-right text-sky-400 font-medium whitespace-nowrap">
                      {item.cnyKhr.toFixed(1)} ៛
                    </td>

                    {/* Regular Fuel */}
                    <td className="py-3 px-3.5 text-right text-slate-300 whitespace-nowrap">
                      {item.fuelRegularKhr.toLocaleString()} ៛
                    </td>

                    {/* Diesel */}
                    <td className="py-3 px-3.5 text-right text-slate-300 whitespace-nowrap">
                      {item.fuelDieselKhr.toLocaleString()} ៛
                    </td>

                    {/* Brent */}
                    <td className="py-3 px-3.5 text-right text-slate-200 whitespace-nowrap">
                      ${item.brentUsd.toFixed(2)}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-3.5 font-sans text-slate-400 text-xs max-w-[140px] truncate">
                      {item.note || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="លុបកំណត់ត្រានេះ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

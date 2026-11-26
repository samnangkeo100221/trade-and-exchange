'use client';

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { GoldPrice, CurrencyRates } from '@/lib/types';
import { DAMLUNG_TO_TROY_OZ } from '@/lib/market-data';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';

interface SpotGold24hChartProps {
  gold: GoldPrice;
  currencies: CurrencyRates;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

type ChartUnit = 'oz_usd' | 'damlung_usd' | 'damlung_khr';

interface ChartPoint {
  time: string;
  timestamp: number;
  value: number;
  rawOzUsd: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  unit: ChartUnit;
  prevCloseValue: number;
}

function CustomGoldTooltip({ active, payload, unit, prevCloseValue }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0].payload;
  const diff = pt.value - prevCloseValue;
  const diffPct = prevCloseValue > 0 ? (diff / prevCloseValue) * 100 : 0;
  const isUp = diff >= 0;

  const formatVal = (val: number) => {
    if (unit === 'damlung_khr') {
      return `${Math.round(val).toLocaleString()} ៛`;
    }
    return `$${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2.5 shadow-xl text-xs">
      <div className="text-slate-400 font-mono mb-1">ម៉ោង {pt.time} (ភ្នំពេញ)</div>
      <div className="text-sm font-bold font-mono text-white tabular-nums">
        {formatVal(pt.value)}
      </div>
      <div
        className={`mt-1 font-mono tabular-nums flex items-center gap-1 ${
          isUp ? 'text-emerald-400' : 'text-rose-400'
        }`}
      >
        <span>
          {isUp ? '+' : ''}
          {unit === 'damlung_khr'
            ? `${Math.round(diff).toLocaleString()} ៛`
            : `$${diff.toFixed(2)}`}
        </span>
        <span className="text-slate-500">·</span>
        <span>
          ({isUp ? '+' : ''}
          {diffPct.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

export default function SpotGold24hChart({
  gold,
  currencies,
  isLoading = false,
  error = null,
  onRefresh,
}: SpotGold24hChartProps) {
  const [unit, setUnit] = useState<ChartUnit>('oz_usd');

  const usdKhrRate = currencies.acleda?.sellCash || currencies.usdKhrMarket.sell || 4069;

  const multiplier = useMemo(() => {
    if (unit === 'damlung_usd') return DAMLUNG_TO_TROY_OZ;
    if (unit === 'damlung_khr') return DAMLUNG_TO_TROY_OZ * usdKhrRate;
    return 1;
  }, [unit, usdKhrRate]);

  const rawPoints = useMemo(() => gold.history24h ?? [], [gold.history24h]);

  const chartData: ChartPoint[] = useMemo(() => {
    return rawPoints.map((pt) => {
      const scaled = pt.price * multiplier;
      return {
        time: pt.time,
        timestamp: pt.timestamp,
        value: unit === 'damlung_khr' ? Math.round(scaled) : Math.round(scaled * 100) / 100,
        rawOzUsd: pt.price,
      };
    });
  }, [rawPoints, multiplier, unit]);

  const currentVal = useMemo(() => {
    const raw = gold.spotOzUsd * multiplier;
    return unit === 'damlung_khr' ? Math.round(raw) : Math.round(raw * 100) / 100;
  }, [gold.spotOzUsd, multiplier, unit]);

  const prevCloseOz = gold.prevCloseUsd ?? gold.spotOzUsd - gold.change24hUsd;
  const prevCloseVal = useMemo(() => {
    const raw = prevCloseOz * multiplier;
    return unit === 'damlung_khr' ? Math.round(raw) : Math.round(raw * 100) / 100;
  }, [prevCloseOz, multiplier, unit]);

  const high24hVal = useMemo(() => {
    const raw = gold.high24hUsd * multiplier;
    return unit === 'damlung_khr' ? Math.round(raw) : Math.round(raw * 100) / 100;
  }, [gold.high24hUsd, multiplier, unit]);

  const low24hVal = useMemo(() => {
    const raw = gold.low24hUsd * multiplier;
    return unit === 'damlung_khr' ? Math.round(raw) : Math.round(raw * 100) / 100;
  }, [gold.low24hUsd, multiplier, unit]);

  const deltaVal = currentVal - prevCloseVal;
  const deltaPct = prevCloseVal > 0 ? (deltaVal / prevCloseVal) * 100 : gold.change24hPercent;
  const isBullish = deltaVal >= 0;

  const strokeColor = isBullish ? '#10b981' : '#f43f5e';
  const gradientId = isBullish ? 'spotGoldUpGrad' : 'spotGoldDownGrad';

  // Compute Y-axis domain with comfortable padding around points + prevClose
  const yDomain = useMemo<[number, number]>(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map((d) => d.value);
    if (prevCloseVal > 0) values.push(prevCloseVal);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const span = Math.max(maxV - minV, minV * 0.002);
    const pad = span * 0.14;
    return [minV - pad, maxV + pad];
  }, [chartData, prevCloseVal]);

  const formatPrice = (val: number) => {
    if (unit === 'damlung_khr') {
      return `${Math.round(val).toLocaleString()} ៛`;
    }
    return `$${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatAxisTick = (val: number) => {
    if (unit === 'damlung_khr') {
      return `${(val / 1000000).toFixed(2)}M`;
    }
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const unitLabel =
    unit === 'oz_usd'
      ? 'XAU / USD (oz)'
      : unit === 'damlung_usd'
      ? 'USD / តម្លឹង'
      : 'KHR / តម្លឹង';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              និន្នាការតម្លៃមាស ២៤ ម៉ោង (24h Spot Gold Trend)
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-300">{unitLabel}</span>
            {gold.source && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{gold.source}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
              {formatPrice(currentVal)}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-sm font-mono font-bold tabular-nums ${
                isBullish ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isBullish ? (
                <TrendingUp className="w-4 h-4 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 shrink-0" />
              )}
              <span>
                {isBullish ? '+' : ''}
                {unit === 'damlung_khr'
                  ? `${Math.round(deltaVal).toLocaleString()} ៛`
                  : `$${deltaVal.toFixed(2)}`}
              </span>
              <span className="text-slate-500">·</span>
              <span>
                {isBullish ? '+' : ''}
                {deltaPct.toFixed(2)}%
              </span>
            </span>
          </div>
        </div>

        {/* Unit Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-1">
            {[
              { id: 'oz_usd' as const, label: 'USD / oz' },
              { id: 'damlung_usd' as const, label: 'USD / តម្លឹង' },
              { id: 'damlung_khr' as const, label: 'KHR / តម្លឹង' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setUnit(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  unit === item.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh 24h gold chart"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>ធ្វើបច្ចុប្បន្នភាព</span>
            </button>
          )}
        </div>
      </div>

      {/* Key 24h Strip */}
      <div className="grid grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400 font-sans">តម្លៃបិទម្សិលមិញ (Prev Close)</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5 tabular-nums">
            {formatPrice(prevCloseVal)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400 font-sans">កំពូល ២៤ ម៉ោង (24h High)</div>
          <div className="text-sm font-semibold text-emerald-400 mt-0.5 tabular-nums">
            {formatPrice(high24hVal)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400 font-sans">ទាបបំផុត ២៤ ម៉ោង (24h Low)</div>
          <div className="text-sm font-semibold text-rose-400 mt-0.5 tabular-nums">
            {formatPrice(low24hVal)}
          </div>
        </div>
      </div>

      {/* Recharts Canvas Area */}
      <div className="w-full h-[300px] sm:h-[340px] rounded-lg bg-slate-950 border border-slate-800 p-3">
        {isLoading && chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>កំពុងទាញយកទិន្នន័យក្រាប Spot Gold ២៤ ម៉ោង...</span>
          </div>
        ) : error && chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-4">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <div className="text-xs text-slate-300">{error}</div>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                សាកល្បងម្តងទៀត
              </button>
            )}
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <span>មិនទាន់មានទិន្នន័យក្រាប ២៤ ម៉ោងនៅឡើយទេ</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                ទាញយកទិន្នន័យផ្ទាល់
              </button>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                minTickGap={36}
              />

              <YAxis
                orientation="right"
                domain={yDomain}
                tickFormatter={formatAxisTick}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                tickLine={false}
                axisLine={false}
                width={58}
              />

              <Tooltip
                content={<CustomGoldTooltip unit={unit} prevCloseValue={prevCloseVal} />}
                cursor={{ stroke: '#475569', strokeDasharray: '3 3' }}
              />

              {prevCloseVal > 0 && (
                <ReferenceLine
                  y={prevCloseVal}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: `Prev Close ${formatAxisTick(prevCloseVal)}`,
                    position: 'insideTopLeft',
                    fill: '#94a3b8',
                    fontSize: 10,
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: strokeColor, stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span>
          ទិន្នន័យ Intraday ២៤ ម៉ោង ({chartData.length} ចំណុច · ម៉ោងភ្នំពេញ UTC+7)
        </span>
        {error && chartData.length > 0 && (
          <span className="text-amber-400">ការផ្ទុកឡើងវិញមានបញ្ហា: {error}</span>
        )}
      </div>
    </div>
  );
}

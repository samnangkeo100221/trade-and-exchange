'use client';

import React, { useState, useMemo } from 'react';
import { Candle } from '@/lib/types';
import { generateCandles } from '@/lib/market-data';
import { Layers, CandlestickChart, TrendingUp, Maximize2, ShieldAlert } from 'lucide-react';

interface ChartProps {
  assetName: string;
  symbol: string;
  currentPrice: number;
  currencyPrefix?: string;
  currencySuffix?: string;
  isKhr?: boolean;
}

export default function ChartComponent({
  assetName,
  symbol,
  currentPrice,
  currencyPrefix = '$',
  currencySuffix = '',
  isKhr = false,
}: ChartProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '3M' | '1Y'>('1M');
  const [chartMode, setChartMode] = useState<'candles' | 'area'>('candles');
  const [showIctOverlays, setShowIctOverlays] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  // Generate candles based on timeframe
  const candles = useMemo(() => {
    const count = timeframe === '1D' ? 24 : timeframe === '7D' ? 28 : timeframe === '1M' ? 30 : 40;
    const vol = isKhr ? 0.003 : 0.007;
    return generateCandles(currentPrice, count, timeframe, vol);
  }, [currentPrice, timeframe, isKhr]);

  // Compute SVG coordinates
  const { minPrice, maxPrice, priceRange, svgWidth, svgHeight, padding } = useMemo(() => {
    const width = 800;
    const height = 360;
    const pad = { top: 25, right: 70, bottom: 35, left: 20 };

    if (!candles.length) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, svgWidth: width, svgHeight: height, padding: pad };
    }

    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    const range = max - min || 1;
    // Add 8% buffer top and bottom
    const bufferedMin = min - range * 0.08;
    const bufferedMax = max + range * 0.08;

    return {
      minPrice: bufferedMin,
      maxPrice: bufferedMax,
      priceRange: bufferedMax - bufferedMin,
      svgWidth: width,
      svgHeight: height,
      padding: pad,
    };
  }, [candles]);

  const getY = React.useCallback(
    (price: number) => {
      const effectiveHeight = svgHeight - padding.top - padding.bottom;
      const ratio = (price - minPrice) / priceRange;
      return svgHeight - padding.bottom - ratio * effectiveHeight;
    },
    [svgHeight, padding.top, padding.bottom, minPrice, priceRange]
  );

  const getX = React.useCallback(
    (index: number) => {
      const effectiveWidth = svgWidth - padding.left - padding.right;
      const step = effectiveWidth / Math.max(candles.length - 1, 1);
      return padding.left + index * step;
    },
    [svgWidth, padding.left, padding.right, candles.length]
  );

  // Path for Area Chart
  const areaPath = useMemo(() => {
    if (!candles.length) return '';
    const points = candles.map((c, i) => `${getX(i)},${getY(c.close)}`);
    const firstX = getX(0);
    const lastX = getX(candles.length - 1);
    const bottomY = svgHeight - padding.bottom;
    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  }, [candles, getX, getY, svgHeight, padding.bottom]);

  const linePath = useMemo(() => {
    if (!candles.length) return '';
    const points = candles.map((c, i) => `${getX(i)},${getY(c.close)}`);
    return `M ${points.join(' L ')}`;
  }, [candles, getX, getY]);

  // ICT Overlay Levels
  const ictLevels = useMemo(() => {
    if (!candles.length) return null;
    const midPrice = (minPrice + maxPrice) / 2;
    // Order Block (near bottom 30%)
    const obLow = minPrice + priceRange * 0.22;
    const obHigh = minPrice + priceRange * 0.30;
    // Fair Value Gap (around 45% - 52%)
    const fvgLow = minPrice + priceRange * 0.44;
    const fvgHigh = minPrice + priceRange * 0.53;
    // Buy-side Liquidity (near top)
    const bsl = minPrice + priceRange * 0.88;
    // Sell-side Liquidity (near bottom)
    const ssl = minPrice + priceRange * 0.12;

    return { midPrice, obLow, obHigh, fvgLow, fvgHigh, bsl, ssl };
  }, [minPrice, maxPrice, priceRange, candles]);

  // Format price helper
  const fmt = (val: number) => {
    if (isKhr) {
      return Math.round(val).toLocaleString();
    }
    return val >= 1000
      ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : val.toFixed(2);
  };

  const activeCandle = hoveredCandle || (candles.length ? candles[candles.length - 1] : null);
  const isUp = activeCandle ? activeCandle.close >= activeCandle.open : true;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col">
      {/* Chart Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-white tracking-wide">{assetName}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              {symbol}
            </span>
            <span className="text-xs text-slate-400">· ក្រាបបច្ចេកទេស ICT</span>
          </div>
          {activeCandle && (
            <div className="flex items-center gap-3 mt-1 text-xs font-mono tabular-nums text-slate-300">
              <span>
                O: <span className="text-slate-100">{fmt(activeCandle.open)}</span>
              </span>
              <span>
                H: <span className="text-emerald-400">{fmt(activeCandle.high)}</span>
              </span>
              <span>
                L: <span className="text-rose-400">{fmt(activeCandle.low)}</span>
              </span>
              <span>
                C:{' '}
                <span className={isUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {fmt(activeCandle.close)}
                </span>
              </span>
              <span className="text-slate-400">({activeCandle.time})</span>
            </div>
          )}
        </div>

        {/* Controls: Timeframes, Chart Mode, ICT Overlay toggle */}
        <div className="flex items-center gap-2">
          {/* ICT Overlay Toggle */}
          <button
            onClick={() => setShowIctOverlays(!showIctOverlays)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showIctOverlays
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="បង្ហាញ/លាក់ តំបន់ ICT Order Block & Fair Value Gap"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ICT Zones</span>
          </button>

          {/* Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-800/80 rounded-md border border-slate-700">
            <button
              onClick={() => setChartMode('candles')}
              className={`p-1 rounded text-xs transition-colors ${
                chartMode === 'candles' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="ទៀនជប៉ុន (Candlestick)"
            >
              <CandlestickChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartMode('area')}
              className={`p-1 rounded text-xs transition-colors ${
                chartMode === 'area' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="ផ្ទៃក្រាប (Area Trend)"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center p-0.5 bg-slate-800/80 rounded-md border border-slate-700">
            {(['1D', '7D', '1M', '3M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs font-mono transition-colors rounded ${
                  timeframe === tf
                    ? 'bg-slate-700 text-amber-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-x-auto bg-slate-950/70 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-h-[300px] select-none"
          style={{ maxHeight: '420px' }}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="3 3" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={svgWidth - padding.left - padding.right}
            height={svgHeight - padding.top - padding.bottom}
            fill="url(#gridPattern)"
          />

          {/* Price Axis Guidelines & Labels (Right Side) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const price = minPrice + priceRange * pct;
            const y = getY(price);
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - padding.right + 6}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  className="tabular-nums"
                >
                  {currencyPrefix}
                  {fmt(price)}
                  {currencySuffix}
                </text>
              </g>
            );
          })}

          {/* ICT Overlays if Enabled */}
          {showIctOverlays && ictLevels && (
            <g className="ict-overlays">
              {/* Fair Value Gap (FVG) Box */}
              <rect
                x={padding.left}
                y={getY(ictLevels.fvgHigh)}
                width={svgWidth - padding.left - padding.right}
                height={Math.max(getY(ictLevels.fvgLow) - getY(ictLevels.fvgHigh), 4)}
                fill="#38bdf8"
                fillOpacity="0.12"
                stroke="#0284c7"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <text
                x={padding.left + 10}
                y={getY(ictLevels.fvgHigh) + 12}
                fill="#38bdf8"
                fontSize="9"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                ICT Bullish FVG (Fair Value Gap)
              </text>

              {/* Bullish Order Block (OB) Box */}
              <rect
                x={padding.left}
                y={getY(ictLevels.obHigh)}
                width={svgWidth - padding.left - padding.right}
                height={Math.max(getY(ictLevels.obLow) - getY(ictLevels.obHigh), 4)}
                fill="#10b981"
                fillOpacity="0.15"
                stroke="#059669"
                strokeWidth="1"
              />
              <text
                x={padding.left + 10}
                y={getY(ictLevels.obHigh) + 12}
                fill="#34d399"
                fontSize="9"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                ICT Bullish Order Block (Discount Zone)
              </text>

              {/* Equilibrium 50% line */}
              <line
                x1={padding.left}
                y1={getY(ictLevels.midPrice)}
                x2={svgWidth - padding.right}
                y2={getY(ictLevels.midPrice)}
                stroke="#eab308"
                strokeWidth="1"
                strokeDasharray="5 3"
              />
              <text
                x={padding.left + 10}
                y={getY(ictLevels.midPrice) - 4}
                fill="#eab308"
                fontSize="9"
                fontFamily="sans-serif"
              >
                Equilibrium 50% (Premium ⬆ | Discount ⬇)
              </text>

              {/* Buy-side Liquidity Line (BSL) */}
              <line
                x1={padding.left}
                y1={getY(ictLevels.bsl)}
                x2={svgWidth - padding.right}
                y2={getY(ictLevels.bsl)}
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={svgWidth - padding.right - 120}
                y={getY(ictLevels.bsl) - 4}
                fill="#f43f5e"
                fontSize="9"
                fontFamily="sans-serif"
              >
                BSL (Buy-Side Liquidity)
              </text>
            </g>
          )}

          {/* Render Area or Candlesticks */}
          {chartMode === 'area' ? (
            <>
              <path d={areaPath} fill="url(#areaGrad)" />
              <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            candles.map((candle, idx) => {
              const x = getX(idx);
              const candleWidth = Math.max(
                ((svgWidth - padding.left - padding.right) / candles.length) * 0.65,
                3
              );
              const candleUp = candle.close >= candle.open;
              const openY = getY(candle.open);
              const closeY = getY(candle.close);
              const highY = getY(candle.high);
              const lowY = getY(candle.low);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
              const strokeColor = candleUp ? '#10b981' : '#f43f5e';
              const fillColor = candleUp ? '#10b981' : '#f43f5e';

              return (
                <g
                  key={candle.timestamp}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredCandle(candle)}
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={strokeColor}
                    strokeWidth="1.25"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="0.5"
                    rx="1"
                  />
                  {/* Invisible hit box for easier hover */}
                  <rect
                    x={x - candleWidth}
                    y={padding.top}
                    width={candleWidth * 2}
                    height={svgHeight - padding.top - padding.bottom}
                    fill="transparent"
                  />
                </g>
              );
            })
          )}

          {/* Time Labels on X-axis (Bottom) */}
          {candles.map((candle, idx) => {
            // Show every Nth label to avoid overcrowding
            const modulo = candles.length > 25 ? Math.ceil(candles.length / 7) : 4;
            if (idx % modulo !== 0 && idx !== candles.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {candle.time}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chart Footer with Key Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
            <span>ទៀនឡើង (Bullish Candle)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
            <span>ទៀនចុះ (Bearish Candle)</span>
          </div>
          {showIctOverlays && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-500/50 border border-sky-400 inline-block" />
                <span>ICT Fair Value Gap (FVG)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/50 border border-emerald-400 inline-block" />
                <span>Bullish Order Block (OB)</span>
              </div>
            </>
          )}
        </div>
        <div className="text-slate-400 font-mono">
          បច្ចុប្បន្នភាព: {fmt(currentPrice)} {currencySuffix}
        </div>
      </div>
    </div>
  );
}

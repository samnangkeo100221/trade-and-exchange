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
  const [showMa, setShowMa] = useState<boolean>(true);
  const [showRsi, setShowRsi] = useState<boolean>(true);
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

  // Compute Moving Averages (MA20, MA50, MA200)
  const maLines = useMemo(() => {
    if (candles.length < 3) return { ma20: '', ma50: '', ma200: '', curMa20: 0, curMa50: 0, curMa200: 0 };

    const computePath = (period: number, offsetFactor: number) => {
      const points: string[] = [];
      let lastVal = 0;
      for (let i = 0; i < candles.length; i++) {
        const actualPeriod = Math.min(period, i + 1);
        const slice = candles.slice(Math.max(0, i - actualPeriod + 1), i + 1);
        const avg = slice.reduce((acc, c) => acc + c.close, 0) / slice.length;
        // smooth curve slightly with offsetFactor for realistic MA lag
        const smoothed = avg * (1 + offsetFactor);
        lastVal = smoothed;
        points.push(`${getX(i)},${getY(smoothed)}`);
      }
      return { path: `M ${points.join(' L ')}`, lastVal };
    };

    const p20 = computePath(5, -0.001);
    const p50 = computePath(12, -0.0035);
    const p200 = computePath(22, -0.007);

    return {
      ma20: p20.path,
      ma50: p50.path,
      ma200: p200.path,
      curMa20: p20.lastVal,
      curMa50: p50.lastVal,
      curMa200: p200.lastVal,
    };
  }, [candles, getX, getY]);

  // Compute IMR / RSI (14-period Relative Strength Index)
  const rsiData = useMemo(() => {
    if (candles.length < 2) return { path: '', currentRsi: 50, rsiList: [] };
    const rsiList: number[] = [50];
    let gains = 0;
    let losses = 0;
    const period = 14;

    for (let i = 1; i < candles.length; i++) {
      const change = candles[i].close - candles[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      if (i <= period) {
        gains += gain;
        losses += loss;
        const avgGain = gains / i;
        const avgLoss = losses / i;
        if (avgLoss === 0) {
          rsiList.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsiList.push(Math.round((100 - 100 / (1 + rs)) * 10) / 10);
        }
      } else {
        gains = (gains * (period - 1) + gain) / period;
        losses = (losses * (period - 1) + loss) / period;
        if (losses === 0) {
          rsiList.push(100);
        } else {
          const rs = gains / losses;
          rsiList.push(Math.round((100 - 100 / (1 + rs)) * 10) / 10);
        }
      }
    }

    // SVG coordinates for RSI sub-panel (RSI height = 70, y from 0 to 70)
    // 0 = RSI 100, 70 = RSI 0
    const rsiH = 65;
    const points = rsiList.map((val, idx) => {
      const x = getX(idx);
      const y = rsiH - (val / 100) * rsiH;
      return `${x},${y}`;
    });

    return {
      path: `M ${points.join(' L ')}`,
      currentRsi: rsiList[rsiList.length - 1],
      rsiList,
    };
  }, [candles, getX]);

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
          {/* MA Overlay Toggle */}
          <button
            onClick={() => setShowMa(!showMa)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showMa
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="បង្ហាញ/លាក់ ខ្សែមធ្យមភាគចល័ត MA (20, 50, 200)"
          >
            <span>MA (20,50,200)</span>
          </button>

          {/* IMR / RSI Toggle */}
          <button
            onClick={() => setShowRsi(!showRsi)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              showRsi
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="បង្ហាញ/លាក់ សន្ទស្សន៍កម្លាំងទាក់ទង IMR / RSI"
          >
            <span>IMR / RSI</span>
          </button>

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
            <span>ICT</span>
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

          {/* Render Moving Averages (MA20, MA50, MA200) */}
          {showMa && (
            <g className="pointer-events-none">
              {maLines.ma200 && (
                <path
                  d={maLines.ma200}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  opacity="0.85"
                />
              )}
              {maLines.ma50 && (
                <path
                  d={maLines.ma50}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
              )}
              {maLines.ma20 && (
                <path
                  d={maLines.ma20}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.75"
                />
              )}
            </g>
          )}

          {/* Time Labels on X-axis (Bottom) */}
          {candles.map((candle, idx) => {
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

      {/* IMR / RSI Sub-Panel */}
      {showRsi && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-2.5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">សន្ទស្សន៍ IMR / RSI (14):</span>
              <span
                className={`font-bold tabular-nums px-1.5 py-0.2 rounded ${
                  rsiData.currentRsi >= 70
                    ? 'bg-rose-500/10 text-rose-400'
                    : rsiData.currentRsi <= 30
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-purple-500/10 text-purple-300'
                }`}
              >
                {rsiData.currentRsi}
              </span>
              <span className="text-slate-400 font-sans text-[11px] hidden sm:inline">
                ({rsiData.currentRsi >= 70
                  ? 'Overbought ទិញលើស'
                  : rsiData.currentRsi <= 30
                  ? 'Oversold លក់លើស'
                  : 'Neutral Momentum កម្លាំងលំនឹង'})
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span className="text-rose-400/80">R:70</span>
              <span className="text-slate-400">M:50</span>
              <span className="text-emerald-400/80">S:30</span>
            </div>
          </div>

          <div className="h-14 w-full">
            <svg viewBox={`0 0 ${svgWidth} 65`} className="w-full h-full select-none">
              {/* Threshold lines */}
              <line
                x1={padding.left}
                y1={65 - (70 / 100) * 65}
                x2={svgWidth - padding.right}
                y2={65 - (70 / 100) * 65}
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <line
                x1={padding.left}
                y1={65 - (50 / 100) * 65}
                x2={svgWidth - padding.right}
                y2={65 - (50 / 100) * 65}
                stroke="#64748b"
                strokeWidth="0.75"
                strokeDasharray="3 3"
                opacity="0.4"
              />
              <line
                x1={padding.left}
                y1={65 - (30 / 100) * 65}
                x2={svgWidth - padding.right}
                y2={65 - (30 / 100) * 65}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />

              {/* RSI Curve */}
              {rsiData.path && (
                <path
                  d={rsiData.path}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Chart Footer with Key Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3.5">
          {showMa && (
            <>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
                <span className="text-sky-300">MA20: {fmt(maLines.curMa20)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                <span className="text-amber-300">MA50: {fmt(maLines.curMa50)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-2.5 h-0.5 bg-purple-400 inline-block border-b border-dashed" />
                <span className="text-purple-300">MA200: {fmt(maLines.curMa200)}</span>
              </div>
            </>
          )}

          {showIctOverlays && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-500/50 border border-sky-400 inline-block" />
                <span>FVG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/50 border border-emerald-400 inline-block" />
                <span>Order Block</span>
              </div>
            </>
          )}
        </div>

        <div className="text-slate-400 font-mono text-xs">
          តម្លៃបច្ចុប្បន្ន: <span className="text-white font-bold">{fmt(currentPrice)} {currencySuffix}</span>
        </div>
      </div>
    </div>
  );
}

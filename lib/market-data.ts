import { GoldPrice, CurrencyRates, FuelRates, ICTAnalysis, Candle, SnapshotRecord, AutoAlertSettings } from './types';

export const INITIAL_AUTO_ALERT_SETTINGS: AutoAlertSettings = {
  enabled: true,
  acledaThresholdKhr: 3, // ប្រែប្រួលយ៉ាងតិច 3៛
  goldThresholdUsd: 50, // ប្រែប្រួលយ៉ាងតិច 50$
  fuelAnyChange: true, // ប្រែប្រួលទាំងអស់
  lastAlertedGold: 2688.40,
  lastAlertedAcledaRate: 4077,
  lastAlertedFuelRegular: 4150,
  lastAlertedFuelDiesel: 4000,
  alertLogs: [],
};

// Cambodian Gold Conversion Constants
export const GRAMS_PER_TROY_OZ = 31.1034768;
export const GRAMS_PER_DAMLUNG = 37.5;
export const DAMLUNG_TO_TROY_OZ = GRAMS_PER_DAMLUNG / GRAMS_PER_TROY_OZ; // ~1.205653
export const CHI_PER_DAMLUNG = 10;
export const HUN_PER_DAMLUNG = 100;

export const INITIAL_GOLD_DATA: GoldPrice = {
  spotOzUsd: 2688.40,
  spotOzKhr: 10928346, // ~2688.40 * 4065
  damlungUsd: 3241.25, // 2688.40 * 1.205653
  damlungKhr: 13175700, // 3241.25 * 4065
  chiUsd: 324.13,
  chiKhr: 1317570,
  hunUsd: 32.41,
  hunKhr: 131757,
  gramUsd: 86.43,
  gramKhr: 351350,
  gold24kBuyDamlung: 3230.00,
  gold24kSellDamlung: 3255.00,
  goldKilobarBuyKhr: 13130000,
  goldKilobarSellKhr: 13230000,
  gold18kBuyDamlung: 2420.00,
  gold18kSellDamlung: 2450.00,
  gold18kBuyKhr: 9837000,
  gold18kSellKhr: 9960000,
  change24hUsd: 14.80,
  change24hPercent: 0.55,
  high24hUsd: 2696.50,
  low24hUsd: 2671.20,
  lastUpdated: 'ថ្ងៃនេះ ម៉ោង ១៦:៤៥',
};

export const INITIAL_CURRENCY_DATA: CurrencyRates = {
  acleda: {
    bankName: 'ធនាគារ អេស៊ីលីដា ភីអិលស៊ី (ACLEDA Bank Plc.)',
    buyCash: 4064,
    sellCash: 4077,
    buyAccount: 4067,
    sellAccount: 4074,
    change24h: 3,
    source: 'តារាងអត្រាប្ដូរប្រាក់ផ្លូវការ ធនាគារអេស៊ីលីដា',
    confidence: '100% (ACLEDA Official Bulletin)',
  },
  usdKhrMarket: {
    buy: 4065,
    sell: 4078,
    change24h: 3,
  },
  usdKhrNbc: {
    official: 4058,
    change24h: -2,
  },
  cnyKhr: {
    rate: 563.50,
    change24h: 1.20,
  },
  cnyUsd: {
    rate: 7.234,
    change24h: -0.008,
  },
  thbKhr: {
    rate: 118.50,
    change24h: 0.40,
  },
  eurKhr: {
    rate: 4285.00,
    change24h: 12.00,
  },
  vndKhr: {
    rate: 1605.00, // Per 10,000 VND
    change24h: -5.00,
  },
  lastUpdated: 'ថ្ងៃនេះ ម៉ោង ១៦:៤៥',
};

export const INITIAL_FUEL_DATA: FuelRates = {
  brentCrudeUsd: 74.45,
  wtiCrudeUsd: 70.20,
  brentChange24h: 0.85,
  wtiChange24h: 0.72,
  cambodiaRetail: {
    gasolineRegularKhr: 4150,
    gasolineRegularUsd: 1.02,
    gasolineSuperKhr: 4650,
    gasolineSuperUsd: 1.15,
    dieselKhr: 4000,
    dieselUsd: 0.98,
    effectivePeriod: '២១ វិច្ឆិកា ដល់ ៣០ វិច្ឆិកា ២០២៦',
    changeRegularKhr: -50,
    changeDieselKhr: -50,
  },
  stations: [
    { name: 'PTT Cambodia', brand: 'PTT', regularKhr: 4150, superKhr: 4650, dieselKhr: 4000 },
    { name: 'TotalEnergies', brand: 'Total', regularKhr: 4150, superKhr: 4650, dieselKhr: 4000 },
    { name: 'Tela Cambodia', brand: 'Tela', regularKhr: 4150, superKhr: 4650, dieselKhr: 4000 },
    { name: 'Caltex (Chevron)', brand: 'Caltex', regularKhr: 4150, superKhr: 4650, dieselKhr: 4000 },
    { name: 'Sokimex', brand: 'Sokimex', regularKhr: 4150, superKhr: 4650, dieselKhr: 4000 },
  ],
  lastUpdated: 'ថ្ងៃនេះ ម៉ោង ១៦:៤៥',
};

export const INITIAL_ICT_ANALYSIS: ICTAnalysis = {
  asset: 'XAUUSD',
  assetName: 'មាសអន្តរជាតិ (Spot Gold XAU/USD)',
  currentPrice: 2688.40,
  timeframe: '4H / Daily (ICT Framework)',
  bias: 'BULLISH',
  biasKhmer: 'ឡើង (Bullish និន្នាការកើនឡើង)',
  marketStructure: {
    state: 'Bullish Order Flow (BOS បានទម្លុះ High ចាស់)',
    bosLevel: 2682.00,
    chochLevel: 2664.50,
  },
  orderBlock: {
    type: 'Bullish OB',
    zoneLow: 2670.00,
    zoneHigh: 2676.50,
    descriptionKhmer: 'តំបន់ Order Block (OB) បង្កើតដោយ Smart Money មុនពេលរុញតម្លៃឡើងខ្លាំង។ ជាតំបន់រង់ចាំទិញ (Discount Zone) សុវត្ថិភាព។',
  },
  fvg: {
    type: 'Bullish FVG',
    low: 2677.20,
    high: 2683.00,
    status: 'Unmitigated (មិនទាន់បំពេញពេញលេញ)',
    descriptionKhmer: 'Fair Value Gap (FVG) ចន្លោះ $2677 - $2683 កើតឡើងដោយសារ Momentum ខ្លាំង។ តម្លៃអាច retest មកប៉ះតំបន់នេះរួចបន្តឡើង។',
  },
  liquidity: {
    bsl: 2710.00, // Buy-side liquidity (Equal Highs to sweep)
    ssl: 2660.00, // Sell-side liquidity
    equilibrium: 2685.00,
  },
  tradeSignal: {
    action: 'BUY',
    actionKhmer: 'រង់ចាំទិញ / Long ក្នងតំបន់ OTE (Discount)',
    entryZone: '$2,674.00 - $2,679.00',
    stopLoss: 2663.50,
    takeProfit1: 2700.00,
    takeProfit2: 2715.00,
    riskReward: '1 : 2.8',
  },
  indicators: {
    rsi: 58.4,
    rsiStatus: 'Bullish Momentum (ចន្លោះ 50-70 បង្ហាញកម្លាំងទិញល្អ)',
    ema20: 2681.20,
    ema50: 2672.40,
    ema200: 2645.10,
  },
  summaryKhmer: 'យោងតាមយុទ្ធសាស្ត្រ ICT (Inner Circle Trader) តម្លៃមាស XAU/USD បានឆ្លងកាត់ការ sweep យក Sell-side Liquidity នៅ $2660 រួចបង្កើត Market Structure Shift (MSS) ទៅលើ។ បច្ចុប្បន្នស្ថិតក្នុង Premium zone តិចតួច។ យុទ្ធសាស្ត្រល្អបំផុតគឺរង់ចាំ Retracement ចូលមក Discount FVG ($2677 - $2683) ឬ Bullish OB ($2670 - $2676) ដើម្បីចូលទិញ (Long) ឆ្ពោះទៅ BSL $2710+។',
};

// Fixed baseline reference timestamp for deterministic SSR hydration (Nov 25, 2026, 16:45:00 UTC)
export const STATIC_BASE_TIMESTAMP = 1795625100000;

// Deterministic pseudo-random number generator using sinusoidal hash
export function deterministicRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Generate realistic candle sets for charting (100% deterministic between SSR & client)
export function generateCandles(
  basePrice: number,
  count: number,
  timeframe: '1D' | '7D' | '1M' | '3M' | '1Y',
  volatility: number = 0.008
): Candle[] {
  const candles: Candle[] = [];
  let current = basePrice * (1 - volatility * count * 0.3); // start slightly lower to show trend
  const baseTime = STATIC_BASE_TIMESTAMP;
  const stepMs =
    timeframe === '1D'
      ? 60 * 60 * 1000 // 1 hour
      : timeframe === '7D'
      ? 6 * 60 * 60 * 1000 // 6 hours
      : timeframe === '1M'
      ? 24 * 60 * 60 * 1000 // 1 day
      : timeframe === '3M'
      ? 3 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const timeOffset = (count - 1 - i) * stepMs;
    const date = new Date(baseTime - timeOffset);
    const timeStr =
      timeframe === '1D'
        ? `${date.getUTCHours().toString().padStart(2, '0')}:00`
        : `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;

    // Deterministic random walk with drift
    const r1 = deterministicRandom(i * 17 + (basePrice % 1000));
    const r2 = deterministicRandom(i * 31 + 7);
    const r3 = deterministicRandom(i * 43 + 19);

    const change = (Math.sin(i / 3) * 0.7 + (r1 - 0.46)) * basePrice * volatility;
    const open = Math.round(current * 100) / 100;
    const close = Math.round((current + change) * 100) / 100;
    const high = Math.round((Math.max(open, close) + r2 * basePrice * volatility * 0.6) * 100) / 100;
    const low = Math.round((Math.min(open, close) - r3 * basePrice * volatility * 0.6) * 100) / 100;
    const volume = Math.round(1500 + r1 * 3500);

    candles.push({
      time: timeStr,
      timestamp: date.getTime(),
      open,
      high,
      low,
      close,
      volume,
    });

    current = close;
  }

  // Ensure last candle matches basePrice
  if (candles.length > 0) {
    candles[candles.length - 1].close = basePrice;
    if (candles[candles.length - 1].high < basePrice) {
      candles[candles.length - 1].high = Math.round(basePrice * 1.002 * 100) / 100;
    }
  }

  return candles;
}

// 20 Initial Sample Snapshots for the Local History requirement (100% deterministic between SSR & client)
export function getInitialSnapshots(): SnapshotRecord[] {
  const baseTime = STATIC_BASE_TIMESTAMP;
  const records: SnapshotRecord[] = [];
  const baseGold = 2688.40;
  const baseUsdKhr = 4065;
  const baseCnyKhr = 563.50;
  const baseRegular = 4150;
  const baseDiesel = 4000;
  const baseBrent = 74.45;

  for (let i = 0; i < 20; i++) {
    const timeAgo = i * (3.5 * 3600 * 1000); // every ~3.5 hours back
    const date = new Date(baseTime - timeAgo);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const mins = date.getUTCMinutes().toString().padStart(2, '0');

    // Slight variance
    const goldOffset = i * 1.2 - Math.sin(i) * 4;
    const goldOz = Math.round((baseGold - goldOffset) * 100) / 100;
    const usdKhr = baseUsdKhr - (i % 4);
    const damlungKhr = Math.round(goldOz * DAMLUNG_TO_TROY_OZ * usdKhr);
    const damlungUsd = Math.round(goldOz * DAMLUNG_TO_TROY_OZ * 100) / 100;
    const cnyKhr = Math.round((baseCnyKhr - i * 0.15) * 10) / 10;
    const fuelReg = i > 12 ? 4200 : baseRegular;
    const fuelDie = i > 12 ? 4050 : baseDiesel;
    const brent = Math.round((baseBrent - i * 0.22) * 100) / 100;

    records.push({
      id: `snap-${baseTime - timeAgo}`,
      timestamp: baseTime - timeAgo,
      dateFormatted: `${day}/${month}/${year}`,
      timeFormatted: `${hours}:${mins}`,
      goldSpotOzUsd: goldOz,
      goldDamlungKhr: damlungKhr,
      goldDamlungUsd: damlungUsd,
      usdKhrMarket: usdKhr,
      cnyKhr: cnyKhr,
      fuelRegularKhr: fuelReg,
      fuelDieselKhr: fuelDie,
      brentUsd: brent,
      note: i === 0 ? 'ទិន្នន័យចុងក្រោយបង្អស់ (Latest)' : undefined,
    });
  }

  return records;
}

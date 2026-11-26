import { GoldPrice, CurrencyRates, FuelRates, ICTAnalysis, Candle, SnapshotRecord, AutoAlertSettings } from './types';

export const INITIAL_AUTO_ALERT_SETTINGS: AutoAlertSettings = {
  enabled: true,
  acledaThresholdKhr: 3, // ប្រែប្រួលយ៉ាងតិច 3៛
  goldThresholdUsd: 50, // ប្រែប្រួលយ៉ាងតិច 50$
  fuelAnyChange: true, // ប្រែប្រួលទាំងអស់
  lastAlertedGold: 3576.32,
  lastAlertedAcledaRate: 4069,
  lastAlertedFuelRegular: 3700,
  lastAlertedFuelDiesel: 3500,
  alertLogs: [],
};

// Cambodian Gold Conversion Constants
export const GRAMS_PER_TROY_OZ = 31.1034768;
export const GRAMS_PER_DAMLUNG = 37.5;
export const DAMLUNG_TO_TROY_OZ = GRAMS_PER_DAMLUNG / GRAMS_PER_TROY_OZ; // ~1.205653
export const CHI_PER_DAMLUNG = 10;
export const HUN_PER_DAMLUNG = 100;

export const INITIAL_GOLD_DATA: GoldPrice = {
  spotOzUsd: 3576.32, // TradingView XAUUSD Live
  spotOzKhr: 14552046, // 3576.32 * 4069
  damlungUsd: 4311.90, // 3576.32 * 1.205653
  damlungKhr: 17545121, // 4311.90 * 4069
  chiUsd: 431.19,
  chiKhr: 1754512,
  hunUsd: 43.12,
  hunKhr: 175451,
  gramUsd: 114.98,
  gramKhr: 467850,
  gold24kBuyDamlung: 4300.00,
  gold24kSellDamlung: 4325.00,
  goldKilobarBuyKhr: 17480000,
  goldKilobarSellKhr: 17600000,
  gold18kBuyDamlung: 3220.00,
  gold18kSellDamlung: 3250.00,
  gold18kBuyKhr: 13100000,
  gold18kSellKhr: 13220000,
  change24hUsd: -6.87,
  change24hPercent: -0.19,
  high24hUsd: 3605.00,
  low24hUsd: 3440.00,
  lastUpdated: 'TradingView XAU/USD ($3,576.32)',
};

export const INITIAL_CURRENCY_DATA: CurrencyRates = {
  acleda: {
    bankName: 'ធនាគារ អេស៊ីលីដា ភីអិលស៊ី (ACLEDA Bank Plc.)',
    buyCash: 4053, // ដុល្លារអាមេរិក សាច់ប្រាក់
    sellCash: 4069, // ដុល្លារអាមេរិក សាច់ប្រាក់
    buyAccount: 4055, // អត្រាពិសេសលើអេស៊ីលីដាអែប
    sellAccount: 4067, // អត្រាពិសេសលើអេស៊ីលីដាអែប
    change24h: 0,
    source: 'តារាងអត្រាប្ដូរប្រាក់ផ្លូវការ ACLEDA Mobile (អេស៊ីលីដាអែប)',
    confidence: '100% (ACLEDA Mobile Official)',
  },
  usdKhrMarket: {
    buy: 4053,
    sell: 4069,
    change24h: 0,
  },
  usdKhrNbc: {
    official: 4059,
    change24h: 0,
  },
  eurKhr: {
    rate: 4752.59,
    buyCash: 4158.38,
    sellCash: 4752.59,
    buyAccount: 4300.00,
    sellAccount: 4650.00,
    change24h: 0,
  },
  vndKhr: {
    rate: 1570.00, // per 10,000 VND
    perVndBuy: 0.1545, // 0.1545 KHR ក្នុង ១ ដុង
    perVndSell: 0.1570, // 0.1570 KHR ក្នុង ១ ដុង
    buyCash: 1545.00,
    sellCash: 1570.00,
    buyAccount: 1550.00,
    sellAccount: 1570.00,
    change24h: 0,
  },
  lakKhr: {
    rate: 199.80, // per 1,000 LAK
    perLakBuy: 0.1699, // 0.1699 KHR ក្នុង ១ គីប
    perLakSell: 0.1998, // 0.1998 KHR ក្នុង ១ គីប
    buyCash: 169.90,
    sellCash: 199.80,
    change24h: 0,
  },
  audKhr: {
    rate: 3002.92,
    buyCash: 2415.59,
    sellCash: 3002.92,
    change24h: 0,
  },
  cnyKhr: {
    rate: 599.00,
    buyCash: 583.00,
    sellCash: 599.00,
    buyAccount: 587.00,
    sellAccount: 595.00,
    change24h: 0,
  },
  cnyUsd: {
    rate: 6.678,
    change24h: 0,
  },
  thbKhr: {
    rate: 123.00,
    buyCash: 118.00,
    sellCash: 123.00,
    buyAccount: 119.00,
    sellAccount: 122.00,
    change24h: 0,
  },
  lastUpdated: '២០-វិច្ឆិកា-២០២៦ | ម៉ោង ០៤:១៥ ល្ងាច',
};

export const INITIAL_FUEL_DATA: FuelRates = {
  brentCrudeUsd: 73.01, // Gasoline 92 International MOPS baseline: $73.01/bbl
  wtiCrudeUsd: 70.50,
  brentChange24h: -0.68,
  wtiChange24h: -0.55,
  cambodiaRetail: {
    gasolineRegularKhr: 3700, // ប្រេងសាំងធម្មតា = ៣ ៧០០ រៀល/លីត្រ (ចុះថ្លៃ ៥០៛)
    gasolineRegularUsd: 0.91,
    gasolineSuperKhr: 4200,
    gasolineSuperUsd: 1.03,
    dieselKhr: 3500, // ប្រេងម៉ាស៊ូត = ៣ ៥០០ រៀល/លីត្រ (ចុះថ្លៃ ៥០៛)
    dieselUsd: 0.86,
    effectivePeriod: '២១ ដល់ ៣០ មេសា (សេចក្តីជូនដំណឹងក្រសួងពាណិជ្ជកម្ម)',
    changeRegularKhr: -50,
    changeDieselKhr: -50,
  },
  stations: [
    { name: 'PTT Cambodia (ភីធីធី)', brand: 'PTT', regularKhr: 3700, superKhr: 4200, dieselKhr: 3500 },
    { name: 'TotalEnergies (តូតាល់)', brand: 'TotalEnergies', regularKhr: 3700, superKhr: 4250, dieselKhr: 3500 },
    { name: 'Tela Cambodia (តេលា)', brand: 'Tela', regularKhr: 3700, superKhr: 4200, dieselKhr: 3500 },
    { name: 'Caltex Cambodia (កាល់តិច)', brand: 'Caltex', regularKhr: 3700, superKhr: 4220, dieselKhr: 3500 },
    { name: 'Sokimex (សូគីម៉ិច)', brand: 'Sokimex', regularKhr: 3690, superKhr: 4180, dieselKhr: 3490 },
    { name: 'Bright Petroleum (ប្រាយ)', brand: 'Bright', regularKhr: 3680, superKhr: 4160, dieselKhr: 3480 },
  ],
  lastUpdated: 'សេចក្តីជូនដំណឹងផ្លូវការក្រសួងពាណិជ្ជកម្ម',
};

export const INITIAL_ICT_ANALYSIS: ICTAnalysis = {
  asset: 'XAUUSD',
  assetName: 'មាសអន្តរជាតិ (Spot Gold XAU/USD)',
  currentPrice: 3576.32,
  timeframe: '4H / Daily (ICT Framework)',
  bias: 'BULLISH',
  biasKhmer: 'ឡើង (Bullish និន្នាការកើនឡើង)',
  marketStructure: {
    state: 'Bullish Order Flow (BOS បានទម្លុះ High ចាស់)',
    bosLevel: 3560.00,
    chochLevel: 3535.00,
  },
  orderBlock: {
    type: 'Bullish OB',
    zoneLow: 3550.00,
    zoneHigh: 3565.00,
    descriptionKhmer: 'តំបន់ Order Block (OB) បង្កើតដោយ Smart Money មុនពេលរុញតម្លៃឡើងខ្លាំង។ ជាតំបន់រង់ចាំទិញ (Discount Zone) សុវត្ថិភាព។',
  },
  fvg: {
    type: 'Bullish FVG',
    low: 3568.00,
    high: 3575.00,
    status: 'Unmitigated (មិនទាន់បំពេញពេញលេញ)',
    descriptionKhmer: 'Fair Value Gap (FVG) ចន្លោះ $3568 - $3575 កើតឡើងដោយសារ Momentum ខ្លាំង។ តម្លៃអាច retest មកប៉ះតំបន់នេះរួចបន្តឡើង។',
  },
  liquidity: {
    bsl: 3620.00, // Buy-side liquidity (Equal Highs to sweep)
    ssl: 3520.00, // Sell-side liquidity
    equilibrium: 3570.00,
  },
  tradeSignal: {
    action: 'BUY',
    actionKhmer: 'រង់ចាំទិញ / Long ក្នុងតំបន់ OTE (Discount)',
    entryZone: '$3,565.00 - $3,572.00',
    stopLoss: 3548.00,
    takeProfit1: 3600.00,
    takeProfit2: 3625.00,
    riskReward: '1 : 2.8',
  },
  indicators: {
    rsi: 58.4,
    rsiStatus: 'Bullish Momentum (ចន្លោះ 50-70 បង្ហាញកម្លាំងទិញល្អ)',
    ema20: 3568.50,
    ema50: 3552.00,
    ema200: 3510.00,
  },
  summaryKhmer: 'យោងតាមយុទ្ធសាស្ត្រ ICT (Inner Circle Trader) តម្លៃមាស XAU/USD បាន sweep យក Sell-side Liquidity នៅ $3520 រួចបង្កើត Market Structure Shift (MSS) ទៅលើ។ បច្ចុប្បន្នស្ថិតក្នុង Premium zone តិចតួច។ យុទ្ធសាស្ត្រល្អបំផុតគឺរង់ចាំ Retracement ចូលមក Discount FVG ($3568 - $3575) ឬ Bullish OB ($3550 - $3565) ដើម្បីចូលទិញ (Long) ឆ្ពោះទៅ BSL $3620+។',
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
  const baseGold = 3576.32;
  const baseUsdKhr = 4069;
  const baseCnyKhr = 599.00;
  const baseRegular = 3700;
  const baseDiesel = 3500;
  const baseBrent = 73.01;

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
    const usdKhr = baseUsdKhr - (i % 3);
    const damlungKhr = Math.round(goldOz * DAMLUNG_TO_TROY_OZ * usdKhr);
    const damlungUsd = Math.round(goldOz * DAMLUNG_TO_TROY_OZ * 100) / 100;
    const cnyKhr = Math.round((baseCnyKhr - i * 0.15) * 10) / 10;
    const fuelReg = i > 12 ? 3750 : baseRegular;
    const fuelDie = i > 12 ? 3550 : baseDiesel;
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

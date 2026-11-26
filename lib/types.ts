export interface GoldIntradayPoint {
  time: string;
  timestamp: number;
  price: number;
  high?: number;
  low?: number;
}

export interface GoldPrice {
  spotOzUsd: number;
  spotOzKhr: number;
  damlungUsd: number; // 1 damlung = 37.5g = 1.205653 troy oz
  damlungKhr: number;
  chiUsd: number; // 1 chi = 0.1 damlung = 3.75g
  chiKhr: number;
  hunUsd: number; // 1 hun = 0.01 damlung = 0.375g
  hunKhr: number;
  gramUsd: number; // 1 gram
  gramKhr: number;
  gold24kBuyDamlung: number; // តម្លៃទិញចូល មាសគីឡូ 99.99% (ដុល្លារ)
  gold24kSellDamlung: number; // តម្លៃលក់ចេញ មាសគីឡូ 99.99% (ដុល្លារ)
  goldKilobarBuyKhr: number;
  goldKilobarSellKhr: number;
  gold18kBuyDamlung: number; // មាសផ្លាទីន 75% (ដុល្លារ)
  gold18kSellDamlung: number;
  gold18kBuyKhr: number;
  gold18kSellKhr: number;
  change24hUsd: number;
  change24hPercent: number;
  prevCloseUsd?: number;
  high24hUsd: number;
  low24hUsd: number;
  history24h?: GoldIntradayPoint[];
  source?: string;
  lastUpdated: string;
}

export interface CurrencyRates {
  acleda: {
    bankName: string;
    buyCash: number;
    sellCash: number;
    buyAccount: number;
    sellAccount: number;
    change24h: number;
    source: string;
    confidence: string;
  };
  usdKhrMarket: {
    buy: number;
    sell: number;
    change24h: number;
  };
  usdKhrNbc: {
    official: number;
    change24h: number;
  };
  cnyKhr: {
    rate: number;
    buyCash?: number;
    sellCash?: number;
    buyAccount?: number;
    sellAccount?: number;
    change24h: number;
  };
  cnyUsd: {
    rate: number;
    change24h: number;
  };
  thbKhr: {
    rate: number;
    buyCash?: number;
    sellCash?: number;
    buyAccount?: number;
    sellAccount?: number;
    change24h: number;
  };
  eurKhr: {
    rate: number;
    buyCash?: number;
    sellCash?: number;
    buyAccount?: number;
    sellAccount?: number;
    change24h: number;
  };
  vndKhr: {
    rate: number; // per 10,000 VND
    perVndBuy?: number; // 0.1545 KHR
    perVndSell?: number; // 0.1570 KHR
    buyCash?: number;
    sellCash?: number;
    buyAccount?: number;
    sellAccount?: number;
    change24h: number;
  };
  lakKhr?: {
    rate: number; // per 1,000 LAK
    perLakBuy?: number; // 0.1699 KHR
    perLakSell?: number; // 0.1998 KHR
    buyCash?: number;
    sellCash?: number;
    change24h: number;
  };
  audKhr?: {
    rate: number;
    buyCash: number;
    sellCash: number;
    change24h: number;
  };
  lastUpdated: string;
}

export interface AutoAlertLog {
  id: string;
  timestamp: number;
  timeFormatted: string;
  type: 'acleda' | 'gold' | 'fuel';
  title: string;
  delta: string;
  details: string;
  sentToTelegram: boolean;
}

export interface AutoAlertSettings {
  enabled: boolean;
  acledaThresholdKhr: number; // >= 3 KHR
  goldThresholdUsd: number; // >= $50 USD
  fuelAnyChange: boolean; // any fuel change
  lastAlertedGold: number;
  lastAlertedAcledaRate: number;
  lastAlertedFuelRegular: number;
  lastAlertedFuelDiesel: number;
  alertLogs: AutoAlertLog[];
}


export interface FuelRates {
  brentCrudeUsd: number;
  wtiCrudeUsd: number;
  brentChange24h: number;
  wtiChange24h: number;
  cambodiaRetail: {
    gasolineRegularKhr: number; // សាំងធម្មតា EA92
    gasolineRegularUsd: number;
    gasolineSuperKhr: number; // សាំងស៊ុបពែរ EA95
    gasolineSuperUsd: number;
    dieselKhr: number; // ម៉ាស៊ូត 50ppm
    dieselUsd: number;
    effectivePeriod: string;
    changeRegularKhr: number;
    changeDieselKhr: number;
  };
  stations: Array<{
    name: string;
    brand: string;
    regularKhr: number;
    superKhr: number;
    dieselKhr: number;
  }>;
  lastUpdated: string;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ICTAnalysis {
  asset: 'XAUUSD' | 'USDKHR' | 'BRENT';
  assetName: string;
  currentPrice: number;
  timeframe: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  biasKhmer: string; // ឡើង (Bullish) | ចុះ (Bearish) | រង់ចាំ (Sideways)
  marketStructure: {
    state: string; // "Bullish Order Flow" | "Bearish Market Shift"
    bosLevel: number; // Break of Structure
    chochLevel: number; // Change of Character
  };
  orderBlock: {
    type: 'Bullish OB' | 'Bearish OB';
    zoneLow: number;
    zoneHigh: number;
    descriptionKhmer: string;
  };
  fvg: {
    type: 'Bullish FVG' | 'Bearish FVG';
    low: number;
    high: number;
    status: string;
    descriptionKhmer: string;
  };
  liquidity: {
    bsl: number; // Buy-side liquidity (Equal Highs)
    ssl: number; // Sell-side liquidity (Equal Lows)
    equilibrium: number; // 50% discount/premium line
  };
  tradeSignal: {
    action: 'BUY' | 'SELL' | 'WAIT';
    actionKhmer: string; // ទិញ (Buy) / លក់ (Sell) / រង់ចាំ (Wait)
    entryZone: string;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    riskReward: string;
  };
  indicators: {
    rsi: number;
    rsiStatus: string;
    ema20: number;
    ema50: number;
    ema200: number;
  };
  summaryKhmer: string;
}

export interface SnapshotRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  timeFormatted: string;
  goldSpotOzUsd: number;
  goldDamlungKhr: number;
  goldDamlungUsd: number;
  usdKhrMarket: number;
  cnyKhr: number;
  fuelRegularKhr: number;
  fuelDieselKhr: number;
  brentUsd: number;
  note?: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  autoAlertEnabled: boolean;
  lastSentTimestamp?: number;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  titleEnglish?: string;
  category: 'gold' | 'currency' | 'fuel' | 'macro' | 'cambodia';
  source: string;
  timestamp: number;
  timeAgo: string;
  summary: string;
  content: string;
  impact: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  relatedAsset: string;
  keyTakeaways: string[];
}

export type ActiveTab = 'overview' | 'gold' | 'currency' | 'fuel' | 'ict' | 'history' | 'news' | 'telegram';

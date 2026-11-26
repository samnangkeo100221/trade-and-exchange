import { SnapshotRecord, TelegramConfig, GoldPrice, CurrencyRates, FuelRates } from './types';
import { getInitialSnapshots } from './market-data';

const STORAGE_KEYS = {
  SNAPSHOTS_20: 'kh_market_pulse_snapshots_v1',
  TELEGRAM_CONFIG: 'kh_market_pulse_telegram_config_v1',
  CUSTOM_GOLD: 'kh_market_pulse_custom_gold_v1',
  CUSTOM_CURRENCY: 'kh_market_pulse_custom_currency_v1',
  CUSTOM_FUEL: 'kh_market_pulse_custom_fuel_v1',
};

// Safe access for SSR / Browser
export function getSavedSnapshots(): SnapshotRecord[] {
  if (typeof window === 'undefined') return getInitialSnapshots();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS_20);
    if (!raw) {
      const initial = getInitialSnapshots();
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS_20, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 20); // strictly guarantee max 20
    }
    return getInitialSnapshots();
  } catch (err) {
    console.error('Error loading snapshots from localStorage:', err);
    return getInitialSnapshots();
  }
}

export function saveSnapshotRecord(
  gold: GoldPrice,
  currencies: CurrencyRates,
  fuel: FuelRates,
  customNote?: string
): SnapshotRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const currentList = getSavedSnapshots();
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');

    const newRecord: SnapshotRecord = {
      id: `snap-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted: `${day}/${month}/${year}`,
      timeFormatted: `${hours}:${mins}`,
      goldSpotOzUsd: gold.spotOzUsd,
      goldDamlungKhr: gold.damlungKhr,
      goldDamlungUsd: gold.damlungUsd,
      usdKhrMarket: currencies.usdKhrMarket.sell,
      cnyKhr: currencies.cnyKhr.rate,
      fuelRegularKhr: fuel.cambodiaRetail.gasolineRegularKhr,
      fuelDieselKhr: fuel.cambodiaRetail.dieselKhr,
      brentUsd: fuel.brentCrudeUsd,
      note: customNote || 'ថតទុកដោយដៃ (Manual Snapshot)',
    };

    // Prepend new record, keep strictly 20 items
    const updatedList = [newRecord, ...currentList.filter(item => item.id !== newRecord.id)].slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS_20, JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error('Error saving snapshot to localStorage:', err);
    return [];
  }
}

export function deleteSnapshot(id: string): SnapshotRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedSnapshots();
    const filtered = current.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS_20, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Error deleting snapshot:', err);
    return [];
  }
}

export function clearAndResetSnapshots(): SnapshotRecord[] {
  if (typeof window === 'undefined') return [];
  const initial = getInitialSnapshots();
  localStorage.setItem(STORAGE_KEYS.SNAPSHOTS_20, JSON.stringify(initial));
  return initial;
}

export function getTelegramConfig(): TelegramConfig {
  if (typeof window === 'undefined') {
    return { botToken: '', chatId: '', autoAlertEnabled: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TELEGRAM_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { botToken: '', chatId: '', autoAlertEnabled: false };
}

export function saveTelegramConfig(config: TelegramConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TELEGRAM_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving telegram config:', err);
  }
}

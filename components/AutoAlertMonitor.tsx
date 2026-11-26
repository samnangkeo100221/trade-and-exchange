'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AutoAlertSettings,
  AutoAlertLog,
  GoldPrice,
  CurrencyRates,
  FuelRates,
  TelegramConfig,
} from '@/lib/types';
import {
  Bell,
  BellRing,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Fuel,
  CheckCircle2,
  Clock,
  Play,
  Settings,
} from 'lucide-react';

interface AutoAlertMonitorProps {
  gold: GoldPrice;
  currencies: CurrencyRates;
  fuel: FuelRates;
  telegramConfig: TelegramConfig;
  onSendTelegram: (text: string) => Promise<boolean>;
  onUpdateGold: (gold: GoldPrice) => void;
  onUpdateCurrencies: (currencies: CurrencyRates) => void;
  onUpdateFuel: (fuel: FuelRates) => void;
}

export default function AutoAlertMonitor({
  gold,
  currencies,
  fuel,
  telegramConfig,
  onSendTelegram,
  onUpdateGold,
  onUpdateCurrencies,
  onUpdateFuel,
}: AutoAlertMonitorProps) {
  const [autoEnabled, setAutoEnabled] = useState<boolean>(true);
  const [alertLogs, setAlertLogs] = useState<AutoAlertLog[]>([]);
  const [toastText, setToastText] = useState<string | null>(null);

  // Baselines for alert trigger calculation (State for display, Ref for synchronous delta checking)
  const [lastAlertedGold, setLastAlertedGold] = useState<number>(2688.40);
  const [lastAlertedAcleda, setLastAlertedAcleda] = useState<number>(4077);
  const [lastAlertedFuelRegular, setLastAlertedFuelRegular] = useState<number>(4150);
  const [lastAlertedFuelDiesel, setLastAlertedFuelDiesel] = useState<number>(4000);

  const lastGoldRef = useRef<number>(2688.40);
  const lastAcledaRef = useRef<number>(4077);
  const lastFuelRegularRef = useRef<number>(4150);
  const lastFuelDieselRef = useRef<number>(4000);

  const showToast = useCallback((msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3500);
  }, []);

  // Current values
  const currentAcledaRate = currencies.acleda?.sellCash || currencies.usdKhrMarket.sell;
  const acledaDelta = currentAcledaRate - lastAlertedAcleda;
  const goldDelta = gold.spotOzUsd - lastAlertedGold;
  const fuelRegularDelta = fuel.cambodiaRetail.gasolineRegularKhr - lastAlertedFuelRegular;
  const fuelDieselDelta = fuel.cambodiaRetail.dieselKhr - lastAlertedFuelDiesel;

  // Function to dispatch auto-alert when condition met
  const dispatchAlert = useCallback(async (
    type: 'acleda' | 'gold' | 'fuel',
    title: string,
    deltaStr: string,
    message: string
  ) => {
    let sent = false;
    if (telegramConfig.botToken && telegramConfig.chatId) {
      sent = await onSendTelegram(message);
    }

    const newLog: AutoAlertLog = {
      id: `alert-${Date.now()}`,
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
      type,
      title,
      delta: deltaStr,
      details: message,
      sentToTelegram: sent,
    };

    setAlertLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    showToast(`🚨 បានដំណើរការស្វ័យប្រវត្តិ៖ ${title}`);
  }, [telegramConfig.botToken, telegramConfig.chatId, onSendTelegram, showToast]);

  // Automated Checker when values change (deferred to macro-task to prevent cascading synchronous renders)
  useEffect(() => {
    if (!autoEnabled) return;

    const timer = setTimeout(() => {
      const curAcleda = currentAcledaRate;
      const curGold = gold.spotOzUsd;
      const curFuelReg = fuel.cambodiaRetail.gasolineRegularKhr;
      const curFuelDiesel = fuel.cambodiaRetail.dieselKhr;

      const deltaAcleda = curAcleda - lastAcledaRef.current;
      const deltaGold = curGold - lastGoldRef.current;
      const deltaReg = curFuelReg - lastFuelRegularRef.current;
      const deltaDiesel = curFuelDiesel - lastFuelDieselRef.current;

      // Rule 1: ACLEDA Bank USD/KHR rate changes by >= 3 KHR
      if (Math.abs(deltaAcleda) >= 3) {
        const deltaSign = deltaAcleda > 0 ? `+${deltaAcleda}` : `${deltaAcleda}`;
        const prevBase = lastAcledaRef.current;
        lastAcledaRef.current = curAcleda;
        setLastAlertedAcleda(curAcleda);

        const msg = `🚨 <b>ជូនដំណឹងស្វ័យប្រវត្តិ៖ អត្រាធនាគារអេស៊ីលីដាប្រែប្រួល ≥ 3៛!</b>
⏰ ម៉ោង: ${new Date().toLocaleTimeString()}

🏦 <b>ធនាគារ អេស៊ីលីដា (ACLEDA Bank Plc.):</b>
• អត្រាលក់ចេញបច្ចុប្បន្ន: <b>${curAcleda.toLocaleString()} ៛</b> (${deltaSign} ៛)
• អត្រាទិញចូល: <b>${(currencies.acleda?.buyCash || 4064).toLocaleString()} ៛</b>
• អត្រាគោលមុននេះ: ${prevBase.toLocaleString()} ៛
• គម្លាតប្រែប្រួល: <b>${Math.abs(deltaAcleda)} ៛</b> (គ្រប់លក្ខខណ្ឌ ≥ 3៛)`;

        dispatchAlert('acleda', `អត្រាអេស៊ីលីដាប្រែប្រួល ${deltaSign}៛`, `${deltaSign} ៛`, msg);
      }

      // Rule 2: Gold Spot price changes by >= $50 USD
      if (Math.abs(deltaGold) >= 50) {
        const deltaSign = deltaGold > 0 ? `+$${deltaGold.toFixed(2)}` : `-$${Math.abs(deltaGold).toFixed(2)}`;
        const prevBase = lastGoldRef.current;
        lastGoldRef.current = curGold;
        setLastAlertedGold(curGold);

        const msg = `🚨 <b>ជូនដំណឹងស្វ័យប្រវត្តិ៖ តម្លៃមាសអន្តរជាតិប្រែប្រួល ≥ 50$!</b>
⏰ ម៉ោង: ${new Date().toLocaleTimeString()}

🟡 <b>Spot Gold XAU/USD:</b>
• តម្លៃបច្ចុប្បន្ន: <b>$${curGold.toFixed(2)}/oz</b> (${deltaSign})
• តម្លៃគោលមុននេះ: $${prevBase.toFixed(2)}/oz
• គម្លាតប្រែប្រួល: <b>$${Math.abs(deltaGold).toFixed(2)}</b> (គ្រប់លក្ខខណ្ឌ ≥ 50$)
• សមមូល ១ តម្លឹងកម្ពុជា: <b>${gold.damlungKhr.toLocaleString()} ៛</b> (~$${gold.damlungUsd.toFixed(2)})`;

        dispatchAlert('gold', `តម្លៃមាសប្រែប្រួល ${deltaSign}`, deltaSign, msg);
      }

      // Rule 3: Fuel price changes by ANY amount (ប្រែប្រួលទាំងអស់)
      if (deltaReg !== 0 || deltaDiesel !== 0) {
        lastFuelRegularRef.current = curFuelReg;
        lastFuelDieselRef.current = curFuelDiesel;
        setLastAlertedFuelRegular(curFuelReg);
        setLastAlertedFuelDiesel(curFuelDiesel);

        const msg = `🚨 <b>ជូនដំណឹងស្វ័យប្រវត្តិ៖ តម្លៃប្រេងឥន្ធនៈកម្ពុជាមានការប្រែប្រួល!</b>
📅 សេចក្តីប្រកាសក្រសួងពាណិជ្ជកម្ម (MOC)

⛽ <b>តម្លៃលក់រាយបច្ចុប្បន្ន:</b>
• សាំងធម្មតា EA92: <b>${curFuelReg.toLocaleString()} ៛/L</b> (${deltaReg >= 0 ? '+' : ''}${deltaReg} ៛)
• ម៉ាស៊ូត 50ppm: <b>${curFuelDiesel.toLocaleString()} ៛/L</b> (${deltaDiesel >= 0 ? '+' : ''}${deltaDiesel} ៛)
• សាំងស៊ុបពែរ EA95: ${fuel.cambodiaRetail.gasolineSuperKhr.toLocaleString()} ៛/L
• Brent Crude: $${fuel.brentCrudeUsd.toFixed(2)}/bbl`;

        dispatchAlert(
          'fuel',
          `តម្លៃប្រេងកម្ពុជាប្រែប្រួល (${deltaReg >= 0 ? '+' : ''}${deltaReg}៛ / ${deltaDiesel >= 0 ? '+' : ''}${deltaDiesel}៛)`,
          `${deltaReg}៛ / ${deltaDiesel}៛`,
          msg
        );
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [
    gold.spotOzUsd,
    gold.damlungKhr,
    gold.damlungUsd,
    currentAcledaRate,
    currencies.acleda?.buyCash,
    fuel.cambodiaRetail.gasolineRegularKhr,
    fuel.cambodiaRetail.dieselKhr,
    fuel.cambodiaRetail.gasolineSuperKhr,
    fuel.brentCrudeUsd,
    autoEnabled,
    dispatchAlert,
  ]);

  // Test Simulation Triggers
  const testTriggerAcleda = () => {
    const shift = 4; // >= 3 KHR
    const newRate = currentAcledaRate + shift;
    onUpdateCurrencies({
      ...currencies,
      acleda: {
        ...currencies.acleda,
        sellCash: newRate,
        buyCash: newRate - 13,
        change24h: shift,
      },
      usdKhrMarket: {
        ...currencies.usdKhrMarket,
        sell: newRate,
        buy: newRate - 13,
      },
    });
  };

  const testTriggerGold = () => {
    const shift = 52.50; // >= $50 USD
    const newSpot = Math.round((gold.spotOzUsd + shift) * 100) / 100;
    const damlungToTroyOz = 37.5 / 31.1034768;
    const newDamlungUsd = Math.round(newSpot * damlungToTroyOz * 100) / 100;
    const usdRate = currencies.acleda?.sellCash || 4077;

    onUpdateGold({
      ...gold,
      spotOzUsd: newSpot,
      spotOzKhr: Math.round(newSpot * usdRate),
      damlungUsd: newDamlungUsd,
      damlungKhr: Math.round(newDamlungUsd * usdRate),
      chiKhr: Math.round((newDamlungUsd * usdRate) / 10),
      hunKhr: Math.round((newDamlungUsd * usdRate) / 100),
      change24hUsd: Math.round((gold.change24hUsd + shift) * 100) / 100,
    });
  };

  const testTriggerFuel = () => {
    const shift = -50;
    onUpdateFuel({
      ...fuel,
      cambodiaRetail: {
        ...fuel.cambodiaRetail,
        gasolineRegularKhr: fuel.cambodiaRetail.gasolineRegularKhr + shift,
        dieselKhr: fuel.cambodiaRetail.dieselKhr + shift,
        changeRegularKhr: shift,
        changeDieselKhr: shift,
      },
    });
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-5 space-y-6">
      {/* Toast */}
      {toastText && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl border border-amber-500/40 bg-slate-900/95 shadow-2xl text-amber-300 text-xs sm:text-sm font-medium flex items-center gap-2">
          <BellRing className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <span>{toastText}</span>
        </div>
      )}

      {/* Header with Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              ប្រព័ន្ធផ្ញើសារជូនដំណឹងស្វ័យប្រវត្តិតាមលក្ខខណ្ឌ (Auto-Alert Rules)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ប្រព័ន្ធត្រួតពិនិត្យ និងផ្ញើសារទៅកាន់ Telegram ភ្លាមៗនៅពេលទីផ្សារប្រែប្រួលដល់កម្រិតកំណត់របស់អ្នក
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-medium">
            {autoEnabled ? 'ដំណើរការ (Active)' : 'ផ្អាក (Paused)'}
          </span>
          <button
            onClick={() => setAutoEnabled(!autoEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              autoEnabled ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                autoEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3 Explicit Rules Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rule 1: ACLEDA >= 3 KHR */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              អត្រាអេស៊ីលីដា (ACLEDA)
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
              ≥ 3 ៛
            </span>
          </div>

          <div className="text-sm font-bold text-white font-mono tabular-nums">
            បច្ចុប្បន្ន: {currentAcledaRate.toLocaleString()} ៛
          </div>
          <div className="text-xs font-mono text-slate-400">
            គោលមុន: {lastAlertedAcleda.toLocaleString()} ៛ · គម្លាត: {acledaDelta >= 0 ? '+' : ''}{acledaDelta} ៛
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              ខ្វះ {Math.max(0, 3 - Math.abs(acledaDelta))} ៛ ទៀតដើម្បី Alert
            </span>
            <button
              onClick={testTriggerAcleda}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
            >
              តេស្ត Trigger (+4៛)
            </button>
          </div>
        </div>

        {/* Rule 2: Gold >= $50 */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              តម្លៃមាសអន្តរជាតិ (Gold)
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
              ≥ $50
            </span>
          </div>

          <div className="text-sm font-bold text-white font-mono tabular-nums">
            បច្ចុប្បន្ន: ${gold.spotOzUsd.toFixed(2)}/oz
          </div>
          <div className="text-xs font-mono text-slate-400">
            គោលមុន: ${lastAlertedGold.toFixed(2)} · គម្លាត: {goldDelta >= 0 ? '+' : ''}${goldDelta.toFixed(2)}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              ខ្វះ ${(Math.max(0, 50 - Math.abs(goldDelta))).toFixed(2)} ទៀតដើម្បី Alert
            </span>
            <button
              onClick={testTriggerGold}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
            >
              តេស្ត Trigger (+$52.5)
            </button>
          </div>
        </div>

        {/* Rule 3: Fuel Any Change */}
        <div className="p-4 rounded-xl border border-sky-500/30 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5" />
              តម្លៃប្រេងឥន្ធនៈ (Fuel)
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
              ប្រែប្រួលទាំងអស់
            </span>
          </div>

          <div className="text-sm font-bold text-white font-mono tabular-nums">
            សាំង: {fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛ · ម៉ាស៊ូត: {fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛
          </div>
          <div className="text-xs font-mono text-slate-400">
            សេចក្តីប្រកាសក្រសួងពាណិជ្ជកម្ម (MOC) រៀងរាល់ ១០ ថ្ងៃ
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">ជូនដំណឹងគ្រប់ការប្រែប្រួល</span>
            <button
              onClick={testTriggerFuel}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
            >
              តេស្ត Trigger (-50៛)
            </button>
          </div>
        </div>
      </div>

      {/* Telegram Connection Indicator */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            ស្ថានភាពតភ្ជាប់ Telegram:{' '}
            {telegramConfig.botToken && telegramConfig.chatId ? (
              <span className="text-emerald-400 font-semibold font-mono">
                ភ្ជាប់រួចរាល់ (Chat ID: {telegramConfig.chatId})
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                មិនទាន់កំណត់ Bot Token & Chat ID នៅឡើយ (សារនឹងបង្ហាញលើអេក្រង់)
              </span>
            )}
          </span>
        </div>
        <span className="text-slate-500 font-mono hidden sm:inline">Auto-Check Interval: Live Event</span>
      </div>

      {/* Triggered Alert History Log */}
      {alertLogs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>ប្រវត្តិនៃការផ្ញើសារជូនដំណឹងស្វ័យប្រវត្តិ ({alertLogs.length} លើកចុងក្រោយ)</span>
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/80 rounded-lg bg-slate-950 border border-slate-800">
            {alertLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.type === 'acleda'
                          ? 'bg-emerald-400'
                          : log.type === 'gold'
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                    />
                    <span className="text-white font-bold font-sans">{log.title}</span>
                    <span className="text-slate-500 text-[11px] font-mono">({log.timeFormatted})</span>
                  </div>
                  <div className="text-slate-400 font-sans text-[11px] pl-4">{log.delta}</div>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  {log.sentToTelegram ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3 h-3" /> បានផ្ញើទៅ Telegram
                    </span>
                  ) : (
                    <span className="text-amber-400/90 font-sans">កត់ត្រាក្នុងប្រព័ន្ធ</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

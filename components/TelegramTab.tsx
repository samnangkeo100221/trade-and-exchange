'use client';

import React, { useState } from 'react';
import { TelegramConfig, GoldPrice, CurrencyRates, FuelRates, ICTAnalysis } from '@/lib/types';
import { saveTelegramConfig } from '@/lib/storage';
import {
  Send,
  Settings,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  HelpCircle,
  FileText,
  Zap,
  Coins,
  DollarSign,
  Fuel,
  Activity,
} from 'lucide-react';

import AutoAlertMonitor from './AutoAlertMonitor';

interface TelegramTabProps {
  config: TelegramConfig;
  onConfigUpdate: (newConfig: TelegramConfig) => void;
  gold: GoldPrice;
  currencies: CurrencyRates;
  fuel: FuelRates;
  ict: ICTAnalysis;
  onSendTelegram: (customMessage: string) => Promise<boolean>;
  onUpdateGold: (gold: GoldPrice) => void;
  onUpdateCurrencies: (currencies: CurrencyRates) => void;
  onUpdateFuel: (fuel: FuelRates) => void;
}

export default function TelegramTab({
  config,
  onConfigUpdate,
  gold,
  currencies,
  fuel,
  ict,
  onSendTelegram,
  onUpdateGold,
  onUpdateCurrencies,
  onUpdateFuel,
}: TelegramTabProps) {
  const [botToken, setBotToken] = useState<string>(config.botToken || '');
  const [chatId, setChatId] = useState<string>(config.chatId || '');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [customMsg, setCustomMsg] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveConfig = () => {
    const updated: TelegramConfig = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      autoAlertEnabled: config.autoAlertEnabled,
    };
    saveTelegramConfig(updated);
    onConfigUpdate(updated);
    setStatusMessage({
      type: 'success',
      text: 'បានរក្សាទុកការកំណត់ Telegram Bot ជោគជ័យ!',
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleTestConnection = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'សូមបញ្ចូល Bot Token និង Chat ID ជាមុនសិន!',
      });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
    try {
      const testText = `🤖 <b>សាកល្បងការតភ្ជាប់ជោគជ័យ!</b>\n\nCambodia Market & Gold Pulse បានតភ្ជាប់ជាមួយ Telegram Bot របស់អ្នករួចរាល់ហើយ។\n⏰ ម៉ោង: ${new Date().toLocaleTimeString()}`;

      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chatId: chatId.trim(),
          message: testText,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'បរាជ័យក្នុងការតភ្ជាប់');
      }

      setStatusMessage({
        type: 'success',
        text: `បានផ្ញើសារសាកល្បងជោគជ័យទៅកាន់ ${data.chat || chatId}!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'កំហុសក្នុងការតភ្ជាប់ Telegram Bot',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Preset Template Dispatchers
  const sendFullSummary = async () => {
    const text = `📊 <b>របាយការណ៍សង្ខេបទីផ្សារ (Cambodia Market Pulse)</b>
📅 ${gold.lastUpdated}

🟡 <b>១. តម្លៃមាស (Gold Prices):</b>
• ១ តម្លឹង (Damlung): <b>${gold.damlungKhr.toLocaleString()} ៛</b> (~$${gold.damlungUsd.toFixed(2)})
• ១ ជី (Chi): <b>${gold.chiKhr.toLocaleString()} ៛</b> (~$${gold.chiUsd.toFixed(2)})
• មាសអន្តរជាតិ (Spot Gold): <b>$${gold.spotOzUsd.toFixed(2)}/oz</b> (${gold.change24hUsd >= 0 ? '+' : ''}${gold.change24hPercent}%)
• មាសគីឡូ 99.99%: $${gold.gold24kBuyDamlung.toLocaleString()} / $${gold.gold24kSellDamlung.toLocaleString()}

💵 <b>២. អត្រាប្ដូរប្រាក់ (Exchange Rates):</b>
• USD / KHR: ទិញ ${currencies.usdKhrMarket.buy.toLocaleString()}៛ · លក់ <b>${currencies.usdKhrMarket.sell.toLocaleString()} ៛</b>
• CNY / KHR: <b>${currencies.cnyKhr.rate.toFixed(2)} ៛ / ¥</b> (1$ ≈ ${currencies.cnyUsd.rate}¥)
• THB / KHR: <b>${currencies.thbKhr.rate.toFixed(2)} ៛ / ฿</b>

⛽ <b>៣. តម្លៃប្រេងឥន្ធនៈ (Fuel Prices):</b>
• សាំងធម្មតា EA92: <b>${fuel.cambodiaRetail.gasolineRegularKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.gasolineRegularUsd})
• ម៉ាស៊ូត 50ppm: <b>${fuel.cambodiaRetail.dieselKhr.toLocaleString()} ៛/L</b> ($${fuel.cambodiaRetail.dieselUsd})
• Brent Crude: <b>$${fuel.brentCrudeUsd.toFixed(2)}/bbl</b>

🎯 <b>៤. យុទ្ធសាស្ត្រ ICT:</b>
• និន្នាការមាស: <b>${ict.biasKhmer}</b>
• សញ្ញា: ${ict.tradeSignal.actionKhmer} (Entry: ${ict.tradeSignal.entryZone})`;

    await executeSend(text);
  };

  const sendIctSignal = async () => {
    const text = `🎯 <b>សញ្ញាវិភាគ ICT Alert (XAU/USD)</b>
⏰ ${new Date().toLocaleTimeString()}

🧭 <b>Market Bias:</b> ${ict.biasKhmer}
⚡ <b>Signal:</b> <b>${ict.tradeSignal.actionKhmer}</b>
📍 <b>Entry Zone:</b> <code>${ict.tradeSignal.entryZone}</code>
🛡️ <b>Stop Loss:</b> <code>$${ict.tradeSignal.stopLoss}</code>
🎯 <b>Take Profit:</b> <code>$${ict.tradeSignal.takeProfit1}</code> (TP2: <code>$${ict.tradeSignal.takeProfit2}</code>)
⚖️ <b>Risk / Reward:</b> ${ict.tradeSignal.riskReward}

💡 <b>ICT Order Flow:</b>
${ict.summaryKhmer}`;

    await executeSend(text);
  };

  const handleSendCustom = async () => {
    if (!customMsg.trim()) return;
    await executeSend(customMsg);
    setCustomMsg('');
  };

  const executeSend = async (message: string) => {
    setIsSending(true);
    setStatusMessage(null);
    try {
      const ok = await onSendTelegram(message);
      if (ok) {
        setStatusMessage({
          type: 'success',
          text: 'បានផ្ញើសារទៅកាន់ Telegram ដោយជោគជ័យ!',
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950/20 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              ការកំណត់ និង ការផ្ញើសារជូនដំណឹងទៅ Telegram
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ភ្ជាប់ Bot Token និង Chat ID ដើម្បីផ្ញើតម្លៃមាស អត្រាប្ដូរប្រាក់ តម្លៃប្រេង និងសញ្ញា ICT ទៅកាន់ Channel ឬ Group ផ្ទាល់ខ្លួន
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={isSending || !botToken}
          className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shrink-0 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{isSending ? 'កំពុងផ្ញើ...' : 'សាកល្បងតភ្ជាប់ (Test)'}</span>
        </button>
      </div>

      {/* Status feedback */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs sm:text-sm flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Automated Threshold Alert Engine */}
      <AutoAlertMonitor
        gold={gold}
        currencies={currencies}
        fuel={fuel}
        telegramConfig={config}
        onSendTelegram={onSendTelegram}
        onUpdateGold={onUpdateGold}
        onUpdateCurrencies={onUpdateCurrencies}
        onUpdateFuel={onUpdateFuel}
      />

      {/* Bot Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Inputs */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <Settings className="w-4 h-4 text-sky-400" />
            <h3>ការកំណត់ Bot Token & Chat ID</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Telegram Bot Token (ពី @BotFather):
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="ឧទាហរណ៍: 7123456789:AAFxz_..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Chat ID ឬ Channel Username (ឧទាហរណ៍: 123456789 ឬ @MyChannel):
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="ឧទាហរណ៍: 987654321 ឬ @cambodia_market_alerts"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              រក្សាទុកការកំណត់
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isSending || !botToken}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors disabled:opacity-50"
            >
              {isSending ? 'កំពុងសាកល្បង...' : 'សាកល្បងផ្ញើសារ'}
            </button>
          </div>
        </div>

        {/* Right: Quick Action Templates */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3>ផ្ញើសារគំរូរហ័ស (Quick Templates)</h3>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={sendFullSummary}
              disabled={isSending}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                    ផ្ញើសេចក្តីសង្ខេបទីផ្សារពេញលេញ
                  </div>
                  <div className="text-[11px] text-slate-400">មាស + រូបិយប័ណ្ណ + ប្រេង + ICT ក្នុងសារតែមួយ</div>
                </div>
              </div>
              <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </button>

            <button
              onClick={sendIctSignal}
              disabled={isSending}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-rose-400 transition-colors">
                    ផ្ញើសញ្ញាវិភាគ ICT (Trade Signal)
                  </div>
                  <div className="text-[11px] text-slate-400">ទិញ/លក់ Entry, Stop Loss, Take Profit និង Order Block</div>
                </div>
              </div>
              <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
            </button>
          </div>

          {/* Custom Message Sender */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              សរសេរសារផ្ញើដោយផ្ទាល់ (Custom Message):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="សរសេរអត្ថបទសារ..."
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={handleSendCustom}
                disabled={isSending || !customMsg.trim()}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors disabled:opacity-50"
              >
                ផ្ញើ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide: How to create Telegram Bot */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          របៀបបង្កើត Telegram Bot និង យក Chat ID ក្នុងរយៈពេល ២ នាទី
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold">ជំហានទី ១: បង្កើត Bot</div>
            <p className="text-slate-400 leading-relaxed">
              បើក Telegram ស្វែងរក <b>@BotFather</b> រួចផ្ញើ <code>/newbot</code>។ ដាក់ឈ្មោះ Bot និង Username រួចអ្នកនឹងទទួលបាន <b>HTTP API Token</b>។
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-sky-400 font-bold">ជំហានទី ២: យក Chat ID</div>
            <p className="text-slate-400 leading-relaxed">
              ស្វែងរក <b>@userinfobot</b> ក្នុង Telegram ហើយចុច Start អ្នកនឹងឃើញលេខ <b>Id</b> របស់អ្នក (ឧ. 123456789)។
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold">ជំហានទី ៣: ចាប់ផ្តើម Bot</div>
            <p className="text-slate-400 leading-relaxed">
              បើក Bot របស់អ្នករួចចុច <b>Start</b>។ ប្រសិនបើចង់ផ្ញើចូល Channel សូម Add Bot ជា Admin ក្នុង Channel នោះជាការស្រេច!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

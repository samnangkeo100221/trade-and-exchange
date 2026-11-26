'use client';

import React, { useState } from 'react';
import { TelegramConfig, ActiveTab } from '@/lib/types';
import { saveTelegramConfig } from '@/lib/storage';
import { X, Send, CheckCircle2, AlertCircle, Settings } from 'lucide-react';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onConfigUpdate: (c: TelegramConfig) => void;
  defaultMessage: string;
  onSend: (message: string) => Promise<boolean>;
  onNavigateTab: (tab: ActiveTab) => void;
}

export default function TelegramModal({
  isOpen,
  onClose,
  config,
  onConfigUpdate,
  defaultMessage,
  onSend,
  onNavigateTab,
}: TelegramModalProps) {
  const [message, setMessage] = useState<string>(defaultMessage);
  const [botToken, setBotToken] = useState<string>(config.botToken);
  const [chatId, setChatId] = useState<string>(config.chatId);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!config.botToken && (!botToken.trim() || !chatId.trim())) {
      setFeedback({ success: false, text: 'សូមបញ្ចូល Bot Token និង Chat ID ជាមុនសិន' });
      return;
    }

    if (botToken !== config.botToken || chatId !== config.chatId) {
      const updated = { ...config, botToken: botToken.trim(), chatId: chatId.trim() };
      saveTelegramConfig(updated);
      onConfigUpdate(updated);
    }

    setIsSending(true);
    setFeedback(null);
    try {
      const ok = await onSend(message || defaultMessage);
      if (ok) {
        setFeedback({ success: true, text: 'បានផ្ញើសារទៅកាន់ Telegram ដោយជោគជ័យ!' });
        setTimeout(() => {
          onClose();
          setFeedback(null);
        }, 1800);
      } else {
        setFeedback({ success: false, text: 'បរាជ័យក្នុងការផ្ញើសារ សូមពិនិត្យមើល Bot Token & Chat ID' });
      }
    } catch (err: any) {
      setFeedback({ success: false, text: err.message || 'កំហុសបច្ចេកទេស' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">ផ្ញើសារទៅកាន់ Telegram</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Missing config alert */}
          {(!config.botToken || !config.chatId) && (
            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>អ្នកមិនទាន់បានកំណត់ Bot Token & Chat ID នៅឡើយទេ</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Bot Token (ឧ. 123456:ABC...)"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Chat ID (ឧ. 987654321)"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Message Preview / Editor */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              ខ្លឹមសារសារ (HTML/Markdown Supported):
            </label>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                feedback.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={() => {
              onClose();
              onNavigateTab('telegram');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ការកំណត់ពេញលេញ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              បោះបង់
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'កំពុងផ្ញើ...' : 'ផ្ញើឥឡូវនេះ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

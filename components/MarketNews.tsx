'use client';

import React, { useState } from 'react';
import { MarketNewsItem } from '@/lib/types';
import { INITIAL_NEWS_ITEMS, SIMULATED_WIRE_UPDATES } from '@/lib/news-data';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Compass,
  Search,
  RefreshCw,
  Send,
  ExternalLink,
  Clock,
  Sparkles,
  BookOpen,
  X,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface MarketNewsProps {
  onSendTelegram: (text: string) => void;
  isWidgetMode?: boolean; // When embedded in Overview tab
  onViewAll?: () => void;
}

export default function MarketNews({
  onSendTelegram,
  isWidgetMode = false,
  onViewAll,
}: MarketNewsProps) {
  const [newsList, setNewsList] = useState<MarketNewsItem[]>(INITIAL_NEWS_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'gold' | 'currency' | 'fuel' | 'cambodia' | 'macro'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [impactFilter, setImpactFilter] = useState<'all' | 'BULLISH' | 'BEARISH' | 'NEUTRAL'>('all');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<MarketNewsItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Simulate fetching new breaking headlines
  const handleFetchBreakingNews = () => {
    setIsFetching(true);
    setTimeout(() => {
      // Pick a wire update not yet in the list or create one with fresh timestamp
      const pool = SIMULATED_WIRE_UPDATES;
      const randomWire = pool[Math.floor(Math.random() * pool.length)];
      const newHeadline: MarketNewsItem = {
        ...randomWire,
        id: `news-${Date.now()}`,
        timestamp: Date.now(),
        timeAgo: 'ទើបតែទទួលបាន (Just Now)',
      };

      setNewsList((prev) => [newHeadline, ...prev.filter((p) => p.title !== newHeadline.title)]);
      setIsFetching(false);
      showToast('ទទួលបានព័ត៌មានហិរញ្ញវត្ថុថ្មីៗជោគជ័យ!');
    }, 600);
  };

  // Filter news
  const filteredNews = newsList.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesImpact = impactFilter === 'all' || item.impact === impactFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.titleEnglish && item.titleEnglish.toLowerCase().includes(q)) ||
      item.summary.toLowerCase().includes(q) ||
      item.relatedAsset.toLowerCase().includes(q);

    return matchesCategory && matchesImpact && matchesSearch;
  });

  const displayList = isWidgetMode ? filteredNews.slice(0, 3) : filteredNews;

  // Telegram forwarder for a specific headline
  const handleShareHeadlineTelegram = (item: MarketNewsItem) => {
    const impactEmoji = item.impact === 'BULLISH' ? '🐂 ឡើង (Bullish)' : item.impact === 'BEARISH' ? '🐻 ចុះ (Bearish)' : '⚖️ អព្យាក្រឹត (Neutral)';
    const text = `📰 <b>ព័ត៌មានទីផ្សារហិរញ្ញវត្ថុ (Market News Wire)</b>
📅 ${item.timeAgo} · ប្រភព: ${item.source}

📢 <b>${item.title}</b>

💡 <b>សេចក្តីសង្ខេប:</b>
${item.summary}

📊 <b>ផលប៉ះពាល់ទីផ្សារ:</b> ${impactEmoji}
🔗 <b>ទ្រព្យសកម្មពាក់ព័ន្ធ:</b> ${item.relatedAsset}

📌 <b>ចំណុចគន្លឹះសំខាន់ៗ:</b>
${item.keyTakeaways.map((t) => `• ${t}`).join('\n')}`;

    onSendTelegram(text);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-3 rounded-xl border border-emerald-500/40 bg-slate-900/95 shadow-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner - Only in Full View */}
      {!isWidgetMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                ព័ត៌មានទីផ្សារហិរញ្ញវត្ថុ (Market News & Headlines)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              ព្រឹត្តិការណ៍សេដ្ឋកិច្ច តម្លៃមាស អត្រាប្ដូរប្រាក់ ដុល្លារ-រៀល-យាន់ តម្លៃប្រេង និងគោលនយោបាយរូបិយវត្ថុ NBC
            </p>
          </div>

          <button
            onClick={handleFetchBreakingNews}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 shadow-sm shadow-amber-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'កំពុងទាញយក...' : 'ទាញយកព័ត៌មានថ្មី (Fetch Breaking)'}</span>
          </button>
        </div>
      )}

      {/* Widget Header if embedded in Overview */}
      {isWidgetMode && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">
              ព័ត៌មានទីផ្សារហិរញ្ញវត្ថុចុងក្រោយ (Market Headlines)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFetchBreakingNews}
              disabled={isFetching}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title="ទាញយកព័ត៌មានថ្មី"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                មើលព័ត៌មានទាំងអស់ →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar (Full view only) */}
      {!isWidgetMode && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'all', label: 'ទាំងអស់' },
              { id: 'gold', label: 'មាស (Gold)' },
              { id: 'currency', label: 'រូបិយប័ណ្ណ (FX)' },
              { id: 'cambodia', label: 'កម្ពុជា (NBC)' },
              { id: 'fuel', label: 'ប្រេងឥន្ធនៈ (Fuel)' },
              { id: 'macro', label: 'ម៉ាក្រូ/ICT' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + Impact Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Impact Filter */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setImpactFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  impactFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setImpactFilter('BULLISH')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  impactFilter === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
                }`}
                title="ឡើង Bullish"
              >
                Bullish 🐂
              </button>
              <button
                onClick={() => setImpactFilter('BEARISH')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  impactFilter === 'BEARISH' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400'
                }`}
                title="ចុះ Bearish"
              >
                Bearish 🐻
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកព័ត៌មាន..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Headlines List */}
      <div className="space-y-3.5">
        {displayList.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
            មិនមានព័ត៌មានដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ។ សូមចុច &quot;ទាញយកព័ត៌មានថ្មី&quot; ដើម្បីផ្ទុកសារជាថ្មី។
          </div>
        ) : (
          displayList.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 p-4 sm:p-5 transition-all hover:bg-slate-900 flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Unboxed Metadata with Typographic Separators */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-amber-400/90">{item.source}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    {item.timeAgo}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-300">{item.relatedAsset}</span>
                  <span aria-hidden="true">·</span>
                  {/* Sentiment text (No pill enclosure, unboxed) */}
                  <span
                    className={`font-mono font-semibold ${
                      item.impact === 'BULLISH'
                        ? 'text-emerald-400'
                        : item.impact === 'BEARISH'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.impact === 'BULLISH' ? 'Bullish ឡើង' : item.impact === 'BEARISH' ? 'Bearish ចុះ' : 'Neutral ស្ថិរ'}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedArticle(item)}
                  className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                >
                  {item.title}
                </h3>

                {/* Subtitle / English translation if present */}
                {item.titleEnglish && (
                  <p className="text-xs text-slate-400 font-sans mt-0.5 italic">
                    {item.titleEnglish}
                  </p>
                )}

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedArticle(item)}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>អានលម្អិត</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShareHeadlineTelegram(item)}
                    className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
                    title="ចែករំលែកទៅ Telegram"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <Newspaper className="w-4 h-4" />
                <span>{selectedArticle.source}</span>
                <span>·</span>
                <span className="text-slate-400">{selectedArticle.timeAgo}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white leading-snug">
                  {selectedArticle.title}
                </h2>
                {selectedArticle.titleEnglish && (
                  <p className="text-xs text-slate-400 italic mt-1">
                    {selectedArticle.titleEnglish}
                  </p>
                )}
              </div>

              {/* Impact Strip */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 font-sans">ទ្រព្យសកម្មពាក់ព័ន្ធ:</span>
                <span className="text-amber-400 font-semibold">{selectedArticle.relatedAsset}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 font-sans">ផលប៉ះពាល់:</span>
                <span
                  className={`font-semibold ${
                    selectedArticle.impact === 'BULLISH'
                      ? 'text-emerald-400'
                      : selectedArticle.impact === 'BEARISH'
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {selectedArticle.impact}
                </span>
              </div>

              {/* Full Content */}
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-3">
                {selectedArticle.content}
              </div>

              {/* Key Takeaways */}
              {selectedArticle.keyTakeaways && selectedArticle.keyTakeaways.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 mt-4">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    ចំណុចគន្លឹះសំខាន់ៗ (Key Takeaways):
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedArticle.keyTakeaways.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/40">
              <span className="text-xs text-slate-500">
                ព័ត៌មានផ្អែកលើការត្រួតពិនិត្យទីផ្សារផ្ទាល់
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  បិទ
                </button>
                <button
                  onClick={() => {
                    handleShareHeadlineTelegram(selectedArticle);
                    setSelectedArticle(null);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ផ្ញើទៅ Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

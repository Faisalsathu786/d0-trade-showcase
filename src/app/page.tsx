'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TradeEntry, LeaderboardEntry, WeeklyResult } from '@/types';
import { TrendingUp, TrendingDown, Trophy, Medal, ExternalLink, Copy, Check, Share2, Search, Loader2, Zap, Sparkles, Clock, Users, BarChart3, ArrowUpRight } from 'lucide-react';

// ── Format helpers ──
const fmt = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` :
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` :
  n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const fmtUsd = (n: number) =>
  n >= 0 ? `+$${fmt(n)}` : `-$${fmt(Math.abs(n))}`;

const fmtPct = (n: number) =>
  n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const shorten = (addr: string) =>
  addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

// ── Main Page ──
export default function HomePage() {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weekly, setWeekly] = useState<WeeklyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletQuery, setWalletQuery] = useState('');
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<TradeEntry | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, lRes] = await Promise.all([
        fetch('/api/trades?limit=50'),
        fetch('/api/leaderboard'),
      ]);
      const tData = await tRes.json();
      const lData = await lRes.json();
      setTrades(tData.trades ?? []);
      setLeaderboard(lData.topTraders ?? []);
      setWeekly(lData.weekly ?? null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Share card text generator ──
  const shareText = (t: TradeEntry) => {
    const emoji = t.pnlUsd >= 0 ? '🚀' : '💀';
    const dir = t.side === 'long' ? '🟢 Long' : '🔴 Short';
    const venue = t.venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid';
    return `${emoji} ${t.username || shorten(t.walletAddress)} just ${dir}ed ${t.asset} on ${venue}!

💵 PnL: ${fmtUsd(t.pnlUsd)} (${fmtPct(t.pnlPercent)})
⚡ Leverage: ${t.leverage}x
📊 ROI: ${fmtPct(t.roi || t.pnlPercent * t.leverage)}

🔗 d0.showcase/trade/${t.id}
Powered by @DonutAI 🍩`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCard(id);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const shareToX = (t: TradeEntry) => {
    const text = encodeURIComponent(shareText(t));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=600,height=400');
  };

  // ── Wallet lookup ──
  const handleWalletSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (walletQuery.trim()) {
      window.open(`/wallet/${walletQuery.trim()}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text">d0 Trade Showcase</h1>
              <p className="text-[10px] text-text-muted">Powered by Donut AI</p>
            </div>
          </div>
          <form onSubmit={handleWalletSearch} className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={walletQuery}
                onChange={(e) => setWalletQuery(e.target.value)}
                placeholder="Search wallet..."
                className="w-48 rounded-lg border border-border bg-surface-light px-8 py-1.5 text-xs text-text placeholder:text-text-muted/50 outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-8">
        {/* ── WEEKLY PODIUM ── */}
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-gold" />
              <h2 className="text-lg font-bold text-text">
                {weekly?.weekLabel || 'This Week'} Leaderboard
              </h2>
            </div>
            <span className="text-[11px] text-text-muted">Updated just now</span>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 mb-4 items-end">
            {top3.length > 0 && (
              <>
                {/* #2 */}
                {top3[1] && (
                  <div className="rounded-xl border border-border bg-surface p-4 text-center order-1">
                    <Medal size={20} className="mx-auto mb-1 text-slate-300" />
                    <p className="text-[11px] font-mono text-text-muted">{shorten(top3[1].walletAddress)}</p>
                    <p className="text-lg font-bold text-text mt-1">{fmtUsd(top3[1].totalPnl)}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {top3[1].tradeCount} trades · {top3[1].winRate}% WR
                    </p>
                  </div>
                )}
                {/* #1 */}
                {top3[0] && (
                  <div className="rounded-xl border-2 border-primary/30 bg-surface p-5 text-center order-2 scale-105 relative card-glow">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Trophy size={22} className="text-gold" />
                    </div>
                    <p className="text-[12px] font-mono text-text-muted mt-1">{shorten(top3[0].walletAddress)}</p>
                    <p className="text-2xl font-bold text-primary mt-1">{fmtUsd(top3[0].totalPnl)}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {top3[0].tradeCount} trades · {top3[0].winRate}% WR · Best: {fmtUsd(top3[0].bestTrade)}
                    </p>
                    <span className="inline-block mt-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary font-medium">
                      🏆 #1 THIS WEEK
                    </span>
                  </div>
                )}
                {/* #3 */}
                {top3[2] && (
                  <div className="rounded-xl border border-border bg-surface p-4 text-center order-3">
                    <Medal size={20} className="mx-auto mb-1 text-amber-600" />
                    <p className="text-[11px] font-mono text-text-muted">{shorten(top3[2].walletAddress)}</p>
                    <p className="text-lg font-bold text-text mt-1">{fmtUsd(top3[2].totalPnl)}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {top3[2].tradeCount} trades · {top3[2].winRate}% WR
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Full leaderboard table */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted">
                    <th className="px-4 py-2.5 text-left w-12">#</th>
                    <th className="px-4 py-2.5 text-left">Trader</th>
                    <th className="px-4 py-2.5 text-right">PNL</th>
                    <th className="px-4 py-2.5 text-right hidden sm:table-cell">Win Rate</th>
                    <th className="px-4 py-2.5 text-right hidden md:table-cell">Trades</th>
                    <th className="px-4 py-2.5 text-right hidden md:table-cell">Best Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className="border-b border-border/50 hover:bg-surface-light/50 transition-colors cursor-pointer"
                      onClick={() => window.open(`/wallet/${entry.walletAddress}`, '_blank')}
                    >
                      <td className="px-4 py-2.5">
                        {entry.rank <= 3 ? (
                          <span className={
                            entry.rank === 1 ? 'text-gold' : entry.rank === 2 ? 'text-slate-300' : 'text-amber-600'
                          }>
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="text-text-muted">{entry.rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{shorten(entry.walletAddress)}</td>
                      <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${entry.totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        {fmtUsd(entry.totalPnl)}
                      </td>
                      <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium
                          ${entry.winRate >= 60 ? 'bg-success/10 text-success' : entry.winRate >= 40 ? 'bg-gold/10 text-gold' : 'bg-danger/10 text-danger'}`}>
                          {entry.winRate}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-text-muted hidden md:table-cell">{entry.tradeCount}</td>
                      <td className="px-4 py-2.5 text-right text-success hidden md:table-cell">{fmtUsd(entry.bestTrade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── LIVE TRADE FEED ── */}
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <h2 className="text-lg font-bold text-text">Live Trade Feed</h2>
            </div>
            <span className="text-[11px] text-text-muted">
              <Clock size={12} className="inline mr-1" />30s refresh
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" ref={feedRef}>
            {trades.slice(0, 30).map((trade) => (
              <TradeCardComponent
                key={trade.id}
                trade={trade}
                copiedCard={copiedCard}
                onCopy={copyToClipboard}
                onShare={shareToX}
                shareText={shareText}
              />
            ))}
          </div>
        </section>

        {/* ── SHARE MODAL ── */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowShareModal(null)}>
            <div className="rounded-2xl border border-border bg-surface p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold mb-4">Share Trade Proof</h3>
              <div className="rounded-xl bg-surface-light p-4 mb-4">
                <p className="text-xs text-text-muted whitespace-pre-wrap font-mono">
                  {shareText(showShareModal)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(shareText(showShareModal), `modal-${showShareModal.id}`)}
                  className="flex-1 rounded-lg border border-border bg-surface-light px-4 py-2 text-xs font-medium text-text hover:bg-surface transition-colors"
                >
                  {copiedCard === `modal-${showShareModal.id}` ? (
                    <><Check size={14} className="inline mr-1 text-success" /> Copied!</>
                  ) : (
                    <><Copy size={14} className="inline mr-1" /> Copy Text</>
                  )}
                </button>
                <button
                  onClick={() => shareToX(showShareModal)}
                  className="flex-1 rounded-lg bg-primary/20 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
                >
                  <Share2 size={14} className="inline mr-1" /> Share to X
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-3 text-center">
                Card will be auto-generated with OG image for rich X previews
              </p>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="border-t border-border pt-6 pb-8 text-center">
          <p className="text-xs text-text-muted mb-2">
            Powered by <span className="text-primary">Donut AI</span> 🍩
          </p>
          <p className="text-[10px] text-text-muted/50">
            d0 Trade Showcase — Real on-chain verified trades from the Donut ecosystem
          </p>
        </footer>
      </main>
    </div>
  );
}

// ── Trade Card Component ──
function TradeCardComponent({
  trade,
  copiedCard,
  onCopy,
  onShare,
  shareText,
}: {
  trade: TradeEntry;
  copiedCard: string | null;
  onCopy: (text: string, id: string) => void;
  onShare: (trade: TradeEntry) => void;
  shareText: (trade: TradeEntry) => string;
}) {
  const isProfitable = trade.pnlUsd >= 0;
  const roi = trade.roi || trade.pnlPercent * trade.leverage;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold
            ${isProfitable ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
            {trade.side === 'long' ? '↑' : '↓'}
          </div>
          <div>
            <p className="text-xs font-bold">{trade.asset}</p>
            <p className="text-[10px] text-text-muted">
              {trade.username || shorten(trade.walletAddress)}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-text-muted">{fmtTime(trade.timestamp)}</span>
      </div>

      {/* PnL */}
      <div className="mb-3">
        <p className={`text-lg font-bold tabular-nums ${isProfitable ? 'text-success' : 'text-danger'}`}>
          {fmtUsd(trade.pnlUsd)}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className={isProfitable ? 'text-success' : 'text-danger'}>
            {fmtPct(roi)} ROI
          </span>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted">{trade.leverage}x</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted">{trade.venue === 'donut-perps' ? 'Donut' : 'HL'}</span>
        </div>
      </div>

      {/* Entry/Exit */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-surface-light/50 px-2.5 py-1.5">
          <p className="text-[10px] text-text-muted">Entry</p>
          <p className="text-xs font-mono font-bold">${trade.entryPrice.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-surface-light/50 px-2.5 py-1.5">
          <p className="text-[10px] text-text-muted">Exit</p>
          <p className="text-xs font-mono font-bold">${trade.exitPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onCopy(shareText(trade), trade.id)}
          className="flex-1 rounded-lg bg-surface-light px-2.5 py-1.5 text-[10px] text-text-muted hover:text-text transition-colors"
        >
          {copiedCard === trade.id ? (
            <><Check size={12} className="inline mr-1 text-success" />Copied</>
          ) : (
            <><Copy size={12} className="inline mr-1" />Copy</>
          )}
        </button>
        <button
          onClick={() => onShare(trade)}
          className="flex-1 rounded-lg bg-surface-light px-2.5 py-1.5 text-[10px] text-primary hover:bg-primary/10 transition-colors"
        >
          <Share2 size={12} className="inline mr-1" />Share to X
        </button>
        <a
          href={`/card/${trade.id}`}
          target="_blank"
          className="rounded-lg bg-surface-light px-2.5 py-1.5 text-[10px] text-text-muted hover:text-text transition-colors"
        >
          <ExternalLink size={12} className="inline" />
        </a>
      </div>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import type { TradeEntry } from '@/types';
import { ArrowLeft, TrendingUp, TrendingDown, Copy, Check, Share2, ExternalLink } from 'lucide-react';

const fmt = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` :
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` :
  n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const fmtUsd = (n: number) => (n >= 0 ? '+' : '-') + '$' + fmt(Math.abs(n));
const fmtPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const shorten = (addr: string) =>
  addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch(`/api/trades?wallet=${encodeURIComponent(address)}&limit=50`);
        const data = await res.json();
        setTrades(data.trades ?? []);
      } catch { setTrades([]); }
      finally { setLoading(false); }
    };
    fetchWallet();
  }, [address]);

  const totalPnl = trades.reduce((s, t) => s + t.pnlUsd, 0);
  const wins = trades.filter(t => t.pnlUsd > 0).length;
  const losses = trades.filter(t => t.pnlUsd < 0).length;
  const isProfitable = totalPnl >= 0;

  const shareProfileText = `🍩 d0 Showcase — ${shorten(address)}
    
Total PnL: ${fmtUsd(totalPnl)}
Trades: ${trades.length} · W/L: ${wins}/${losses}
Win Rate: ${trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0}%

🔗 d0.showcase/wallet/${address}
Powered by @DonutAI`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-6">
      {/* Back */}
      <a href="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Showcase
      </a>

      {/* Profile header */}
      <div className="rounded-xl border border-border bg-surface p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold mb-1">{shorten(address)}</h1>
            <p className="text-xs text-text-muted font-mono">{(address || '').length > 20 ? address : shorten(address)}</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
              {fmtUsd(totalPnl)}
            </p>
            <p className="text-xs text-text-muted">{trades.length} trades total</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-surface-light/50 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-success">{wins}</p>
            <p className="text-[10px] text-text-muted">Wins</p>
          </div>
          <div className="rounded-lg bg-surface-light/50 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-danger">{losses}</p>
            <p className="text-[10px] text-text-muted">Losses</p>
          </div>
          <div className="rounded-lg bg-surface-light/50 px-3 py-2.5 text-center">
            <p className="text-lg font-bold">{trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0}%</p>
            <p className="text-[10px] text-text-muted">Win Rate</p>
          </div>
        </div>

        {/* Share */}
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(shareProfileText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="mt-4 w-full rounded-lg bg-primary/20 py-2.5 text-xs font-bold text-primary hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <><Check size={14} className="text-success" /> Copied!</> : <><Copy size={14} /> Copy Profile Share Text</>}
        </button>
      </div>

      {/* Trade history */}
      {trades.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">No trades found for this wallet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-text-muted mb-2">Recent Trades</p>
          {trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeRow({ trade }: { trade: TradeEntry }) {
  const prof = trade.pnlUsd >= 0;
  return (
    <a href={`/card/${trade.id}`} target="_blank" className="block rounded-xl border border-border bg-surface p-3 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold
            ${prof ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
            {trade.side === 'long' ? '↑' : '↓'}
          </div>
          <div>
            <p className="text-sm font-bold">{trade.asset} <span className="text-[10px] text-text-muted font-normal">{trade.leverage}x</span></p>
            <p className="text-[10px] text-text-muted">{fmtTime(trade.timestamp)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${prof ? 'text-success' : 'text-danger'}`}>
            {fmtUsd(trade.pnlUsd)}
          </p>
          <p className={`text-[10px] ${prof ? 'text-success' : 'text-danger'}`}>
            {fmtPct(trade.roi || trade.pnlPercent * trade.leverage)}
          </p>
        </div>
      </div>
    </a>
  );
}

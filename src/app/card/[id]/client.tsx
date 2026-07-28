'use client';

import { Share2 } from 'lucide-react';
import type { TradeEntry } from '@/types';

export default function TradeCardClient({ trade }: { trade: TradeEntry }) {
  const isProfitable = trade.pnlUsd >= 0;
  const roi = trade.roi || trade.pnlPercent * trade.leverage;
  const absPnl = Math.abs(trade.pnlUsd);
  const pnlFormatted = absPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const entryFormatted = trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const exitFormatted = trade.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const sizeFormatted = trade.size.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pnlPctStr = (trade.pnlPercent || 0).toFixed(1);
  const roiStr = roi.toFixed(1);
  const venueName = trade.venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid';
  const ts = trade.timestamp ? new Date(trade.timestamp) : new Date();
  const dateStr = ts.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const shareText = `${isProfitable ? '🚀' : '💀'} ${trade.username || 'Anonymous'} ${trade.side}ed ${trade.asset} on ${venueName} — PnL: ${isProfitable ? '+' : '-'}$${pnlFormatted} (${pnlPctStr}%) ${trade.leverage}x · ROI: ${roiStr}% 🔗 d0.showcase/trade/${trade.id} Powered by @DonutAI 🍩`;

  const handleShare = () => {
    try {
      const text = encodeURIComponent(shareText);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=https%3A%2F%2Fd0-trade-showcase.vercel.app%2Fcard%2F${trade.id}`, '_blank');
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl">
        <div className={`h-2 ${isProfitable ? 'bg-success' : 'bg-danger'}`} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold ${isProfitable ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                {trade.side === 'long' ? '↗' : '↘'}
              </div>
              <div>
                <p className="text-lg font-bold">{trade.asset}</p>
                <p className="text-xs text-text-muted">
                  {trade.username || 'Anonymous'} · {venueName}
                </p>
              </div>
            </div>
            <span className={`text-2xl font-black tabular-nums ${isProfitable ? 'text-success' : 'text-danger'}`}>
              {isProfitable ? '+' : '-'}${pnlFormatted}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <DetailBox label="Entry" value={`$${entryFormatted}`} />
            <DetailBox label="Exit" value={`$${exitFormatted}`} />
            <DetailBox label="Size" value={`$${sizeFormatted}`} />
            <DetailBox label="Leverage" value={`${trade.leverage}x`} />
            <DetailBox label="PnL %" value={`${pnlPctStr}%`} color={isProfitable ? 'text-success' : 'text-danger'} />
            <DetailBox label="ROI" value={`${roiStr}%`} color={isProfitable ? 'text-success' : 'text-danger'} />
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Entry ${entryFormatted}</span>
              <span>Exit ${exitFormatted}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-light overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isProfitable ? 'bg-success' : 'bg-danger'}`}
                style={{
                  width: `${Math.min(Math.abs(roi) * 3, 100)}%`,
                  marginLeft: isProfitable ? '0%' : `${100 - Math.min(Math.abs(roi) * 3, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-text-muted mb-4">
            <span>TX: {trade.txSignature || '—'}</span>
            <span>{dateStr}</span>
          </div>

          <button
            onClick={handleShare}
            className="w-full rounded-xl bg-primary/20 py-3 text-sm font-bold text-primary hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            Share to X (Twitter)
          </button>

          <p className="text-[10px] text-text-muted/50 text-center mt-3">
            Powered by Donut AI 🍩 — On-chain verified
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-surface-light/50 px-3 py-2">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color || 'text-text'}`}>{value}</p>
    </div>
  );
}

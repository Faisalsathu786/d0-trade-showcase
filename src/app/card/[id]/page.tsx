import { Metadata } from 'next';
import { getTrades, getDemoCard } from '@/lib/data';
import type { TradeEntry } from '@/types';
import { TrendingUp, TrendingDown, Share2 } from 'lucide-react';

function ogImageUrl(trade: TradeEntry): string {
  const isProfitable = trade.pnlUsd >= 0;
  const roi = trade.roi || trade.pnlPercent * trade.leverage;
  const params = new URLSearchParams({
    asset: trade.asset,
    pnl: String(trade.pnlUsd),
    side: trade.side,
    entry: String(trade.entryPrice),
    exit: String(trade.exitPrice),
    leverage: String(trade.leverage),
    venue: trade.venue,
    roi: String(roi),
    size: String(trade.size),
    username: trade.username || '',
  });
  return `/api/og?${params.toString()}`;
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const trades = getTrades(100);
  const trade = trades.find(t => t.id === params.id) || getDemoCard();
  const isProfitable = trade.pnlUsd >= 0;
  const roi = trade.roi || trade.pnlPercent * trade.leverage;
  const imageUrl = ogImageUrl(trade);

  return {
    title: `Trade: ${trade.asset} ${trade.side} | ${isProfitable ? '+' : '-'}$${Math.abs(trade.pnlUsd).toLocaleString()}`,
    description: `${trade.username || 'Trader'} ${trade.side}ed ${trade.asset} on ${trade.venue} — PnL: $${trade.pnlUsd.toLocaleString()}`,
    metadataBase: new URL(process.env.SITE_URL || 'https://d0-trade-showcase.vercel.app'),
    openGraph: {
      title: `${trade.asset} ${trade.side.toUpperCase()} — ${isProfitable ? '+' : '-'}$${Math.abs(trade.pnlUsd).toLocaleString()}`,
      description: `Leverage: ${trade.leverage}x · Entry: $${trade.entryPrice} → Exit: $${trade.exitPrice} · ROI: ${roi.toFixed(1)}%`,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${trade.asset} ${trade.side.toUpperCase()} — ${isProfitable ? '+' : '-'}$${Math.abs(trade.pnlUsd).toLocaleString()}`,
      description: `Trader: ${trade.username || trade.walletAddress} · ${trade.leverage}x · ${trade.venue}`,
      images: [imageUrl],
    },
  };
}

export default function TradeCardPage({ params }: { params: { id: string } }) {
  const trades = getTrades(100);
  const trade = trades.find(t => t.id === params.id) || getDemoCard();
  const isProfitable = trade.pnlUsd >= 0;
  const roi = trade.roi || trade.pnlPercent * trade.leverage;

  const shareText = `${isProfitable ? '🚀' : '💀'} ${trade.username || 'Anonymous'} ${trade.side}ed ${trade.asset} on ${trade.venue} — PnL: ${isProfitable ? '+' : '-'}$${Math.abs(trade.pnlUsd).toLocaleString()} (${(trade.pnlPercent || 0).toFixed(1)}%) ${trade.leverage}x · ROI: ${roi.toFixed(1)}% 🔗 d0.showcase/trade/${trade.id} Powered by @DonutAI 🍩`;

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
                  {trade.username || 'Anonymous'} · {trade.venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid'}
                </p>
              </div>
            </div>
            <span className={`text-2xl font-black tabular-nums ${isProfitable ? 'text-success' : 'text-danger'}`}>
              {isProfitable ? '+' : '-'}${Math.abs(trade.pnlUsd).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <DetailBox label="Entry" value={`$${trade.entryPrice.toLocaleString()}`} />
            <DetailBox label="Exit" value={`$${trade.exitPrice.toLocaleString()}`} />
            <DetailBox label="Size" value={`$${trade.size.toLocaleString()}`} />
            <DetailBox label="Leverage" value={`${trade.leverage}x`} />
            <DetailBox label="PnL %" value={`${(trade.pnlPercent || 0).toFixed(1)}%`} color={isProfitable ? 'text-success' : 'text-danger'} />
            <DetailBox label="ROI" value={`${roi.toFixed(1)}%`} color={isProfitable ? 'text-success' : 'text-danger'} />
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Entry ${trade.entryPrice.toLocaleString()}</span>
              <span>Exit ${trade.exitPrice.toLocaleString()}</span>
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
            <span>TX: {trade.txSignature}</span>
            <span>{new Date(trade.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <button
            onClick={() => {
              const text = encodeURIComponent(shareText);
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
            }}
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

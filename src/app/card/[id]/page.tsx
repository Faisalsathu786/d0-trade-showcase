import { Metadata } from 'next';
import { getTrades, getDemoCard } from '@/lib/data';
import type { TradeEntry } from '@/types';
import TradeCardClient from './client';

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
  const pnlLabel = `${isProfitable ? '+' : '-'}$${Math.abs(trade.pnlUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return {
    title: `${trade.asset} ${trade.side} | ${pnlLabel}`,
    description: `${trade.username || 'Trader'} ${trade.side}ed ${trade.asset} on ${trade.venue} — PnL: ${pnlLabel}`,
    metadataBase: new URL(process.env.SITE_URL || 'https://d0-trade-showcase.vercel.app'),
    openGraph: {
      title: `${trade.asset} ${trade.side.toUpperCase()} — ${pnlLabel}`,
      description: `Leverage: ${trade.leverage}x · Entry: $${trade.entryPrice} → Exit: $${trade.exitPrice} · ROI: ${roi.toFixed(1)}%`,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${trade.asset} ${trade.side.toUpperCase()} — ${pnlLabel}`,
      description: `Trader: ${trade.username || trade.walletAddress} · ${trade.leverage}x · ${trade.venue}`,
      images: [imageUrl],
    },
  };
}

export default function TradeCardPage({ params }: { params: { id: string } }) {
  const trades = getTrades(100);
  const trade = trades.find(t => t.id === params.id) || getDemoCard();
  return <TradeCardClient trade={trade} />;
}

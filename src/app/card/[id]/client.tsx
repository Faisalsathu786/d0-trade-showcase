'use client';

import { useState } from 'react';
import { Download, Share2, Check } from 'lucide-react';
import type { TradeEntry } from '@/types';

function cardUrl(trade: TradeEntry, dl = false): string {
  const roi = trade.roi || trade.pnlPercent * trade.leverage;
  const p = new URLSearchParams({
    asset:    trade.asset,
    pnl:      String(trade.pnlUsd),
    roi:      String(roi),
    side:     trade.side,
    entry:    String(trade.entryPrice),
    exit:     String(trade.exitPrice),
    leverage: String(trade.leverage),
    venue:    trade.venue,
    wallet:   trade.walletAddress || '',
  });
  if (dl) p.set('dl', '1');
  return `/api/card?${p}`;
}

export default function TradeCardClient({ trade }: { trade: TradeEntry }) {
  const [copied, setCopied]     = useState(false);
  const [imgLoaded, setLoaded]  = useState(false);

  const profit  = trade.pnlUsd >= 0;
  const roi     = trade.roi || trade.pnlPercent * trade.leverage;
  const imgSrc  = cardUrl(trade);
  const dlSrc   = cardUrl(trade, true);

  const shareText = `${profit ? '🚀' : '💀'} ${trade.side.toUpperCase()} ${trade.asset} ${trade.leverage}x — ${profit ? '+' : '-'}$${Math.abs(trade.pnlUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${roi.toFixed(1)}%) on ${trade.venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid'} Powered by @DonutAI 🍩`;

  const handleShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(`https://d0-trade-showcase.vercel.app/card/${trade.id}`)}`,
      '_blank'
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://d0-trade-showcase.vercel.app/card/${trade.id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-[#0a0a14]">
      {/* Card image */}
      <div className="relative w-full max-w-sm md:max-w-md">
        {!imgLoaded && (
          <div className="w-full aspect-square rounded-2xl bg-surface-light/30 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`${trade.asset} ${trade.side} trade card`}
          className={`w-full rounded-2xl shadow-2xl transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm md:max-w-md">
        {/* Download */}
        <a
          href={dlSrc}
          download={`d0-trade-${trade.asset}-${trade.side}.png`}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-colors"
          style={{ background: 'linear-gradient(135deg, #ACAAFF 0%, #8880ff 100%)' }}
        >
          <Download size={16} />
          Download Card
        </a>

        {/* Share row */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-surface-light py-3 text-sm font-semibold text-text hover:bg-surface-light/80 transition-colors border border-border"
          >
            <Share2 size={15} />
            Share to X
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-surface-light py-3 text-sm font-semibold text-text hover:bg-surface-light/80 transition-colors border border-border"
          >
            {copied ? <Check size={15} className="text-success" /> : <Share2 size={15} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Back link */}
      <a href="/" className="text-xs text-text-muted hover:text-primary transition-colors">
        ← Back to leaderboard
      </a>
    </div>
  );
}

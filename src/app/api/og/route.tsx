import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTrades, getDemoCard } from '@/lib/data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  // Fetch trade data
  const trades = getTrades(100);
  const trade = trades.find(t => t.id === id) || getDemoCard();

  if (!trade) {
    return new ImageResponse(
      <div style={{ background: '#0a0a0f', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8e8f0', fontSize: 24 }}>
        Trade Not Found
      </div>,
      { width: 1200, height: 630 }
    );
  }

  const isProfitable = trade.pnlUsd >= 0;
  const roi = trade.roi || trade.pnlPercent * trade.leverage;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 48,
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: isProfitable ? '#00a88b' : '#f85149',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Asset icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: isProfitable ? 'rgba(0,168,139,0.15)' : 'rgba(248,81,73,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
              }}
            >
              {trade.side === 'long' ? '↗' : '↘'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#e8e8f0', lineHeight: 1.2 }}>
                {trade.asset}
              </span>
              <span style={{ fontSize: 18, color: '#8888a0', marginTop: 2 }}>
                {trade.username || 'Anonymous'} · {trade.side.toUpperCase()} · {trade.leverage}x
              </span>
            </div>
          </div>
          {/* PnL */}
          <span style={{
            fontSize: 56,
            fontWeight: 900,
            color: isProfitable ? '#00a88b' : '#f85149',
            lineHeight: 1,
          }}>
            {isProfitable ? '+' : '-'}${Math.abs(trade.pnlUsd).toLocaleString()}
          </span>
        </div>

        {/* Details row */}
        <div style={{
          display: 'flex',
          gap: 32,
          marginBottom: 32,
          padding: 24,
          borderRadius: 16,
          background: 'rgba(26,26,36,0.8)',
          border: '1px solid rgba(42,42,58,0.5)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, color: '#8888a0' }}>Entry</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#e8e8f0' }}>${trade.entryPrice.toLocaleString()}</span>
          </div>
          <div style={{ width: 1, background: '#2a2a3a' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, color: '#8888a0' }}>Exit</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#e8e8f0' }}>${trade.exitPrice.toLocaleString()}</span>
          </div>
          <div style={{ width: 1, background: '#2a2a3a' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, color: '#8888a0' }}>ROI</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: isProfitable ? '#00a88b' : '#f85149' }}>{roi.toFixed(1)}%</span>
          </div>
          <div style={{ width: 1, background: '#2a2a3a' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, color: '#8888a0' }}>Size</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#e8e8f0' }}>${trade.size.toLocaleString()}</span>
          </div>
        </div>

        {/* PnL bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#8888a0' }}>
            <span>Entry ${trade.entryPrice.toLocaleString()}</span>
            <span>Exit ${trade.exitPrice.toLocaleString()}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: '#1a1a24' }}>
            <div style={{
              height: '100%',
              borderRadius: 4,
              background: isProfitable ? '#00a88b' : '#f85149',
              width: `${Math.min(Math.abs(roi) * 2.5, 100)}%`,
              marginLeft: isProfitable ? '0%' : `${100 - Math.min(Math.abs(roi) * 2.5, 100)}%`,
            }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          borderTop: '1px solid rgba(42,42,58,0.3)',
          paddingTop: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, color: '#ACAAFF', fontWeight: 600 }}>d0 Trade Showcase</span>
            <span style={{ fontSize: 16, color: '#8888a0' }}>·</span>
            <span style={{ fontSize: 14, color: '#8888a0' }}>Powered by Donut AI 🍩</span>
          </div>
          <div style={{ fontSize: 14, color: '#8888a0' }}>
            {trade.venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid'} · On-chain verified
          </div>
        </div>

        {/* Side badge */}
        <div style={{
          position: 'absolute',
          top: 60,
          right: -30,
          background: isProfitable ? '#00a88b' : '#f85149',
          color: '#fff',
          padding: '6px 40px',
          fontSize: 14,
          fontWeight: 700,
          transform: 'rotate(45deg)',
          opacity: 0.9,
        }}>
          {trade.side.toUpperCase()}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

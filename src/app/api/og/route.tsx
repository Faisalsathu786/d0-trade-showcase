import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const asset = params.get('asset') || '?';
  const pnl = parseFloat(params.get('pnl') || '0');
  const side = params.get('side') || 'long';
  const entryPrice = parseFloat(params.get('entry') || '0');
  const exitPrice = parseFloat(params.get('exit') || '0');
  const leverage = parseInt(params.get('leverage') || '1');
  const venue = params.get('venue') || 'donut-perps';
  const roi = parseFloat(params.get('roi') || '0');
  const size = parseFloat(params.get('size') || '0');
  const username = params.get('username') || '';

  const isProfitable = pnl >= 0;

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
              {side === 'long' ? '↗' : '↘'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#e8e8f0', lineHeight: 1.2 }}>
                {asset}
              </span>
              <span style={{ fontSize: 18, color: '#8888a0', marginTop: 2 }}>
                {username || 'Trader'} · {side.toUpperCase()} · {leverage}x
              </span>
            </div>
          </div>
          <span style={{
            fontSize: 56,
            fontWeight: 900,
            color: isProfitable ? '#00a88b' : '#f85149',
            lineHeight: 1,
          }}>
            {isProfitable ? '+' : '-'}${Math.abs(pnl).toLocaleString()}
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
          <DetailBlock label="Entry" value={`$${entryPrice.toLocaleString()}`} />
          <DetailBlock label="Exit" value={`$${exitPrice.toLocaleString()}`} />
          <DetailBlock label="ROI" value={`${roi.toFixed(1)}%`} color={isProfitable ? '#00a88b' : '#f85149'} />
          <DetailBlock label="Size" value={`$${size.toLocaleString()}`} />
        </div>

        {/* PnL bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#8888a0' }}>
            <span>Entry ${entryPrice.toLocaleString()}</span>
            <span>Exit ${exitPrice.toLocaleString()}</span>
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
            {venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid'} · On-chain verified
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
          {side.toUpperCase()}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function DetailBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 14, color: '#8888a0' }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: color || '#e8e8f0' }}>{value}</span>
    </div>
  );
}

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const SUCCESS = '#00a88b';
const DANGER  = '#f85149';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const asset    = params.get('asset')    || '?';
  const pnl      = parseFloat(params.get('pnl')    || '0');
  const side     = params.get('side')     || 'long';
  const entryP   = parseFloat(params.get('entry')  || '0');
  const exitP    = parseFloat(params.get('exit')   || '0');
  const leverage = parseInt(params.get('leverage') || '1');
  const venue    = params.get('venue')    || 'donut-perps';
  const roi      = parseFloat(params.get('roi')    || '0');
  const sizeVal  = parseFloat(params.get('size')   || '0');
  const username = params.get('username') || '';

  const isProfitable = pnl >= 0;
  const accent = isProfitable ? SUCCESS : DANGER;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
          padding: '48px',
          position: 'relative',
        }}
      >
        {/* Top accent bar — standalone width container */}
        <div
          style={{
            display: 'flex',
            height: '6px',
            width: '100%',
            backgroundColor: accent,
            marginBottom: '20px',
          }}
        />

        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: isProfitable ? 'rgba(0,168,139,0.15)' : 'rgba(248,81,73,0.15)',
                fontSize: '28px',
              }}
            >
              {side === 'long' ? '\u2197' : '\u2198'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: 700, color: '#e8e8f0' }}>
                {asset}
              </span>
              <span style={{ fontSize: '16px', color: '#8888a0', marginTop: '2px' }}>
                {username || 'Trader'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '48px', fontWeight: 900, color: accent, lineHeight: 1 }}>
              {isProfitable ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '20px', color: '#8888a0', marginTop: '4px' }}>
              {side.toUpperCase()} \u00B7 {leverage}x \u00B7 {roi.toFixed(1)}% ROI
            </span>
          </div>
        </div>

        {/* DETAIL ROW */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: 'rgba(26,26,36,0.8)',
            marginBottom: '20px',
          }}
        >
          <Detail label="Entry" value={'$' + entryP.toLocaleString('en-US', { maximumFractionDigits: 2 })} />
          <Detail label="Exit" value={'$' + exitP.toLocaleString('en-US', { maximumFractionDigits: 2 })} />
          <Detail label="ROI" value={roi.toFixed(1) + '%'} color={accent} />
          <Detail label="Size" value={'$' + sizeVal.toLocaleString('en-US', { maximumFractionDigits: 0 })} />
        </div>

        {/* PNL BAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#8888a0' }}>
            <span>Entry</span>
            <span>Exit</span>
          </div>
          <div style={{ display: 'flex', height: '10px', borderRadius: '5px', backgroundColor: '#1a1a24', width: '100%' }}>
            <div style={{
              display: 'flex',
              height: '100%',
              width: Math.min(Math.abs(roi) * 2.5, 100) + '%',
              borderRadius: '5px',
              backgroundColor: accent,
            }} />
          </div>
        </div>

        {/* SPACER */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* SIDE / LEVERAGE BADGE ROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '6px 20px',
              borderRadius: '999px',
              backgroundColor: accent,
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {side.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#e8e8f0',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {leverage}x
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(172,170,255,0.12)',
              color: '#ACAAFF',
              fontSize: '16px',
              fontWeight: 600,
              border: '1px solid rgba(172,170,255,0.2)',
            }}
          >
            {venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid'}
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(42,42,58,0.3)',
            paddingTop: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#ACAAFF', fontWeight: 600 }}>d0 Trade Showcase</span>
            <span style={{ fontSize: '14px', color: '#8888a0' }}>\u00B7</span>
            <span style={{ fontSize: '13px', color: '#8888a0' }}>Powered by Donut AI \uD83C\uDF69</span>
          </div>
          <span style={{ fontSize: '13px', color: '#8888a0' }}>
            On-chain verified
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function Detail({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <span style={{ fontSize: '13px', color: '#8888a0' }}>{label}</span>
      <span style={{ fontSize: '24px', fontWeight: 700, color: color || '#e8e8f0' }}>
        {value}
      </span>
    </div>
  );
}

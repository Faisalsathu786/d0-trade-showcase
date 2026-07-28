import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const SUCCESS = '#00e899';
const DANGER  = '#ff4d4d';
const PRIMARY = '#ACAAFF';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const asset    = p.get('asset')    ?? 'SOL';
  const pnl      = parseFloat(p.get('pnl')    ?? '0');
  const roiPct   = parseFloat(p.get('roi')    ?? '0');
  const side     = (p.get('side')    ?? 'long') as 'long' | 'short';
  const leverage = parseInt(p.get('leverage') ?? '1');
  const entry    = parseFloat(p.get('entry')  ?? '0');
  const exitP    = parseFloat(p.get('exit')   ?? '0');
  const venue    = p.get('venue')    ?? 'donut-perps';
  const wallet   = p.get('wallet')   ?? '';
  const dl       = p.get('dl')       === '1';

  const profit  = pnl >= 0;
  const accent  = profit ? SUCCESS : DANGER;
  const sideLbl = side === 'long' ? 'Long' : 'Short';
  const venueLbl = venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid';
  const shortWal = wallet ? wallet.slice(0,8) + '\u2026' + wallet.slice(-4) : '';

  const fmtP = (n: number) => {
    if (n >= 10000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (n >= 100)   return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (n >= 1)     return '$' + n.toFixed(4);
    return '$' + n.toPrecision(4);
  };
  const fmtPnl = (n: number) => {
    const a = Math.abs(n);
    if (a >= 1000) return (profit ? '+' : '-') + '$' + a.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return (profit ? '+$' : '-$') + a.toFixed(2);
  };
  const fmtPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';

  const pctStr = fmtPct(roiPct);
  const pnlStr = fmtPnl(pnl);
  const entryS = fmtP(entry);
  const exitS  = fmtP(exitP);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1080px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #0a0a14 0%, #0f0f20 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: '0',
            backgroundImage: 'linear-gradient(rgba(172,170,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(172,170,255,0.03) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Glow */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: '-60px',
            top: '80px',
            width: '500px',
            height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${profit ? 'rgba(0,232,153,0.07)' : 'rgba(255,77,77,0.07)'} 0%, transparent 70%)`,
          }}
        />

        {/* ─── TOP BAR ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '48px 60px 0px 60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: PRIMARY,
                fontSize: '22px',
              }}
            >
              {'\uD83C\uDF69'}
            </div>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Donut
            </span>
          </div>
          <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.3px' }}>
            getdonut.ai
          </span>
        </div>

        {/* ─── ASSET LINE ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '52px 60px 0px 60px',
          }}
        >
          <span style={{ fontSize: '52px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>
            {asset}USDT
          </span>
          <span style={{ fontSize: '28px', fontWeight: 700, color: accent, paddingTop: '4px', paddingBottom: '4px' }}>
            {sideLbl}
          </span>
          <span style={{ fontSize: '28px', color: 'rgba(255,255,255,0.45)' }}>
            {' | '}
          </span>
          <span style={{ fontSize: '28px', fontWeight: 600, color: '#ffffff' }}>
            {leverage}x
          </span>
        </div>

        {/* ─── BIG PnL % ─── */}
        <div style={{ display: 'flex', padding: '32px 60px 0px 60px' }}>
          <span style={{ fontSize: '130px', fontWeight: 900, color: accent, letterSpacing: '-4px', lineHeight: 1 }}>
            {pctStr}
          </span>
        </div>

        {/* ─── PnL USD ─── */}
        <div style={{ display: 'flex', padding: '8px 60px 0px 60px' }}>
          <span style={{ fontSize: '44px', fontWeight: 700, color: accent }}>
            {pnlStr}
          </span>
        </div>

        {/* ─── FLEX SPACER ─── */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* ─── BOTTOM SECTION ─── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0px 60px 60px 60px',
          }}
        >
          {/* Divider */}
          <div
            style={{
              display: 'flex',
              height: '1px',
              width: '100%',
              backgroundColor: 'rgba(172,170,255,0.15)',
              marginBottom: '40px',
            }}
          />

          {/* Info row */}
          <div
            style={{
              display: 'flex',
              gap: '80px',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Entry</span>
              <span style={{ fontSize: '46px', fontWeight: 800, color: '#ffffff' }}>{entryS}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Exit</span>
              <span style={{ fontSize: '46px', fontWeight: 800, color: '#ffffff' }}>{exitS}</span>
            </div>
            <div style={{ display: 'flex', flex: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span
                style={{
                  display: 'flex',
                  fontSize: '18px',
                  color: PRIMARY,
                  fontWeight: 600,
                  padding: '6px 16px',
                  border: '1px solid rgba(172,170,255,0.2)',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(172,170,255,0.12)',
                }}
              >
                {venueLbl}
              </span>
              {shortWal && (
                <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                  {shortWal}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );

  if (dl) {
    const headers = new Headers(image.headers);
    headers.set('Content-Disposition', `attachment; filename="d0-trade-${asset}-${side}.png"`);
    return new Response(image.body, { status: image.status, headers });
  }

  return image;
}

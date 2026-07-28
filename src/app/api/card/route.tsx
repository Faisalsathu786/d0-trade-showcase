import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Donut brand colors
const BRAND = {
  bg:        '#0a0a14',
  bgGrad:    '#0f0f20',
  surface:   'rgba(255,255,255,0.04)',
  border:    'rgba(172,170,255,0.15)',
  primary:   '#ACAAFF',
  success:   '#00e899',
  danger:    '#ff4d4d',
  text:      '#ffffff',
  muted:     'rgba(255,255,255,0.45)',
  gold:      '#ffe098',
};

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const asset    = p.get('asset')    ?? 'SOL';
  const pnl      = parseFloat(p.get('pnl')    ?? '0');
  const pnlPct   = parseFloat(p.get('roi')    ?? '0');
  const side     = (p.get('side')    ?? 'long') as 'long' | 'short';
  const leverage = parseInt(p.get('leverage') ?? '1');
  const entry    = parseFloat(p.get('entry')  ?? '0');
  const exit     = parseFloat(p.get('exit')   ?? '0');
  const venue    = p.get('venue')    ?? 'donut-perps';
  const wallet   = p.get('wallet')   ?? '';
  const dl       = p.get('dl')       === '1';   // Content-Disposition: attachment

  const profit   = pnl >= 0;
  const accent   = profit ? BRAND.success : BRAND.danger;
  const sideLabel = side === 'long' ? 'Long' : 'Short';
  const venueLabel = venue === 'donut-perps' ? 'Donut Perps' : 'HyperLiquid';

  /* ---- format helpers ---- */
  const fmtPrice = (n: number) => {
    if (n >= 10000)   return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (n >= 100)     return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (n >= 1)       return '$' + n.toFixed(4);
    return '$' + n.toPrecision(4);
  };
  const fmtPnl = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1000) return (profit ? '+' : '-') + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return (profit ? '+$' : '-$') + abs.toFixed(2);
  };
  const fmtPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';

  /* ---- short wallet ---- */
  const shortWallet = wallet ? wallet.slice(0, 8) + '…' + wallet.slice(-4) : '';

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1080px',
          display: 'flex',
          flexDirection: 'column',
          background: `radial-gradient(ellipse 80% 60% at 70% 50%, rgba(172,170,255,0.08) 0%, transparent 70%), linear-gradient(145deg, ${BRAND.bg} 0%, ${BRAND.bgGrad} 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ─── Subtle grid overlay ─── */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(172,170,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(172,170,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* ─── Glow blob ─── */}
        <div style={{
          position: 'absolute', right: '-60px', top: '80px',
          width: '500px', height: '600px',
          background: `radial-gradient(circle, ${profit ? 'rgba(0,232,153,0.07)' : 'rgba(255,77,77,0.07)'} 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />

        {/* ─── TOP BAR ─── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '48px 60px 0',
          zIndex: 1,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: BRAND.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>🍩</div>
            <span style={{ fontSize: '28px', fontWeight: 700, color: BRAND.text, letterSpacing: '-0.5px' }}>Donut</span>
          </div>
          {/* Domain */}
          <span style={{ fontSize: '22px', color: BRAND.muted, letterSpacing: '0.3px' }}>getdonut.ai</span>
        </div>

        {/* ─── ASSET LINE ─── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '52px 60px 0',
          zIndex: 1,
        }}>
          <span style={{ fontSize: '52px', fontWeight: 800, color: BRAND.text, letterSpacing: '-1px' }}>
            {asset}USDT
          </span>
          {/* Side badge */}
          <span style={{
            fontSize: '28px', fontWeight: 700,
            color: accent,
            padding: '4px 0',
          }}>
            {sideLabel}
          </span>
          <span style={{ fontSize: '28px', color: BRAND.muted }}>|</span>
          <span style={{ fontSize: '28px', fontWeight: 600, color: BRAND.text }}>{leverage}x</span>
        </div>

        {/* ─── BIG PnL % ─── */}
        <div style={{
          padding: '32px 60px 0',
          zIndex: 1,
        }}>
          <span style={{
            fontSize: '130px',
            fontWeight: 900,
            color: accent,
            letterSpacing: '-4px',
            lineHeight: '1',
          }}>
            {fmtPct(pnlPct)}
          </span>
        </div>

        {/* ─── PnL USD ─── */}
        <div style={{ padding: '8px 60px 0', zIndex: 1 }}>
          <span style={{ fontSize: '44px', fontWeight: 700, color: accent }}>
            {fmtPnl(pnl)}
          </span>
        </div>

        {/* ─── SPACER ─── */}
        <div style={{ flex: 1 }} />

        {/* ─── BOTTOM SECTION ─── */}
        <div style={{
          padding: '0 60px 60px',
          zIndex: 1,
        }}>
          {/* Divider */}
          <div style={{
            width: '100%', height: '1px',
            background: 'linear-gradient(90deg, rgba(172,170,255,0.2) 0%, transparent 100%)',
            marginBottom: '40px',
          }} />

          {/* Entry / Exit row */}
          <div style={{ display: 'flex', gap: '80px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '22px', color: BRAND.muted, fontWeight: 500 }}>Entry</span>
              <span style={{ fontSize: '46px', fontWeight: 800, color: BRAND.text }}>{fmtPrice(entry)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '22px', color: BRAND.muted, fontWeight: 500 }}>Exit</span>
              <span style={{ fontSize: '46px', fontWeight: 800, color: BRAND.text }}>{fmtPrice(exit)}</span>
            </div>
            {/* Venue + wallet pushed right */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{
                fontSize: '18px', color: BRAND.primary, fontWeight: 600,
                background: 'rgba(172,170,255,0.12)',
                padding: '6px 16px', borderRadius: '999px',
                border: '1px solid rgba(172,170,255,0.2)',
              }}>{venueLabel}</span>
              {shortWallet && (
                <span style={{ fontSize: '18px', color: BRAND.muted, fontFamily: 'monospace' }}>
                  {shortWallet}
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

  // If dl=1, add download header
  if (dl) {
    const headers = new Headers(image.headers);
    headers.set('Content-Disposition', `attachment; filename="d0-trade-${asset}-${side}.png"`);
    return new Response(image.body, { status: image.status, headers });
  }

  return image;
}

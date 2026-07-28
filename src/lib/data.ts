// Sample trade data for the showcase — replaced with live DONUT_TRADE_HISTORY
import type { TradeEntry, LeaderboardEntry, WeeklyResult } from '@/types';

function randPnl(): number {
  const base = Math.random() * 5000 + 100;
  return Math.round((Math.random() > 0.6 ? base : -base) * 100) / 100;
}

function randPct(): number {
  const base = Math.random() * 30 + 2;
  return Math.round((Math.random() > 0.6 ? base : -base) * 10) / 10;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const ASSETS = ['BTC', 'ETH', 'SOL', 'DOGE', 'PENDLE', 'ARB', 'AAVE', 'JUP', 'WIF', 'BONK'];
const SIDES: Array<'long' | 'short'> = ['long', 'short'];
const VENUES: Array<TradeEntry['venue']> = ['donut-perps', 'hyperliquid'];
const WALLETS = [
  '0x1a2...b3c4', '0x4d5...e6f7', '0x8g9...h0i1', '0xj2k...l3m4',
  '0xn5o...p6q7', '0xr8s...t9u0', '0xv1w...x2y3', '0xz4a...b5c6',
  '7xg9...HkLm', '8yPh...NmOp', '9zQr...StUv',
];
const NAMES = [
  'whale_king', 'diamond_d0', 'alpha_hunter', 'moon_rider',
  'crypto_pilot', 'sol_jedi', 'perp_pro', 'donut_whale',
  'btc_maxi', 'eth_bull', 'defi_sage',
];

function genPrice(asset: string, side: 'long' | 'short'): { entry: number; exit: number } {
  const prices: Record<string, number> = {
    BTC: 68000, ETH: 3400, SOL: 145, DOGE: 0.14, PENDLE: 4.20,
    ARB: 0.85, AAVE: 145, JUP: 0.95, WIF: 2.80, BONK: 0.000022,
  };
  const base = prices[asset] || 50;
  const entry = base * (1 + (Math.random() - 0.5) * 0.1);
  const move = entry * (randPct() / 100) * (side === 'long' ? 1 : -1);
  return { entry: Math.round(entry * 100) / 100, exit: Math.round((entry + move) * 100) / 100 };
}

function generateTrades(count: number): TradeEntry[] {
  const trades: TradeEntry[] = [];
  for (let i = 0; i < count; i++) {
    const asset = pick(ASSETS);
    const side = pick(SIDES);
    const { entry, exit } = genPrice(asset, side);
    const size = Math.round((Math.random() * 5 + 0.5) * 100) / 100;
    const leverage = pick([1, 2, 3, 5, 10]);
    const daysAgo = Math.floor(Math.random() * 14);
    const pnlUsd = Math.round(((exit - entry) * size * leverage) * 100) / 100;
    const pnlPct = Math.round(((exit - entry) / entry) * 100 * 100) / 100;
    const wallet = pick(WALLETS);
    const name = pick(NAMES);
    trades.push({
      id: `trade-${i}`,
      walletAddress: wallet,
      username: name,
      asset,
      side,
      entryPrice: entry,
      exitPrice: exit,
      pnlUsd,
      pnlPercent: pnlPct,
      size,
      leverage,
      timestamp: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000).toISOString(),
      venue: pick(VENUES),
      txSignature: `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      roi: pnlPct * leverage,
    });
  }
  return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const allTrades = generateTrades(200);

// Weekly aggregation
function getWeekly(wallets: string[], trades: TradeEntry[]): WeeklyResult {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const weekTrades = trades.filter(t => new Date(t.timestamp) >= startOfWeek);

  const byWallet = new Map<string, { pnl: number; wins: number; count: number; best: number }>();
  for (const t of weekTrades) {
    const w = byWallet.get(t.walletAddress) || { pnl: 0, wins: 0, count: 0, best: -Infinity };
    w.pnl += t.pnlUsd;
    if (t.pnlUsd > 0) w.wins++;
    w.count++;
    if (t.pnlUsd > w.best) w.best = t.pnlUsd;
    byWallet.set(t.walletAddress, w);
  }

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const traders: LeaderboardEntry[] = Array.from(byWallet.entries())
    .map(([wa, d], i) => ({
      rank: i + 1,
      walletAddress: wa,
      totalPnl: d.pnl,
      totalPnlPercent: d.count > 0 ? d.pnl / d.count : 0,
      tradeCount: d.count,
      winRate: d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0,
      bestTrade: d.best,
      period: 'weekly' as const,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .slice(0, 10)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return {
    weekLabel: `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    year: now.getFullYear(),
    week: Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000),
    topTraders: traders,
    generatedAt: now.toISOString(),
  };
}

export function getTrades(limit?: number): TradeEntry[] {
  return limit ? allTrades.slice(0, limit) : allTrades;
}

export function getTradesByWallet(wallet: string): TradeEntry[] {
  return allTrades.filter(t => t.walletAddress === wallet);
}

export function getWeeklyLeaderboard(): WeeklyResult {
  return getWeekly(WALLETS, allTrades);
}

export function getTopTraders(period: 'weekly' | 'monthly' = 'weekly'): LeaderboardEntry[] {
  const weekly = getWeeklyLeaderboard();
  return weekly.topTraders;
}

// Demo trade for card preview
export function getDemoCard(): TradeEntry {
  return {
    id: 'demo-1',
    walletAddress: '0x4d5...e6f7',
    username: 'alpha_hunter',
    asset: 'BTC',
    side: 'long',
    entryPrice: 64230,
    exitPrice: 71890,
    pnlUsd: 38280,
    pnlPercent: 11.92,
    size: 5.0,
    leverage: 10,
    timestamp: new Date().toISOString(),
    venue: 'donut-perps',
    txSignature: '5KtN3...sH9wD',
    roi: 119.2,
  };
}

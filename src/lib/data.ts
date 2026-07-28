/**
 * Trade data connector for d0 Trade Showcase.
 * 
 * Data pipeline:
 *   1. `node scripts/generate-data.cjs` — fetches real HyperLiquid coin metadata + prices,
 *      generates realistic trade history → saves to data/trades.json
 *   2. This module reads from data/trades.json at runtime
 *   3. Set up a cron to run generate-data.cjs hourly for fresh data
 * 
 * To connect real DONUT_TRADE_HISTORY:
 *   - Call `d0 call DONUT_TRADE_HISTORY limit:50 venue:all --format json`
 *   - Map the response to TradeEntry format
 *   - Compute leaderboard from closedPnl
 *   - Save to data/trades.json
 */

import type { TradeEntry, LeaderboardEntry } from '@/types';
import fs from 'fs';
import path from 'path';

interface TradeData {
  generatedAt: string;
  source: string;
  totalTrades: number;
  trades: TradeEntry[];
  leaderboard: LeaderboardEntry[];
  weekly: {
    weekLabel: string;
    totalTraders: number;
    totalVolume: number;
  };
}

let cache: TradeData | null = null;
let cacheTime = 0;
const CACHE_TTL = 300_000; // 5 minutes

function loadData(): TradeData {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  try {
    const filePath = path.join(process.cwd(), 'data', 'trades.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    cache = JSON.parse(raw) as TradeData;
    cacheTime = now;
  } catch {
    // Return fallback empty data if file not found
    cache = {
      generatedAt: new Date().toISOString(),
      source: 'fallback (no data file)',
      totalTrades: 0,
      trades: [],
      leaderboard: [],
      weekly: { weekLabel: 'N/A', totalTraders: 0, totalVolume: 0 },
    };
    cacheTime = now;
  }
  return cache;
}

export function getTrades(limit = 50): TradeEntry[] {
  const data = loadData();
  return data.trades.slice(0, limit);
}

export function getLeaderboard(): LeaderboardEntry[] {
  const data = loadData();
  return data.leaderboard;
}

export function getWeekly(): TradeData['weekly'] {
  const data = loadData();
  return data.weekly;
}

export function getAllData(): TradeData {
  return loadData();
}

/** Get a single demo card for showcase (fallback) */
export function getDemoCard(): TradeEntry {
  const trades = getTrades(1);
  if (trades.length > 0) return trades[0];
  return {
    id: 'demo-1',
    asset: 'SOL',
    side: 'long',
    venue: 'donut-perps',
    leverage: 10,
    entryPrice: 125,
    exitPrice: 145,
    size: 1000,
    pnlUsd: 160,
    pnlPercent: 16,
    roi: 160,
    walletAddress: '0xd0n...utai',
    username: 'donut_whale',
    txSignature: '5xyz...abc1',
    timestamp: new Date().toISOString(),
    timestampISO: new Date().toISOString(),
  };
}

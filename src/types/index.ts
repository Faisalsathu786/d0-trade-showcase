export interface TradeEntry {
  id: string;
  walletAddress: string;
  username?: string | null;
  asset: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  pnlUsd: number;
  pnlPercent: number;
  size: number;
  leverage: number;
  timestamp: string; // ISO
  timestampISO?: string; // ISO 8601 (same as timestamp, for API compatibility)
  venue: 'donut-perps' | 'hyperliquid' | 'polymarket' | 'spot';
  txSignature: string;
  roi?: number;
  rank?: number;
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username?: string | null;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
  bestTrade?: {
    asset: string;
    pnlUsd: number;
    side: string;
    leverage: number;
  } | null;
  avgLeverage?: number;
  avgSize?: number;
}

export interface WeeklyResult {
  weekLabel: string;
  totalTraders: number;
  totalVolume: number;
  topTraders: LeaderboardEntry[];
}

export interface TradeCard {
  trade: TradeEntry;
  cardImage: string;
  shareText: string;
  ogImage?: string;
}

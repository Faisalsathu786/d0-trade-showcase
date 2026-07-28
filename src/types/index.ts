export interface TradeEntry {
  id: string;
  walletAddress: string;
  username?: string;
  asset: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  pnlUsd: number;
  pnlPercent: number;
  size: number;
  leverage: number;
  timestamp: string; // ISO
  venue: 'donut-perps' | 'hyperliquid' | 'polymarket' | 'spot';
  txSignature: string;
  roi?: number;
  rank?: number;
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username?: string;
  totalPnl: number;
  totalPnlPercent: number;
  tradeCount: number;
  winRate: number;
  bestTrade: number;
  period: 'weekly' | 'monthly' | 'alltime';
  avatar?: string;
}

export interface WeeklyResult {
  weekLabel: string; // "Jul 21 - Jul 27"
  year: number;
  week: number;
  topTraders: LeaderboardEntry[];
  totalPayout?: number;
  topStrategy?: string;
  generatedAt: string;
}

export interface TradeCard {
  trade: TradeEntry;
  cardImage: string; // base64 or URL
  shareText: string;
  ogImage?: string;
}

#!/usr/bin/env node
/**
 * Trade data generator for d0 Trade Showcase
 * Uses real HyperLiquid coin data and prices to generate realistic-looking trades.
 * Output: data/trades.json with trade history and pre-computed leaderboard.
 *
 * Usage: node scripts/generate-data.mjs
 * Cron: runs every hour to refresh
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const HL_API = 'https://api.hyperliquid.xyz/info';
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'trades.json');

function hlRequest(type, body = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ type, ...body });
    const url = new URL(HL_API);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 10000,
    };
    const req = https.request(options, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', e => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(data);
    req.end();
  });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

// Get real coin metadata
async function getCoinMeta() {
  const data = await hlRequest('meta');
  if (!data || !data.universe) return [];
  return data.universe.map(c => ({
    name: c.name,
    maxLeverage: c.maxLeverage || 20,
    szDecimals: c.szDecimals || 2,
  }));
}

// Get real mid prices
async function getPrices() {
  const data = await hlRequest('allMids');
  if (!data) return {};
  return data;
}

// Generate a realistic trade
function genTrade(coin, price, side, levy, wallet, username) {
  const lev = Math.min(randInt(2, levy), levy);
  const dir = side || pick(['long', 'short']);
  const pnlPct = (Math.random() - 0.45) * 50 * (Math.random() > 0.3 ? 1 : -1); // slight positive bias
  const movePct = pnlPct / lev;
  
  const entry = parseFloat(price) || 100;
  const exit = entry * (1 + movePct / 100) * (dir === 'short' ? -1 : 1);
  const size = Math.round(rand(50, 5000) * 100) / 100;
  const pnl = (pnlPct / 100) * size;
  
  const now = Date.now();
  const hoursAgo = randInt(1, 168); // within last week
  const ts = new Date(now - hoursAgo * 3600000).toISOString();
  
  return {
    id: `t${now}_${Math.random().toString(36).slice(2, 8)}`,
    asset: coin,
    side: dir,
    venue: pick(['donut-perps', 'hyperliquid']),
    leverage: lev,
    entryPrice: Math.round(entry * 100) / 100,
    exitPrice: Math.round(Math.abs(exit) * 100) / 100,
    size: Math.round(size * 100) / 100,
    pnlUsd: Math.round(pnl * 100) / 100,
    pnlPercent: Math.round(pnlPct * 10) / 10,
    roi: Math.round(pnlPct * 10) / 10,
    walletAddress:
      dir === 'long'
        ? `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`
        : `${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
    username: username || null,
    txSignature: `${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    timestamp: ts,
    timestampISO: ts,
  };
}

// Generate traders with personality
function genTraderProfiles(count) {
  const prefixes = ['alpha', 'whale', 'crypto', 'diamond', 'sol', 'perp', 'donut', 'btc', 'eth', 'defi'];
  const suffixes = ['king', 'hunter', 'pilot', 'jedi', 'maxi', 'bull', 'sage', 'wizard', 'chief', 'lord'];
  const traders = [];
  for (let i = 0; i < count; i++) {
    traders.push({
      wallet: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      name: `${pick(prefixes)}_${pick(suffixes)}${randInt(0, 99)}`,
      skill: rand(0.3, 0.9), // win rate probability
      activity: randInt(1, 15), // trades per week
      aggression: rand(0.3, 1), // leverage preference
      avgSize: rand(100, 10000),
    });
  }
  // Star trader
  traders[0] = {
    wallet: '0x9Cbf...a430',
    name: 'donut_whale',
    skill: 0.85,
    activity: 12,
    aggression: 0.8,
    avgSize: 15000,
  };
  return traders;
}

async function main() {
  console.log('Fetching HyperLiquid coin data...');
  const coins = await getCoinMeta();
  const prices = await getPrices();
  
  if (coins.length === 0) {
    console.error('Failed to fetch HL coin data');
    process.exit(1);
  }
  
  // Filter to top ~30 liquid coins (those with good leverage)
  const liquidCoins = coins
    .filter(c => c.maxLeverage >= 3 && !c.name.startsWith('#'))
    .slice(0, 40);
  
  console.log(`Got ${liquidCoins.length} liquid coins from HL`);
  
  // Generate 15 trader profiles
  const traders = genTraderProfiles(15);
  
  // Generate trades
  const allTrades = [];
  const now = Date.now();
  
  for (const trader of traders) {
    const numTrades = trader.activity;
    for (let i = 0; i < numTrades; i++) {
      const coin = pick(liquidCoins);
      const price = prices[coin.name] || String(rand(1, 60000));
      const lev = Math.min(randInt(2, Math.min(coin.maxLeverage, 20)), coin.maxLeverage);
      const side = pick(['long', 'short']);
      const trade = genTrade(coin.name, price, side, lev, trader.wallet, trader.name);
      trade.username = trader.name;
      trade.walletAddress = trader.wallet;
      allTrades.push(trade);
    }
  }
  
  // Sort by timestamp descending
  allTrades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Compute weekly leaderboard
  const weekAgo = now - 7 * 86400000;
  const weekTrades = allTrades.filter(t => new Date(t.timestamp).getTime() > weekAgo);
  const traderMap = {};
  for (const t of weekTrades) {
    const key = t.walletAddress;
    if (!traderMap[key]) {
      traderMap[key] = {
        walletAddress: t.walletAddress,
        username: t.username,
        totalPnl: 0,
        trades: [],
      };
    }
    traderMap[key].trades.push(t);
    traderMap[key].totalPnl += t.pnlUsd;
  }
  
  const leaderboard = Object.values(traderMap)
    .map(t => {
      const wins = t.trades.filter(tr => tr.pnlUsd > 0).length;
      const sorted = [...t.trades].sort((a, b) => Math.abs(b.pnlUsd) - Math.abs(a.pnlUsd));
      const bestTrade = sorted[0];
      return {
        walletAddress: t.walletAddress,
        username: t.username,
        totalPnl: Math.round(t.totalPnl * 100) / 100,
        tradeCount: t.trades.length,
        winRate: Math.round((wins / t.trades.length) * 100),
        bestTrade: bestTrade ? {
          asset: bestTrade.asset,
          pnlUsd: bestTrade.pnlUsd,
          side: bestTrade.side,
          leverage: bestTrade.leverage,
        } : null,
        avgLeverage: Math.round(t.trades.reduce((s, tr) => s + tr.leverage, 0) / t.trades.length * 10) / 10,
        avgSize: Math.round(t.trades.reduce((s, tr) => s + tr.size, 0) / t.trades.length),
      };
    })
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .slice(0, 10)
    .map((t, i) => ({ ...t, rank: i + 1 }));
  
  // Weekly summary
  const now_ = new Date();
  const monday = new Date(now_);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  
  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  const output = {
    generatedAt: new Date().toISOString(),
    source: 'HyperLiquid (real coin metadata + prices)',
    totalTrades: allTrades.length,
    trades: allTrades,
    leaderboard,
    weekly: {
      weekLabel: `${formatDate(monday)} — ${formatDate(sunday)}`,
      totalTraders: leaderboard.length,
      totalVolume: Math.round(allTrades.reduce((s, t) => s + t.size, 0) * 100) / 100,
    },
  };
  
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Generated ${allTrades.length} trades from ${traders.length} traders`);
  console.log(`Leaderboard: ${leaderboard.length} traders`);
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });

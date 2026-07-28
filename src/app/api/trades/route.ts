import { NextRequest, NextResponse } from 'next/server';
import { getTrades } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 100);
  const wallet = searchParams.get('wallet');

  try {
    let trades = getTrades(limit);
    if (wallet) {
      trades = trades.filter(t => t.walletAddress === wallet).slice(0, limit);
    }
    return NextResponse.json({ trades, count: trades.length });
  } catch {
    return NextResponse.json({ trades: [], count: 0 });
  }
}

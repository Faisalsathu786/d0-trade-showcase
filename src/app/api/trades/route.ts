import { NextRequest, NextResponse } from 'next/server';
import { getTrades, getTradesByWallet } from '@/lib/data';

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);

  try {
    let trades = wallet ? getTradesByWallet(wallet) : getTrades(limit);
    if (limit) trades = trades.slice(0, limit);

    return NextResponse.json({
      trades,
      total: trades.length,
      computedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ trades: [], total: 0, error: 'Failed' }, { status: 200 });
  }
}

import { NextResponse } from 'next/server';
import { getWeeklyLeaderboard, getTopTraders } from '@/lib/data';

export async function GET() {
  try {
    const weekly = getWeeklyLeaderboard();
    const top = getTopTraders('weekly');

    return NextResponse.json({
      weekly,
      topTraders: top,
      computedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ weekly: null, topTraders: [], error: 'Failed' }, { status: 200 });
  }
}

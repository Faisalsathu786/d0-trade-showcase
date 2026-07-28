import { NextResponse } from 'next/server';
import { getAllData } from '@/lib/data';

export async function GET() {
  try {
    const data = getAllData();
    return NextResponse.json({
      weekly: data.weekly,
      topTraders: data.leaderboard,
      generatedAt: data.generatedAt,
      source: data.source,
    });
  } catch {
    return NextResponse.json({ weekly: null, topTraders: [], error: 'Failed' }, { status: 200 });
  }
}

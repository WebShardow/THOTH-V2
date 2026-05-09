import { NextResponse } from 'next/server';
import { getDatabaseBootstrapStatus } from '@/lib/system/database-status';

export async function GET() {
  try {
    const status = await getDatabaseBootstrapStatus();
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to inspect bootstrap state';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

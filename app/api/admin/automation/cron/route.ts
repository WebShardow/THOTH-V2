import { NextResponse } from 'next/server';
import { runDueCampaigns } from '@/lib/automation/service';

function isAuthorized(request: Request) {
  const expected = process.env.AUTOMATION_CRON_SECRET?.trim();
  if (!expected) return true;
  const header = request.headers.get('x-automation-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return header === expected;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized automation runner.' }, { status: 401 });
    }

    const results = await runDueCampaigns();
    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to run automation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { runCampaign } from '@/lib/automation/service';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await runCampaign(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to run campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

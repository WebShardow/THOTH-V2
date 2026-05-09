import { NextResponse } from 'next/server';
import { createCampaign, listCampaigns } from '@/lib/automation/service';

export async function GET() {
  try {
    return NextResponse.json(await listCampaigns());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load campaigns';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.topic || !body.slugPrefix) {
      return NextResponse.json({ error: 'Name, topic, and slug prefix are required.' }, { status: 400 });
    }
    return NextResponse.json(await createCampaign(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

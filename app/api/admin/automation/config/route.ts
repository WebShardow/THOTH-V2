import { NextResponse } from 'next/server';
import { getAutomationConfig, saveAutomationConfig } from '@/lib/automation/service';

export async function GET() {
  try {
    return NextResponse.json(await getAutomationConfig());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load automation config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { apiKey?: string };
    if (!body.apiKey?.trim()) {
      return NextResponse.json({ error: 'API key is required.' }, { status: 400 });
    }
    return NextResponse.json(await saveAutomationConfig(body.apiKey.trim()));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save automation config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

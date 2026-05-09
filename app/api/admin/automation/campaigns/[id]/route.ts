import { NextResponse } from 'next/server';
import { deleteCampaign, updateCampaign } from '@/lib/automation/service';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(await updateCampaign(id, body));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteCampaign(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

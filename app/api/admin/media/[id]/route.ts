import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStorageAdapter } from '@/lib/storage';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const adapter = getStorageAdapter();
    await adapter.remove({ key: media.storageKey, url: media.url });
    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}

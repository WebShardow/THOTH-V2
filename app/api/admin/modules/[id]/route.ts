import { NextResponse } from 'next/server';
import {
  canWriteExtensions,
  getExtensionById,
  setExtensionEnabled,
  uninstallExtension,
  validateExtension,
} from '@/lib/extensions/registry';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json({ item: getExtensionById(id) });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 404 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { action?: string };

    if (body.action === 'enable') {
      return NextResponse.json({ success: true, item: setExtensionEnabled(id, true) });
    }

    if (body.action === 'disable') {
      return NextResponse.json({ success: true, item: setExtensionEnabled(id, false) });
    }

    if (body.action === 'validate') {
      return NextResponse.json({ success: true, item: validateExtension(id) });
    }

    return NextResponse.json({ error: 'Unsupported action. Use enable, disable, or validate.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!canWriteExtensions()) {
      return NextResponse.json(
        { error: 'Extension uninstall is disabled in this environment.' },
        { status: 403 },
      );
    }

    return NextResponse.json(uninstallExtension(id));
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

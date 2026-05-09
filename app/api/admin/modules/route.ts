import { NextResponse } from 'next/server';
import {
  canWriteExtensions,
  getExtensionsDir,
  installExtensionArchive,
  listInstalledExtensions,
  CMS_EXTENSION_API_VERSION,
} from '@/lib/extensions/registry';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET() {
  try {
    return NextResponse.json({
      apiVersion: CMS_EXTENSION_API_VERSION,
      installMode: canWriteExtensions() ? 'filesystem-write' : 'manual-only',
      extensionsDir: getExtensionsDir(),
      items: listInstalledExtensions(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to read extensions: ${getErrorMessage(error)}` },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please upload a .zip extension package.' }, { status: 400 });
    }

    const installed = await installExtensionArchive(file);

    return NextResponse.json({
      success: true,
      item: installed,
      message: `Extension '${installed.manifest?.name ?? installed.directoryName}' installed successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}

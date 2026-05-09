import { readdirSync, existsSync, mkdirSync, readFileSync, rmSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CMS_EXTENSION_API_VERSION,
  type ExtensionManifest,
  sanitizeExtensionId,
  validateExtensionManifest,
} from './validator';

const EXTENSION_STATE_FILE = '.cms-extension-state.json';
const REGISTRY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXTENSIONS_DIR = path.join(REGISTRY_ROOT, 'extensions');
const EXTENSION_TMP_DIR = path.join(REGISTRY_ROOT, 'tmp', 'extensions');

export { CMS_EXTENSION_API_VERSION };
export type { ExtensionManifest } from './validator';

export type InstalledExtension = {
  directoryName: string;
  directoryPath: string;
  manifestPath: string | null;
  status: 'ready' | 'invalid';
  manifest: ExtensionManifest | null;
  errors: string[];
  state: ExtensionLifecycleState | null;
};

export type ExtensionLifecycleState = {
  enabled: boolean;
  installedAt: string;
  updatedAt: string;
  lastValidatedAt: string | null;
};

export function getExtensionsDir() {
  return EXTENSIONS_DIR;
}

export function canWriteExtensions() {
  return process.env.EXTENSIONS_WRITE_ENABLED === 'true';
}

export function ensureExtensionsDir() {
  mkdirSync(EXTENSIONS_DIR, { recursive: true });
  return EXTENSIONS_DIR;
}

function getStatePath(directoryPath: string) {
  return path.join(directoryPath, EXTENSION_STATE_FILE);
}

function nowIso() {
  return new Date().toISOString();
}

function readState(directoryPath: string): ExtensionLifecycleState | null {
  const statePath = getStatePath(directoryPath);
  if (!existsSync(statePath)) return null;

  try {
    const parsed = JSON.parse(readFileSync(statePath, 'utf8')) as Partial<ExtensionLifecycleState>;
    return {
      enabled: parsed.enabled ?? true,
      installedAt: parsed.installedAt ?? nowIso(),
      updatedAt: parsed.updatedAt ?? nowIso(),
      lastValidatedAt: parsed.lastValidatedAt ?? null,
    };
  } catch {
    return null;
  }
}

function writeState(directoryPath: string, nextState: ExtensionLifecycleState) {
  writeFileSync(getStatePath(directoryPath), JSON.stringify(nextState, null, 2), 'utf8');
}

function ensureState(directoryPath: string) {
  const current = readState(directoryPath);
  if (current) return current;

  const initial: ExtensionLifecycleState = {
    enabled: true,
    installedAt: nowIso(),
    updatedAt: nowIso(),
    lastValidatedAt: null,
  };
  writeState(directoryPath, initial);
  return initial;
}

function buildExtension(directoryPath: string): InstalledExtension {
  const manifestPath = path.join(directoryPath, 'extension.json');

  if (!existsSync(manifestPath)) {
    return {
      directoryName: path.basename(directoryPath),
      directoryPath,
      manifestPath: null,
      status: 'invalid',
      manifest: null,
      errors: ['Missing extension.json manifest.'],
      state: readState(directoryPath),
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
    const { manifest, errors } = validateExtensionManifest(parsed, directoryPath);
    const state = ensureState(directoryPath);

    return {
      directoryName: path.basename(directoryPath),
      directoryPath,
      manifestPath,
      status: errors.length === 0 ? 'ready' : 'invalid',
      manifest,
      errors,
      state,
    };
  } catch (error) {
    return {
      directoryName: path.basename(directoryPath),
      directoryPath,
      manifestPath,
      status: 'invalid',
      manifest: null,
      errors: [error instanceof Error ? error.message : 'Failed to read manifest.'],
      state: readState(directoryPath),
    };
  }
}

export function listInstalledExtensions(): InstalledExtension[] {
  const extensionsDir = ensureExtensionsDir();

  return readdirSync(extensionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => buildExtension(path.join(extensionsDir, entry.name)))
    .sort((a, b) => a.directoryName.localeCompare(b.directoryName));
}

export function getExtensionById(id: string) {
  const all = listInstalledExtensions();
  const exact = all.find(
    (item) => item.manifest?.id === id || item.directoryName === sanitizeExtensionId(id),
  );

  if (!exact) {
    throw new Error(`Extension '${id}' was not found.`);
  }

  return exact;
}

function resolveExtractedRoot(stagingDir: string) {
  const directManifest = path.join(stagingDir, 'extension.json');
  if (existsSync(directManifest)) return stagingDir;

  const nestedDirectories = readdirSync(stagingDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(stagingDir, entry.name));

  for (const dir of nestedDirectories) {
    if (existsSync(path.join(dir, 'extension.json'))) {
      return dir;
    }
  }

  throw new Error('Uploaded package does not contain extension.json at the root of the archive.');
}

async function expandZipOnWindows(zipPath: string, stagingDir: string) {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execFileAsync = promisify(execFile);

  await execFileAsync('powershell', [
    '-NoProfile',
    '-Command',
    `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${stagingDir.replace(/'/g, "''")}' -Force`,
  ]);
}

export async function installExtensionArchive(file: File) {
  if (!canWriteExtensions()) {
    throw new Error('Extension installer is disabled. Set EXTENSIONS_WRITE_ENABLED=true to enable filesystem installation.');
  }

  if (process.platform !== 'win32') {
    throw new Error('ZIP installation is currently supported only on Windows hosts. Use manual extraction into the extensions directory for Linux or container deployments.');
  }

  if (!file.name.endsWith('.zip')) {
    throw new Error('Please upload a valid .zip file.');
  }

  const extensionsDir = ensureExtensionsDir();
  mkdirSync(EXTENSION_TMP_DIR, { recursive: true });

  const fileBase = sanitizeExtensionId(file.name.replace(/\.zip$/i, '')) || `extension-${Date.now()}`;
  const zipPath = path.join(EXTENSION_TMP_DIR, `${Date.now()}-${fileBase}.zip`);
  const stagingDir = path.join(EXTENSION_TMP_DIR, `${Date.now()}-${fileBase}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(zipPath, buffer);
  mkdirSync(stagingDir, { recursive: true });

  try {
    await expandZipOnWindows(zipPath, stagingDir);

    const extractedRoot = resolveExtractedRoot(stagingDir);
    const extension = buildExtension(extractedRoot);

    if (!extension.manifest || extension.errors.length > 0) {
      throw new Error(extension.errors.join(' '));
    }

    const destination = path.join(extensionsDir, sanitizeExtensionId(extension.manifest.id));
    if (existsSync(destination)) {
      throw new Error(`Extension '${extension.manifest.id}' is already installed.`);
    }

    renameSync(extractedRoot, destination);
    ensureState(destination);

    return buildExtension(destination);
  } finally {
    if (existsSync(zipPath)) rmSync(zipPath, { force: true });
    if (existsSync(stagingDir)) rmSync(stagingDir, { recursive: true, force: true });
  }
}

export function setExtensionEnabled(id: string, enabled: boolean) {
  const extension = getExtensionById(id);
  if (extension.status !== 'ready') {
    throw new Error('Cannot change lifecycle state for an invalid extension. Validate it first.');
  }

  const current = ensureState(extension.directoryPath);
  const nextState: ExtensionLifecycleState = {
    ...current,
    enabled,
    updatedAt: nowIso(),
  };
  writeState(extension.directoryPath, nextState);
  return buildExtension(extension.directoryPath);
}

export function validateExtension(id: string) {
  const extension = getExtensionById(id);
  const current = ensureState(extension.directoryPath);
  const nextState: ExtensionLifecycleState = {
    ...current,
    enabled: extension.status === 'ready' ? current.enabled : false,
    updatedAt: nowIso(),
    lastValidatedAt: nowIso(),
  };
  writeState(extension.directoryPath, nextState);
  return buildExtension(extension.directoryPath);
}

export function uninstallExtension(id: string) {
  if (!canWriteExtensions()) {
    throw new Error('Extension uninstall is disabled. Set EXTENSIONS_WRITE_ENABLED=true to allow filesystem changes.');
  }

  const extension = getExtensionById(id);
  rmSync(extension.directoryPath, { recursive: true, force: true });
  return { success: true, id };
}

import { existsSync } from 'node:fs';
import path from 'node:path';

export const CMS_EXTENSION_API_VERSION = '1';

export type ExtensionManifest = {
  id: string;
  name: string;
  version: string;
  apiVersion: string;
  description?: string;
  author?: string;
  website?: string;
  capabilities?: string[];
  entrypoints?: {
    adminPage?: string;
    api?: string;
    hooks?: string;
  };
};

function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSafeRelativeEntrypoint(value: string) {
  return value.startsWith('./') && !value.includes('..');
}

export function sanitizeExtensionId(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
}

export function validateExtensionManifest(raw: unknown, directoryPath?: string) {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { manifest: null, errors: ['Manifest must be a JSON object.'] };
  }

  const candidate = raw as Record<string, unknown>;
  const manifest: ExtensionManifest = {
    id: String(candidate.id ?? '').trim(),
    name: String(candidate.name ?? '').trim(),
    version: String(candidate.version ?? '').trim(),
    apiVersion: String(candidate.apiVersion ?? '').trim(),
    description: isNonEmptyString(candidate.description) ? String(candidate.description).trim() : undefined,
    author: isNonEmptyString(candidate.author) ? String(candidate.author).trim() : undefined,
    website: isNonEmptyString(candidate.website) ? String(candidate.website).trim() : undefined,
    capabilities: Array.isArray(candidate.capabilities) ? candidate.capabilities.map((item) => String(item).trim()).filter(Boolean) : [],
    entrypoints:
      candidate.entrypoints && typeof candidate.entrypoints === 'object'
        ? {
            adminPage: isNonEmptyString((candidate.entrypoints as Record<string, unknown>).adminPage)
              ? String((candidate.entrypoints as Record<string, unknown>).adminPage).trim()
              : undefined,
            api: isNonEmptyString((candidate.entrypoints as Record<string, unknown>).api)
              ? String((candidate.entrypoints as Record<string, unknown>).api).trim()
              : undefined,
            hooks: isNonEmptyString((candidate.entrypoints as Record<string, unknown>).hooks)
              ? String((candidate.entrypoints as Record<string, unknown>).hooks).trim()
              : undefined,
          }
        : undefined,
  };

  if (!manifest.id) errors.push('Missing required field: id');
  if (!manifest.name) errors.push('Missing required field: name');
  if (!manifest.version) errors.push('Missing required field: version');
  if (!manifest.apiVersion) errors.push('Missing required field: apiVersion');

  if (manifest.id && manifest.id !== sanitizeExtensionId(manifest.id)) {
    errors.push('Extension id must use lowercase letters, numbers, dots, underscores, or hyphens only.');
  }

  if (manifest.apiVersion && manifest.apiVersion !== CMS_EXTENSION_API_VERSION) {
    errors.push(`Unsupported apiVersion '${manifest.apiVersion}'. Expected '${CMS_EXTENSION_API_VERSION}'.`);
  }

  const capabilitySet = new Set<string>();
  for (const capability of manifest.capabilities ?? []) {
    if (capabilitySet.has(capability)) {
      errors.push(`Duplicate capability '${capability}' is not allowed.`);
    }
    capabilitySet.add(capability);
  }

  if (manifest.entrypoints) {
    for (const [label, value] of Object.entries(manifest.entrypoints)) {
      if (!value) continue;
      if (!isSafeRelativeEntrypoint(value)) {
        errors.push(`Entrypoint '${label}' must be a safe relative path starting with './'.`);
        continue;
      }
      if (directoryPath) {
        const resolved = path.join(directoryPath, value);
        if (!existsSync(resolved)) {
          errors.push(`Entrypoint '${label}' does not exist: ${value}`);
        }
      }
    }
  }

  return { manifest, errors };
}

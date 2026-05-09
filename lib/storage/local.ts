import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorageAdapter, StorageUploadInput, StorageUploadResult } from './types';

const STORAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOCAL_UPLOAD_DIR = path.join(STORAGE_ROOT, 'public', 'uploads');

function normalizeLocalKey(input: string) {
  return input.replace(/^\/+/, '').replace(/^uploads\//, '');
}

function getUploadDir() {
  return LOCAL_UPLOAD_DIR;
}

function getUrlBase() {
  return process.env.LOCAL_UPLOAD_URL_BASE?.trim() || '/uploads';
}

function ensureDir() {
  const dir = getUploadDir();
  mkdirSync(dir, { recursive: true });
  return dir;
}

function sanitizeFilename(filename: string) {
  const ext = path.extname(filename) || '.bin';
  const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${base || 'file'}-${Date.now()}${ext.toLowerCase()}`;
}

function buildResult(fileName: string): StorageUploadResult {
  const key = `uploads/${fileName}`;
  const urlBase = getUrlBase().replace(/\/$/, '');
  return {
    provider: 'local',
    key,
    url: `${urlBase}/${fileName}`,
  };
}

export const localStorageAdapter: StorageAdapter = {
  name: 'local',
  async upload(input: StorageUploadInput) {
    const fileName = sanitizeFilename(input.filename);
    const uploadDir = ensureDir();
    writeFileSync(path.join(uploadDir, fileName), input.buffer);
    return buildResult(fileName);
  },
  async remove(target) {
    const keySource = target.key ?? target.url ?? '';
    if (!keySource) return;

    const normalized = normalizeLocalKey(keySource.replace(/^\/+/, ''));
    const filePath = path.join(getUploadDir(), path.basename(normalized));
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  },
};

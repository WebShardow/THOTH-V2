import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'node:path';
import type { StorageAdapter, StorageUploadInput, StorageUploadResult } from './types';

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for S3-compatible storage.`);
  }
  return value;
}

function getClient() {
  return new S3Client({
    region: process.env.S3_REGION?.trim() || 'auto',
    endpoint: requireEnv('S3_ENDPOINT'),
    credentials: {
      accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });
}

function getBucket() {
  return requireEnv('S3_BUCKET');
}

function sanitizeFilename(filename: string) {
  const ext = path.extname(filename) || '.bin';
  const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${base || 'file'}-${Date.now()}${ext.toLowerCase()}`;
}

function getPublicUrl(key: string) {
  const configured = process.env.S3_PUBLIC_URL_BASE?.trim();
  if (configured) {
    return `${configured.replace(/\/$/, '')}/${key}`;
  }

  const endpoint = requireEnv('S3_ENDPOINT').replace(/\/$/, '');
  return `${endpoint}/${getBucket()}/${key}`;
}

export const s3StorageAdapter: StorageAdapter = {
  name: 's3',
  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const client = getClient();
    const key = `uploads/${sanitizeFilename(input.filename)}`;

    await client.send(new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: input.buffer,
      ContentType: input.contentType,
    }));

    return {
      provider: process.env.STORAGE_DRIVER?.trim() || 's3',
      key,
      url: getPublicUrl(key),
    };
  },
  async remove(target) {
    const key = target.key?.trim();
    if (!key) return;

    const client = getClient();
    await client.send(new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }));
  },
};

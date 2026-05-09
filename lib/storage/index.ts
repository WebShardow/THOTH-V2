import { localStorageAdapter } from './local';
import { s3StorageAdapter } from './s3';
import type { StorageAdapter } from './types';

function getDriverName() {
  return (process.env.STORAGE_DRIVER?.trim() || 'local').toLowerCase();
}

export function getStorageAdapter(): StorageAdapter {
  const driver = getDriverName();

  switch (driver) {
    case 'local':
      return localStorageAdapter;
    case 's3':
    case 'r2':
      return s3StorageAdapter;
    default:
      throw new Error(`Unsupported storage driver '${driver}'. Configure STORAGE_DRIVER=local, s3, or r2.`);
  }
}

export type { StorageAdapter, StorageUploadInput, StorageUploadResult } from './types';

export type StorageUploadInput = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

export type StorageUploadResult = {
  provider: string;
  key: string;
  url: string;
};

export type StorageAdapter = {
  name: string;
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  remove(target: { key?: string | null; url?: string | null }): Promise<void>;
};

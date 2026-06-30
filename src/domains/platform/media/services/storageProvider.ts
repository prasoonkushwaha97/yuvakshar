export interface StorageUploadResult {
  url: string;
  thumbnailUrl?: string;
  sizeBytes: number;
  mimeType: string;
  extension: string;
}

export interface IStorageProvider {
  /**
   * Uploads a raw file to the storage provider.
   */
  upload(file: File, path: string): Promise<StorageUploadResult>;
  
  /**
   * Deletes a file from the storage provider.
   */
  delete(path: string): Promise<boolean>;
  
  /**
   * Generates a signed, short-lived URL for private assets.
   */
  getSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}

export type MediaType = "image" | "document";

export interface MediaMetadata {
  width?: number;
  height?: number;
  sizeBytes: number;
  mimeType: string;
  extension: string;
  
  // EXIF / IPTC Data
  cameraModel?: string;
  focalLength?: string;
  aperture?: string;
  iso?: string;
  shutterSpeed?: string;
  dateTaken?: string;
  
  // Editorial Data
  altText?: string;
  caption?: string;
  copyright?: string;
  photographerCredit?: string;
  location?: string;
}

export interface MediaFolder {
  id: string;
  parentId: string | null;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  folderId: string | null;
  filename: string;
  url: string; // The CDN or Storage URL
  thumbnailUrl?: string;
  
  type: MediaType;
  metadata: MediaMetadata;
  
  tags: string[];
  
  // Usage tracking (e.g. how many articles use this image)
  usageCount: number;
  
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

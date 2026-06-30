export type BlockType = 
  | "heading" 
  | "paragraph" 
  | "image" 
  | "gallery" 
  | "quote" 
  | "pull_quote" 
  | "divider" 
  | "list" 
  | "table" 
  | "video" 
  | "audio" 
  | "embed" 
  | "html" 
  | "code" 
  | "callout";

export interface BaseBlock {
  id: string; // Unique UUID for the block
  type: BlockType;
  order: number; // For manual sorting if needed, though array position implies order
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  content: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  content: {
    text: string; // HTML-safe string (for inline bold/italic) or raw text
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  content: {
    url: string;
    altText?: string;
    caption?: string;
    photographerCredit?: string;
    copyright?: string;
  };
  settings?: {
    layout?: "full" | "wide" | "normal";
  };
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  content: {
    text: string;
    author?: string;
    source?: string;
  };
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  content: Record<string, never>;
}

// ... other blocks can be defined similarly as needed ...

export type EditorBlock = 
  | HeadingBlock 
  | ParagraphBlock 
  | ImageBlock 
  | QuoteBlock 
  | DividerBlock;

/**
 * Universal Content Document
 * The single source of truth for all structured content across the CMS.
 */
export interface ContentDocument {
  schemaVersion: 1;
  id: string; // Document ID (e.g. Article ID)
  blocks: EditorBlock[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

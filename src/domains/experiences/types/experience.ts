export type ExperienceType = 
  | "homepage" 
  | "category_page" 
  | "article_page" 
  | "landing_page" 
  | "static_page";

export type PublishingStatus = 
  | "draft" 
  | "scheduled" 
  | "published" 
  | "expired" 
  | "archived";

export interface ExperienceMetadata {
  title: string;
  slug: string;
  description?: string;
  openGraphImage?: string;
  canonicalUrl?: string;
  robots?: string;
}

export interface ExperienceTheme {
  primaryColor?: string;
  accentColor?: string;
  typography?: string;
  sectionRadius?: string;
  containerWidth?: string;
}

export interface LayoutConfig {
  id: string; // e.g., 'classic_newspaper', 'masonry'
  slots: Record<string, any>; 
}

export interface ContentSourceConfig {
  sourceType: "category" | "tag" | "author" | "editorial_picks" | "trending" | "manual";
  sourceId?: string; // e.g., Category ID
  limit?: number;
}

export interface ExperienceSection {
  id: string; // Unique instance ID
  registryId: string; // References the SectionRegistry (e.g. 'hero_section', 'latest_news')
  order: number;
  isHidden: boolean;
  
  layout: LayoutConfig;
  contentSource?: ContentSourceConfig;
  
  // Custom JSON configuration specific to this section
  config: Record<string, any>; 
}

export interface Experience {
  id: string;
  type: ExperienceType;
  name: string; // Internal name e.g., "Diwali Festival Homepage"
  
  metadata: ExperienceMetadata;
  theme: ExperienceTheme;
  
  sections: ExperienceSection[];
  
  status: PublishingStatus;
  scheduledPublishAt?: string;
  scheduledExpireAt?: string;
  
  authorId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

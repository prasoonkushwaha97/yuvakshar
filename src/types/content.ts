export type ArticleStatus =
  | "draft"
  | "in_review"
  | "fact_check"
  | "editor_review"
  | "scheduled"
  | "published"
  | "archived";

export interface Category {
  id: string;
  name_hi: string;
  name_en?: string;
  slug: string;
  description_hi?: string;
  description_en?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  parent_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    articles: number;
  };
  // Optional relations
  parent?: Category;
  children?: Category[];
  creator?: {
    name: string;
    avatar_url: string;
  };
  updater?: {
    name: string;
    avatar_url: string;
  };
}

export interface Article {
  id: string;
  title_hi: string;
  title_en?: string;
  slug: string;
  summary_hi?: string;
  summary_en?: string;
  content: string;
  cover_image?: string;
  category_id?: string | null;
  author_id?: string | null;
  reviewer_id?: string | null;
  editor_id?: string | null;
  status: ArticleStatus;
  content_type: string;
  access_level: string;
  section: string;
  is_featured: boolean;
  is_highlighted: boolean;
  requires_eic_approval: boolean;
  published_at?: string | null;
  scheduled_publish_at?: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  bookmark_count: number;
  share_count: number;
  comment_count: number;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  language: string;
  
  // Relations
  categories?: {
    id: string;
    name_hi: string;
    slug: string;
    color: string;
  } | null;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string;
  } | null;
  reviewer?: {
    id: string;
    name: string;
  } | null;
  editor?: {
    id: string;
    name: string;
  } | null;
}

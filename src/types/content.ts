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
  read_time?: string;
  
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
    username: string;
    slug?: string;
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

export type MagazineStatus = 'draft' | 'in_production' | 'ready_for_publish' | 'scheduled' | 'published' | 'archived';

export interface MagazineIssue {
  id: string;
  title: string;
  slug: string;
  cover_image?: string;
  volume?: number;
  issue_number?: number;
  month?: number;
  year?: number;
  editorial_note?: string;
  status: MagazineStatus;
  published_at?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MagazineSection {
  id: string;
  issue_id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface MagazineIssueArticle {
  issue_id: string;
  article_id: string;
  section_id?: string;
  sort_order: number;
  added_by?: string;
  created_at: string;
  article?: Article;
}

export interface ReviewNote {
  id: string;
  article_id: string;
  reviewer_id: string;
  parent_id?: string;
  note: string;
  decision?: 'approve' | 'request_changes' | 'reject' | null;
  created_at: string;
  updated_at: string;
  reviewer?: {
    id: string;
    name: string;
    avatar_url: string;
  };
  replies?: ReviewNote[];
}

export interface ArticleAssignment {
  id: string;
  article_id: string;
  user_id: string;
  role_type: 'reviewer' | 'editor' | 'fact_checker';
  assigned_by?: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

export interface WorkflowHistory {
  id: string;
  article_id: string;
  old_status?: ArticleStatus;
  new_status: ArticleStatus;
  actor_id: string;
  notes?: string;
  created_at: string;
  actor?: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

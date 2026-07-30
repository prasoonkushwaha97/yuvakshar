/**
 * Yuvakshar Admin Shared Types
 * 
 * This file contains all shared TypeScript interfaces used across the CMS.
 * Kept in a separate file (not "use client") to avoid Turbopack static analysis 
 * issues when importing types from client components.
 */

// ─── Article & Magazine ────────────────────────────────────────────────────
// These are re-exported from fallbackData for convenience
export interface Article {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorProfile?: Profile;
  authorRole: string;
  authorAvatar?: string;
  category: string;
  date: string;
  image?: string;
  summary: string;
  content: string;
  readTime: string;
  tags: string[];
  trending?: boolean;
  is_editor_pick?: boolean;
  editor_pick_order?: number;
  editor_pick_at?: string | null;
  editor_pick_by?: string | null;
  status?: string;
  section?: string;
  [key: string]: any;
}

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  cover_url?: string;
  website?: string;
  location?: string;
  role?: string;
  status?: string;
  verified?: boolean;
}

export interface MagazineIssue {
  id: string;
  issue: string;
  edition?: string;
  month: string;
  year?: string;
  coverImage: string;
  description: string;
  pages: string[]; // Array of image URLs representing pages
  category?: string;
  accessLevel?: "Free" | "Premium" | "Patron";
  status?: "Draft" | "Published" | "Archived";
  publishDate?: string;
  pdfSourceUrl?: string; // Optional raw PDF for download purposes only
  isFeatured?: boolean;
  isRecommended?: boolean;
}

export type Magazine = MagazineIssue;

// ─── User & Profile ────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  name: string;
  username: string;
  verified?: boolean;
  username_changed_at?: string;
  previous_username?: string;
  role: "Founder" | "Admin" | "Editor" | "Normal User" | null;
  status: "active" | "suspended" | "pending" | "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Resigned";
  password?: string;
  department?: string; // Hindi department identifier
  org_id?: string;     // e.g. YUV-ED-0001
  suspended_by?: string | null;
  provisional_password?: boolean;
  force_password_change?: boolean;
  state?: string;
  city?: string;
  country?: string;
  district?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  avatar_url?: string;
  social_links?: Record<string, string>;
  badges?: string[];
  views_count?: number;
  email?: string;
  mobile?: string;
  interests?: string[];
  dob?: string;
  gender?: string;
  location?: string;
  joinDate?: string;
  articlesReadCount?: number;
  totalReadingTime?: number;
  categoryStats?: Record<string, number>;
  bookmarks?: string[];
  
  // Author Ecosystem 2.0 extensions
  slug?: string;
  // Profile Banner Management extensions
  custom_banner_url?: string;
  selected_gallery_banner_id?: string;
  cover_url?: string;
  website?: string;
  designation?: string;
  current_role?: string;
  verification_badge?: "Verified Author" | "Verified Researcher" | "Editorial Team" | "Editor" | "Admin" | "Founder" | null;
  institution?: string;
  expertise_tags?: string[];
  orcid_id?: string;
  google_scholar_url?: string;
  academic_credentials?: string[];
  education?: string;
  academic_background?: string;
  research_interests?: string;
  professional_experience?: string;
  social_contributions?: string;
  publications_list?: string;
  timeline?: Array<{ id: string; title: string; description: string; date: string; type?: string }>;
  portfolio?: Array<{ id: string; name: string; url: string; type: "book" | "research_paper" | "report" | "white_paper" | "resume" | "other"; is_public: boolean }>;
  achievements?: Array<{ id: string; title: string; description?: string; year?: string; image_url?: string }>;
  social_posts_count?: number;
  social_replies_count?: number;
  groups_count?: number;
  featured?: boolean;
  publicVisibility?: boolean;

}

// ─── Comment ───────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  article_id: string;
  parent_id: string | null;
  name: string;
  user_id?: string | null;
  authorProfile?: Profile;
  content: string;
  likes: number;
  status: "approved" | "pending" | "spam" | "deleted";
  is_reported: boolean;
  created_at: string;
}

// ─── Submission ────────────────────────────────────────────────────────────
export interface Submission {
  id: string;
  type: "contact" | "feedback" | "suggestion" | "report" | "article";
  name: string;
  email: string;
  mobile?: string;
  subject?: string;
  content: string;
  status: "New" | "Open" | "In Progress" | "Resolved" | "Archived";
  replies?: any[];
  category?: string;
  title?: string;
  image_url?: string;
  pdf_url?: string;
  doc_url?: string;
  created_at: string;
}

// ─── Editorial Assignment ──────────────────────────────────────────────────
export interface EditorialAssignment {
  id: string;
  article_id: string;
  submission_id?: string;
  article_title?: string;
  author_name?: string;
  reviewer_name?: string;
  author_id?: string;
  reviewer_id?: string;
  section_editor_id?: string;
  deadline?: string;
  status: "Assigned" | "In Progress" | "Under Review" | "Completed" | "Revision Requested";
  created_at: string;
}

// ─── Ad ────────────────────────────────────────────────────────────────────
export interface Ad {
  id: string;
  name: string;
  zone: "after_first_p" | "mid_content" | "before_related";
  type: "adsense" | "custom_html" | "banner";
  code?: string;
  image_url?: string;
  link_url?: string;
  active: boolean;
  impression_count: number;
  click_count: number;
}

// ─── Quiz ──────────────────────────────────────────────────────────────────
export interface QuizAttempt {
  id: string;
  userId: string;
  userName: string;
  articleId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  durationSeconds: number;
  timestamp: string;
  answers: Record<number, string>;
}

export interface QuizSettings {
  articleId: string;
  isEnabled: boolean;
  questionCount: number;
  difficulty: "सरल" | "मध्यम" | "उन्नत";
}

export interface QuizLeaderboardEntry {
  id: string;
  userName: string;
  score: number;
  completedQuizzes: number;
  interval: "weekly" | "monthly" | "alltime";
}

// ─── Membership ────────────────────────────────────────────────────────────

// ─── Other ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  language_code: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  language_code: string;
}

export interface SearchAnalytics {
  id: string;
  query: string;
  search_count: number;
  click_count: number;
  zero_results: boolean;
  updated_at: string;
}

export interface HomepageLayout {
  id: string;
  name: string;
  layout_json: {
    hero_story_id: string;
    sections_order: string[];
    visible_sections: Record<string, boolean>;
  };
  version: number;
  is_published: boolean;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface TopicMastery {
  userId: string;
  category: string;
  badges: string[];
}

export interface MonthlyReport {
  id: string;
  userId: string;
  monthYear: string;
  articlesRead: number;
  quizzesAttempted: number;
  averageScore: number;
  bestCategory: string;
  studyTimeSeconds: number;
  growthPercentage: number;
}

export interface AiSettings {
  enabledModules: Record<string, boolean>;
  apiProvider: "OpenAI" | "Gemini";
  apiKeys: { openai: string; gemini: string; };
  tokenLimit: number;
  tokensUsed: number;
  usageAnalytics: Array<{ date: string; tokensUsed: number; cost: number; feature: string; }>;
  accessRules: Record<string, "Free" | "Premium" | "Patron">;
}

export interface AiNote {
  id: string;
  userId: string;
  content: string;
  articleId?: string;
  createdAt: string;
  tags?: string[];
}

export interface DonationRecord {
  id: string;
  name: string;
  email: string;
  amount: number;
  message?: string;
  date: string;
}

export interface GeneralSettings {
  site_name: string;
  tagline: string;
  primary_email: string;
  editorial_email: string;
  support_email: string;
  notification_email: string;
}

export interface AppearanceSettings {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  logo_url: string;
  favicon_url: string;
  font_headlines: string;
  font_body: string;
}

export interface FooterSettings {
  copyright_text: string;
  links: Array<{ name: string; href: string }>;
}

// ─── Organizational Governance Extensions ──────────────────────────────────
export interface OrgTask {
  id: string;
  title: string;
  description: string;
  assigned_by: string;
  assigned_by_name: string;
  assigned_to: string;
  assigned_to_name: string;
  department: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  due_date: string;
  attachments?: string[];
  status: "Pending" | "In Progress" | "Completed" | "Rejected" | "Needs Revision";
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  badge_requested: string;
  status: "Pending" | "Approved" | "Rejected";
  supporting_docs?: string;
  review_notes?: string;
  decision_notes?: string;
  decided_by?: string;
  decided_by_name?: string;
  decided_at?: string;
  created_at: string;
}

export interface OrgAuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
  severity: "Info" | "Warning" | "Critical";
}

export interface RoleTransfer {
  id: string;
  user_id: string;
  user_name: string;
  old_role: string;
  new_role: string;
  changed_by: string;
  changed_by_name: string;
  date: string;
}

export interface PrivateMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  receiver_name: string;
  content: string;
  timestamp: string;
  read: boolean;
  reply_to?: string;
  forwarded?: boolean;
  reactions?: Record<string, string[]>;
  pinned?: boolean;
  archived_by?: string[];
}

export interface BannerGalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  status: "active" | "disabled";
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}


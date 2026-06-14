/**
 * Yuvakshar CMS Shared Types
 * 
 * This file contains all shared TypeScript interfaces used across the CMS.
 * Kept in a separate file (not "use client") to avoid Turbopack static analysis 
 * issues when importing types from client components.
 */

// ─── Article & Magazine ────────────────────────────────────────────────────
// These are re-exported from mockData for convenience
export type { Article } from "@/lib/mockData";

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
  role: "Founder" | "संस्थापक" | "सह-संस्थापक" | "प्रधान प्रशासक" | "प्रशासक" | "प्रधान संपादक" | "कार्यकारी संपादक" | "वरिष्ठ संपादक" | "संपादक" | "सहायक संपादक" | "समुदाय प्रबंधक" | "समुदाय मॉडरेटर" | "समूह व्यवस्थापक" | "समूह मॉडरेटर" | "प्रूफरीडर" | "भाषा समीक्षक" | "कार्यक्रम समन्वयक" | "चुनौती समन्वयक" | "प्रमाणपत्र प्रबंधक" | "स्वयंसेवक" | "प्रशिक्षु" | "सदस्य" | "Owner" | "Admin" | "Editor-in-Chief" | "Managing Editor" | "Editor" | "Sub Editor" | "Fact Checker" | "Reviewer" | "Author" | "Contributor" | "Fact Check Reviewer" | null;
  status: "active" | "suspended" | "pending" | "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Resigned";
  password?: string;
  department?: string; // Hindi department identifier
  org_id?: string;     // e.g. YUV-ED-0001
  suspended_by?: string | null;
  temporary_password?: boolean;
  force_password_change?: boolean;
  state?: string;
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
  
  // Author Ecosystem 2.0 extensions
  slug?: string;
  cover_banner?: string;
  designation?: string;
  current_role?: string;
  verification_badge?: "Verified Author" | "Verified Researcher" | "Editorial Team" | "Editor" | "Managing Editor" | "Editor-in-Chief" | "Founder" | null;
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
  followers?: string[];
  following?: string[];
  social_posts_count?: number;
  social_replies_count?: number;
  groups_count?: number;
  featured?: boolean;
  publicVisibility?: boolean;
}

// ─── Video ─────────────────────────────────────────────────────────────────
export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  category: "समाचार" | "विशेष रिपोर्ट" | "साक्षात्कार" | "विचार" | "साहित्य" | "शिक्षा" | "पर्यावरण" | "इतिहास" | "पत्रिका विशेष" | "युवाक्षर संवाद";
  thumbnailUrl?: string;
  isFeatured: boolean;
  isShorts: boolean;
  status: "Draft" | "Published";
  publishDate: string;
  viewCount?: number;
  duration?: string;
}

// ─── Comment ───────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  article_id: string;
  parent_id: string | null;
  name: string;
  user_id?: string | null;
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
  article_title?: string;
  author_name?: string;
  reviewer_name?: string;
  author_id?: string;
  reviewer_id?: string;
  section_editor_id?: string;
  deadline?: string;
  status: "Assigned" | "In Progress" | "Under Review" | "Completed";
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

export interface QuizCertificate {
  id: string;
  userId: string;
  userName: string;
  articleTitle: string;
  score: number;
  percentage: number;
  date: string;
  certificateType: "सहभागिता प्रमाणपत्र" | "उत्कृष्टता प्रमाणपत्र" | "ज्ञानवीर प्रमाणपत्र";
  badge: string;
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
  certificatesCount: number;
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
  certificatesCount: number;
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
  newsletter_email: string;
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


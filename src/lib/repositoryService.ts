import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { 
  Profile, 
  Article, 
  Magazine, 
  Comment, 
  Submission, 
  Ad, 
  HomepageLayout, 
  ActivityLog,
  Category,
  Tag,
  QuizAttempt,

  QuizSettings,
  DonationRecord,
  Video
} from "@/store/types";

/**
 * Helper to check if running in browser
 */
const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Helper to safely get item from localStorage
 */
const getLocalItem = (key: string, fallback: string = "[]"): string => {
  if (!isBrowser()) return fallback;
  return localStorage.getItem(key) || fallback;
};

/**
 * Helper to safely set item in localStorage
 */
const setLocalItem = (key: string, value: string): void => {
  if (isBrowser()) {
    localStorage.setItem(key, value);
  }
};

// ─── AUTHOR LITERARY IDENTITY ENGINE ───────────────────────────────────────

/**
 * Get dynamic literary identity tags for a profile based on roles, interests, and publications
 */
export const getLiteraryIdentities = (
  profile: Profile,
  authorArticles: Article[] = []
): string[] => {
  const identities: string[] = [];

  // 1. Role-based identities
  if (profile.role === "Owner" || profile.role === "Editor-in-Chief") {
    identities.push("संपादकीय सहयोगी");
  } else if (profile.role === "Reviewer" || profile.role === "Fact Checker" || profile.role === "Fact Check Reviewer") {
    identities.push("समीक्षक");
  }

  // 2. Verification badge-based identities
  if (profile.verification_badge === "Verified Researcher") {
    identities.push("शोधार्थी");
  }

  // 3. Interest-based identities
  if (profile.interests && profile.interests.length > 0) {
    const ints = profile.interests.map(i => i.toLowerCase());
    if (ints.some(i => i.includes("कविता") || i.includes("काव्य") || i.includes("कवि") || i.includes("poetry"))) {
      identities.push("कवि");
    }
    if (ints.some(i => i.includes("कहानी") || i.includes("कथा") || i.includes("उपन्यास") || i.includes("story"))) {
      identities.push("कथाकार");
    }
    if (ints.some(i => i.includes("निबंध") || i.includes("आलेख") || i.includes("essay") || i.includes("article"))) {
      identities.push("निबंधकार");
    }
  }

  // 4. Activity-based seniority
  const articlesCount = authorArticles.length;
  if (articlesCount >= 10) {
    identities.push("वरिष्ठ लेखक");
  } else if (articlesCount >= 3) {
    identities.push("सक्रिय लेखक");
  } else if (profile.role === "Author" || profile.role === "Contributor" || articlesCount > 0) {
    identities.push("लेखक");
  }

  // 5. Achievement/Contribution fallback
  if (profile.achievements && profile.achievements.length > 0) {
    identities.push("विशेष योगदानकर्ता");
  }

  // Fallback
  if (identities.length === 0) {
    identities.push("योगदानकर्ता");
  }

  return Array.from(new Set(identities)); // Deduplicate
};

/**
 * @deprecated The points-based reputation engine is deprecated.
 * Kept for internal compatibility only.
 */
export const calculateAuthorReputation = (
  profile: Profile,
  authorArticles: Article[] = []
): { score: number; tier: "Bronze" | "Silver" | "Gold" | "Platinum" } => {
  return { score: 100, tier: "Bronze" };
};

export const generateAuthorSlug = (name: string): string => {
  const cleaned = name.trim();
  const transliterations: Record<string, string> = {
    "प्रसून कुशवाहा": "prasoon-kushwaha",
    "अमित शर्मा": "amit-sharma",
    "डॉ. राजेश सिंह": "dr-rajesh-singh",
    "संजय कुमार": "sanjay-kumar",
    "रवि कुमार": "ravi-kumar",
    "सुमित सिंह": "sumit-singh",
    "आलोक शर्मा": "alok-sharma",
    "विजय सिंह": "vijay-singh"
  };

  if (transliterations[cleaned]) {
    return transliterations[cleaned];
  }

  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// ─── AUTHENTICATION LAYER ──────────────────────────────────────────────────

export const signUpUser = async (email: string, role: string, metadata: Record<string, any> = {}): Promise<{ success: boolean; data?: any; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: metadata.password || "tempPassword123!",
        options: {
          data: {
            name: metadata.name || email.split("@")[0].toUpperCase(),
            role: role,
            mobile: metadata.mobile || "",
          }
        }
      });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || "Signup failed" };
    }
  } else {
    // Mock user list update
    const mockId = `mock-uid-${Math.floor(Math.random() * 10000)}`;
    const newProfile: Profile = {
      id: mockId,
      name: metadata.name || email.split("@")[0].toUpperCase(),
      email,
      role: role as any,
      status: "active",
      mobile: metadata.mobile || "",
      password: metadata.password || "password123",
      joinDate: new Date().toLocaleDateString("hi-IN", { year: "numeric", month: "long" }),
      slug: generateAuthorSlug(metadata.name || email.split("@")[0].toUpperCase()),
      username: generateAuthorSlug(metadata.name || email.split("@")[0].toUpperCase())
    };
    const localUsers = JSON.parse(getLocalItem("yuvakshar_users", "[]"));
    localUsers.push(newProfile);
    setLocalItem("yuvakshar_users", JSON.stringify(localUsers));
    return { success: true, data: newProfile };
  }
};

export const signInUser = async (email: string, passwordInput: string): Promise<{ success: boolean; user?: Profile; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });
      if (authError) return { success: false, error: authError.message };
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();
        
      if (profileError) return { success: false, error: profileError.message };
      return { success: true, user: mapDbProfileToProfile(profile) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const localUsers: Profile[] = JSON.parse(getLocalItem("yuvakshar_users", "[]"));
    const matched = localUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!matched) return { success: false, error: "यूज़र नहीं मिला!" };
    if (matched.status === "suspended") return { success: false, error: "खाता निलंबित है!" };
    if (matched.password && matched.password !== passwordInput) {
      return { success: false, error: "गलत पासवर्ड!" };
    }
    return { success: true, user: matched };
  }
};

export const resetUserPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } else {
    return { success: true };
  }
};

// ─── ARTICLESPersistence ────────────────────────────────────────────────────

export const fetchArticlesFromDb = async (fallback: Article[]): Promise<Article[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Falling back to local storage for articles:", err);
    }
  }
  return JSON.parse(getLocalItem("yuvakshar_articles", JSON.stringify(fallback)));
};

export const saveArticleInDb = async (article: Article): Promise<{ success: boolean; data?: Article; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .upsert(article)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const articles = JSON.parse(getLocalItem("yuvakshar_articles", "[]"));
    const index = articles.findIndex((a: any) => a.id === article.id);
    if (index !== -1) {
      articles[index] = article;
    } else {
      articles.unshift(article);
    }
    setLocalItem("yuvakshar_articles", JSON.stringify(articles));
    return { success: true, data: article };
  }
};

export const deleteArticleFromDb = async (id: string): Promise<{ success: boolean; error?: string }> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } else {
    const articles = JSON.parse(getLocalItem("yuvakshar_articles", "[]"));
    const filtered = articles.filter((a: any) => a.id !== id);
    setLocalItem("yuvakshar_articles", JSON.stringify(filtered));
    return { success: true };
  }
};

export const incrementArticleViewsInDb = async (id: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.rpc("increment_article_views", { article_id: id });
  } else {
    const articles = JSON.parse(getLocalItem("yuvakshar_articles", "[]"));
    const updated = articles.map((a: any) => {
      if (a.id === id) return { ...a, views: (a.views || 0) + 1 };
      return a;
    });
    setLocalItem("yuvakshar_articles", JSON.stringify(updated));
  }
};

export const incrementArticleLikesInDb = async (id: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.rpc("increment_article_likes", { article_id: id });
  } else {
    const articles = JSON.parse(getLocalItem("yuvakshar_articles", "[]"));
    const updated = articles.map((a: any) => {
      if (a.id === id) return { ...a, likes: (a.likes || 0) + 1 };
      return a;
    });
    setLocalItem("yuvakshar_articles", JSON.stringify(updated));
  }
};

// ─── PROFILEPersistence (Author extensions) ─────────────────────────────────

export const mapDbProfileToProfile = (dbProfile: any): Profile => {
  if (!dbProfile) return dbProfile;
  const profile = { ...dbProfile };
  const custom = dbProfile.social_links || {};
  
  const customFields = [
    "username", "username_changed_at", "previous_username", "slug", "cover_banner",
    "designation", "current_role", "verification_badge", "institution", "expertise_tags",
    "orcid_id", "google_scholar_url", "academic_credentials", "education",
    "academic_background", "research_interests", "professional_experience",
    "social_contributions", "publications_list", "reputation_score", "reputation_tier"
  ];
  
  customFields.forEach(field => {
    if (custom[field] !== undefined && profile[field] === undefined) {
      profile[field] = custom[field];
    }
  });

  if (custom.public_visibility !== undefined && profile.publicVisibility === undefined) {
    profile.publicVisibility = custom.public_visibility;
  } else if (dbProfile.public_visibility !== undefined && profile.publicVisibility === undefined) {
    profile.publicVisibility = dbProfile.public_visibility;
  }
  
  if (!profile.username) {
    profile.username = profile.name ? profile.name.toLowerCase().replace(/[^a-z0-9_]/g, "") : profile.id;
  }
  if (!profile.slug) {
    profile.slug = profile.username;
  }

  return profile;
};

export const fetchProfilesFromDb = async (fallback: Profile[]): Promise<Profile[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return (data || []).map(mapDbProfileToProfile);
    } catch (err) {
      console.warn("Falling back to local profiles:", err);
    }
  }
  return JSON.parse(getLocalItem("yuvakshar_users", JSON.stringify(fallback)));
};

export const updateProfileInDb = async (profile: Profile): Promise<{ success: boolean; data?: Profile; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const allowed = [
        "id", "name", "role", "status", "bio", "avatar_url", "social_links", "badges",
        "views_count"
      ];
      const filtered: any = {};
      allowed.forEach(key => {
        if ((profile as any)[key] !== undefined) {
          filtered[key] = (profile as any)[key];
        }
      });

      const customFields = [
        "username", "username_changed_at", "previous_username", "slug", "cover_banner",
        "designation", "current_role", "verification_badge", "institution", "expertise_tags",
        "orcid_id", "google_scholar_url", "academic_credentials", "education",
        "academic_background", "research_interests", "professional_experience",
        "social_contributions", "publications_list", "reputation_score", "reputation_tier"
      ];
      
      const currentSocialLinks = { ...(profile.social_links || {}) } as any;
      let socialLinksUpdated = false;
      customFields.forEach(field => {
        if ((profile as any)[field] !== undefined) {
          currentSocialLinks[field] = (profile as any)[field];
          socialLinksUpdated = true;
        }
      });
      if (profile.publicVisibility !== undefined) {
        currentSocialLinks.public_visibility = profile.publicVisibility;
        socialLinksUpdated = true;
      }
      
      if (socialLinksUpdated) {
        filtered.social_links = currentSocialLinks;
      }

      console.log("PROFILE UPDATE PAYLOAD", filtered);

      const { data, error } = await supabase
        .from("profiles")
        .upsert(filtered)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: mapDbProfileToProfile(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const users = JSON.parse(getLocalItem("yuvakshar_users", "[]"));
    const index = users.findIndex((u: any) => u.id === profile.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...profile };
      setLocalItem("yuvakshar_users", JSON.stringify(users));
      return { success: true, data: users[index] };
    }
    return { success: false, error: "User profile not found in local db" };
  }
};

// ─── COMMENTS ──────────────────────────────────────────────────────────────

export const fetchCommentsFromDb = async (fallback: Comment[]): Promise<Comment[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Comment fetch fallback:", err);
    }
  }
  return JSON.parse(getLocalItem("yuvakshar_comments", JSON.stringify(fallback)));
};

export const saveCommentInDb = async (comment: Comment): Promise<{ success: boolean; data?: Comment; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("comments").insert(comment).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const comments = JSON.parse(getLocalItem("yuvakshar_comments", "[]"));
    comments.unshift(comment);
    setLocalItem("yuvakshar_comments", JSON.stringify(comments));
    return { success: true, data: comment };
  }
};

export const updateCommentStatusInDb = async (id: string, status: Comment["status"]): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("comments").update({ status }).eq("id", id);
  } else {
    const comments = JSON.parse(getLocalItem("yuvakshar_comments", "[]"));
    const updated = comments.map((c: any) => (c.id === id ? { ...c, status } : c));
    setLocalItem("yuvakshar_comments", JSON.stringify(updated));
  }
};

export const reportCommentInDb = async (id: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("comments").update({ is_reported: true }).eq("id", id);
  } else {
    const comments = JSON.parse(getLocalItem("yuvakshar_comments", "[]"));
    const updated = comments.map((c: any) => (c.id === id ? { ...c, is_reported: true } : c));
    setLocalItem("yuvakshar_comments", JSON.stringify(updated));
  }
};

// ─── MAGAZINES ──────────────────────────────────────────────────────────────

export const fetchMagazinesFromDb = async (fallback: Magazine[]): Promise<Magazine[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("magazines").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Magazine fetch fallback:", err);
    }
  }
  return JSON.parse(getLocalItem("yuvakshar_magazines", JSON.stringify(fallback)));
};

export const saveMagazineInDb = async (mag: Magazine): Promise<{ success: boolean; data?: Magazine; error?: string }> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from("magazines").upsert(mag).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } else {
    const mags = JSON.parse(getLocalItem("yuvakshar_magazines", "[]"));
    const index = mags.findIndex((m: any) => m.id === mag.id);
    if (index !== -1) {
      mags[index] = mag;
    } else {
      mags.unshift(mag);
    }
    setLocalItem("yuvakshar_magazines", JSON.stringify(mags));
    return { success: true, data: mag };
  }
};

export const deleteMagazineFromDb = async (id: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("magazines").delete().eq("id", id);
  } else {
    const mags = JSON.parse(getLocalItem("yuvakshar_magazines", "[]"));
    const filtered = mags.filter((m: any) => m.id !== id);
    setLocalItem("yuvakshar_magazines", JSON.stringify(filtered));
  }
};

// ─── SUBSCRIBERS & CAMPAIGNS ───────────────────────────────────────────────

export const fetchSubscribersFromDb = async (fallback: string[]): Promise<string[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("subscribers").select("email");
      if (error) throw error;
      return data?.map(s => s.email) || [];
    } catch (err) {
      console.warn("Subscribers fetch fallback:", err);
    }
  }
  return JSON.parse(getLocalItem("yuvakshar_subscribers", JSON.stringify(fallback)));
};

export const addSubscriberInDb = async (email: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("subscribers").insert({ email, status: "Active" });
  } else {
    const subs = JSON.parse(getLocalItem("yuvakshar_subscribers", "[]"));
    if (!subs.includes(email)) {
      subs.push(email);
      setLocalItem("yuvakshar_subscribers", JSON.stringify(subs));
    }
  }
};

export const removeSubscriberInDb = async (email: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("subscribers").delete().eq("email", email);
  } else {
    const subs = JSON.parse(getLocalItem("yuvakshar_subscribers", "[]"));
    const filtered = subs.filter((s: string) => s !== email);
    setLocalItem("yuvakshar_subscribers", JSON.stringify(filtered));
  }
};

// ─── HOMEPAGE LAYOUTS ──────────────────────────────────────────────────────

export const fetchLayoutsFromDb = async (fallback: HomepageLayout[]): Promise<HomepageLayout[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("homepage_layouts").select("*").order("version", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Layouts fetch fallback:", err);
    }
  }
  return JSON.parse(getLocalItem("yuvakshar_layouts", JSON.stringify(fallback)));
};

export const saveLayoutInDb = async (layout: HomepageLayout): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("homepage_layouts").update({ is_published: false }).eq("is_published", true);
    await supabase.from("homepage_layouts").insert(layout);
  } else {
    const layouts = JSON.parse(getLocalItem("yuvakshar_layouts", "[]"));
    const reset = layouts.map((l: any) => ({ ...l, is_published: false }));
    reset.push(layout);
    setLocalItem("yuvakshar_layouts", JSON.stringify(reset));
  }
};

// ─── SEARCH & TELEMETRY ────────────────────────────────────────────────────

export const logSearchTelemetry = async (query: string, zeroResults: boolean): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.rpc("log_search_telemetry", { search_query: query, is_zero: zeroResults });
  } else {
    const logs = JSON.parse(getLocalItem("yuvakshar_search_logs", "[]"));
    const index = logs.findIndex((l: any) => l.query === query);
    if (index !== -1) {
      logs[index].search_count += 1;
    } else {
      logs.push({ id: `log-${Date.now()}`, query, search_count: 1, click_count: 0, zero_results: zeroResults, updated_at: new Date().toISOString() });
    }
    setLocalItem("yuvakshar_search_logs", JSON.stringify(logs));
  }
};

// ─── AUDIT ACTIVITY LOGS ───────────────────────────────────────────────────

export const logAuditActivity = async (action: string, details: Record<string, any> = {}): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("activity_logs").insert({ action, details });
  } else {
    const logs = JSON.parse(getLocalItem("yuvakshar_activity_logs", "[]"));
    logs.unshift({ id: `act-${Date.now()}`, action, details, created_at: new Date().toISOString() });
    if (logs.length > 150) logs.pop();
    setLocalItem("yuvakshar_activity_logs", JSON.stringify(logs));
  }
};

// ─── SUBMISSIONS / DRAFTS ──────────────────────────────────────────────────

export const fetchSubmissionsFromDb = async (): Promise<Submission[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Submissions fetch fallback:", err);
    }
  }
  return JSON.parse(getLocalItem("yuvakshar_submissions", "[]"));
};

export const saveSubmissionInDb = async (sub: Submission): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("contact_messages").insert({
      type: sub.type,
      name: sub.name, username: sub.email.split('@')[0].replace(/['"]/g, ''), email: sub.email,
      mobile: sub.mobile,
      subject: sub.subject,
      content: sub.content,
      status: sub.status,
      replies: sub.replies || []
    });
  } else {
    const subs = JSON.parse(getLocalItem("yuvakshar_submissions", "[]"));
    subs.unshift(sub);
    setLocalItem("yuvakshar_submissions", JSON.stringify(subs));
  }
};

export const updateSubmissionStatusInDb = async (id: string, status: Submission["status"]): Promise<void> => {
  if (isSupabaseConfigured()) {
    await supabase.from("contact_messages").update({ status }).eq("id", id);
  } else {
    const subs = JSON.parse(getLocalItem("yuvakshar_submissions", "[]"));
    const updated = subs.map((s: any) => (s.id === id ? { ...s, status } : s));
    setLocalItem("yuvakshar_submissions", JSON.stringify(updated));
  }
};

/**
 * Toggles follow status in repository
 */
export const toggleFollowAuthorInDb = (
  users: Profile[],
  authorId: string,
  followerId: string
): Profile[] => {
  return users.map(user => {
    if (user.id === authorId) {
      const followersList = user.followers || [];
      const isFollowing = followersList.includes(followerId);
      const updatedFollowers = isFollowing
        ? followersList.filter(fId => fId !== followerId)
        : [...followersList, followerId];
      return { ...user, followers: updatedFollowers };
    }
    return user;
  });
};

/**
 * Adds a timeline event node in repository
 */
export const addTimelineEventInDb = (
  users: Profile[],
  userId: string,
  event: { title: string; description: string; date: string; type?: string }
): Profile[] => {
  const newEvent = {
    ...event,
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  };
  return users.map(user => {
    if (user.id === userId) {
      const timelineList = user.timeline || [];
      return { ...user, timeline: [...timelineList, newEvent] };
    }
    return user;
  });
};

/**
 * Deletes a timeline event node in repository
 */
export const deleteTimelineEventInDb = (
  users: Profile[],
  userId: string,
  eventId: string
): Profile[] => {
  return users.map(user => {
    if (user.id === userId) {
      const timelineList = user.timeline || [];
      return { ...user, timeline: timelineList.filter(ev => ev.id !== eventId) };
    }
    return user;
  });
};

/**
 * Adds a document/portfolio item in repository
 */
export const addPortfolioItemInDb = (
  users: Profile[],
  userId: string,
  item: { name: string; url: string; type: "book" | "research_paper" | "report" | "white_paper" | "resume" | "other"; is_public: boolean }
): Profile[] => {
  const newItem = {
    ...item,
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  };
  return users.map(user => {
    if (user.id === userId) {
      const portfolioList = user.portfolio || [];
      return { ...user, portfolio: [...portfolioList, newItem] };
    }
    return user;
  });
};

/**
 * Deletes a document/portfolio item in repository
 */
export const deletePortfolioItemInDb = (
  users: Profile[],
  userId: string,
  itemId: string
): Profile[] => {
  return users.map(user => {
    if (user.id === userId) {
      const portfolioList = user.portfolio || [];
      return { ...user, portfolio: portfolioList.filter(doc => doc.id !== itemId) };
    }
    return user;
  });
};

/**
 * Adds an achievement/award item in repository
 */
export const addAchievementInDb = (
  users: Profile[],
  userId: string,
  achievement: { title: string; description?: string; year?: string; image_url?: string }
): Profile[] => {
  const newItem = {
    ...achievement,
    id: `ach-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  };
  return users.map(user => {
    if (user.id === userId) {
      const achievementsList = user.achievements || [];
      return { ...user, achievements: [...achievementsList, newItem] };
    }
    return user;
  });
};

/**
 * Deletes an achievement/award item in repository
 */
export const deleteAchievementInDb = (
  users: Profile[],
  userId: string,
  achievementId: string
): Profile[] => {
  return users.map(user => {
    if (user.id === userId) {
      const achievementsList = user.achievements || [];
      return { ...user, achievements: achievementsList.filter(ach => ach.id !== achievementId) };
    }
    return user;
  });
};

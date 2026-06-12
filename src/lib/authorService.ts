import { Profile, Article } from "@/store/types";

/**
 * Yuvakshar Author Ecosystem 2.0 Repository Service
 * 
 * This service abstracts all profile mutations, calculations, and data fetching.
 * Designed to be migration-ready, it separates business logic from React Context
 * and UI files so that transitioning to Supabase/PostgreSQL is simple.
 */

// ─── REPUTATION SCORE CALCULATOR ─────────────────────────────────────────────
/**
 * Calculates a dynamic reputation score and determines the tier (Bronze, Silver, Gold, Platinum).
 * 
 * Rules:
 * - Base points for being active and verified.
 * - Articles Published: +25 points per published article.
 * - Views engagement: +1 point per 10 views.
 * - Likes engagement: +5 points per like.
 * - Followers: +10 points per follower.
 * - Magazine Contributions: +50 points per contribution.
 * - Achievements/Awards: +100 points per achievement.
 * - Editorial Roles get custom leadership points.
 */
export const calculateAuthorReputation = (
  profile: Profile,
  authorArticles: Article[] = []
): { score: number; tier: "Bronze" | "Silver" | "Gold" | "Platinum" } => {
  let score = 100; // Base starting reputation

  // 1. Role-based base points
  if (profile.role === "Owner" || profile.role === "Editor-in-Chief") {
    score += 500;
  } else if (profile.role === "Managing Editor" || profile.role === "Admin") {
    score += 350;
  } else if (profile.role === "Editor" || profile.role === "Fact Check Reviewer") {
    score += 200;
  } else if (profile.role === "Author") {
    score += 100;
  }

  // 2. Verification badge bonus
  if (profile.verification_badge) {
    const badgesMap: Record<string, number> = {
      "Founder": 300,
      "Editor-in-Chief": 250,
      "Managing Editor": 200,
      "Editor": 150,
      "Editorial Team": 120,
      "Verified Researcher": 100,
      "Verified Author": 80,
    };
    score += badgesMap[profile.verification_badge] || 50;
  }

  // 3. Articles & Engagement
  score += authorArticles.length * 25;
  const totalViews = authorArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = authorArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
  score += Math.floor(totalViews / 10);
  score += totalLikes * 5;

  // 4. Followers
  const followerCount = profile.followers?.length || 0;
  score += followerCount * 10;

  // 5. Portfolio & Achievements
  const achievementsCount = profile.achievements?.length || 0;
  const portfolioCount = profile.portfolio?.length || 0;
  score += achievementsCount * 100;
  score += portfolioCount * 30;

  // Tier Determination
  let tier: "Bronze" | "Silver" | "Gold" | "Platinum" = "Bronze";
  if (score >= 1200) {
    tier = "Platinum";
  } else if (score >= 600) {
    tier = "Gold";
  } else if (score >= 300) {
    tier = "Silver";
  }

  return { score, tier };
};

// ─── PERSISTENCE WRAPPERS (MIGRATION READY) ──────────────────────────────────

/**
 * Toggles a follower status.
 * If followerId is already in the author's followers array, removes it. Otherwise adds it.
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
 * Adds a chronological timeline event node.
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
 * Deletes a timeline event node.
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
 * Adds a document/portfolio item.
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
 * Deletes a document/portfolio item.
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
 * Adds an achievement/award item.
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
 * Deletes an achievement/award item.
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

/**
 * Helper to generate English URL slug from Name.
 * If Devanagari characters are present, maps key staff names, otherwise slugifies the alphabet characters.
 */
export const generateAuthorSlug = (name: string): string => {
  const cleaned = name.trim();
  // Quick lookup table for Devanagari names in staff
  const transliterations: Record<string, string> = {
    "प्रसून कुशवाहा": "prasoon-kushwaha",
    "अमित शर्मा": "amit-sharma",
    "डॉ. राजेश सिंह": "dr-rajesh-singh",
    "संजय कुमार": "sanjay-kumar",
    "रवि कुमार": "ravi-kumar",
    "सुमित सिंह": "sumit-singh",
    " आलोक शर्मा": "alok-sharma",
    "विजय सिंह": "vijay-singh"
  };

  if (transliterations[cleaned]) {
    return transliterations[cleaned];
  }

  // Fallback slugification
  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric chars
    .trim()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove duplicate hyphens
};

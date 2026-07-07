import { getCanonicalProfileUrl } from "./username";
import { Article, Profile } from "@/store/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yuvakshar.tech";

export const ROUTES = {
  HOME: "/",
  CURRENT_AFFAIRS: "/current-affairs",
  ABOUT: "/about",
  CONTACT: "/contact",
  MAGAZINE: "/magazine",
  CONTRIBUTE: "/contribute",
  SETTINGS: "/settings",
  BOOKMARKS: "/bookmarks",
  LOGIN: "/login",
};

interface ArticleLike {
  slug?: string;
  id?: string;
}

interface IssueLike {
  slug?: string;
  id?: string;
}

export function getArticleUrl(article: ArticleLike | Article): string {
  if (!article) return "#";
  const slug = article.slug || article.id;
  if (!slug) {
    console.warn("getArticleUrl: Article slug or ID is missing", article);
    return "#";
  }
  return `/articles/${slug}`;
}

export function getProfileUrl(user: Partial<Profile> | Profile | null | undefined): string | null {
  if (!user) {
    return null;
  }
  return getCanonicalProfileUrl(user);
}

export function getMagazineUrl(issue: IssueLike | string | null | undefined): string {
  if (!issue) return "#";
  if (typeof issue === "string") {
    return `/magazine/${issue}`;
  }
  const identifier = issue.slug || issue.id;
  if (!identifier) {
    console.warn("getMagazineUrl: Issue identifier is missing", issue);
    return "#";
  }
  return `/magazine/${identifier}`;
}

export function getMagazineReadUrl(issue: IssueLike | string | null | undefined): string {
  if (!issue) return "#";
  if (typeof issue === "string") {
    return `/magazine/read/${issue}`;
  }
  const identifier = issue.slug || issue.id;
  if (!identifier) {
    console.warn("getMagazineReadUrl: Issue identifier is missing", issue);
    return "#";
  }
  return `/magazine/read/${identifier}`;
}

/**
 * Shared author resolver — the single source of truth for resolving
 * an author name string to a Profile and canonical profile URL.
 *
 * Used by MetaInfo, Hero, Popular, and any future component that
 * needs to display a clickable author identity.
 *
 * @returns profile - The resolved profile (or null)
 * @returns href    - The canonical /u/username URL (or null if no valid username)
 */
export function resolveAuthorFromUsers(
  authorName: string | null | undefined,
  authorProfile: Partial<Profile> | null | undefined,
  users: Profile[]
): { profile: Partial<Profile> | null; href: string | null } {
  // 1. If authorProfile already has a resolvable username, use it directly
  if (authorProfile) {
    const href = getProfileUrl(authorProfile);
    if (href) {
      return { profile: authorProfile, href };
    }
  }

  // 2. Try to find from the users list by name or display_name
  if (users && authorName) {
    const found = users.find(
      (u) => u.name === authorName || u.display_name === authorName
    );
    if (found) {
      return { profile: found, href: getProfileUrl(found) };
    }
  }

  // 3. Special aliases
  if (authorName) {
    let specialUsername: string | null = null;
    if (authorName === "युवाक्षर संपादकीय") specialUsername = "yuvakshar";
    if (authorName === "संपादकीय मंडल") specialUsername = "editorial";
    if (authorName === "Guest Author") specialUsername = "guest";
    
    if (specialUsername) {
      return { 
        profile: { name: authorName, username: specialUsername, verified: true }, 
        href: `/u/${specialUsername}` 
      };
    }
  }

  // 4. Return whatever profile we have but no href — never fabricate URLs
  return { profile: authorProfile || null, href: null };
}

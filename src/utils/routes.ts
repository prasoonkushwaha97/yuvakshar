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
    console.warn("getProfileUrl: User is undefined/null");
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

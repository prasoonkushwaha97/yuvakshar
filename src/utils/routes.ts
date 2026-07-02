import { getCanonicalProfileUrl } from "./username";

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

export function getArticleUrl(article: any): string {
  if (!article) return "#";
  const slug = article.slug || article.id;
  if (!slug) {
    console.warn("getArticleUrl: Article slug or ID is missing", article);
    return "#";
  }
  return `/articles/${slug}`;
}

export function getProfileUrl(user: any): string | null {
  if (!user) {
    console.warn("getProfileUrl: User is undefined/null");
    return null;
  }
  const url = getCanonicalProfileUrl(user);
  if (!url || url === "/u/unknown" || url.includes("undefined") || url.includes("null")) {
    console.warn("getProfileUrl: Invalid or missing profile fields. Navigation disabled.", user);
    return null;
  }
  return url;
}

export function getMagazineUrl(issue: any): string {
  if (!issue) return "#";
  const identifier = issue.slug || issue.id || (typeof issue === "string" ? issue : "");
  if (!identifier) {
    console.warn("getMagazineUrl: Issue identifier is missing", issue);
    return "#";
  }
  return `/magazine/${identifier}`;
}

export function getMagazineReadUrl(issue: any): string {
  if (!issue) return "#";
  const identifier = issue.slug || issue.id || (typeof issue === "string" ? issue : "");
  if (!identifier) {
    console.warn("getMagazineReadUrl: Issue identifier is missing", issue);
    return "#";
  }
  return `/magazine/read/${identifier}`;
}

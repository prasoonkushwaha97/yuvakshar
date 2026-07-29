export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  
  // If it's a raw ISO date string
  if (dateStr.includes("-") && dateStr.includes("T")) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("hi-IN", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }
    } catch (e) {}
  }
  
  // Otherwise split by comma if formatted previously
  return dateStr.split(",")[0] || "";
}

export const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export function getArticleTimestamp(art: any): number {
  if (!art) return 0;
  const dateStr = art.published_at || art.date || art.created_at;
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 0 : time;
}

export function isPublishedWithinDays(art: any, days: number = 5): boolean {
  const time = getArticleTimestamp(art);
  if (!time) return false;
  const ageMs = Date.now() - time;
  const maxAgeMs = days * 24 * 60 * 60 * 1000;
  return ageMs < maxAgeMs;
}

export function isOlderThanDays(art: any, days: number = 5): boolean {
  const time = getArticleTimestamp(art);
  if (!time) return true;
  const ageMs = Date.now() - time;
  const maxAgeMs = days * 24 * 60 * 60 * 1000;
  return ageMs >= maxAgeMs;
}

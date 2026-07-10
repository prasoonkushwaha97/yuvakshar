import { Profile } from "@/store/types";

export const RESERVED_USERNAMES = [
  "admin", "administrator", "root", "support", "help", "api", "login", "logout",
  "signup", "register", "settings", "account", "profile", "profiles", "user",
  "users", "home", "about", "contact", "privacy", "terms", "search", "news",
  "article", "articles", "magazine", "chaupal", "community", "dashboard", "cms",
  "editor", "staff", "team", "official", "yuvakshar"
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) return { valid: false, error: "Username is required." };
  
  const lower = username.toLowerCase();
  
  if (lower.length < 3 || lower.length > 30) {
    return { valid: false, error: "Username must be between 3 and 30 characters." };
  }

  if (RESERVED_USERNAMES.includes(lower)) {
    return { valid: false, error: "Reserved username." };
  }

  if (/\s/.test(username)) {
    return { valid: false, error: "Username cannot contain spaces." };
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return { valid: false, error: "Only letters, numbers, _, -, and . are allowed." };
  }

  return { valid: true };
}

export function generateDeterministicUsername(email: string, existingUsernames: Set<string>): string {
  let base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  
  if (base.length < 3) base = base.padEnd(3, '0');
  if (base.length > 30) base = base.substring(0, 30);
  
  base = base.replace(/_+/g, '_').replace(/^_/, '').replace(/_$/, '');
  if (base.length < 3) base = base.padEnd(3, '0'); // ensure still >= 3 after trimming
  
  let test = base;
  let counter = 1;
  
  while (existingUsernames.has(test.toLowerCase()) || RESERVED_USERNAMES.includes(test.toLowerCase())) {
    const counterStr = counter.toString();
    const allowedLength = 30 - counterStr.length;
    const truncatedBase = base.substring(0, allowedLength).replace(/_$/, '');
    test = `${truncatedBase}${counterStr}`;
    counter++;
  }
  
  return test;
}

export function generateFallbackUsername(email: string | undefined): string {
  if (!email) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `user_${randomNum}`;
  }
  
  let base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  
  if (base.length < 3) base = base.padEnd(3, '0');
  if (base.length > 25) base = base.substring(0, 25);
  
  base = base.replace(/_+/g, '_').replace(/^_/, '').replace(/_$/, '');
  if (base.length < 3) base = base.padEnd(3, '0'); 
  
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${base}${randomNum}`;
}

/**
 * Generates a canonical profile URL from a profile object or username string.
 * Returns '#' if no valid username can be resolved — never fabricates URLs.
 */
export function getCanonicalProfileUrl(profile: Partial<Profile> | string | null | undefined): string {
  if (!profile) {
    return "#";
  }
  
  if (typeof profile === "string") {
    const trimmed = profile.trim();
    if (trimmed.length >= 3 && /^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      return `/u/${trimmed.toLowerCase()}`;
    }
    return "#";
  }
  
  // Extract username from the profile object — check nested profile structures too
  const username = profile.username
    || profile.slug
    || profile.id
    || (profile as Record<string, unknown>).author_username as string | undefined;

  if (
    username &&
    typeof username === "string" &&
    username.trim().length >= 3 &&
    username !== "unknown" &&
    username !== "null" &&
    username !== "undefined"
  ) {
    return `/u/${username.toLowerCase()}`;
  }
  
  // No valid username found — return fallback '#', never fabricate
  return "#";
}

/**
 * Resolves an incoming identifier (username, slug, or ID) to a canonical profile.
 * Returns the matched profile and a boolean indicating if a redirect is needed.
 */
export function resolveProfileIdentifier(identifier: string, users: Partial<Profile>[]): { profile: Partial<Profile> | null, needsRedirect: boolean } {
  if (!identifier || !users || users.length === 0) {
    return { profile: null, needsRedirect: false };
  }

  const lowerIdentifier = identifier.toLowerCase();

  // 1. Priority: Canonical username match
  const matchByUsername = users.find(u => u.username?.toLowerCase() === lowerIdentifier);
  if (matchByUsername) {
    const needsRedirect = matchByUsername.username !== identifier;
    return { profile: matchByUsername, needsRedirect };
  }

  // 1b. Priority: Previous username match (for historical redirects)
  const matchByPreviousUsername = users.find(u => u.previous_username?.toLowerCase() === lowerIdentifier);
  if (matchByPreviousUsername) {
    return { 
      profile: matchByPreviousUsername, 
      needsRedirect: true 
    };
  }

  // 2. Priority: Legacy slug match
  const matchBySlug = users.find(u => u.slug?.toLowerCase() === lowerIdentifier);
  if (matchBySlug) {
    return { 
      profile: matchBySlug, 
      needsRedirect: !!matchBySlug.username 
    };
  }

  // 3. Last Resort: Internal ID match (UUID)
  const matchById = users.find(u => u.id === identifier);
  if (matchById) {
    return { 
      profile: matchById, 
      needsRedirect: !!matchById.username 
    };
  }

  return { profile: null, needsRedirect: false };
}

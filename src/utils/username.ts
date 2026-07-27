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

export function getCanonicalProfileUrl(profile: Partial<Profile> | string | null | undefined): string {
  if (!profile) {
    return "#";
  }
  
  if (typeof profile === "string") {
    const trimmed = profile.trim();
    if (trimmed.length >= 2) {
      return `/u/${trimmed.toLowerCase()}`;
    }
    return "#";
  }
  
  // Extract slug from the profile object
  const slug = profile.slug
    || profile.username
    || profile.id
    || (profile as Record<string, unknown>).author_username as string | undefined;

  if (
    slug &&
    typeof slug === "string" &&
    slug.trim().length >= 2 &&
    slug !== "unknown" &&
    slug !== "null" &&
    slug !== "undefined"
  ) {
    return `/u/${slug.toLowerCase()}`;
  }
  
  return "#";
}

/**
 * Resolves an incoming identifier (slug, name, or ID) to a canonical profile.
 * Returns the matched profile and a boolean indicating if a redirect is needed.
 */
export function resolveProfileIdentifier(identifier: string, users: Partial<Profile>[]): { profile: Partial<Profile> | null, needsRedirect: boolean } {
  if (!identifier || !users || users.length === 0) {
    return { profile: null, needsRedirect: false };
  }

  const lowerIdentifier = identifier.toLowerCase();
  const normalizedIdentifier = lowerIdentifier.replace(/[-_]/g, "");

  // 1. Priority: Direct slug match
  const matchBySlug = users.find(u => {
    const s = u.slug?.toLowerCase();
    return s === lowerIdentifier || (s && s.replace(/[-_]/g, "") === normalizedIdentifier);
  });
  if (matchBySlug) {
    const needsRedirect = matchBySlug.slug ? matchBySlug.slug !== identifier : false;
    return { profile: matchBySlug, needsRedirect };
  }

  // 2. Priority: Match by username (legacy fallback)
  const matchByUsername = users.find(u => u.username?.toLowerCase() === lowerIdentifier);
  if (matchByUsername) {
    return { profile: matchByUsername, needsRedirect: true };
  }

  // 3. Priority: Name match (e.g. searching "Prasoon Kushwaha")
  const matchByName = users.find(u => {
    const nameSlug = u.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const nameClean = u.name?.toLowerCase().replace(/[\s-_]/g, "");
    return (nameSlug && nameSlug === lowerIdentifier) || (nameClean && nameClean === normalizedIdentifier) || (u.name && u.name.toLowerCase() === lowerIdentifier);
  });
  if (matchByName) {
    return { profile: matchByName, needsRedirect: true };
  }

  // 4. Last Resort: Internal ID match (UUID)
  const matchById = users.find(u => u.id === identifier);
  if (matchById) {
    return { 
      profile: matchById, 
      needsRedirect: true 
    };
  }

  return { profile: null, needsRedirect: false };
}

export const RESERVED_USERNAMES = [
  "admin", "administrator", "root", "system", "support", "help", "api", 
  "about", "settings", "login", "signup", "editor", "founder", "yuvakshar",
  "contact", "community", "dashboard", "profile", "bookmarks", 
  "literary-journey", "articles", "magazines"
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) return { valid: false, error: "Username is required." };
  
  const lower = username.toLowerCase();
  
  if (lower.length < 3 || lower.length > 30) {
    return { valid: false, error: "Username must be between 3 and 30 characters." };
  }

  if (RESERVED_USERNAMES.includes(lower)) {
    return { valid: false, error: "This username is reserved." };
  }

  if (/\s/.test(username)) {
    return { valid: false, error: "Username cannot contain spaces." };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores." };
  }

  if (username.startsWith("_")) {
    return { valid: false, error: "Username cannot start with an underscore." };
  }

  if (username.endsWith("_")) {
    return { valid: false, error: "Username cannot end with an underscore." };
  }

  if (/__/.test(username)) {
    return { valid: false, error: "Username cannot contain consecutive underscores." };
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

export function getCanonicalProfileUrl(profile: any): string {
  if (!profile) {
    console.log("getCanonicalProfileUrl called with: null/undefined => returning /u/unknown");
    return "/u/unknown";
  }
  
  // Try to resolve username first
  const username = profile.username || profile.profiles?.username;
  if (username) {
    console.log("getCanonicalProfileUrl called with:", profile, "=> returning", `/u/${username}`);
    return `/u/${username}`;
  }
  
  console.log("getCanonicalProfileUrl called with:", profile, "=> returning /u/unknown (no canonical username found)");
  return "/u/unknown";
}

/**
 * Resolves an incoming identifier (username, slug, or ID) to a canonical profile.
 * Returns the matched profile and a boolean indicating if a redirect is needed.
 */
export function resolveProfileIdentifier(identifier: string, users: any[]): { profile: any | null, needsRedirect: boolean } {
  if (!identifier || !users || users.length === 0) {
    console.log({ identifier, usersLength: users?.length || 0, matchedUser: null });
    return { profile: null, needsRedirect: false };
  }

  const lowerIdentifier = identifier.toLowerCase();

  // 1. Priority: Canonical username match
  const matchByUsername = users.find(u => u.username?.toLowerCase() === lowerIdentifier);
  if (matchByUsername) {
    console.log({ identifier, usersLength: users.length, matchedUser: matchByUsername.username });
    return { profile: matchByUsername, needsRedirect: false };
  }

  // 2. Priority: Legacy slug match
  const matchBySlug = users.find(u => u.slug?.toLowerCase() === lowerIdentifier);
  if (matchBySlug) {
    console.log({ identifier, usersLength: users.length, matchedUser: matchBySlug.username });
    // If we matched by slug but they have a canonical username, we must redirect to the username!
    return { 
      profile: matchBySlug, 
      needsRedirect: !!matchBySlug.username 
    };
  }

  // 3. Last Resort: Internal ID match (UUID)
  const matchById = users.find(u => u.id === identifier);
  if (matchById) {
    console.log({ identifier, usersLength: users.length, matchedUser: matchById.username });
    return { 
      profile: matchById, 
      needsRedirect: !!matchById.username 
    };
  }

  console.log({ identifier, usersLength: users.length, matchedUser: null });
  return { profile: null, needsRedirect: false };
}

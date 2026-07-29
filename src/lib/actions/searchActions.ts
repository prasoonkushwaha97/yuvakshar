"use server";

import { createClient } from "../supabaseServer";

export interface SearchResult {
  id: string;
  type:
    | "article"
    | "magazine"
    | "chaupal_post"
    | "chaupal_discussion"
    | "chaupal_group"
    | "author"
    | "category"
    | "tag"
    | "qna_question";
  title: string;
  subtitle?: string;
  thumbnail?: string;
  url: string;
  author?: string;
  date?: string;
  score: number; // Internal ranking score
  meta?: any; // Additional metadata
}

/**
 * Score a profile candidate against the search query.
 */
function scoreProfileMatch(profile: any, rawQuery: string): number {
  if (!profile || !rawQuery) return 0;

  const cleanQ = rawQuery.trim().toLowerCase().replace(/^@/, "");
  if (!cleanQ) return 0;

  const compactQ = cleanQ.replace(/[\s\-_\.@]/g, "");

  const name = (profile.name || "").toLowerCase();
  const username = (profile.username || "").toLowerCase();
  const slug = (profile.slug || "").toLowerCase();

  const compactName = name.replace(/[\s\-_\.@]/g, "");
  const compactUsername = username.replace(/[\s\-_\.@]/g, "");
  const compactSlug = slug.replace(/[\s\-_\.@]/g, "");

  let score = 0;

  // 1. Exact username / slug match (highest priority)
  if (
    username === cleanQ ||
    slug === cleanQ ||
    compactUsername === compactQ ||
    compactSlug === compactQ
  ) {
    score = Math.max(score, 200);
  }

  // 2. Exact display name match
  if (name === cleanQ || compactName === compactQ) {
    score = Math.max(score, 180);
  }

  // 3. Prefix match
  if (
    username.startsWith(cleanQ) ||
    slug.startsWith(cleanQ) ||
    name.startsWith(cleanQ) ||
    compactUsername.startsWith(compactQ) ||
    compactName.startsWith(compactQ)
  ) {
    score = Math.max(score, 140);
  }

  // 4. Multi-word token match (e.g. searching "Pratishtha Kushwaha")
  const tokens = cleanQ.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every(
      (t) => name.includes(t) || username.includes(t) || slug.includes(t)
    );
    if (allTokensMatch) {
      score = Math.max(score, 120);
    }
  }

  // 5. Space-insensitive / Substring match
  if (
    name.includes(cleanQ) ||
    username.includes(cleanQ) ||
    slug.includes(cleanQ) ||
    compactName.includes(compactQ) ||
    compactUsername.includes(compactQ) ||
    compactSlug.includes(compactQ)
  ) {
    score = Math.max(score, 90);
  }

  return score;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const rawQ = query.trim();
  const cleanQ = rawQ.toLowerCase().replace(/^@/, "");
  const compactQ = cleanQ.replace(/[\s\-_\.@]/g, "");

  const results: SearchResult[] = [];
  const seenIds = new Set<string>();

  try {
    // -------------------------------------------------------------
    // 1. Authors / Profiles Search (Primary Audit Target)
    // -------------------------------------------------------------
    try {
      const likeClean = `%${cleanQ}%`;
      const likeCompact = `%${compactQ}%`;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, username, slug, bio, avatar_url, role, is_verified, status")
        .neq("status", "suspended")
        .neq("status", "deleted")
        .or(
          `name.ilike.${likeClean},username.ilike.${likeClean},slug.ilike.${likeClean},name.ilike.${likeCompact},username.ilike.${likeCompact},slug.ilike.${likeCompact}`
        )
        .limit(30);

      let candidateProfiles = profiles || [];

      // Fallback: If DB OR query returned few items, fetch top profiles to evaluate in-memory with flexible matcher
      if (candidateProfiles.length < 5) {
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("id, name, username, slug, bio, avatar_url, role, is_verified, status")
          .neq("status", "suspended")
          .neq("status", "deleted")
          .limit(100);

        if (allProfiles) {
          const profileMap = new Map<string, any>();
          candidateProfiles.forEach((p: any) => profileMap.set(p.id, p));
          allProfiles.forEach((p: any) => profileMap.set(p.id, p));
          candidateProfiles = Array.from(profileMap.values());
        }
      }

      candidateProfiles.forEach((p: any) => {
        const score = scoreProfileMatch(p, rawQ);
        const uniqueId = `profile-${p.id}`;

        if (score > 0 && !seenIds.has(uniqueId)) {
          seenIds.add(uniqueId);
          results.push({
            id: uniqueId,
            type: "author",
            title: p.name || p.username || "लेखक",
            subtitle: p.username ? `@${p.username}` : p.bio,
            thumbnail: p.avatar_url,
            url: `/u/${p.username || p.slug || p.id}`,
            score,
            meta: {
              username: p.username || p.slug,
              slug: p.slug || p.username,
              role: p.role,
              is_verified: p.is_verified,
            },
          });
        }
      });
    } catch (err) {
      console.error("Profile search error:", err);
    }

    // -------------------------------------------------------------
    // 2. Articles Search
    // -------------------------------------------------------------
    try {
      const likeClean = `%${cleanQ}%`;
      const { data: articles } = await supabase
        .from("articles")
        .select(
          "id, title, english_title, slug, summary, status, updated_at, categories(slug), profiles!articles_author_id_fkey(name)"
        )
        .eq("status", "Published")
        .or(`title.ilike.${likeClean},english_title.ilike.${likeClean},summary.ilike.${likeClean}`)
        .limit(15);

      if (articles) {
        articles.forEach((a: any) => {
          let score = 0;
          const titleLower = (a.title || "").toLowerCase();
          const engLower = (a.english_title || "").toLowerCase();

          if (titleLower === cleanQ || engLower === cleanQ) score += 150;
          else if (titleLower.startsWith(cleanQ) || engLower.startsWith(cleanQ)) score += 120;
          else if (titleLower.includes(cleanQ) || engLower.includes(cleanQ)) score += 80;
          else score += 40;

          const categorySlug = Array.isArray(a.categories)
            ? a.categories[0]?.slug
            : a.categories?.slug;

          const uniqueId = `article-${a.id}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            results.push({
              id: uniqueId,
              type: "article",
              title: a.title || a.english_title,
              subtitle: a.summary,
              url: `/articles/${a.slug}`,
              date: a.updated_at,
              author: a.profiles?.name || undefined,
              score,
              meta: { categorySlug },
            });
          }
        });
      }
    } catch (err) {
      console.error("Article search error:", err);
    }

    // -------------------------------------------------------------
    // 3. Magazines Search
    // -------------------------------------------------------------
    try {
      const likeClean = `%${cleanQ}%`;
      const { data: magazines } = await supabase
        .from("magazines")
        .select("id, issue, month, year, cover_url")
        .or(`issue.ilike.${likeClean},month.ilike.${likeClean}`)
        .limit(5);

      if (magazines) {
        magazines.forEach((m: any) => {
          let score = 50;
          if (m.issue && m.issue.toLowerCase().includes(cleanQ)) score += 50;

          const uniqueId = `magazine-${m.id}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            results.push({
              id: uniqueId,
              type: "magazine",
              title: `${m.month} ${m.year}`,
              subtitle: `अंक: ${m.issue}`,
              thumbnail: m.cover_url,
              url: `/magazine/${m.issue || m.id}`,
              score,
            });
          }
        });
      }
    } catch (err) {
      console.error("Magazine search error:", err);
    }

    // -------------------------------------------------------------
    // 4. Chaupal Posts Search
    // -------------------------------------------------------------
    try {
      const likeClean = `%${cleanQ}%`;
      const { data: posts } = await supabase
        .from("chaupal_posts")
        .select("id, content, profiles(name, username, avatar_url), created_at")
        .ilike("content", likeClean)
        .limit(5);

      if (posts) {
        posts.forEach((post: any) => {
          const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
          const uniqueId = `chaupal-${post.id}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            results.push({
              id: uniqueId,
              type: "chaupal_post",
              title: post.content
                ? post.content.length > 80
                  ? post.content.substring(0, 80) + "..."
                  : post.content
                : "चौपाल चर्चा",
              author: profile?.name || "उपयोगकर्ता",
              thumbnail: profile?.avatar_url,
              url: `/community/post/${post.id}`,
              date: post.created_at,
              score: 40,
            });
          }
        });
      }
    } catch (err) {
      console.error("Chaupal post search error:", err);
    }

    // -------------------------------------------------------------
    // 5. Chaupal Groups & Discussions
    // -------------------------------------------------------------
    try {
      const likeClean = `%${cleanQ}%`;
      const { data: rooms } = await supabase
        .from("chaupal_rooms")
        .select("id, title, description, type, created_at")
        .or(`title.ilike.${likeClean},description.ilike.${likeClean}`)
        .limit(5);

      if (rooms) {
        rooms.forEach((room: any) => {
          const isGroup = room.type === "group";
          const uniqueId = `room-${room.id}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            results.push({
              id: uniqueId,
              type: isGroup ? "chaupal_group" : "chaupal_discussion",
              title: room.title,
              subtitle: room.description,
              url: isGroup ? `/community/groups/${room.id}` : `/community/discussion/${room.id}`,
              date: room.created_at,
              score: 50,
            });
          }
        });
      }
    } catch (err) {
      console.error("Chaupal room search error:", err);
    }

    // -------------------------------------------------------------
    // 6. Categories Search
    // -------------------------------------------------------------
    try {
      const likeClean = `%${cleanQ}%`;
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, slug, description")
        .or(`name.ilike.${likeClean},description.ilike.${likeClean},slug.ilike.${likeClean}`)
        .limit(5);

      if (categories) {
        categories.forEach((c: any) => {
          let score = 60;
          if (c.name.toLowerCase() === cleanQ || c.slug.toLowerCase() === cleanQ) score += 60;

          const uniqueId = `category-${c.id}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            results.push({
              id: uniqueId,
              type: "category",
              title: c.name,
              subtitle: c.description,
              url: `/category/${c.slug}`,
              score,
            });
          }
        });
      }
    } catch (err) {
      console.error("Category search error:", err);
    }

    // -------------------------------------------------------------
    // 7. Tags Search
    // -------------------------------------------------------------
    try {
      const likeClean = `%${cleanQ}%`;
      const { data: tags } = await supabase
        .from("tags")
        .select("id, name, slug")
        .or(`name.ilike.${likeClean},slug.ilike.${likeClean}`)
        .limit(5);

      if (tags) {
        tags.forEach((t: any) => {
          let score = 55;
          if (t.name.toLowerCase() === cleanQ || t.slug.toLowerCase() === cleanQ) score += 55;

          const uniqueId = `tag-${t.id}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            results.push({
              id: uniqueId,
              type: "tag",
              title: t.name,
              url: `/category/${t.slug}`,
              score,
            });
          }
        });
      }
    } catch (err) {
      console.error("Tag search error:", err);
    }

    // Sort all combined results by score descending
    results.sort((a, b) => b.score - a.score);

    return results;
  } catch (error) {
    console.error("Global search error:", error);
    return [];
  }
}

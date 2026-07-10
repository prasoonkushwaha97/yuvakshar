"use server";

import { createClient } from "../supabaseServer";

export interface SearchResult {
  id: string;
  type: "article" | "magazine" | "chaupal_post" | "chaupal_discussion" | "chaupal_group" | "author" | "category" | "tag";
  title: string;
  subtitle?: string;
  thumbnail?: string;
  url: string;
  author?: string;
  date?: string;
  score: number; // Internal ranking
  meta?: any; // Additional data
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const q = query.trim().toLowerCase();
  const likeQuery = `%${q}%`;
  
  // To avoid hitting all tables if query is very short
  const results: SearchResult[] = [];

  try {
    // 1. Articles Search
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, english_title, slug, summary, status, updated_at, categories(slug), profiles!articles_author_id_fkey(name)')
      .eq('status', 'Published')
      .or(`title.ilike.${likeQuery},english_title.ilike.${likeQuery},summary.ilike.${likeQuery}`)
      .limit(10);

    if (articles) {
      articles.forEach((a: any) => {
        let score = 0;
        if (a.title && a.title.toLowerCase().includes(q)) score += 10;
        if (a.english_title && a.english_title.toLowerCase().includes(q)) score += 8;
        if (a.summary && a.summary.toLowerCase().includes(q)) score += 5;

        const categorySlug = Array.isArray(a.categories) ? a.categories[0]?.slug : a.categories?.slug;
        
        results.push({
          id: `article-${a.id}`,
          type: "article",
          title: a.title || a.english_title,
          subtitle: a.summary,
          url: `/articles/${a.slug}`,
          date: a.updated_at,
          author: a.profiles?.name || undefined,
          score,
          meta: { categorySlug }
        });
      });
    }

    // 2. Magazines Search
    const { data: magazines } = await supabase
      .from('magazines')
      .select('id, issue, month, year, cover_url')
      .or(`issue.ilike.${likeQuery},month.ilike.${likeQuery}`)
      .limit(5);
    
    if (magazines) {
      magazines.forEach((m: any) => {
        let score = 0;
        if (m.issue && m.issue.toLowerCase().includes(q)) score += 10;
        if (m.month && m.month.toLowerCase().includes(q)) score += 5;

        results.push({
          id: `magazine-${m.id}`,
          type: "magazine",
          title: `${m.month} ${m.year}`,
          subtitle: `अंक: ${m.issue}`,
          thumbnail: m.cover_url,
          url: `/magazine/${m.issue || m.id}`,
          score
        });
      });
    }

    // 3. Authors/Profiles Search
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, username, bio, avatar_url')
      .or(`name.ilike.${likeQuery},username.ilike.${likeQuery}`)
      .limit(5);

    if (profiles) {
      profiles.forEach((p: any) => {
        let score = 0;
        if (p.name && p.name.toLowerCase().includes(q)) score += 10;
        if (p.username && p.username.toLowerCase().includes(q)) score += 8;

        results.push({
          id: `profile-${p.id}`,
          type: "author",
          title: p.name,
          subtitle: p.bio,
          thumbnail: p.avatar_url,
          url: `/u/${p.username}`,
          score
        });
      });
    }

    // 4. Chaupal Posts
    try {
      const { data, error } = await supabase
        .from('chaupal_posts')
        .select('id, content, profiles(name, username, avatar_url), created_at')
        .ilike('content', likeQuery)
        .limit(5);
      if (!error && data) {
        data.forEach((post: any) => {
          const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
          results.push({
            id: `chaupal-${post.id}`,
            type: "chaupal_post",
            title: post.content ? (post.content.length > 80 ? post.content.substring(0, 80) + "..." : post.content) : "Post",
            author: profile?.name || "Member",
            thumbnail: profile?.avatar_url,
            url: `/community/post/${post.id}`,
            date: post.created_at,
            score: 5
          });
        });
      }
    } catch (e) {
      // ignore
    }

    // 5. Chaupal Groups & Discussions
    try {
      const { data, error } = await supabase
        .from('chaupal_rooms')
        .select('id, title, description, type, created_at')
        .or(`title.ilike.${likeQuery},description.ilike.${likeQuery}`)
        .limit(5);
      if (!error && data) {
        data.forEach((room: any) => {
          const isGroup = room.type === 'group';
          results.push({
            id: `room-${room.id}`,
            type: isGroup ? "chaupal_group" : "chaupal_discussion",
            title: room.title,
            subtitle: room.description,
            url: isGroup ? `/community/groups/${room.id}` : `/community/discussion/${room.id}`,
            date: room.created_at,
            score: 6
          });
        });
      }
    } catch (e) {}



    // 7. Categories
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .or(`name.ilike.${likeQuery},description.ilike.${likeQuery}`)
        .limit(3);
      if (!error && data) {
        data.forEach((c: any) => {
          results.push({
            id: `category-${c.id}`,
            type: "category",
            title: c.name,
            subtitle: c.description,
            url: `/category/${c.slug}`,
            score: 8
          });
        });
      }
    } catch (e) {}

    // 8. Tags
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, slug')
        .ilike('name', likeQuery)
        .limit(3);
      if (!error && data) {
        data.forEach((t: any) => {
          results.push({
            id: `tag-${t.id}`,
            type: "tag",
            title: t.name,
            url: `/category/${t.slug}`, // Using /category/ as fallback if /tag/ doesn't exist natively. Change to /tags/slug if needed
            score: 8
          });
        });
      }
    } catch (e) {}

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    return results;
  } catch (error) {
    console.error("Global search error:", error);
    return [];
  }
}

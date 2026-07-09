"use server";

import { supabase } from "@/lib/supabaseClient";

export async function searchChaupal(query: string, tab: 'discussions' | 'users' | 'groups' = 'discussions') {
  if (!query) return [];

  const searchQuery = `%${query}%`;

  if (tab === 'discussions') {
    const { data: posts, error } = await supabase
      .from('chaupal_posts')
      .select(`
        id,
        content,
        media_url,
        poll_question,
        poll_options,
        created_at,
        is_pinned,
        is_locked,
        group_id,
        author:profiles!chaupal_posts_author_id_fkey(id, name, username, avatar_url, is_verified, role),
        likes:chaupal_post_likes(count),
        comments:chaupal_post_comments(count)
      `)
      .eq('is_draft', false)
      .eq('is_hidden', false)
      .ilike('content', searchQuery)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Search Discussions Error:", error);
      return [];
    }
    
    // Map same way as feed
    return posts.map(post => ({
      id: post.id,
      content: post.content,
      mediaUrl: post.media_url,
      timestamp: post.created_at,
      author: Array.isArray(post.author) ? post.author[0] : post.author,
      likesCount: post.likes[0]?.count || 0,
      commentsCount: post.comments[0]?.count || 0,
      sharesCount: 0,
      isLiked: false, // Placeholder for search, complex to bulk resolve here for now
      isSaved: false,
      pollQuestion: post.poll_question,
      pollOptions: post.poll_options,
      visibility: post.group_id ? "group" : "public",
      isPinned: post.is_pinned,
      isLocked: post.is_locked,
      groupId: post.group_id
    }));
  }

  if (tab === 'users') {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, is_verified, role, public_identity')
      .or(`name.ilike.${searchQuery},username.ilike.${searchQuery}`)
      .limit(20);

    if (error) {
      console.error("Search Users Error:", error);
      return [];
    }
    return users;
  }

  if (tab === 'groups') {
    const { data: groups, error } = await supabase
      .from('chaupal_groups')
      .select('id, name, description, avatar_url, is_private')
      .or(`name.ilike.${searchQuery},description.ilike.${searchQuery}`)
      .limit(20);

    if (error) {
      console.error("Search Groups Error:", error);
      return [];
    }
    return groups;
  }

  return [];
}

"use server";

import { supabase } from "@/lib/supabaseClient";

export async function getFeedPosts(page = 1, limit = 20, filter = 'latest') {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const query = supabase
    .from('chaupal_posts')
    .select(`
      id,
      content,
      media_url,
      poll_question,
      poll_options,
      created_at,
      author:profiles!chaupal_posts_author_id_fkey(id, name, username, avatar_url, is_verified),
      likes:chaupal_post_likes(count),
      comments:chaupal_post_comments(count)
    `)
    .order('created_at', { ascending: false })
    .range(start, end);

  // Note: For Trending/Following we would adjust the query, 
  // keeping it simple for 'latest' initially.

  const { data: posts, error } = await query;
  
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  // If user is logged in, fetch their likes and bookmarks to set isLiked and isSaved
  const userLikes = new Set<string>();
  const userSaves = new Set<string>();

  if (userId && posts.length > 0) {
    const postIds = posts.map(p => p.id);
    
    // Fetch likes
    const { data: likes } = await supabase
      .from('chaupal_post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);
      
    if (likes) likes.forEach(l => userLikes.add(l.post_id));

    // Fetch bookmarks
    const { data: saves } = await supabase
      .from('bookmarks')
      .select('chaupal_post_id')
      .eq('user_id', userId)
      .in('chaupal_post_id', postIds);
      
    if (saves) saves.forEach(s => { if (s.chaupal_post_id) userSaves.add(s.chaupal_post_id) });
  }

  // Format the response to match FeedCardProps
  return posts.map(post => ({
    id: post.id,
    content: post.content,
    mediaUrl: post.media_url,
    timestamp: post.created_at,
    author: Array.isArray(post.author) ? post.author[0] : post.author, // Handle PostgREST array behavior
    likesCount: post.likes[0]?.count || 0,
    commentsCount: post.comments[0]?.count || 0,
    sharesCount: 0, // Placeholder
    isLiked: userLikes.has(post.id),
    isSaved: userSaves.has(post.id),
    pollQuestion: post.poll_question,
    pollOptions: post.poll_options
  }));
}

export async function createPost(content: string, mediaUrl?: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('chaupal_posts')
    .insert([{
      author_id: userId,
      content,
      media_url: mediaUrl
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleLikePost(postId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // Check if like exists
  const { data: existing } = await supabase
    .from('chaupal_post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Unlike
    await supabase.from('chaupal_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    return false; // isLiked = false
  } else {
    // Like
    await supabase.from('chaupal_post_likes').insert([{ post_id: postId, user_id: userId }]);
    
    // Notification logic omitted to prevent RBAC/type errors
    
    return true; // isLiked = true
  }
}

export async function deletePost(postId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // RLS will ensure they can only delete their own post (unless admin, handled later)
  const { error } = await supabase.from('chaupal_posts').delete().eq('id', postId).eq('author_id', userId);
  if (error) throw new Error(error.message);
  return true;
}

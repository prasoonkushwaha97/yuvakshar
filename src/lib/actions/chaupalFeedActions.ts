"use server";

import { supabase } from "@/lib/supabaseClient";

export async function getFeedPosts(cursor?: string, limit = 20, filter = 'latest') {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;

  // Filter out drafts and hidden posts
  let query = supabase
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
    .order('is_pinned', { ascending: false }) // Pinned posts on top
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  // Handle specific tabs
  if (filter === 'groups') {
    query = query.not('group_id', 'is', null);
  } else if (filter === 'following') {
    query = query.is('group_id', null);
    if (userId) {
      const { data: following } = await supabase.from('user_followers').select('following_id').eq('follower_id', userId);
      const followingIds = following ? following.map(f => f.following_id) : [];
      if (followingIds.length > 0) {
        query = query.in('author_id', followingIds);
      } else {
        return []; // Not following anyone
      }
    } else {
      return []; // Must be logged in to see following
    }
  } else {
    // latest, trending, for-you etc should not show group posts by default
    query = query.is('group_id', null);
  }

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
    pollOptions: post.poll_options,
    visibility: post.group_id ? "group" : "public",
    isPinned: post.is_pinned,
    isLocked: post.is_locked,
    groupId: post.group_id
  }));
}

export async function createPost({ content, mediaUrl, isDraft = false, groupId = null }: { content: string, mediaUrl?: string, isDraft?: boolean, groupId?: string | null }) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('chaupal_posts')
    .insert([{
      author_id: userId,
      content,
      media_url: mediaUrl,
      is_draft: isDraft,
      group_id: groupId
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Handle Mentions if not draft
  if (!isDraft) {
    const mentions = content.match(/@(\w+)/g);
    if (mentions) {
      const usernames = mentions.map(m => m.slice(1));
      if (usernames.length > 0) {
        const { data: mentionedUsers } = await supabase.from('profiles').select('id, username').in('username', usernames);
        if (mentionedUsers && mentionedUsers.length > 0) {
          const { data: currentUserProfile } = await supabase.from('profiles').select('name').eq('id', userId).single();
          
          import('./notificationActions').then(({ createInternalNotification }) => {
            mentionedUsers.forEach(mu => {
              if (mu.id !== userId) {
                createInternalNotification(
                  mu.id,
                  'mention',
                  'उल्लेख',
                  `${currentUserProfile?.name || 'किसी'} ने एक चर्चा में आपका उल्लेख किया है।`,
                  `/community/discussion/thread/${data.id}`
                );
              }
            });
          });
        }
      }
    }
  }

  return data;
}

export async function editPost(postId: string, newContent: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('chaupal_posts')
    .update({ content: newContent })
    .eq('id', postId)
    .eq('author_id', userId) // RLS protection + explicit check
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePost(postId: string) {
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // RLS will ensure they can only delete their own post (unless admin/editor)
  const { error } = await supabase.from('chaupal_posts').delete().eq('id', postId);
  if (error) throw new Error(error.message);
  return true;
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

    // Notification
    const { data: post } = await supabase.from('chaupal_posts').select('author_id, content').eq('id', postId).single();
    if (post && post.author_id !== userId) {
      const { data: user } = await supabase.from('profiles').select('name').eq('id', userId).single();
      if (user) {
        import('./notificationActions').then(({ createInternalNotification }) => {
          createInternalNotification(
            post.author_id, 
            'like', 
            'नई पसंद', 
            `${user.name} ने आपकी चर्चा "${post.content.substring(0, 30)}..." को पसंद किया।`,
            `/community/discussion/thread/${postId}`
          );
        });
      }
    }

    return true; // isLiked = true
  }
}

export async function toggleBookmarkPost(postId: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('chaupal_post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('bookmarks').insert([{ chaupal_post_id: postId, user_id: userId, type: 'chaupal_post' }]);
    return true;
  }
}

export async function addComment(postId: string, content: string, parentId?: string, mediaUrl?: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('chaupal_post_comments')
    .insert([{
      post_id: postId,
      author_id: userId,
      content,
      parent_id: parentId || null,
      media_url: mediaUrl || null
    }])
    .select('*, author:profiles(id, name, username, avatar_url, is_verified)')
    .single();

  if (error) throw new Error(error.message);

  // Notification for comment/reply
  const { data: post } = await supabase.from('chaupal_posts').select('author_id, content').eq('id', postId).single();
  
  if (post && post.author_id !== userId) {
    const { data: user } = await supabase.from('profiles').select('name').eq('id', userId).single();
    if (user) {
      import('./notificationActions').then(({ createInternalNotification }) => {
        createInternalNotification(
          post.author_id, 
          'comment', 
          'नई प्रतिक्रिया', 
          `${user.name} ने आपकी चर्चा पर प्रतिक्रिया दी है।`,
          `/community/discussion/thread/${postId}`
        );
      });
    }
  }

  return data;
}

export async function reportPost(postId: string, reason: string) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('submissions')
    .insert([{
      type: 'report',
      name: 'Community Report',
      email: 'system@yuvakshar.com',
      content: `Report for Chaupal Post ${postId}. Reason: ${reason}. Reported by user ${userId}.`,
      status: 'New'
    }]);

  if (error) throw new Error(error.message);
  return true;
}

export async function pinPost(postId: string, isPinned: boolean) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user?.id) throw new Error("Unauthorized");
  
  // Need server role to bypass RLS if auth user isn't author
  // Assuming RLS allows admins to update 'is_pinned'
  const { error } = await supabase
    .from('chaupal_posts')
    .update({ is_pinned: isPinned })
    .eq('id', postId);

  if (error) throw new Error(error.message);
  return true;
}

export async function hidePost(postId: string, isHidden: boolean) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user?.id) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('chaupal_posts')
    .update({ is_hidden: isHidden })
    .eq('id', postId);

  if (error) throw new Error(error.message);
  return true;
}

export async function lockPost(postId: string, isLocked: boolean) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user?.id) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('chaupal_posts')
    .update({ is_locked: isLocked })
    .eq('id', postId);

  if (error) throw new Error(error.message);
  return true;
}

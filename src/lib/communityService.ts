"use server";

import { createClient } from "./supabaseServer";

// ─── TYPE INTERFACES ────────────────────────────────────────────────────────

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: "Literature" | "Poetry" | "Journalism" | "Research" | "Exams" | "Reading Club";
  is_private: boolean;
  owner_id: string;
  current_book?: string;
  created_at: string;
  membersCount?: number;
}

export interface CommunityGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "Owner" | "Admin" | "Moderator" | "Mentor" | "Member";
  joined_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_rank?: string;
  group_id?: string;
  group_name?: string;
  title?: string;
  content: string;
  post_type: "text" | "image" | "pdf" | "poll" | "discussion" | "resource" | "link";
  media_url?: string;
  poll_question?: string;
  poll_options?: string[];
  poll_votes?: Record<string, number>; 
  link_url?: string;
  forum_category?: "General" | "Writing Help" | "Criticism" | "Publishing" | "Magazine" | "Research" | "Support";
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  best_answer_id?: string;
  created_at: string;
  likesCount: number;
  commentsCount: number;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  is_accepted_answer: boolean;
  likesCount: number;
  created_at: string;
  replies?: CommunityComment[];
  reply_to_name?: string;
  reply_to_content?: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: "Workshop" | "Webinar" | "Competition" | "Live Session" | "Meetup";
  event_date: string;
  meeting_link?: string;
  attendeesCount: number;
  isRegistered?: boolean;
}

// ─── INITIALIZATION ────────────────────────────────────────────────────────

export const initializeCommunityData = async () => {
  // No-op. Data lives in Supabase.
};

// ─── GROUPS ─────────────────────────────────────────────────────────────────

export const fetchGroups = async (): Promise<CommunityGroup[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_groups").select("*");
  if (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
  return data || [];
};

export const fetchGroupMembers = async (groupId: string): Promise<CommunityGroupMember[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_members").select("*").eq("community_id", groupId);
  if (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
  return (data || []).map((m: any) => ({
    id: m.id,
    group_id: m.community_id,
    user_id: m.user_id,
    role: m.role || "Member",
    joined_at: m.joined_at
  }));
};

export const isUserGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_members")
    .select("id")
    .eq("community_id", groupId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  return !!data;
};

export const toggleGroupMembership = async (groupId: string, userId: string): Promise<boolean> => {
  const supabase = await createClient();
  const isMember = await isUserGroupMember(groupId, userId);
  
  if (isMember) {
    await supabase.from("community_members")
      .delete()
      .eq("community_id", groupId)
      .eq("user_id", userId);
    return false;
  } else {
    await supabase.from("community_members")
      .insert({ community_id: groupId, user_id: userId, role: "member", status: "active" });
    return true;
  }
};

// ─── POSTS ──────────────────────────────────────────────────────────────────

export const fetchPosts = async (groupId?: string): Promise<CommunityPost[]> => {
  const supabase = await createClient();
  let query = supabase.from("community_posts").select(`
    *,
    profiles:user_id(name, avatar_url, role),
    groups:group_id(name),
    likes:community_post_likes(count),
    comments:community_comments(count)
  `).order("created_at", { ascending: false });

  if (groupId && groupId !== "all") {
    query = query.eq("group_id", groupId);
  } else {
    query = query.is("group_id", null);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    user_name: p.profiles?.name || "Unknown User",
    user_avatar: p.profiles?.avatar_url,
    user_rank: p.profiles?.role || "Member",
    group_id: p.group_id,
    group_name: p.groups?.name,
    title: p.title,
    content: p.content,
    post_type: p.post_type || "text",
    media_url: p.media_url,
    poll_question: p.poll_question,
    poll_options: p.poll_options,
    poll_votes: p.poll_votes,
    link_url: p.link_url,
    forum_category: p.forum_category || "General",
    is_pinned: p.is_pinned || false,
    is_locked: p.is_locked || false,
    is_solved: p.is_solved || false,
    best_answer_id: p.best_answer_id,
    created_at: p.created_at,
    likesCount: p.likes[0]?.count || 0,
    commentsCount: p.comments[0]?.count || 0
  }));
};

export const fetchUserPosts = async (userId: string): Promise<CommunityPost[]> => {
  const supabase = await createClient();
  const query = supabase.from("community_posts").select(`
    *,
    profiles:user_id(name, avatar_url, role),
    groups:group_id(name),
    likes:community_post_likes(count),
    comments:community_comments(count)
  `).eq("user_id", userId).order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    user_name: p.profiles?.name || "Unknown User",
    user_avatar: p.profiles?.avatar_url,
    user_rank: p.profiles?.role || "Member",
    group_id: p.group_id,
    group_name: p.groups?.name,
    title: p.title,
    content: p.content,
    post_type: p.post_type || "text",
    media_url: p.media_url,
    poll_question: p.poll_question,
    poll_options: p.poll_options,
    poll_votes: p.poll_votes,
    link_url: p.link_url,
    forum_category: p.forum_category || "General",
    is_pinned: p.is_pinned || false,
    is_locked: p.is_locked || false,
    is_solved: p.is_solved || false,
    best_answer_id: p.best_answer_id,
    created_at: p.created_at,
    likesCount: p.likes[0]?.count || 0,
    commentsCount: p.comments[0]?.count || 0
  }));
};

export const createPost = async (
  userId: string,
  userName: string,
  content: string,
  postType: string,
  optionalData: any
): Promise<CommunityPost> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_posts").insert({
    user_id: userId,
    group_id: optionalData?.group_id === "all" ? null : optionalData?.group_id,
    title: optionalData?.title,
    content: content,
    post_type: postType || "text",
    media_url: optionalData?.media_url,
    poll_question: optionalData?.poll_question,
    poll_options: optionalData?.poll_options,
    link_url: optionalData?.link_url,
    forum_category: optionalData?.forum_category || "General",
  }).select().single();

  if (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }

  return {
    ...data,
    user_name: userName,
    user_avatar: optionalData?.user_avatar,
    likesCount: 0,
    commentsCount: 0
  } as CommunityPost;
};

export const deletePost = async (postId: string): Promise<boolean> => {
  const supabase = await createClient();
  const { error } = await supabase.from("community_posts").delete().eq("id", postId);
  return !error;
};

export const updatePost = async (
  postId: string,
  updates: Partial<CommunityPost>
): Promise<CommunityPost | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_posts").update(updates).eq("id", postId).select().single();
  if (error) {
    console.error("Error updating post:", error);
    return null;
  }
  return data as CommunityPost;
};

export const toggleLikePost = async (postId: string, userId: string): Promise<number> => {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("community_post_likes")
    .select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
    
  if (existing) {
    await supabase.from("community_post_likes").delete().eq("post_id", postId).eq("user_id", userId);
  } else {
    await supabase.from("community_post_likes").insert({ post_id: postId, user_id: userId });
  }

  const { count } = await supabase.from("community_post_likes")
    .select("*", { count: "exact", head: true }).eq("post_id", postId);

  return count || 0;
};

// ─── COMMENTS ───────────────────────────────────────────────────────────────

export const fetchComments = async (postId: string): Promise<CommunityComment[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_comments").select(`
    *,
    profiles:user_id(name, avatar_url),
    likes:community_comment_likes(count)
  `).eq("post_id", postId).order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  const allComments = (data || []).map((c: any) => ({
    id: c.id,
    post_id: c.post_id,
    parent_id: c.parent_id,
    user_id: c.user_id,
    user_name: c.profiles?.name || "Unknown User",
    user_avatar: c.profiles?.avatar_url,
    content: c.content,
    is_accepted_answer: c.is_accepted_answer || false,
    likesCount: c.likes[0]?.count || 0,
    created_at: c.created_at,
    replies: [],
    reply_to_name: c.reply_to_name,
    reply_to_content: c.reply_to_content
  }));

  // Build tree
  const rootComments: CommunityComment[] = [];
  const map = new Map<string, CommunityComment>();
  allComments.forEach((c: any) => map.set(c.id, c));

  allComments.forEach((c: any) => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(c);
    } else {
      rootComments.push(c);
    }
  });

  return rootComments;
};

export const addComment = async (
  postId: string,
  userId: string,
  userName: string,
  content: string,
  parentId?: string | null,
  replyToName?: string,
  replyToContent?: string
): Promise<CommunityComment> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_comments").insert({
    post_id: postId,
    content,
    user_id: userId,
    parent_id: parentId || null,
    reply_to_name: replyToName,
    reply_to_content: replyToContent
  }).select().single();

  if (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }

  return {
    ...data,
    user_name: userName,
    user_avatar: undefined,
    likesCount: 0,
    replies: []
  } as CommunityComment;
};

export const toggleLikeComment = async (commentId: string, userId: string): Promise<number> => {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("community_comment_likes")
    .select("comment_id").eq("comment_id", commentId).eq("user_id", userId).maybeSingle();
    
  if (existing) {
    await supabase.from("community_comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId);
  } else {
    await supabase.from("community_comment_likes").insert({ comment_id: commentId, user_id: userId });
  }

  const { count } = await supabase.from("community_comment_likes")
    .select("*", { count: "exact", head: true }).eq("comment_id", commentId);

  return count || 0;
};

// ─── EVENTS ─────────────────────────────────────────────────────────────────

export const fetchEvents = async (): Promise<CommunityEvent[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_events").select(`
    *,
    attendees:community_event_attendees(count)
  `).order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  // To check if current user is registered, we need user context which isn't passed here.
  // We'll leave isRegistered as false or handle it client-side.
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  let registeredIds: string[] = [];
  if (authData?.user?.id) {
     const { data: myAttendees } = await supabase.from("community_event_attendees")
       .select("event_id").eq("user_id", authData.user.id);
     registeredIds = (myAttendees || []).map(a => a.event_id);
  }

  return (data || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type,
    event_date: e.event_date,
    meeting_link: e.meeting_link,
    attendeesCount: e.attendees[0]?.count || 0,
    isRegistered: registeredIds.includes(e.id)
  }));
};

export const toggleEventRegistration = async (eventId: string, isRegistering: boolean): Promise<boolean> => {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }));
  if (!authData?.user) return false;

  if (isRegistering) {
    await supabase.from("community_event_attendees").insert({ event_id: eventId, user_id: authData.user.id });
    return true;
  } else {
    await supabase.from("community_event_attendees").delete().eq("event_id", eventId).eq("user_id", authData.user.id);
    return false;
  }
};

// ─── NON-IMPLEMENTED MOCKED FEATURES ────────────────────────────────────────

// These are scoped out of Phase 4C schema requests, returning empty or stubs.

export const creditReputationPoints = async (...args: any[]): Promise<void> => {};

export const fetchConversations = async (): Promise<any[]> => [];

export const fetchMessages = async (convId: string): Promise<any[]> => [];

export const sendMessage = async (...args: any[]): Promise<any> => null;

export const fetchNotifications = async (): Promise<any[]> => [];

export const markNotificationsRead = async (): Promise<void> => {};

export const fetchChallenges = async (): Promise<any[]> => [];

export const submitChallengeWork = async (...args: any[]): Promise<any> => null;

export const fetchChallengeSubmissions = async (challengeId: string): Promise<any[]> => [];

export const searchCommunity = async (query: string, ...args: any[]): Promise<any[]> => [];

export const toggleFollowUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => false;

export const isUserFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => false;

export const getUserSocialTimeline = async (userId: string): Promise<any[]> => [];

export const fetchReadingProgress = async (groupId: string): Promise<any[]> => [];

export const saveReadingProgress = async (...args: any[]): Promise<void> => {};

export interface CommunityChallenge { id: string; title: string; description: string; type: string; start_date: string; end_date: string; reward_points: number; created_at: string; }
export interface CommunityChallengeSubmission { id: string; challenge_id: string; user_id: string; user_name: string; title: string; content: string; votes_count: number; is_winner: boolean; created_at: string; }
export interface CommunityConversation { id: string; name?: string; is_group: boolean; created_at: string; lastMessage?: string; lastMessageTime?: string; unreadCount?: number; }
export interface CommunityMessage { id: string; conversation_id: string; sender_id: string; sender_name: string; sender_avatar?: string; content?: string; file_url?: string; reactions?: Record<string, string[]>; is_read: boolean; created_at: string; }
export interface CommunityNotification { id: string; user_id: string; sender_id: string; sender_name: string; sender_avatar?: string; notification_type: string; content: string; related_id?: string; is_read: boolean; created_at: string; }
export interface CommunityBookmark { id: string; user_id: string; content_type: string; content_id: string; created_at: string; }
export interface CommunityReadingProgress { id: string; group_id: string; user_id: string; book_title: string; current_page: number; total_pages: number; notes?: string; updated_at: string; }
export interface CommunityReputationHistory { id: string; user_id: string; points: number; source: string; related_id?: string; created_at: string; }


import { supabase } from "@/lib/supabaseClient";
import { CommunityPost } from "@/lib/communityService";

export class SupabaseCommunityRepository {
  async getPosts(groupId?: string): Promise<CommunityPost[]> {
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
    if (error) throw error;
    return this.mapDbToPosts(data || []);
  }

  async getPostById(id: string): Promise<CommunityPost | null> {
    const { data, error } = await supabase.from("community_posts").select(`
      *,
      profiles:user_id(name, avatar_url, role),
      groups:group_id(name),
      likes:community_post_likes(count),
      comments:community_comments(count)
    `).eq("id", id).single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapDbToPosts([data])[0];
  }

  async createPost(post: Partial<CommunityPost>): Promise<CommunityPost> {
    const { data, error } = await supabase.from("community_posts").insert({
      user_id: post.user_id,
      group_id: post.group_id,
      title: post.title,
      content: post.content,
      post_type: post.post_type,
      media_url: post.media_url,
      poll_question: post.poll_question,
      poll_options: post.poll_options,
      poll_votes: post.poll_votes,
      link_url: post.link_url,
      forum_category: post.forum_category,
      status: post.status || 'Published'
    }).select(`
      *,
      profiles:user_id(name, avatar_url, role),
      groups:group_id(name),
      likes:community_post_likes(count),
      comments:community_comments(count)
    `).single();

    if (error) throw error;
    return this.mapDbToPosts([data])[0];
  }

  async updatePost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost> {
    const { data, error } = await supabase.from("community_posts").update({
      title: updates.title,
      content: updates.content,
      post_type: updates.post_type,
      media_url: updates.media_url,
      poll_question: updates.poll_question,
      poll_options: updates.poll_options,
      poll_votes: updates.poll_votes,
      link_url: updates.link_url,
      forum_category: updates.forum_category,
      status: updates.status,
      is_pinned: updates.is_pinned,
      is_locked: updates.is_locked,
      is_solved: updates.is_solved,
      best_answer_id: updates.best_answer_id
    }).eq("id", id).select(`
      *,
      profiles:user_id(name, avatar_url, role),
      groups:group_id(name),
      likes:community_post_likes(count),
      comments:community_comments(count)
    `).single();

    if (error) throw error;
    return this.mapDbToPosts([data])[0];
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase.from("community_posts").delete().eq("id", id);
    if (error) throw error;
  }

  private mapDbToPosts(data: any[]): CommunityPost[] {
    return data.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      user_name: p.profiles?.name || "Unknown User",
      user_avatar: p.profiles?.avatar_url,
      user_rank: p.profiles?.role || "Normal User",
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
      status: p.status || 'Published',
      likesCount: p.likes?.[0]?.count || 0,
      commentsCount: p.comments?.[0]?.count || 0
    }));
  }
}

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface DashboardStats {
  publishedArticles: number;
  draftArticles: number;
  pendingReview: number;
  needsRevision: number;
  rejectedArticles: number;
  archivedArticles: number;
  featuredArticles: number;
  priorityAssignments: number;
  
  magazineIssues: number;
  
  totalUsers: number;
  editorialTeamMembers: number;
  communityUsers: number;
}

export const dashboardAnalyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const countStatus = async (status: string) => {
      const { count } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).ilike('status', status);
      return count || 0;
    };
    
    // Arrays for 'in' queries
    const countPendingReview = async () => {
      const { count } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).or('status.ilike.submitted,status.ilike.revision_requested');
      return count || 0;
    };

    const countFeatured = async () => {
      const { count } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('featured', true);
      return count || 0;
    };

    const countPriority = async () => {
      // The priority column does not exist on the articles table yet.
      return 0;
    };
    
    const countMagazines = async () => {
      const { count } = await supabaseAdmin.from('magazine_issues').select('*', { count: 'exact', head: true });
      return count || 0;
    };
    
    const countTotalUsers = async () => {
      const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    };

    const getEditorialCount = async () => {
      const { data, error } = await supabaseAdmin.from('user_roles').select('user_id, roles!inner(slug)').in('roles.slug', ['founder', 'co_founder', 'super_admin', 'admin', 'editor_in_chief', 'managing_editor', 'editor']);
      if (!data || error) return 0;
      const uniqueUsers = new Set(data.map((d: any) => d.user_id));
      return uniqueUsers.size;
    };

    const [
      publishedArticles,
      draftArticles,
      pendingReview,
      needsRevision,
      rejectedArticles,
      archivedArticles,
      featuredArticles,
      priorityAssignments,
      magazineIssues,
      totalUsers,
      editorialTeamMembers
    ] = await Promise.all([
      countStatus('published'),
      countStatus('draft'),
      countPendingReview(),
      countStatus('revision_requested'),
      countStatus('rejected'),
      countStatus('archived'),
      countFeatured(),
      countPriority(),
      countMagazines(),
      countTotalUsers(),
      getEditorialCount()
    ]);

    const communityUsers = Math.max(0, totalUsers - editorialTeamMembers);

    return {
      publishedArticles,
      draftArticles,
      pendingReview,
      needsRevision,
      rejectedArticles,
      archivedArticles,
      featuredArticles,
      priorityAssignments,
      magazineIssues,
      totalUsers,
      editorialTeamMembers,
      communityUsers
    };
  }
};

import { getFounderDashboardStats } from "@/lib/actions/systemActions";

export const dynamic = 'force-dynamic';

export default async function FounderDashboardPage() {
  let stats = {
    totalUsers: 0,
    founders: 0,
    admins: 0,
    editors: 0,
    moderators: 0,
    reviewers: 0
  };
  let error = null;

  try {
    stats = await getFounderDashboardStats();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
        {error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md mb-4 text-sm">
            Failed to load stats: {error}
          </div>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalUsers || 0}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Founders</h3>
            <p className="text-3xl font-bold mt-2">{stats.founders || 0}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Admins</h3>
            <p className="text-3xl font-bold mt-2">{stats.admins || 0}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Editors</h3>
            <p className="text-3xl font-bold mt-2">{stats.editors || 0}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Moderators</h3>
            <p className="text-3xl font-bold mt-2">{stats.moderators || 0}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Reviewers</h3>
            <p className="text-3xl font-bold mt-2">{stats.reviewers || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

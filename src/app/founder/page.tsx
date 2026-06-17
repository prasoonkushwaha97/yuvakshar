import { getFounderDashboardStats } from "@/lib/actions/systemActions";
import { Users, FileText, UsersRound, MessageSquare, ClipboardList, CheckSquare } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function FounderDashboardPage() {
  let stats = {
    totalUsers: 0,
    totalArticles: 0,
    totalCommunities: 0,
    totalComments: 0,
    totalAuditEvents: 0,
    pendingReviews: 0,
  };
  let error = null;

  try {
    stats = await getFounderDashboardStats();
  } catch (e: any) {
    error = e.message;
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Articles", value: stats.totalArticles, icon: FileText, color: "text-green-500" },
    { label: "Total Communities", value: stats.totalCommunities, icon: UsersRound, color: "text-purple-500" },
    { label: "Total Comments", value: stats.totalComments, icon: MessageSquare, color: "text-pink-500" },
    { label: "Total Audit Events", value: stats.totalAuditEvents, icon: ClipboardList, color: "text-amber-500" },
    { label: "Pending Reviews", value: stats.pendingReviews, icon: CheckSquare, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">System Analytics</h2>
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md mb-4 text-sm border border-red-200 dark:border-red-900/50">
            Failed to load stats: {error}
          </div>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { getMagazineIssues } from "@/lib/actions/magazineActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateIssueModal from "@/components/founder/magazine/CreateIssueModal";

export const dynamic = "force-dynamic";

export default async function MagazineDashboard() {
  const canAccess = await hasPermission("manage_system");
  if (!canAccess) redirect("/founder/unauthorized");

  const issues = await getMagazineIssues();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Magazine Issues</h1>
          <p className="text-slate-500 text-sm mt-1">Manage digital editions, compile articles, and publish issues.</p>
        </div>
        <CreateIssueModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {issues?.map(issue => (
          <div key={issue.id} className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">
              {issue.cover_image ? (
                 <img src={issue.cover_image} alt="cover" className="w-full h-full object-cover" />
              ) : (
                "No Cover Image"
              )}
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{issue.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                  issue.status === 'published' ? 'bg-green-100 text-green-800' :
                  issue.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {issue.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Volume {issue.volume}, Issue {issue.issue_number}</p>
              <div className="mt-auto">
                <Link href={`/founder/magazine/builder/${issue.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Open Builder &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {issues.length === 0 && (
        <div className="text-center p-12 bg-white border rounded-lg text-gray-500">
          No magazine issues created yet. Create your first issue to start building.
        </div>
      )}
    </div>
  );
}

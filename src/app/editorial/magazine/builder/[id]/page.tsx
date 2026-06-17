import React from "react";
import { getMagazineIssueById } from "@/lib/actions/magazineActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";
import Link from "next/link";
import IssueBuilder from "@/components/founder/magazine/IssueBuilder";

export const dynamic = "force-dynamic";

export default async function MagazineBuilderPage({ params }: { params: { id: string } }) {
  const canAccess = await hasPermission("manage_system");
  if (!canAccess) redirect("/founder/unauthorized");

  const issue = await getMagazineIssueById(params.id);
  if (!issue) redirect("/founder/magazine");

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/founder/magazine" className="text-sm text-blue-500 hover:underline mb-2 inline-block">&larr; Back to Issues</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Issue Builder: {issue.title}</h1>
          <p className="text-slate-500 text-sm mt-1">Organize sections, add articles, and prepare the Table of Contents.</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
            issue.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' :
            'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            Status: {issue.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <IssueBuilder initialIssue={issue} />
    </div>
  );
}

import React from "react";
import KanbanBoard from "@/components/founder/workflow/KanbanBoard";
import { getArticles } from "@/lib/actions/articleActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WorkflowPage() {
  const canAccess = await hasPermission("manage_articles");
  if (!canAccess) {
    redirect("/admin/unauthorized");
  }

  // Fetch articles up to a limit for the board, ideally all active ones
  const articlesData = await getArticles({}, { page: 1, limit: 200, sortBy: "created_at", sortOrder: "desc" });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editorial Workflow</h1>
          <p className="text-slate-500 text-sm mt-1">Drag and drop articles to progress them through the publishing pipeline.</p>
        </div>
      </div>
      <KanbanBoard initialArticles={articlesData.data} />
    </div>
  );
}

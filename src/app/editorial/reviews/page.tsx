import React from "react";
import { getArticles, getArticleById } from "@/lib/actions/articleActions";
import { getReviewNotes } from "@/lib/actions/reviewActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReviewPanel from "@/components/founder/reviews/ReviewPanel";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: { searchParams: { articleId?: string, filter?: string } }) {
  const canAccess = await hasPermission("manage_articles");
  if (!canAccess) {
    redirect("/founder/unauthorized");
  }

  const { articleId, filter = "in_review" } = searchParams;

  let activeArticle = null;
  let reviewNotes: any[] = [];
  if (articleId) {
    activeArticle = await getArticleById(articleId);
    if (activeArticle) {
      reviewNotes = await getReviewNotes(articleId);
    }
  }

  // Fetch queue
  const queueData = await getArticles({}, { page: 1, limit: 100, sortBy: "created_at", sortOrder: "desc" });
  const queue = queueData.data.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage article submissions, peer reviews, and editorial approvals.</p>
      </div>

      {!articleId ? (
        <>
          <div className="flex space-x-2 mb-4 border-b pb-2">
            <Link href="?filter=in_review" className={`px-3 py-1 rounded-full text-sm ${filter === 'in_review' ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>Pending Review</Link>
            <Link href="?filter=fact_check" className={`px-3 py-1 rounded-full text-sm ${filter === 'fact_check' ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>Fact Check</Link>
            <Link href="?filter=editor_review" className={`px-3 py-1 rounded-full text-sm ${filter === 'editor_review' ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>Editor Review</Link>
            <Link href="?filter=all" className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>All active</Link>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queue.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{article.title_hi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.categories?.name_hi || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.profiles?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`?articleId=${article.id}`} className="text-blue-600 hover:text-blue-900">
                        Open Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {queue.length === 0 && (
              <div className="p-8 text-center text-gray-500">No articles found in this queue.</div>
            )}
          </div>
        </>
      ) : (
        <div>
          <Link href="/founder/reviews" className="text-sm text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Queue</Link>
          {activeArticle ? (
            <ReviewPanel article={activeArticle} initialNotes={reviewNotes} />
          ) : (
            <div className="bg-white p-4 border rounded-lg shadow-sm">
               <p className="text-gray-500">Article not found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

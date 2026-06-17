"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { updateArticleStatus, deleteArticle, bulkDeleteArticles } from "@/lib/actions/articleActions";
import { Search, Plus, Edit2, Trash2, FileText, CheckCircle, Clock, Archive, MoreVertical, Eye, ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { Article, ArticleStatus } from "@/types/content";

export default function ArticleManager({ 
  initialArticles, 
  totalCount,
  currentPage,
  currentLimit,
  stats, 
  categories 
}: { 
  initialArticles: Article[],
  totalCount: number,
  currentPage: number,
  currentLimit: number,
  stats: any,
  categories: any[]
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [articles, setArticles] = useState(initialArticles);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Derive active sort state from URL
  const activeSortBy = searchParams.get("sortBy") || "created_at";
  const activeSortOrder = searchParams.get("sortOrder") || "desc";

  const totalPages = Math.ceil(totalCount / currentLimit) || 1;

  const updateUrlParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Reset to page 1 if changing filters/search, unless explicit page provided
    if (!params.page && (params.search !== undefined || params.status !== undefined || params.sortBy !== undefined)) {
      newParams.set("page", "1");
    }
    
    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput || null });
  };

  const handleSort = (column: string) => {
    const isAsc = activeSortBy === column && activeSortOrder === "asc";
    updateUrlParams({ sortBy: column, sortOrder: isAsc ? "desc" : "asc" });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(articles.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} articles? This action cannot be undone.`)) return;
    
    // Optimistic UI
    const originalArticles = [...articles];
    setArticles(articles.filter(a => !selectedIds.has(a.id)));
    
    try {
      await bulkDeleteArticles(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success("Articles deleted successfully");
      router.refresh();
    } catch (err: any) {
      setArticles(originalArticles);
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (id: string, status: ArticleStatus) => {
    const originalArticles = [...articles];
    setArticles(articles.map(a => a.id === id ? { ...a, status } : a));
    
    try {
      await updateArticleStatus(id, status);
      toast.success("Status updated");
    } catch (err: any) {
      setArticles(originalArticles);
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    const originalArticles = [...articles];
    setArticles(articles.filter(a => a.id !== id));
    
    try {
      await deleteArticle(id);
      toast.success("Article deleted");
      router.refresh();
    } catch (err: any) {
      setArticles(originalArticles);
      toast.error(err.message);
    }
  };

  const statusColors: Record<string, string> = {
    "draft": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    "in_review": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
    "fact_check": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    "editor_review": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
    "published": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    "scheduled": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50",
    "archived": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
  };

  const statusLabels: Record<string, string> = {
    "draft": "Draft",
    "in_review": "In Review",
    "fact_check": "Fact Check",
    "editor_review": "Editor Review",
    "published": "Published",
    "scheduled": "Scheduled",
    "archived": "Archived"
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Article Management
          </h1>
          <p className="text-sm text-slate-500">Manage all editorial content, workflow, and publication</p>
        </div>
        <Link
          href="/founder/editor/new"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Article
        </Link>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalArticles}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Articles</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPublished}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Published</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalViews?.toLocaleString() || 0}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Views</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">~{stats.averageReadingTime}m</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Avg Read Time</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-96">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-800/50">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-400">{selectedIds.size} selected</span>
              <button onClick={handleBulkDelete} className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 p-1 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <select 
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
            value={searchParams.get("status") || ""}
            onChange={(e) => updateUrlParams({ status: e.target.value || null })}
          >
            <option value="">All Statuses</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <select 
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
            value={searchParams.get("category_id") || ""}
            onChange={(e) => updateUrlParams({ category_id: e.target.value || null })}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_hi}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === articles.length && articles.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4 font-medium">
                  <button onClick={() => handleSort("title_hi")} className="flex items-center gap-1 hover:text-primary transition-colors">
                    Article <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">
                  <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-primary transition-colors">
                    Status <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium">
                  <button onClick={() => handleSort("view_count")} className="flex items-center gap-1 hover:text-primary transition-colors">
                    Views <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium">
                  <button onClick={() => handleSort("created_at")} className="flex items-center gap-1 hover:text-primary transition-colors">
                    Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No articles found</h3>
                      <p className="text-slate-500 max-w-sm mb-4">We couldn't find any articles matching your current filters.</p>
                      {(searchParams.get("search") || searchParams.get("status") || searchParams.get("category_id")) && (
                        <button onClick={() => router.push(pathname)} className="text-primary hover:text-primary-dark font-medium">
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(article.id)}
                        onChange={() => handleSelect(article.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="font-medium text-slate-900 dark:text-white truncate" title={article.title_hi}>{article.title_hi}</div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{article.slug}</span>
                          {article.categories?.name_hi}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {article.profiles?.avatar_url ? (
                          <img src={article.profiles.avatar_url} alt="" className="w-6 h-6 rounded-full bg-slate-200" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            {article.profiles?.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="text-sm text-slate-700 dark:text-slate-300">{article.profiles?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="group relative inline-block">
                        <select 
                          value={article.status}
                          onChange={(e) => handleStatusChange(article.id, e.target.value as ArticleStatus)}
                          className={`appearance-none cursor-pointer inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[article.status] || statusColors["draft"]} focus:outline-none focus:ring-2 focus:ring-primary/20 pr-6`}
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {article.view_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {format(new Date(article.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link href={`/${article.slug}`} target="_blank" className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="View Live">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/founder/editor/${article.id}`} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(article.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * currentLimit + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * currentLimit, totalCount)}</span> of <span className="font-medium text-slate-900 dark:text-white">{totalCount}</span> results
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => updateUrlParams({ page: (currentPage - 1).toString() })}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => updateUrlParams({ page: (currentPage + 1).toString() })}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { updateArticleStatus, deleteArticle, bulkDeleteArticles } from "@/lib/actions/articleActions";
import { Search, Plus, Edit2, Trash2, FileText, CheckCircle, Clock, Eye, MoreHorizontal, MessageSquare, Star, ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { Article, ArticleStatus } from "@/types/content";
import Image from "next/image";

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
  const activeStatus = searchParams.get("status") || "all";
  const isFeaturedFilter = searchParams.get("featured") === "true";

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
    if (!params.page && (params.search !== undefined || params.status !== undefined || params.featured !== undefined)) {
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(articles?.map(a => a.id)));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} articles?`)) return;
    
    const originalArticles = [...articles];
    setArticles(articles.filter(a => !selectedIds.has(a.id)));
    
    try {
      await bulkDeleteArticles(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success("Articles deleted successfully");
      router.refresh();
    } catch (err) {
      setArticles(originalArticles);
      toast.error("Failed to delete articles");
    }
  };

  const tabs = [
    { id: "all", label: "All Articles", count: stats?.total || 0 },
    { id: "published", label: "Published", count: stats?.published || 0 },
    { id: "in_review", label: "Pending", count: stats?.inReview || 0 },
    { id: "draft", label: "Drafts", count: stats?.drafts || 0 },
    { id: "scheduled", label: "Scheduled", count: stats?.scheduled || 0 },
    { id: "archived", label: "Archived", count: stats?.archived || 0 },
  ];

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case "published": return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md text-xs font-medium">Published</span>;
      case "draft": return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 rounded-md text-xs font-medium">Draft</span>;
      case "scheduled": return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-md text-xs font-medium">Scheduled</span>;
      case "in_review":
      case "editor_review":
      case "fact_check": 
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-md text-xs font-medium">Pending</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-md text-xs font-medium capitalize">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Articles</h1>
          <p className="text-slate-500 mt-1">Manage your publication's content and featured news.</p>
        </div>
        <Link 
          href="/admin/articles/new" 
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => updateUrlParams({ status: tab.id === 'all' ? null : tab.id, featured: null })}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeStatus === tab.id && !isFeaturedFilter
                ? "text-primary border-b-2 border-primary bg-primary/5 dark:bg-primary/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
            }`}
          >
            {tab.label}
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
        <button
            onClick={() => updateUrlParams({ featured: "true", status: null })}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ml-4 ${
              isFeaturedFilter
                ? "text-amber-500 border-b-2 border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                : "text-slate-600 hover:text-amber-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800/50"
            }`}
          >
            <Star className="w-4 h-4" />
            Featured News
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0A0F1D] border border-transparent focus:border-primary focus:bg-white dark:focus:bg-[#0A0F1D] rounded-lg outline-none transition-all text-sm text-slate-900 dark:text-white"
            />
          </form>
          {searchInput && (
            <button onClick={() => { setSearchInput(""); updateUrlParams({ search: null }); }} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-1 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
            <div className="w-px h-4 bg-primary/20"></div>
            <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-1">
              <Star className="w-4 h-4" /> Feature
            </button>
            <button onClick={handleBulkDelete} className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                    checked={articles?.length > 0 && selectedIds.size === articles.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-4">Article</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Author</th>
                <th className="px-4 py-4 text-center">Featured</th>
                <th className="px-4 py-4 text-right">Metrics</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {articles?.length > 0 ? (
                articles.map(article => (
                  <tr key={article.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                        checked={selectedIds.has(article.id)}
                        onChange={() => handleSelect(article.id)}
                      />
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate">
                      <Link href={`/admin/articles/${article.id}`} className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors block truncate">
                        {article.title_hi}
                      </Link>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        {article.categories ? (
                          <span className="flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: article.categories.color }}></span>
                             {article.categories.name_hi}
                          </span>
                        ) : 'Uncategorized'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                         {article.profiles?.avatar_url ? (
                            <img src={article.profiles.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover bg-slate-100 dark:bg-slate-800" />
                         ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                               {article.profiles?.name?.charAt(0) || '?'}
                            </div>
                         )}
                         <span className="font-medium text-slate-700 dark:text-slate-300">{article.profiles?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className={`p-1.5 rounded-md transition-colors ${article.is_featured ? 'text-amber-500 bg-amber-500/10' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Star className={`w-5 h-5 ${article.is_featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-3 text-slate-500 text-xs">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.view_count || 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {article.comment_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col gap-1">
                         <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(article.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/articles/${article.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-slate-900 dark:text-white mb-1">No articles found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * currentLimit + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * currentLimit, totalCount)}</span> of <span className="font-medium text-slate-900 dark:text-white">{totalCount}</span>
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => updateUrlParams({ page: (currentPage - 1).toString() })}
                disabled={currentPage <= 1 || isPending}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-slate-900 dark:text-white px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => updateUrlParams({ page: (currentPage + 1).toString() })}
                disabled={currentPage >= totalPages || isPending}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

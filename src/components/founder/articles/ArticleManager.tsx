"use client";
import React, { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { updateArticleStatus, deleteArticle, bulkDeleteArticles, toggleFeaturedArticle, bulkUpdateArticleStatus, duplicateArticle, updateArticle } from "@/lib/actions/articleActions";
import { getAdminUsersList } from "@/lib/actions/userManagementActions";
import { Search, Plus, Edit2, Trash2, FileText, CheckCircle, Clock, Eye, MoreHorizontal, MessageSquare, Star, ChevronLeft, ChevronRight, X, Calendar, UserPlus, Copy, UploadCloud, Archive } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { Article, ArticleStatus } from "@/types/content";
import Image from "next/image";
import Avatar from "@/components/shared/Avatar";

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
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const activeStatus = searchParams.get("status") || "all";
  const isFeaturedFilter = searchParams.get("featured") === "true";

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Assignment state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Sync initial articles when page changes
  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  // Debounced Search Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateUrlParams({ search: debouncedSearch || null });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (assignModalOpen && adminUsers.length === 0) {
      setLoadingUsers(true);
      getAdminUsersList().then(res => {
        if (res) setAdminUsers(res);
        setLoadingUsers(false);
      });
    }
  }, [assignModalOpen]);

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

  const handleActionMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
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

  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to change status of ${selectedIds.size} articles to ${status}?`)) return;
    
    startTransition(async () => {
      try {
        await bulkUpdateArticleStatus(Array.from(selectedIds), status);
        setSelectedIds(new Set());
        toast.success(`Articles updated to ${status}`);
        router.refresh();
      } catch (err) {
        toast.error("Failed to update articles");
      }
    });
  };

  const handleToggleFeatured = async (e: React.MouseEvent, id: string, currentFeatured: boolean) => {
    e.stopPropagation();
    // Optimistic update
    setArticles(articles.map(a => a.id === id ? { ...a, is_featured: !currentFeatured } : a));
    startTransition(async () => {
      try {
        await toggleFeaturedArticle(id, !currentFeatured);
        toast.success(currentFeatured ? "Removed from featured" : "Added to featured");
        router.refresh();
      } catch (err) {
        // Revert
        setArticles(articles.map(a => a.id === id ? { ...a, is_featured: currentFeatured } : a));
        toast.error("Failed to update featured status");
      }
    });
  };

  const tabs = [
    { id: "all", label: "All Articles", count: stats?.total || 0 },
    { id: ArticleStatus.Draft, label: "Drafts", count: stats?.drafts || 0 },
    { id: ArticleStatus.Submitted, label: "Pending Review", count: stats?.submitted || 0 },
    { id: ArticleStatus.RevisionRequested, label: "Needs Revision", count: stats?.revisions || 0 },
    { id: ArticleStatus.Published, label: "Published", count: stats?.published || 0 },
    { id: ArticleStatus.Rejected, label: "Rejected", count: stats?.rejected || 0 },
    { id: ArticleStatus.Archived, label: "Archived", count: stats?.archived || 0 },
  ];

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.Published: return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md text-xs font-medium">Published</span>;
      case ArticleStatus.Draft: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 rounded-md text-xs font-medium">Draft</span>;
      case ArticleStatus.Submitted: return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-md text-xs font-medium">Submitted</span>;
      case ArticleStatus.RevisionRequested: return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 rounded-md text-xs font-medium">Needs Revision</span>;
      case ArticleStatus.Rejected: return <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded-md text-xs font-medium">Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-md text-xs font-medium capitalize">{status}</span>;
    }
  };

  const getWorkflowBadge = (stage?: string) => {
    if (!stage) return null;
    const map: Record<string, string> = {
      editor_review: "Editor",
      me_review: "Managing Editor",
      eic_review: "EIC",
      completed: "Done"
    };
    return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider">{map[stage] || stage}</span>;
  };

  return (
    <>
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
            <button onClick={() => handleBulkUpdateStatus(ArticleStatus.Published)} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors flex items-center gap-1">
              <UploadCloud className="w-4 h-4" /> Publish
            </button>
            <button onClick={() => handleBulkUpdateStatus(ArticleStatus.Archived)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <Archive className="w-4 h-4" /> Archive
            </button>
            <button onClick={handleBulkDelete} className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hidden md:block">
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
                <th className="px-4 py-4">Status & Stage</th>
                <th className="px-4 py-4">Author</th>
                <th className="px-4 py-4">Assignment</th>
                <th className="px-4 py-4 text-center">Featured</th>
                <th className="px-4 py-4">Deadline / Date</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {articles?.length > 0 ? (
                articles.map(article => (
                  <tr key={article.id} onClick={() => router.push(`/admin/articles/${article.id}`)} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                    <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                        checked={selectedIds.has(article.id)}
                        onChange={() => handleSelect(article.id)}
                      />
                    </td>
                    <td className="px-4 py-4 max-w-[240px]">
                      <span className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors block truncate">
                        {article.title_hi}
                      </span>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        {article.categories ? (
                          <button onClick={(e) => { e.stopPropagation(); updateUrlParams({ category_id: article.categories!.id }); }} className="flex items-center gap-1 hover:text-primary transition-colors">
                             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: article.categories.color || '#94a3b8' }}></span>
                             {article.categories.name_hi}
                          </button>
                        ) : 'Uncategorized'}
                        {article.priority === 'urgent' && <span className="text-red-500 font-bold uppercase text-[10px] bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">Urgent</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(article.status)}
                        {getWorkflowBadge(article.workflow_stage)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={(e) => { e.stopPropagation(); updateUrlParams({ author_id: article.profiles?.id || null }); }} className="flex items-center gap-2 hover:text-primary transition-colors">
                         <Avatar url={article.profiles?.avatar_url} alt={article.profiles?.name || ''} className="w-6 h-6 rounded-full object-cover bg-slate-100 dark:bg-slate-800" />
                         <span className="font-medium text-slate-700 dark:text-slate-300">{article.profiles?.name || 'Unknown'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {article.assigned_to ? 'Assigned' : <span className="text-slate-400 italic">Unassigned</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={(e) => handleToggleFeatured(e, article.id, article.is_featured)}
                        disabled={isPending}
                        className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${article.is_featured ? 'text-amber-500 bg-amber-500/10' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <Star className={`w-5 h-5 ${article.is_featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col gap-1">
                         {article.deadline ? (
                            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400"><Clock className="w-3.5 h-3.5" /> {format(new Date(article.deadline), 'MMM d, yy')}</span>
                         ) : (
                            <span className="flex items-center gap-1 text-slate-400"><Calendar className="w-3.5 h-3.5" /> {format(new Date(article.created_at), 'MMM d, yy')}</span>
                         )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link onClick={e => e.stopPropagation()} href={`/admin/articles/${article.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => handleActionMenuClick(e, article.id)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {activeMenu === article.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden text-left">
                              <Link href={`/${article.slug}`} target="_blank" className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">
                                <Eye className="w-4 h-4 mr-2 text-slate-400" /> Preview
                              </Link>
                              <button onClick={() => {
                                startTransition(async () => {
                                  try {
                                    await duplicateArticle(article.id);
                                    toast.success("Article duplicated");
                                    setActiveMenu(null);
                                  } catch (e) {
                                    toast.error("Failed to duplicate");
                                  }
                                });
                              }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">
                                <Copy className="w-4 h-4 mr-2 text-slate-400" /> Duplicate
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                              <button onClick={() => { setSelectedArticleId(article.id); setAssignModalOpen(true); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">
                                <UserPlus className="w-4 h-4 mr-2 text-slate-400" /> Assign Editor
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                              {article.status !== ArticleStatus.Published ? (
                                <button onClick={() => {
                                  startTransition(async () => {
                                    await updateArticleStatus(article.id, ArticleStatus.Published as any);
                                    setActiveMenu(null);
                                    toast.success("Article published");
                                  });
                                }} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center">
                                  <UploadCloud className="w-4 h-4 mr-2" /> Publish
                                </button>
                              ) : (
                                <button onClick={() => {
                                  startTransition(async () => {
                                    await updateArticleStatus(article.id, ArticleStatus.Draft as any);
                                    setActiveMenu(null);
                                    toast.success("Article unpublished");
                                  });
                                }} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center">
                                  <Archive className="w-4 h-4 mr-2" /> Unpublish
                                </button>
                              )}
                              <button onClick={() => {
                                startTransition(async () => {
                                  if (confirm("Are you sure you want to delete this article?")) {
                                    await deleteArticle(article.id);
                                    setActiveMenu(null);
                                    toast.success("Article deleted");
                                  }
                                });
                              }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
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
      </div>
      
      {/* Mobile Responsive Cards */}
      <div className="md:hidden space-y-4">
         {articles?.length > 0 ? (
           articles.map(article => (
              <div key={article.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                 <div className="flex justify-between items-start gap-2">
                    <Link href={`/admin/articles/${article.id}`} className="font-bold text-slate-900 dark:text-white leading-tight">
                      {article.title_hi}
                    </Link>
                    <div className="shrink-0 flex flex-col gap-1 items-end">
                      {getStatusBadge(article.status)}
                      <button 
                        onClick={(e) => handleToggleFeatured(e, article.id, article.is_featured)}
                        disabled={isPending}
                        className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${article.is_featured ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}
                      >
                        <Star className={`w-4 h-4 ${article.is_featured ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap items-center gap-2 text-xs">
                    {getWorkflowBadge(article.workflow_stage)}
                    {article.priority === 'urgent' && <span className="text-red-500 font-bold uppercase text-[10px] bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">Urgent</span>}
                    {article.categories && (
                      <span className="flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                         <span className="w-2 h-2 rounded-full" style={{ backgroundColor: article.categories.color || '#94a3b8' }}></span>
                         {article.categories.name_hi}
                      </span>
                    )}
                 </div>

                 <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                   <div className="flex items-center gap-1.5">
                     <Avatar url={article.profiles?.avatar_url} alt={article.profiles?.name || ''} className="w-5 h-5 rounded-full object-cover" />
                     <span className="font-medium">{article.profiles?.name || 'Unknown'}</span>
                   </div>
                   <span className="text-slate-300 dark:text-slate-600">•</span>
                   <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(article.deadline || article.created_at), 'MMM d')}
                   </div>
                 </div>

                 <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                        checked={selectedIds.has(article.id)}
                        onChange={() => handleSelect(article.id)}
                      />
                      <span className="text-xs text-slate-500">Select</span>
                    </div>
                    <div className="flex items-center gap-3 relative">
                      <Link href={`/admin/articles/${article.id}`} className="text-primary font-medium text-sm flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={(e) => handleActionMenuClick(e, article.id + '_mobile')} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {activeMenu === article.id + '_mobile' && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden text-left">
                              <Link href={`/${article.slug}`} target="_blank" className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">
                                <Eye className="w-4 h-4 mr-2 text-slate-400" /> Preview
                              </Link>
                              <button onClick={() => {
                                startTransition(async () => {
                                  try {
                                    await duplicateArticle(article.id);
                                    toast.success("Article duplicated");
                                    setActiveMenu(null);
                                  } catch (e) {
                                    toast.error("Failed to duplicate");
                                  }
                                });
                              }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">
                                <Copy className="w-4 h-4 mr-2 text-slate-400" /> Duplicate
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                              <button onClick={() => { setSelectedArticleId(article.id); setAssignModalOpen(true); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">
                                <UserPlus className="w-4 h-4 mr-2 text-slate-400" /> Assign Editor
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                              {article.status !== ArticleStatus.Published ? (
                                <button onClick={() => {
                                  startTransition(async () => {
                                    await updateArticleStatus(article.id, ArticleStatus.Published as any);
                                    setActiveMenu(null);
                                    toast.success("Article published");
                                  });
                                }} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center">
                                  <UploadCloud className="w-4 h-4 mr-2" /> Publish
                                </button>
                              ) : (
                                <button onClick={() => {
                                  startTransition(async () => {
                                    await updateArticleStatus(article.id, ArticleStatus.Draft as any);
                                    setActiveMenu(null);
                                    toast.success("Article unpublished");
                                  });
                                }} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center">
                                  <Archive className="w-4 h-4 mr-2" /> Unpublish
                                </button>
                              )}
                              <button onClick={() => {
                                startTransition(async () => {
                                  if (confirm("Are you sure you want to delete this article?")) {
                                    await deleteArticle(article.id);
                                    setActiveMenu(null);
                                    toast.success("Article deleted");
                                  }
                                });
                              }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </button>
                            </div>
                      )}
                    </div>
                 </div>
              </div>
           ))
         ) : null}
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
      
      {/* Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> Assign Editor
              </h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
              {loadingUsers ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="text-center p-8 text-slate-500">No admin users found</div>
              ) : (
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      startTransition(async () => {
                        try {
                          await updateArticle(selectedArticleId!, { assigned_to: null });
                          toast.success("Assignment removed");
                          setAssignModalOpen(false);
                          router.refresh();
                        } catch (e) {
                          toast.error("Failed to update assignment");
                        }
                      });
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Unassign</span>
                  </button>
                  {adminUsers.map(user => (
                    <button 
                      key={user.id}
                      onClick={() => {
                        startTransition(async () => {
                          try {
                            await updateArticle(selectedArticleId!, { assigned_to: user.id });
                            toast.success("Editor assigned");
                            setAssignModalOpen(false);
                            router.refresh();
                          } catch (e) {
                            toast.error("Failed to assign editor");
                          }
                        });
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/30 transition-colors text-left"
                    >
                      <Avatar url={user.avatar_url} alt={user.name || ''} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name || 'Unnamed'}</div>
                        <div className="text-xs text-slate-500 capitalize">{user.role?.replace('_', ' ') || 'Editor'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

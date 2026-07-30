"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent 
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable, 
  arrayMove 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Star, 
  Search, 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  ArrowLeft, 
  X, 
  CheckCircle, 
  Calendar, 
  User, 
  Award, 
  ExternalLink,
  Edit2
} from "lucide-react";
import { toast } from "sonner";
import { Article } from "@/types/content";
import { 
  toggleEditorialPick, 
  updateEditorialPickOrders, 
  getArticles 
} from "@/lib/actions/articleActions";
import { getArticleImage, handleImageError } from "@/utils/imageHelper";
import Avatar from "@/components/shared/Avatar";

interface EditorialPicksManagerProps {
  initialPicks: Article[];
}

function SortableItem({ 
  article, 
  index, 
  onRemove, 
  onOrderChange, 
  onPreview 
}: { 
  article: Article; 
  index: number; 
  onRemove: (id: string) => void;
  onOrderChange: (id: string, newOrder: number) => void;
  onPreview: (article: Article) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: article.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1
  };

  const title = article.title_hi || article.title_en || "Untitled";
  const summary = article.summary_hi || article.summary_en || article.content || "";
  const imageUrl = getArticleImage(article);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-slate-900 border ${
        isDragging 
          ? "border-amber-500 shadow-xl bg-amber-50/50 dark:bg-amber-950/20" 
          : "border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-sm"
      } rounded-xl p-4 transition-all duration-200 group relative flex flex-col md:flex-row md:items-center gap-4`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 flex items-center justify-center"
        title="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Index Position Badge */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/20">
        #{index + 1}
      </div>

      {/* Thumbnail */}
      <div className="relative w-full md:w-28 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          onError={handleImageError}
          className="object-cover"
        />
      </div>

      {/* Article Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 rounded">
            {article.categories?.name_hi || article.category || "संपादकीय"}
          </span>
          {article.is_featured && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 rounded">
              Featured
            </span>
          )}
        </div>
        <h3 className="font-serif font-bold text-base md:text-lg text-slate-900 dark:text-white truncate">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
          {summary.replace(/<[^>]*>?/gm, '')}
        </p>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-3 pt-1">
          <span>लेखक: {article.profiles?.name || article.author || "युवाक्षर डेस्क"}</span>
          {article.editor_pick_at && (
            <span>चयन: {new Date(article.editor_pick_at).toLocaleDateString("hi-IN")}</span>
          )}
        </div>
      </div>

      {/* Controls: Order input + Actions */}
      <div className="flex items-center gap-3 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Numeric Order Input */}
        <div className="flex items-center gap-1.5" title="Direct order number">
          <span className="text-xs text-slate-400 font-medium">Order:</span>
          <input
            type="number"
            min={0}
            value={article.editor_pick_order ?? index}
            onChange={(e) => onOrderChange(article.id, parseInt(e.target.value) || 0)}
            className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
          />
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => onPreview(article)}
          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Preview Article"
        >
          <Eye className="w-4 h-4" />
        </button>

        <Link
          href={`/admin/articles/${article.id}`}
          className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Edit Article"
        >
          <Edit2 className="w-4 h-4" />
        </Link>

        <button
          onClick={() => onRemove(article.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Remove from Editorial Picks"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function EditorialPicksManager({ initialPicks }: EditorialPicksManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [picks, setPicks] = useState<Article[]>(initialPicks);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Preview Modal state
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Add Article Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [loadingAllArticles, setLoadingAllArticles] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Filtered picks based on search query
  const filteredPicks = picks.filter((art) => {
    const term = searchQuery.toLowerCase();
    const title = (art.title_hi || art.title_en || "").toLowerCase();
    const cat = (art.categories?.name_hi || art.category || "").toLowerCase();
    return title.includes(term) || cat.includes(term);
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = picks.findIndex((item) => item.id === active.id);
    const newIndex = picks.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newArray = arrayMove(picks, oldIndex, newIndex);
    // Update order numbers sequentially
    const updatedWithOrder = newArray.map((item, idx) => ({
      ...item,
      editor_pick_order: idx
    }));

    setPicks(updatedWithOrder);

    // Save to database
    startTransition(async () => {
      try {
        await updateEditorialPickOrders(
          updatedWithOrder.map((item) => ({
            id: item.id,
            editor_pick_order: item.editor_pick_order!
          }))
        );
        toast.success("Order updated successfully");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || String(err));
        setPicks(picks); // revert
      }
    });
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this article from Editorial Picks?")) return;

    const previousPicks = [...picks];
    setPicks(picks.filter((p) => p.id !== id));

    startTransition(async () => {
      try {
        await toggleEditorialPick(id, false);
        toast.success("Removed from Editorial Picks");
        router.refresh();
      } catch (err: any) {
        setPicks(previousPicks);
        toast.error(err?.message || String(err));
      }
    });
  };

  const handleOrderChange = async (id: string, newOrder: number) => {
    const updated = picks.map((p) => (p.id === id ? { ...p, editor_pick_order: newOrder } : p));
    updated.sort((a, b) => (a.editor_pick_order ?? 0) - (b.editor_pick_order ?? 0));
    setPicks(updated);

    startTransition(async () => {
      try {
        await updateEditorialPickOrders([{ id, editor_pick_order: newOrder }]);
        toast.success("Order updated");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || String(err));
      }
    });
  };

  // Open Add Modal & Load articles
  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    if (allArticles.length === 0) {
      setLoadingAllArticles(true);
      try {
        const res = await getArticles({}, { limit: 100 });
        setAllArticles(res.data || []);
      } catch (err: any) {
        toast.error(err?.message || String(err));
      } finally {
        setLoadingAllArticles(false);
      }
    }
  };

  const handleAddPick = async (article: Article) => {
    const existingIndex = picks.findIndex((p) => p.id === article.id);
    if (existingIndex !== -1) {
      toast.info("Article is already in Editorial Picks");
      return;
    }

    const nextOrder = picks.length;
    const updatedArticle = {
      ...article,
      is_editor_pick: true,
      editor_pick_order: nextOrder,
      editor_pick_at: new Date().toISOString()
    };

    setPicks([...picks, updatedArticle]);

    startTransition(async () => {
      try {
        await toggleEditorialPick(article.id, true, nextOrder);
        toast.success("Article added to Editorial Picks!");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || String(err));
        setPicks(picks);
      }
    });
  };

  const activeArticle = picks.find((p) => p.id === activeId);

  // Available candidate articles for adding
  const filteredCandidates = allArticles.filter((art) => {
    const isPick = picks.some((p) => p.id === art.id);
    if (isPick) return false;
    const term = addSearchQuery.toLowerCase();
    const title = (art.title_hi || art.title_en || "").toLowerCase();
    return title.includes(term);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/articles" 
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-500" />
              Editorial Picks (संपादकीय चयन)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-9">
            Manage, reorder, and feature top articles on the homepage Editorial Picks section (Max 8 articles).
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Article to Picks</span>
        </button>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Editorial Picks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {picks.length} / 8 Selected
          </span>
          <span>(Drag handles to change order)</span>
        </div>
      </div>

      {/* Drag & Drop Sortable List */}
      {filteredPicks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredPicks.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filteredPicks.map((article, index) => (
                <SortableItem
                  key={article.id}
                  article={article}
                  index={index}
                  onRemove={handleRemove}
                  onOrderChange={handleOrderChange}
                  onPreview={setPreviewArticle}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeArticle ? (
              <div className="bg-white dark:bg-slate-900 border border-amber-500 shadow-2xl rounded-xl p-4 flex items-center gap-4 opacity-90">
                <GripVertical className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  {activeArticle.title_hi || activeArticle.title_en}
                </h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Editorial Picks Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? "No editorial picks match your search query."
              : "No articles are currently added to Editorial Picks. Click 'Add Article to Picks' to include articles."}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            + Add First Article
          </button>
        </div>
      )}

      {/* Modal 1: Article Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" /> Preview Editorial Pick
              </h2>
              <button 
                onClick={() => setPreviewArticle(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 font-sans">
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image 
                  src={getArticleImage(previewArticle)} 
                  alt={previewArticle.title_hi || ""} 
                  fill 
                  onError={handleImageError}
                  className="object-cover" 
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-600 font-semibold uppercase tracking-wider">
                <span>{previewArticle.categories?.name_hi || previewArticle.category}</span>
                <span>•</span>
                <span>Order #{previewArticle.editor_pick_order ?? 0}</span>
              </div>

              <h1 className="font-serif font-bold text-2xl text-slate-900 dark:text-white leading-tight">
                {previewArticle.title_hi || previewArticle.title_en}
              </h1>

              {previewArticle.summary_hi && (
                <p className="text-slate-600 dark:text-slate-300 font-serif italic text-base leading-relaxed border-l-2 border-amber-500 pl-3">
                  {previewArticle.summary_hi}
                </p>
              )}

              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif pt-2 space-y-3">
                {previewArticle.content ? (
                  <div dangerouslySetInnerHTML={{ __html: previewArticle.content }} />
                ) : (
                  <p className="text-slate-400 italic">No content available.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <Link 
                href={`/${previewArticle.slug}`} 
                target="_blank" 
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View Live Page <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Add Article to Editorial Picks
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles to add..."
                  value={addSearchQuery}
                  onChange={(e) => setAddSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white focus:border-amber-500"
                />
              </div>
            </div>

            {/* Candidates List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[50vh]">
              {loadingAllArticles ? (
                <div className="py-8 text-center text-slate-400 text-sm">Loading articles...</div>
              ) : filteredCandidates.length > 0 ? (
                filteredCandidates.map((art) => (
                  <div
                    key={art.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        <Image
                          src={getArticleImage(art)}
                          alt={art.title_hi || ""}
                          fill
                          onError={handleImageError}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {art.title_hi || art.title_en}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {art.categories?.name_hi || art.category || "विविध"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddPick(art)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  {addSearchQuery ? "No matching articles found." : "All eligible articles are already added."}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { createCategory, updateCategory, deleteCategory, toggleCategoryStatus, mergeCategories } from "@/lib/actions/categoryActions";
import { Search, Plus, Edit2, Trash2, Power, Layers, Merge, CornerDownRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { Category } from "@/types/content";

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name_hi: "",
    name_en: "",
    slug: "",
    description_hi: "",
    description_en: "",
    color: "#EA580C",
    is_active: true,
    parent_id: "",
    sort_order: 0,
  });

  const [mergeTargetId, setMergeTargetId] = useState("");

  // Build Hierarchy
  const buildHierarchy = (cats: Category[]) => {
    const rootCats = cats.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    return rootCats?.map(root => ({
      ...root,
      children: cats.filter(c => c.parent_id === root.id).sort((a, b) => a.sort_order - b.sort_order)
    }));
  };

  const hierarchy = buildHierarchy(categories);

  const openCreateModal = () => {
    setSelectedCategory(null);
    setFormData({ name_hi: "", name_en: "", slug: "", description_hi: "", description_en: "", color: "#EA580C", is_active: true, parent_id: "", sort_order: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setFormData({
      name_hi: cat.name_hi,
      name_en: cat.name_en || "",
      slug: cat.slug,
      description_hi: cat.description_hi || "",
      description_en: cat.description_en || "",
      color: cat.color,
      is_active: cat.is_active,
      parent_id: cat.parent_id || "",
      sort_order: cat.sort_order || 0,
    });
    setIsModalOpen(true);
  };

  const openMergeModal = (cat: Category) => {
    setSelectedCategory(cat);
    setMergeTargetId("");
    setIsMergeModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSave = { ...formData, parent_id: formData.parent_id || null };
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, dataToSave);
        toast.success("Category updated successfully");
      } else {
        await createCategory(dataToSave);
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This cannot be undone.")) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      await toggleCategoryStatus(cat.id, cat.is_active);
      setCategories(categories?.map(c => c.id === cat.id ? { ...c, is_active: !cat.is_active } : c));
      toast.success(`Category ${!cat.is_active ? 'activated' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !mergeTargetId) return;
    setIsSaving(true);
    try {
      await mergeCategories(selectedCategory.id, mergeTargetId);
      toast.success("Categories merged successfully");
      setIsMergeModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter logic (flattens if searching)
  const isSearching = search.trim().length > 0;
  const filteredCategories = isSearching ? categories.filter(c => 
    c.name_hi.toLowerCase().includes(search.toLowerCase()) || 
    (c.name_en && c.name_en.toLowerCase().includes(search.toLowerCase())) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const availableParents = categories.filter(c => !c.parent_id && c.id !== selectedCategory?.id);

  const renderCategoryRow = (cat: Category, isChild = false) => (
    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <td className="px-6 py-4">
        <div className={`flex items-center gap-3 ${isChild ? 'pl-6' : ''}`}>
          {isChild && <CornerDownRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              {cat.name_hi}
              {!cat.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Disabled</span>}
            </div>
            {cat.name_en && <div className="text-xs text-slate-500">{cat.name_en}</div>}
            
            {/* Audit Info */}
            <div className="text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Created by: {cat.creator?.name || "System"} • Updated by: {cat.updater?.name || "System"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
        {cat.slug}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {cat._count?.articles || 0} articles
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button onClick={() => openMergeModal(cat)} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors" title="Merge Category">
            <Merge className="w-4 h-4" />
          </button>
          <button onClick={() => handleToggle(cat)} className={`p-1.5 transition-colors ${cat.is_active ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="Toggle Status">
            <Power className="w-4 h-4" />
          </button>
          <button onClick={() => openEditModal(cat)} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Category Management
          </h1>
          <p className="text-sm text-slate-500">Organize your content taxonomy. Maximum depth of 2 allowed.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="श्रेणियां खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium w-full">Category Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Analytics</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <Layers className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No categories yet</h3>
                      <p className="text-slate-500 max-w-sm mb-4">Create your first category to start organizing your content.</p>
                      <button onClick={openCreateModal} className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Category
                      </button>
                    </div>
                  </td>
                </tr>
              ) : isSearching ? (
                filteredCategories.length > 0 ? (
                  filteredCategories?.map(cat => renderCategoryRow(cat, !!cat.parent_id))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No categories match your search.
                    </td>
                  </tr>
                )
              ) : (
                hierarchy?.map(root => (
                  <React.Fragment key={root.id}>
                    {renderCategoryRow(root as Category, false)}
                    {root.children?.map(child => renderCategoryRow(child as Category, true))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} title={selectedCategory ? "Edit Category" : "Create Category"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Name (Hindi) *</label>
              <input required value={formData.name_hi} onChange={e => setFormData({...formData, name_hi: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Name (English)</label>
              <input value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Slug *</label>
              <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Parent Category</label>
              <select 
                value={formData.parent_id} 
                onChange={e => setFormData({...formData, parent_id: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">None (Root Category)</option>
                {availableParents?.map(p => (
                  <option key={p.id} value={p.id}>{p.name_hi}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Sort Order</label>
              <input type="number" required value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Color (Hex) *</label>
              <div className="flex gap-2">
                <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-10 h-10 p-1 rounded-lg border border-slate-200 dark:border-slate-600" />
                <input required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50">
              {isSaving ? 'Saving...' : (selectedCategory ? 'Save Changes' : 'Create Category')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Merge Modal */}
      <Modal open={isMergeModalOpen} onOpenChange={setIsMergeModalOpen} title="Merge Category">
        <form onSubmit={handleMerge} className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-lg text-sm mb-4 border border-amber-200 dark:border-amber-800">
            <strong>Warning:</strong> Merging will move all articles from <span className="font-semibold">{selectedCategory?.name_hi}</span> into the target category, and then delete <span className="font-semibold">{selectedCategory?.name_hi}</span>. This action cannot be undone.
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Select Target Category</label>
            <select 
              required
              value={mergeTargetId} 
              onChange={e => setMergeTargetId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">-- Select Category --</option>
              {categories.filter(c => c.id !== selectedCategory?.id)?.map(c => (
                <option key={c.id} value={c.id}>{c.name_hi}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
            <button type="button" onClick={() => setIsMergeModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
            <button type="submit" disabled={isSaving || !mergeTargetId} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
              <Merge className="w-4 h-4" />
              {isSaving ? 'Merging...' : 'Merge Categories'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

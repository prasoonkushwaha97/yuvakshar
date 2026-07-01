'use client';
export const dynamic = "force-dynamic";

import React, {  useEffect, useState , useCallback } from "react";
import { getNavigationMenus, createNavigationItem, deleteNavigationItem } from '@/lib/actions/globalSettingsActions';
import { toast } from 'sonner';
import { Network, Plus, Trash2, Loader2, Link as LinkIcon } from 'lucide-react';

export default function GlobalNavigationPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New item form state
  const [newItem, setNewItem] = useState({ menu_id: '', label: '', url: '', sort_order: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      const data = await getNavigationMenus();
      setMenus(data);
      if (data.length > 0 && !newItem.menu_id) {
        setNewItem(prev => ({ ...prev, menu_id: data[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load navigation menus');
    } finally {
      setLoading(false);
    }
  }, [newItem.menu_id]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.label || !newItem.url) {
      toast.error('Label and URL are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createNavigationItem(newItem.menu_id, newItem.label, newItem.url, Number(newItem.sort_order));
      if (res.success) {
        toast.success('Navigation link added');
        setNewItem(prev => ({ ...prev, label: '', url: '', sort_order: prev.sort_order + 1 }));
        await fetchMenus();
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error('Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      const res = await deleteNavigationItem(id);
      if (res.success) {
        toast.success('Link deleted');
        await fetchMenus();
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
          <Network className="w-6 h-6 mr-3 text-primary" />
          Navigation Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure headers, footers, and sidebar navigation menus platform-wide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              Add New Link
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Menu</label>
                <select 
                  value={newItem.menu_id}
                  onChange={(e) => setNewItem({...newItem, menu_id: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                >
                  {menus?.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Display Label</label>
                <input 
                  type="text"
                  placeholder="उदा. करेंट अफेयर्स"
                  value={newItem.label}
                  onChange={(e) => setNewItem({...newItem, label: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL / Path</label>
                <input 
                  type="text"
                  placeholder="उदा. /current-affairs"
                  value={newItem.url}
                  onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sort Order (0-99)</label>
                <input 
                  type="number"
                  min="0"
                  value={newItem.sort_order}
                  onChange={(e) => setNewItem({...newItem, sort_order: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Link'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {menus?.map((menu) => (
            <div key={menu.id} className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg">{menu.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{menu.location}</p>
              </div>
              <div className="p-4">
                {menu.navigation_items && menu.navigation_items.length > 0 ? (
                  <div className="space-y-2">
                    {menu.navigation_items.sort((a: any, b: any) => a.sort_order - b.sort_order)?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors">
                        <div className="flex items-center">
                          <LinkIcon className="w-4 h-4 text-slate-400 mr-3" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-slate-400">Order: {item.sort_order}</span>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No links in this menu yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

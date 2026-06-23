'use client';

import React, { useEffect, useState } from 'react';
import { getHomepageSections, updateHomepageSection } from '@/lib/actions/globalSettingsActions';
import { toast } from 'sonner';
import { Layout, Loader2, Save } from 'lucide-react';

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const data = await getHomepageSections();
      setSections(data);
    } catch (error) {
      toast.error('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    setSaving(id);
    try {
      const res = await updateHomepageSection(id, updates);
      if (res.success) {
        toast.success(`Section updated`);
        await fetchSections();
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error('Failed to update section');
    } finally {
      setSaving(null);
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
          <Layout className="w-6 h-6 mr-3 text-primary" />
          Homepage Layout
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure the active sections, ordering, and queries for the dynamic homepage.
        </p>
      </div>

      <div className="space-y-4">
        {sections?.map((section) => (
          <div key={section.id} className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{section.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Active</span>
                    <button 
                      onClick={() => handleUpdate(section.id, { is_active: !section.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${section.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${section.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Section Type</label>
                    <input 
                      type="text" 
                      defaultValue={section.type}
                      onBlur={(e) => {
                        if (e.target.value !== section.type) handleUpdate(section.id, { type: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sort Order</label>
                    <input 
                      type="number" 
                      defaultValue={section.sort_order}
                      onBlur={(e) => {
                        if (parseInt(e.target.value) !== section.sort_order) handleUpdate(section.id, { sort_order: parseInt(e.target.value) });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Content Query (JSON)</label>
                  <textarea 
                    defaultValue={JSON.stringify(section.content_query, null, 2)}
                    rows={4}
                    onBlur={(e) => {
                      try {
                        const newQuery = JSON.parse(e.target.value);
                        handleUpdate(section.id, { content_query: newQuery });
                      } catch (err) {
                        toast.error('Invalid JSON format');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-mono"
                  />
                </div>
              </div>
              
              <div className="w-8 flex justify-center pt-2">
                {saving === section.id && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No homepage sections found. Check database seeding.
          </div>
        )}
      </div>
    </div>
  );
}

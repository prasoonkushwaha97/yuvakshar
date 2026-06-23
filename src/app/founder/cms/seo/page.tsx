'use client';

import React, { useEffect, useState } from 'react';
import { getSeoSettings, updateSeoSetting } from '@/lib/actions/globalSettingsActions';
import { toast } from 'sonner';
import { Globe, Loader2 } from 'lucide-react';

export default function SeoSettingsPage() {
  const [seo, setSeo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSeo();
  }, []);

  const fetchSeo = async () => {
    try {
      const data = await getSeoSettings();
      setSeo(data);
    } catch (error) {
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    setSaving(id);
    try {
      const res = await updateSeoSetting(id, updates);
      if (res.success) {
        toast.success(`SEO Setting updated`);
        await fetchSeo();
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error('Failed to update SEO setting');
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
          <Globe className="w-6 h-6 mr-3 text-primary" />
          SEO Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage meta tags, open graph attributes, and JSON-LD data for platform routes.
        </p>
      </div>

      <div className="space-y-4">
        {seo?.map((setting) => (
          <div key={setting.id} className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-lg font-mono">{setting.route_path}</h3>
                    <p className="text-xs text-slate-500 mt-1">Configure metadata for this path</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Page Title</label>
                    <input 
                      type="text" 
                      defaultValue={setting.title}
                      onBlur={(e) => {
                        if (e.target.value !== setting.title) handleUpdate(setting.id, { title: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Meta Description</label>
                    <textarea 
                      defaultValue={setting.description || ''}
                      rows={2}
                      onBlur={(e) => {
                        if (e.target.value !== setting.description) handleUpdate(setting.id, { description: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Keywords</label>
                    <input 
                      type="text" 
                      defaultValue={setting.keywords?.join(', ')}
                      placeholder="news, articles, local"
                      onBlur={(e) => {
                        const kw = e.target.value.split(',')?.map(s => s.trim()).filter(Boolean);
                        handleUpdate(setting.id, { keywords: kw });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">OG Image URL</label>
                    <input 
                      type="url" 
                      defaultValue={setting.og_image || ''}
                      onBlur={(e) => {
                        if (e.target.value !== setting.og_image) handleUpdate(setting.id, { og_image: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-8 flex justify-center pt-2">
                {saving === setting.id && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
            </div>
          </div>
        ))}

        {seo.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No SEO settings found in database.
          </div>
        )}
      </div>
    </div>
  );
}

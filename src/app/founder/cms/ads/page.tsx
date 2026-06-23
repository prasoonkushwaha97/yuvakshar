'use client';

import React, { useEffect, useState } from 'react';
import { getAdvertisements, updateAdvertisement } from '@/lib/actions/globalSettingsActions';
import { toast } from 'sonner';
import { Megaphone, Loader2 } from 'lucide-react';

export default function AdsManagementPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const data = await getAdvertisements();
      setAds(data);
    } catch (error) {
      toast.error('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    setSaving(id);
    try {
      const res = await updateAdvertisement(id, updates);
      if (res.success) {
        toast.success(`Advertisement updated`);
        await fetchAds();
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error('Failed to update advertisement');
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
          <Megaphone className="w-6 h-6 mr-3 text-primary" />
          Advertisements
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage ad placements, active status, and ad content across the platform.
        </p>
      </div>

      <div className="space-y-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-lg">{ad.title}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">Location: {ad.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Active</span>
                    <button 
                      onClick={() => handleUpdate(ad.id, { is_active: !ad.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ad.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ad.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target URL</label>
                    <input 
                      type="url" 
                      defaultValue={ad.target_url}
                      onBlur={(e) => {
                        if (e.target.value !== ad.target_url) handleUpdate(ad.id, { target_url: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Image URL</label>
                    <input 
                      type="url" 
                      defaultValue={ad.image_url}
                      onBlur={(e) => {
                        if (e.target.value !== ad.image_url) handleUpdate(ad.id, { image_url: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ad Content (HTML/Text)</label>
                  <textarea 
                    defaultValue={ad.content || ''}
                    rows={3}
                    onBlur={(e) => {
                      if (e.target.value !== ad.content) handleUpdate(ad.id, { content: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                  />
                </div>
              </div>
              
              <div className="w-8 flex justify-center pt-2">
                {saving === ad.id && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
            </div>
          </div>
        ))}

        {ads.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No advertisements configured yet.
          </div>
        )}
      </div>
    </div>
  );
}

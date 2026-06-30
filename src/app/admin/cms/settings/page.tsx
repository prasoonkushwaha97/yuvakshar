'use client';

import React, { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSetting } from '@/lib/actions/globalSettingsActions';
import { toast } from 'sonner';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key);
    try {
      const res = await updateSiteSetting(key, value);
      if (res.success) {
        toast.success(`Setting updated`);
        await fetchSettings();
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error('Failed to update setting');
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
          <Settings className="w-6 h-6 mr-3 text-primary" />
          Global Site Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage core configuration variables for the entire platform.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {settings?.map((setting) => (
              <div key={setting.key} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-white font-mono text-sm">{setting.key}</h3>
                  {setting.description && (
                    <p className="text-sm text-slate-500 mt-1">{setting.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    defaultValue={setting.value}
                    className="flex-1 sm:w-64 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    onBlur={(e) => {
                      if (e.target.value !== setting.value) {
                        handleUpdate(setting.key, e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                  />
                  {saving === setting.key && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
              </div>
            ))}
            
            {settings.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No settings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

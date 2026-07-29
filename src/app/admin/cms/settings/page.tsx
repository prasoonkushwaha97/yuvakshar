'use client';
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSetting } from '@/lib/actions/globalSettingsActions';
import { toast } from 'sonner';
import { Settings, Loader2, Save } from 'lucide-react';

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'navigation' | 'footer' | 'features' | 'editorial'>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const DEFAULT_BRANDING_SETTINGS = [
    { key: 'brand_logo', value: '/yuvakshar-logo.png', description: 'Official Yuvakshar Portal Logo URL' },
    { key: 'brand_favicon', value: '/favicon.ico', description: 'Website Favicon Icon URL' },
    { key: 'brand_app_icon', value: '/icon-192.png', description: 'PWA Mobile App Icon URL (192x192)' },
    { key: 'brand_default_thumbnail', value: '/default-article.jpg', description: 'Fallback Thumbnail image URL for articles without a cover image' },
    { key: 'brand_og_image', value: '/og-image.jpg', description: 'Default Open Graph Social Sharing Image URL' },
  ];

  const fetchSettings = async () => {
    try {
      const data = await getSiteSettings();
      
      const existingKeys = new Set(data.map(s => s.key));
      const combined = [...data];
      DEFAULT_BRANDING_SETTINGS.forEach(b => {
        if (!existingKeys.has(b.key)) {
          combined.push(b);
        }
      });
      
      setSettings(combined);
      
      const initialForm: Record<string, string> = {};
      combined.forEach(s => {
        initialForm[s.key] = s.value;
      });
      setFormData(initialForm);
    } catch (error) {
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let successCount = 0;
    let errorCount = 0;
    
    // Basic validation
    if (Object.values(formData).some(val => val === null || val === undefined)) {
      toast.error("Settings cannot be null or undefined");
      setSaving(false);
      return;
    }

    try {
      // For simplicity, update all modified settings sequentially
      for (const setting of settings) {
        if (formData[setting.key] !== setting.value) {
          const res = await updateSiteSetting(setting.key, formData[setting.key]);
          if (res.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} settings`);
      }
      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} settings`);
      } else if (errorCount === 0) {
        toast.info("No changes to save");
      }
      
      await fetchSettings();
    } catch (err) {
      toast.error('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'branding', label: 'Branding & Shared Assets' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'footer', label: 'Footer' },
    { id: 'features', label: 'Features' },
    { id: 'editorial', label: 'Editorial' },
  ];

  const getTabForKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.startsWith('brand_') || k.startsWith('logo') || k.startsWith('favicon') || k.startsWith('icon') || k.startsWith('og_') || k.startsWith('thumbnail')) return 'branding';
    if (k.startsWith('nav_')) return 'navigation';
    if (k.startsWith('footer_')) return 'footer';
    if (k.startsWith('feature_') || k.startsWith('features_')) return 'features';
    if (k.startsWith('editorial_') || k.startsWith('editor_')) return 'editorial';
    return 'general';
  };

  const filteredSettings = settings.filter(s => getTabForKey(s.key) === activeTab);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <Settings className="w-6 h-6 mr-3 text-primary" />
            Global Site Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage core configuration variables for the entire platform.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {filteredSettings?.map((setting) => (
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
                    value={formData[setting.key] !== undefined ? formData[setting.key] : setting.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    className="flex-1 sm:w-64 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                        handleSave();
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            
            {filteredSettings.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No settings found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

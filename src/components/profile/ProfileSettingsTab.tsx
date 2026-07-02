"use client";

import React, { useState } from "react";
import { Profile } from "@/store/types";
import { useCms } from "@/store/CmsContext";
import DeviceImageUploader from "@/components/yuvakshar/DeviceImageUploader";

export default function ProfileSettingsTab({ user }: { user: Profile }) {
  const { updateUserProfile } = useCms();
  const [formData, setFormData] = useState({
    display_name: user.display_name || user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    website: user.website || "",
    location: user.location || "",
    cover_url: user.cover_url || "",
    avatar_url: user.avatar_url || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(formData);
      alert("प्रोफ़ाइल सेटिंग्स सफलतापूर्वक अपडेट की गईं!");
    } catch (err) {
      alert("सेटिंग्स अपडेट करने में विफल।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 font-serif">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 font-hindi">खाता सेटिंग्स (Account Settings)</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">प्रदर्शन नाम (Display Name)</label>
          <input 
            type="text" 
            value={formData.display_name}
            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] font-hindi"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">उपयोगकर्ता नाम (Username)</label>
          <div className="flex items-center">
            <span className="bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 text-slate-500 rounded-l-xl px-4 py-3">yuvakshar.org/u/</span>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
              placeholder="username"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-r-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">सिर्फ अक्षर (a-z), नंबर (0-9) और अंडरस्कोर (_) मान्य हैं।</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">अवतार चित्र (Avatar Image)</label>
          <DeviceImageUploader
            value={formData.avatar_url}
            onChange={(url) => setFormData({...formData, avatar_url: url})}
            bucket="avatars"
            folder="avatars"
            label="अवतार चित्र अपलोड करें"
            aspectRatio="aspect-square"
            className="max-w-[200px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">कवर बैनर (Cover Banner)</label>
          <DeviceImageUploader
            value={formData.cover_url}
            onChange={(url) => setFormData({...formData, cover_url: url})}
            bucket="avatars"
            folder="covers"
            label="कवर बैनर अपलोड करें"
            aspectRatio="aspect-[3/1]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">स्थान (Location)</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g. New Delhi, India"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">वेबसाइट (Website)</label>
            <input 
              type="text" 
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">मेरे बारे में (Bio)</label>
          <textarea 
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] font-hindi"
          />
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {saving ? "सुरक्षित किया जा रहा है..." : "सुरक्षित करें (Save)"}
        </button>
      </form>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Profile } from "@/store/types";
import { useCms } from "@/store/CmsContext";

export default function ProfileSettingsTab({ user }: { user: Profile }) {
  const { updateUser } = useCms();
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(user.id, formData);
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
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-hindi"
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
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-r-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">सिर्फ अक्षर (a-z), नंबर (0-9) और अंडरस्कोर (_) मान्य हैं।</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">मेरे बारे में (Bio)</label>
          <textarea 
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-hindi"
          />
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {saving ? "सुरक्षित किया जा रहा है..." : "सुरक्षित करें (Save)"}
        </button>
      </form>
    </div>
  );
}

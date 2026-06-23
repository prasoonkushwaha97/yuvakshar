"use client";

import React, { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "@/lib/actions/settingsActions";
import { Shield, Eye, Activity, Search, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";

export default function PrivacySettingsPage() {
  const [privacy, setPrivacy] = useState<any>({
    profileVisibility: "public",
    activityVisibility: "public",
    searchable: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings?.privacy) {
          setPrivacy(settings.privacy);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    try {
      await updateUserSettings("privacy", privacy);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse flex gap-4"><div className="w-8 h-8 bg-slate-200 rounded-full"></div><div className="flex-1 bg-slate-200 h-8 rounded-xl"></div></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          गोपनीयता (Privacy)
        </h2>
        <p className="text-sm text-slate-500 mt-1">नियंत्रित करें कि प्लेटफ़ॉर्म पर कौन आपकी जानकारी देख सकता है।</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Visibility */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <Eye className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">प्रोफ़ाइल दृश्यता (Profile Visibility)</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">तय करें कि आपकी प्रोफ़ाइल और आपका बायो कौन देख सकता है।</p>
            </div>
          </div>
          <div className="pl-8 space-y-3">
            {[
              { id: 'public', label: 'सार्वजनिक (Public)', desc: 'कोई भी आपकी प्रोफ़ाइल देख सकता है।' },
              { id: 'members', label: 'केवल सदस्य (Members Only)', desc: 'केवल लॉग-इन किए गए उपयोगकर्ता देख सकते हैं।' },
              { id: 'private', label: 'निजी (Private)', desc: 'कोई भी आपकी प्रोफ़ाइल नहीं देख सकता (संपादकों को छोड़कर)।' }
            ]?.map((option) => (
              <label key={option.id} className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input 
                  type="radio" 
                  name="profileVisibility" 
                  value={option.id}
                  checked={privacy.profileVisibility === option.id}
                  onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                  className="w-5 h-5 accent-primary text-primary focus:ring-primary border-slate-300 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{option.label}</span>
                  <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Activity Visibility */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">गतिविधि दृश्यता (Activity Visibility)</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">आपकी टिप्पणियां, लाइक्स और बुकमार्क्स कौन देख सकता है।</p>
            </div>
          </div>
          <div className="pl-8 space-y-3">
            {[
              { id: 'public', label: 'सार्वजनिक (Public)' },
              { id: 'private', label: 'निजी (Private)' }
            ]?.map((option) => (
              <label key={option.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input 
                  type="radio" 
                  name="activityVisibility" 
                  value={option.id}
                  checked={privacy.activityVisibility === option.id}
                  onChange={(e) => setPrivacy({...privacy, activityVisibility: e.target.value})}
                  className="w-5 h-5 accent-primary text-primary focus:ring-primary border-slate-300"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search Engine Indexing */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 pr-4">
              <Search className="w-5 h-5 text-slate-400 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">सर्च इंजन दृश्यता (Searchable Profile)</h3>
                <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">Google जैसे सर्च इंजन को आपकी प्रोफ़ाइल अनुक्रमित करने की अनुमति दें।</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={privacy.searchable}
                onChange={(e) => setPrivacy({...privacy, searchable: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          {isSuccess ? (
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
              <span>सेटिंग्स सुरक्षित कर ली गईं</span>
            </div>
          ) : <div />}
          
          <button
            type="submit"
            disabled={isSaving}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isSaving ? <RotateCw className="w-5 h-5 animate-spin" /> : "परिवर्तन सहेजें"}
          </button>
        </div>
      </form>
    </div>
  );
}

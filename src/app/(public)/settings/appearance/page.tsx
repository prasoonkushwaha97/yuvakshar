"use client";

import React, { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "@/lib/actions/settingsActions";
import { Monitor, Moon, Sun, Type, Maximize, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";

export default function AppearanceSettingsPage() {
  const [appearance, setAppearance] = useState<any>({
    theme: "system",
    fontSize: "medium",
    readingWidth: "standard",
    reducedMotion: false,
    highContrast: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings?.appearance) {
          setAppearance(settings.appearance);
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
      await updateUserSettings("appearance", appearance);
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
        <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">स्वरूप (Appearance)</h2>
        <p className="text-sm text-slate-500 mt-1">वेबसाइट का थीम और रीडिंग अनुभव कस्टमाइज़ करें।</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Theme */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
             <Monitor className="w-4 h-4 text-primary" /> थीम (Theme)
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAppearance({ ...appearance, theme: t })}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                  appearance.theme === t 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:border-slate-300'
                }`}
              >
                {t === 'light' && <Sun className="w-6 h-6" />}
                {t === 'dark' && <Moon className="w-6 h-6" />}
                {t === 'system' && <Monitor className="w-6 h-6" />}
                <span className="text-sm font-medium capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
             <Type className="w-4 h-4 text-primary" /> फ़ॉन्ट साइज़ (Font Size)
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['small', 'medium', 'large'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAppearance({ ...appearance, fontSize: s })}
                className={`p-3 border rounded-xl text-center transition-all ${
                  appearance.fontSize === s 
                    ? 'border-primary bg-primary/5 text-primary font-bold' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                <span className={`capitalize ${s === 'small' ? 'text-sm' : s === 'large' ? 'text-lg' : 'text-base'}`}>{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reading Width */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
             <Maximize className="w-4 h-4 text-primary" /> रीडिंग चौड़ाई (Reading Width)
          </label>
          <div className="flex gap-4">
            {['standard', 'wide'].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setAppearance({ ...appearance, readingWidth: w })}
                className={`flex-1 p-3 border rounded-xl text-center transition-all ${
                  appearance.readingWidth === w 
                    ? 'border-primary bg-primary/5 text-primary font-bold' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                <span className="capitalize">{w}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">एक्सेसिबिलिटी (Accessibility)</label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={appearance.reducedMotion}
              onChange={(e) => setAppearance({...appearance, reducedMotion: e.target.checked})}
              className="w-5 h-5 accent-primary rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-slate-700 dark:text-slate-300">कम मोशन (Reduced Motion)</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={appearance.highContrast}
              onChange={(e) => setAppearance({...appearance, highContrast: e.target.checked})}
              className="w-5 h-5 accent-primary rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-slate-700 dark:text-slate-300">हाई कंट्रास्ट (High Contrast)</span>
          </label>
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

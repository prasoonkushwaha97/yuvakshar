"use client";

import React, { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "@/lib/actions/settingsActions";
import { Globe, Languages, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";

export default function LanguageSettingsPage() {
  const [language, setLanguage] = useState<any>({
    interfaceLanguage: "hi",
    contentLanguage: "hi",
    bilingualMode: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings?.language) {
          setLanguage(settings.language);
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
      await updateUserSettings("language", language);
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
          <Globe className="w-5 h-5 text-primary" />
          भाषा (Language)
        </h2>
        <p className="text-sm text-slate-500 mt-1">वेबसाइट की भाषा और पढ़ने के अनुभव को कस्टमाइज़ करें।</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Interface Language */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">इंटरफ़ेस भाषा (Interface Language)</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'hi', label: 'हिंदी', desc: 'डिफ़ॉल्ट' },
              { id: 'en', label: 'English', desc: 'अंग्रेजी' }
            ]?.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLanguage({ ...language, interfaceLanguage: opt.id })}
                className={`p-4 border rounded-xl text-left transition-all ${
                  language.interfaceLanguage === opt.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className={`font-bold text-lg ${language.interfaceLanguage === opt.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{opt.label}</div>
                <div className="text-sm text-slate-500 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Language Preference */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">सामग्री प्राथमिकता (Content Preference)</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'hi', label: 'मुख्य रूप से हिंदी', desc: 'हिंदी लेखों को प्राथमिकता दें' },
              { id: 'en', label: 'Mainly English', desc: 'Prefer English articles' }
            ]?.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLanguage({ ...language, contentLanguage: opt.id })}
                className={`p-4 border rounded-xl text-left transition-all ${
                  language.contentLanguage === opt.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className={`font-bold text-lg ${language.contentLanguage === opt.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{opt.label}</div>
                <div className="text-sm text-slate-500 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bilingual Mode */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 pr-4">
              <Languages className="w-5 h-5 text-slate-400 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">द्विभाषी मोड (Bilingual Mode)</h3>
                <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">जहाँ संभव हो, दोनों भाषाओं (हिंदी और अंग्रेजी) में सामग्री प्रदर्शित करें।</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={language.bilingualMode}
                onChange={(e) => setLanguage({...language, bilingualMode: e.target.checked})}
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

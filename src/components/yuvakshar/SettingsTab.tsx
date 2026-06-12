"use client";

import React, { useState, useEffect } from "react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function SettingsTab() {
  const cms = useCms();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [accessibleFont, setAccessibleFont] = useState(false);

  const [adminTimerSound, setAdminTimerSound] = useState(true);
  const [adminTimerEnabled, setAdminTimerEnabled] = useState(true);
  const [adminTimerStats, setAdminTimerStats] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("yuvakshar_theme") as "light" | "dark" || "light";
      setTheme(savedTheme);

      const savedContrast = localStorage.getItem("yuvakshar_high_contrast") === "true";
      setHighContrast(savedContrast);

      const savedScale = localStorage.getItem("yuvakshar_font_scale") as "sm" | "base" | "lg" | "xl" || "base";
      setFontSizeScale(savedScale);

      const savedFont = localStorage.getItem("yuvakshar_accessible_font") === "true";
      setAccessibleFont(savedFont);

      const savedTimer = localStorage.getItem("yuvakshar_timer_settings");
      if (savedTimer) {
        const parsed = JSON.parse(savedTimer);
        if (parsed.sound !== undefined) setAdminTimerSound(parsed.sound);
        if (parsed.enabled !== undefined) setAdminTimerEnabled(parsed.enabled);
        if (parsed.statistics !== undefined) setAdminTimerStats(parsed.statistics);
      }
    }
  }, []);

  const handleThemeChange = (val: "light" | "dark") => {
    setTheme(val);
    localStorage.setItem("yuvakshar_theme", val);
    if (val === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleContrastChange = (val: boolean) => {
    setHighContrast(val);
    localStorage.setItem("yuvakshar_high_contrast", val.toString());
    if (val) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  const handleFontScaleChange = (val: "sm" | "base" | "lg" | "xl") => {
    setFontSizeScale(val);
    localStorage.setItem("yuvakshar_font_scale", val);
    document.documentElement.setAttribute("data-font-scale", val);
  };

  const handleAccessibleFontChange = (val: boolean) => {
    setAccessibleFont(val);
    localStorage.setItem("yuvakshar_accessible_font", val.toString());
    if (val) {
      document.documentElement.classList.add("accessible-font");
    } else {
      document.documentElement.classList.remove("accessible-font");
    }
  };

  const handleTimerSetting = (key: "sound" | "enabled" | "statistics", val: boolean) => {
    if (key === "sound") setAdminTimerSound(val);
    if (key === "enabled") setAdminTimerEnabled(val);
    if (key === "statistics") setAdminTimerStats(val);

    const saved = localStorage.getItem("yuvakshar_timer_settings");
    const parsed = saved ? JSON.parse(saved) : {};
    localStorage.setItem("yuvakshar_timer_settings", JSON.stringify({ ...parsed, [key]: val }));
  };

  return (
    <GlassCard glow="none" className="p-6 space-y-6">
      <div className="space-y-6 font-serif text-xs">
        
        {/* Theme Preference */}
        <div className="pb-4 border-b border-slate-100 dark:border-slate-805 space-y-3">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs">डार्क मोड / लाइट मोड थीम (Theme Preference)</h4>
            <p className="text-[10px] text-slate-400 font-sans">पठन सुविधा के अनुकूल थीम का चयन करें।</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: "light", label: "लाइट थीम (Light Mode)" },
              { id: "dark", label: "डार्क थीम (Dark Mode)" }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleThemeChange(t.id as any)}
                className={`px-4 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  theme === t.id 
                    ? "bg-primary border-primary text-white" 
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast Mode */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-805">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs">उच्च कंट्रास्ट मोड (High Contrast Mode)</h4>
            <p className="text-[10px] text-slate-400 font-sans">बेहतर दृश्यता के लिए पूर्ण श्वेत/श्याम रंग योजना का उपयोग करें।</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => handleContrastChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Global Font Scale */}
        <div className="pb-4 border-b border-slate-100 dark:border-slate-805 space-y-3">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs">वैश्विक फॉन्ट आकार (Global Font Scale)</h4>
            <p className="text-[10px] text-slate-400 font-sans">पूरे पोर्टल की पाठ्य सामग्री का फॉन्ट आकार बदलें।</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: "sm", label: "छोटा (Small)" },
              { id: "base", label: "सामान्य (Default)" },
              { id: "lg", label: "बड़ा (Large)" },
              { id: "xl", label: "अति बड़ा (Extra Large)" }
            ].map(scale => (
              <button
                key={scale.id}
                type="button"
                onClick={() => handleFontScaleChange(scale.id as any)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  fontSizeScale === scale.id
                    ? "bg-primary border-primary text-white"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400"
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accessible Font Toggle */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs">सुलभ एवं सरल फॉन्ट (Accessible Fonts)</h4>
            <p className="text-[10px] text-slate-400 font-sans">पठन सुगमता के लिए देवनागरी सेरिफ को सरल फॉन्ट में बदलें।</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={accessibleFont}
              onChange={(e) => handleAccessibleFontChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Swadhyaya Timer Sound */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs">स्वाध्याय टाइमर ध्वनि (Chime Sound)</h4>
            <p className="text-[10px] text-slate-400 font-sans">स्वाध्याय सत्र पूरा होने पर घंटानाद बजना सक्षम करें।</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={adminTimerSound}
              onChange={(e) => handleTimerSetting("sound", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Push Notifications */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs">ब्राउज़र पुश सूचनाएँ (Push Notifications)</h4>
            <p className="text-[10px] text-slate-400 font-sans">स्वाध्याय समय पूर्ण होने पर सिस्टम पुश नोटिफिकेशन प्राप्त करें।</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={adminTimerEnabled}
              onChange={(e) => handleTimerSetting("enabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2 leading-relaxed">
          <h5 className="font-bold text-primary font-serif">सुरक्षा एवं पहुँच क्षमता नीति</h5>
          <p className="text-[10px] text-slate-400 font-serif leading-relaxed font-semibold">युवाक्षर समावेशी एवं स्वतंत्र पत्रकारिता का पक्षधर है। उपर्युक्त सभी पहुँच क्षमता कस्टमाइज़ेशन सेटिंग्स आपके स्थानीय वेब ब्राउज़र में सुरक्षित कर ली जाती हैं और पूरे पोर्टल पर तत्काल प्रभाव से लागू होती हैं।</p>
        </div>

        <button
          onClick={() => alert("वैयक्तिक सेटिंग्स सफलतापूर्वक सुरक्षित कर ली गई हैं!")}
          className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1 font-serif"
        >
          <span>सेटिंग्स सुरक्षित करें</span>
        </button>
      </div>
    </GlassCard>
  );
}

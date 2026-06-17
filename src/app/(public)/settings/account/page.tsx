"use client";

import React, { useState, useEffect } from "react";
import { useCms } from "@/store/CmsContext";
import { User, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";

export default function AccountSettingsPage() {
  const { currentUser, updateUserProfile, checkUsernameAvailability } = useCms();
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setUsername(currentUser.username || "");
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const canChangeUsername = !currentUser.username_changed_at;
  const isUsernameChanged = username !== currentUser.username;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isUsernameChanged) {
      if (!canChangeUsername) {
        alert("You have already changed your username once.");
        return;
      }
      
      const check = checkUsernameAvailability(username);
      if (!check.available) {
        setUsernameMsg(check.message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const updates: any = { name: name.trim() };
      
      if (isUsernameChanged) {
        updates.username = username.trim();
        updates.previous_username = currentUser.username;
        updates.username_changed_at = new Date().toISOString();
      }

      await updateUserProfile(updates);
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">अकाउंट सेटिंग्स</h2>
        <p className="text-sm text-slate-500 mt-1">अपनी पहचान और यूज़रनेम प्रबंधित करें।</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">प्रदर्शन नाम (Name)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
            placeholder="आपका पूरा नाम"
            required
          />
          <p className="text-xs text-slate-500">यह नाम आपके लेखों और प्रोफ़ाइल पर दिखाई देगा।</p>
        </div>

        {/* Username Field */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">यूज़रनेम (@username)</label>
            {!canChangeUsername && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">बदला नहीं जा सकता</span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (e.target.value && e.target.value !== currentUser.username) {
                  const check = checkUsernameAvailability(e.target.value);
                  setUsernameMsg(check.message);
                } else {
                  setUsernameMsg("");
                }
              }}
              disabled={!canChangeUsername || isLoading}
              className="w-full pl-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-slate-800/50"
              placeholder="username"
              required
            />
          </div>
          
          {usernameMsg && isUsernameChanged && (
            <p className={`text-xs flex items-center gap-1 ${usernameMsg === 'Available' ? 'text-green-600' : 'text-amber-600'}`}>
              {usernameMsg === 'Available' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {usernameMsg}
            </p>
          )}

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">यूज़रनेम नीतियां:</h4>
            <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
              <li>यूज़रनेम केवल <b>एक बार</b> बदला जा सकता है।</li>
              <li>अक्षर, संख्याएं और अंडरस्कोर (_) का प्रयोग करें।</li>
              <li>न्यूनतम 3 और अधिकतम 30 अक्षर।</li>
              <li>स्पेस या विशेष चिह्न मान्य नहीं हैं।</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoading || (isUsernameChanged && usernameMsg !== 'Available')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <RotateCw className="w-4 h-4 animate-spin" />}
            परिवर्तन सहेजें
          </button>
          
          {isSuccess && (
            <span className="text-sm text-green-600 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              सफलतापूर्वक सहेजा गया!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useCms } from "@/store/CmsContext";
import { updateUserAccount } from "@/lib/actions/settingsActions";
import { AlertCircle, CheckCircle2, RotateCw } from "lucide-react";
import AvatarUploader from "@/components/yuvakshar/AvatarUploader";
import { validateUsername, RESERVED_USERNAMES } from "@/utils/username";

export default function AccountSettingsPage() {
  const { currentUser, users } = useCms();
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({ twitter: "", linkedin: "", website: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  const validateAndCheck = (val: string) => {
    setUsernameSuccess("");
    
    if (!val) {
      setUsernameError("Username is required.");
      return;
    }
    
    const valRes = validateUsername(val);
    if (!valRes.valid) {
      setUsernameError(valRes.error || "Invalid username.");
      return;
    }
    
    const lower = val.toLowerCase();
    if (currentUser && currentUser.username && currentUser.username.toLowerCase() === lower) {
      setUsernameError("");
      setUsernameSuccess("✓ Username available");
      return;
    }
    
    const isTaken = users.some(
      (u: any) => u.id !== currentUser?.id && u.username && u.username.toLowerCase() === lower
    );
    
    if (isTaken) {
      setUsernameError("Username already taken");
    } else {
      setUsernameError("");
      setUsernameSuccess("✓ Username available");
    }
  };

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setBio(currentUser.bio || "");
      if (currentUser.social_links) {
        setSocialLinks({
          twitter: currentUser.social_links.twitter || "",
          linkedin: currentUser.social_links.linkedin || "",
          website: currentUser.social_links.website || "",
        });
      }

      if (!currentUser.username) {
        setShowWarning(true);
        // Automatically generate a username from name/display_name
        const baseName = currentUser.name || currentUser.display_name || "user";
        let base = baseName
          .toLowerCase()
          .replace(/[^a-z0-9_.-]/g, '-')
          .replace(/[-_.]+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (base.length < 3) base = base.padEnd(3, '0');
        if (base.length > 25) base = base.substring(0, 25);
        
        let test = base;
        let counter = 2;
        const existingUsernames = new Set(users.map((u: any) => u.username?.toLowerCase()).filter(Boolean));
        
        while (existingUsernames.has(test) || RESERVED_USERNAMES.includes(test)) {
          test = `${base}-${counter}`;
          counter++;
        }
        
        setUsername(test);
        validateAndCheck(test);
      } else {
        setShowWarning(false);
        setUsername(currentUser.username);
        validateAndCheck(currentUser.username);
      }
    }
  }, [currentUser, users]);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    try {
      await updateUserAccount({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        social_links: socialLinks,
      });
      setIsSuccess(true);
      setShowWarning(false);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">अकाउंट सेटिंग्स</h2>
        <p className="text-sm text-slate-500 mt-1">अपनी प्रोफ़ाइल जानकारी प्रबंधित करें।</p>
      </div>

      {showWarning && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl text-sm flex gap-3 border border-amber-200 dark:border-amber-900/50 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <p className="font-bold">अधूरी प्रोफ़ाइल (Profile Incomplete)</p>
            <p className="mt-1">यूट्यूब और अन्य सार्वजनिक सुविधाओं का उपयोग जारी रखने के लिए कृपया एक यूज़रनेम (Username) सेट करें।</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Avatar Upload System */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">प्रोफ़ाइल फ़ोटो</label>
          <AvatarUploader currentAvatarUrl={currentUser.avatar_url || ""} />
        </div>

        {/* Name Field */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">प्रदर्शन नाम (Display Name) *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
            placeholder="आपका पूरा नाम"
            required
          />
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">यूज़रनेम (Username) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                const val = e.target.value;
                setUsername(val);
                validateAndCheck(val);
              }}
              className={`w-full bg-white dark:bg-slate-900 border ${
                usernameError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : usernameSuccess
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-slate-300 dark:border-slate-700 focus:border-primary focus:ring-primary"
              } rounded-xl p-3 pl-8 focus:outline-none focus:ring-1 text-slate-900 dark:text-white font-mono`}
              placeholder="username"
              required
            />
          </div>
          
          {/* Live Profile Preview */}
          <div className="mt-2 text-xs text-slate-500">
            Your Public Profile:{" "}
            <span className="font-mono text-primary font-semibold select-all break-all">
              https://yuvakshar.tech/u/{username.trim() ? username.toLowerCase() : "username"}
            </span>
          </div>

          {/* Validation Messages */}
          {usernameError && (
            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {usernameError}
            </p>
          )}
          {usernameSuccess && (
            <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {usernameSuccess}
            </p>
          )}
        </div>

        {/* Bio Field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">बायो (Bio)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white h-24"
            placeholder="अपने बारे में कुछ बताएं..."
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">सोशल लिंक्स (Social Links)</label>
          <input
            type="url"
            value={socialLinks.twitter}
            onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
            placeholder="ट्विटर (Twitter) लिंक"
          />
          <input
            type="url"
            value={socialLinks.linkedin}
            onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
            placeholder="लिंक्डइन (LinkedIn) लिंक"
          />
          <input
            type="url"
            value={socialLinks.website}
            onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
            placeholder="व्यक्तिगत वेबसाइट लिंक"
          />
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
          ) : (
            <div /> // placeholder for spacing
          )}
          
          <button
            type="submit"
            disabled={isLoading || !name.trim() || !username.trim() || !!usernameError}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RotateCw className="w-5 h-5 animate-spin" />
            ) : (
              "परिवर्तन सहेजें"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

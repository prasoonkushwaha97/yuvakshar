"use client";

import React, { useState, useEffect } from "react";
import { useCms } from "@/store/CmsContext";
import { updateUserAccount } from "@/lib/actions/settingsActions";
import { validateUsername, RESERVED_USERNAMES } from "@/utils/username";
import { UserCheck, AlertCircle, CheckCircle2, RotateCw, AtSign } from "lucide-react";

interface CreateUsernameModalProps {
  isOpen: boolean;
  onSuccess: (newUsername: string) => void;
}

export default function CreateUsernameModal({ isOpen, onSuccess }: CreateUsernameModalProps) {
  const { currentUser, users } = useCms();
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.name && !usernameInput) {
      // Suggest an initial clean username from display name
      const suggested = currentUser.name
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .substring(0, 25);
      if (suggested.length >= 3) {
        setUsernameInput(suggested);
        validateAndCheck(suggested);
      }
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const validateAndCheck = (val: string) => {
    setSuccessMsg("");
    setError("");

    if (!val || !val.trim()) {
      setError("यूज़रनेम अनिवार्य है। (Username is required)");
      return false;
    }

    const trimmed = val.trim();
    const valRes = validateUsername(trimmed);
    if (!valRes.valid) {
      setError(valRes.error || "अमान्य यूज़रनेम।");
      return false;
    }

    const lower = trimmed.toLowerCase();
    const isTaken = users.some(
      (u: any) => u.id !== currentUser.id && u.username && u.username.toLowerCase() === lower
    );

    if (isTaken) {
      setError("यह यूज़रनेम पहले से उपयोग में है। (Username already taken)");
      return false;
    }

    setSuccessMsg("✓ यूज़रनेम उपलब्ध है (Username available)");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/\s+/g, "");
    setUsernameInput(val);
    validateAndCheck(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAndCheck(usernameInput)) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await updateUserAccount({
        username: usernameInput.trim().toLowerCase(),
      });
      if (res && res.success) {
        onSuccess(usernameInput.trim().toLowerCase());
      } else {
        setError("यूज़रनेम अपडेट करने में विफल। कृपया पुनः प्रयास करें।");
      }
    } catch (err: any) {
      console.error("Failed to create username:", err);
      setError(err.message || "यूज़रनेम सहेजने में विफल।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden font-sans p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#F97316]/10 text-[#F97316] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AtSign className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            यूज़रनेम बनाएं (Create Username)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            आपकी प्रोफ़ाइल के लिए एक विशिष्ट यूज़रनेम (Username) आवश्यक है। कृपया आगे बढ़ने के लिए यूज़रनेम सेट करें।
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              यूज़रनेम (Username) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">@</span>
              <input
                type="text"
                value={usernameInput}
                onChange={handleInputChange}
                className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : successMsg
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary"
                } rounded-xl p-3 pl-8 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                placeholder="my_unique_username"
                required
                autoFocus
              />
            </div>
            
            {/* Live profile URL preview */}
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Profile URL: <span className="text-[#F97316] font-semibold">yuvakshar.tech/u/{usernameInput || "username"}</span>
            </p>

            {/* Validation indicators */}
            {error && (
              <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
            {successMsg && !error && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{successMsg}</span>
              </p>
            )}
          </div>

          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-slate-600 dark:text-slate-300">नियम (Rules):</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>3 से 30 अक्षरों का होना चाहिए (3-30 chars)</li>
              <li>केवल अक्षर, अंक, अंडरस्कोर (_) एवं बिंदु (.) (a-z, 0-9, _, .)</li>
              <li>स्पेस (Spaces) की अनुमति नहीं है</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!error || !usernameInput.trim()}
            className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>सहेजा जा रहा है...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>यूज़रनेम सहेजें (Save Username)</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

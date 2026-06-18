"use client";

import React, { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings, getUserLoginHistory } from "@/lib/actions/settingsActions";
import { supabase } from "@/lib/supabaseClient";
import { Lock, Smartphone, Monitor, Clock, ShieldAlert, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";

export default function SecuritySettingsPage() {
  const [securitySettings, setSecuritySettings] = useState<any>({
    future_2fa_enabled: false
  });
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings) {
          setSecuritySettings({ future_2fa_enabled: settings.future_2fa_enabled || false });
        }
        const history = await getUserLoginHistory();
        setLoginHistory(history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordError("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setPasswordSuccess(true);
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const toggle2FA = async (enabled: boolean) => {
    // Just updates the boolean flag to demonstrate the future-ready feature
    try {
      setSecuritySettings({ ...securitySettings, future_2fa_enabled: enabled });
      await updateUserSettings("future_2fa_enabled", enabled);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoutOtherDevices = async () => {
    // Implementation placeholder for future session revoking capabilities
    alert("Session management is currently in development. Future updates will allow revoking specific active sessions.");
  };

  if (isLoading) {
    return <div className="animate-pulse flex gap-4"><div className="w-8 h-8 bg-slate-200 rounded-full"></div><div className="flex-1 bg-slate-200 h-8 rounded-xl"></div></div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          सुरक्षा (Security)
        </h2>
        <p className="text-sm text-slate-500 mt-1">अपने खाते को सुरक्षित रखें और लॉगिन गतिविधि प्रबंधित करें।</p>
      </div>

      <div className="space-y-8">
        
        {/* Password Update Form */}
        <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">पासवर्ड बदलें (Change Password)</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">नया पासवर्ड</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">नया पासवर्ड (पुष्टि करें)</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-900 dark:text-white"
                required
              />
            </div>
            
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{passwordError}</p>
              </div>
            )}
            
            <div className="pt-2 flex items-center justify-between">
              {passwordSuccess ? (
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>पासवर्ड अपडेट कर दिया गया</span>
                </div>
              ) : <div />}
              <button
                type="submit"
                disabled={isSavingPassword || !newPassword}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                {isSavingPassword ? <RotateCw className="w-5 h-5 animate-spin" /> : "पासवर्ड बदलें"}
              </button>
            </div>
          </div>
        </form>

        {/* Two-Factor Authentication (Future Ready Placeholder) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 pr-4">
              <ShieldAlert className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">टू-फैक्टर ऑथेंटिकेशन (2FA)</h3>
                <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">अपने खाते की सुरक्षा बढ़ाने के लिए प्रमाणीकरण की एक अतिरिक्त परत जोड़ें। (यह सुविधा जल्द ही पूरी तरह से सक्षम हो जाएगी)।</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={securitySettings.future_2fa_enabled}
                onChange={(e) => toggle2FA(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">सक्रिय सत्र (Active Sessions)</h3>
              <p className="text-sm text-slate-500">वे डिवाइस जहां आप वर्तमान में लॉग इन हैं।</p>
            </div>
            <button 
              onClick={handleLogoutOtherDevices}
              className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-100"
            >
              अन्य सभी डिवाइस से लॉग आउट करें
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Current Session Mockup */}
            <div className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-4">
                <Monitor className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Windows • Chrome</h4>
                  <p className="text-xs text-slate-500 mt-0.5">India • वर्तमान सत्र (Current Session)</p>
                </div>
              </div>
              <div className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded">Active</div>
            </div>
          </div>
        </div>

        {/* Login History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">लॉगिन इतिहास (Login History)</h3>
          <p className="text-sm text-slate-500 mb-4">हाल ही में आपके खाते में लॉगिन करने का प्रयास।</p>
          
          {loginHistory.length === 0 ? (
            <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-700">
              कोई लॉगिन इतिहास उपलब्ध नहीं है।
            </div>
          ) : (
            <div className="space-y-2">
              {loginHistory.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex gap-3 items-center">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {log.ip_address || "Unknown IP"} • {log.location || "Unknown Location"}
                      </div>
                      <div className="text-xs text-slate-500">{new Date(log.login_time).toLocaleString()}</div>
                    </div>
                  </div>
                  {log.success ? (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">सफल (Success)</span>
                  ) : (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">विफल (Failed)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

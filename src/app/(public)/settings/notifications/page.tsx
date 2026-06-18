"use client";

import React, { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "@/lib/actions/settingsActions";
import { Bell, Mail, Smartphone, Newspaper, MessageSquare, UsersRound, AtSign, BookOpen, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";

export default function NotificationsSettingsPage() {
  const [notifications, setNotifications] = useState<any>({
    email: true,
    inApp: true,
    digest: "weekly",
    community: true,
    comments: true,
    mentions: true,
    editorial: true,
    newsletter: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings?.notifications) {
          setNotifications(settings.notifications);
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
      await updateUserSettings("notifications", notifications);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleItem = ({ id, label, description, icon: Icon, value, onChange }: any) => (
    <div className="flex items-start justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex gap-3 pr-4">
        <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{label}</h3>
          <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
      </label>
    </div>
  );

  if (isLoading) {
    return <div className="animate-pulse flex gap-4"><div className="w-8 h-8 bg-slate-200 rounded-full"></div><div className="flex-1 bg-slate-200 h-8 rounded-xl"></div></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">सूचनाएं (Notifications)</h2>
        <p className="text-sm text-slate-500 mt-1">तय करें कि आप किस प्रकार की सूचनाएं प्राप्त करना चाहते हैं।</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Delivery Methods */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">डिलीवरी का तरीका (Delivery Method)</h3>
          
          <ToggleItem 
            id="email" 
            label="ईमेल सूचनाएं (Email Notifications)" 
            description="महत्वपूर्ण अपडेट्स सीधे आपके इनबॉक्स में प्राप्त करें।"
            icon={Mail}
            value={notifications.email}
            onChange={(val: boolean) => setNotifications({...notifications, email: val})}
          />
          <ToggleItem 
            id="inApp" 
            label="इन-ऐप सूचनाएं (In-App Notifications)" 
            description="वेबसाइट इस्तेमाल करते समय अलर्ट प्राप्त करें।"
            icon={Smartphone}
            value={notifications.inApp}
            onChange={(val: boolean) => setNotifications({...notifications, inApp: val})}
          />
        </div>

        {/* Content Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">विषय (Content Preferences)</h3>
          
          <ToggleItem 
            id="mentions" 
            label="उल्लेख (Mentions)" 
            description="जब कोई आपको किसी टिप्पणी या पोस्ट में टैग करे।"
            icon={AtSign}
            value={notifications.mentions}
            onChange={(val: boolean) => setNotifications({...notifications, mentions: val})}
          />
          <ToggleItem 
            id="comments" 
            label="टिप्पणियां (Comments)" 
            description="आपके लेखों पर आने वाली नई टिप्पणियों के लिए।"
            icon={MessageSquare}
            value={notifications.comments}
            onChange={(val: boolean) => setNotifications({...notifications, comments: val})}
          />
          <ToggleItem 
            id="community" 
            label="समुदाय गतिविधि (Community Activity)" 
            description="आपके द्वारा फॉलो किए जा रहे समुदायों में नए पोस्ट।"
            icon={UsersRound}
            value={notifications.community}
            onChange={(val: boolean) => setNotifications({...notifications, community: val})}
          />
          <ToggleItem 
            id="editorial" 
            label="संपादकीय अपडेट (Editorial Updates)" 
            description="आपके लेखों की समीक्षा और प्रकाशन स्थिति के बारे में।"
            icon={BookOpen}
            value={notifications.editorial}
            onChange={(val: boolean) => setNotifications({...notifications, editorial: val})}
          />
          <ToggleItem 
            id="newsletter" 
            label="न्यूज़लेटर (Newsletter)" 
            description="युवाक्षर की साप्ताहिक हाइलाइट्स और समाचार।"
            icon={Newspaper}
            value={notifications.newsletter}
            onChange={(val: boolean) => setNotifications({...notifications, newsletter: val})}
          />
        </div>

        {/* Digest Frequency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">ईमेल सारांश (Email Digest)</h3>
          <div className="space-y-3">
            {['daily', 'weekly', 'never'].map((freq) => (
              <label key={freq} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input 
                  type="radio" 
                  name="digest" 
                  value={freq}
                  checked={notifications.digest === freq}
                  onChange={(e) => setNotifications({...notifications, digest: e.target.value})}
                  className="w-5 h-5 accent-primary text-primary focus:ring-primary border-slate-300"
                />
                <span className="capitalize font-medium text-slate-700 dark:text-slate-200">
                  {freq === 'daily' ? 'दैनिक (Daily)' : freq === 'weekly' ? 'साप्ताहिक (Weekly)' : 'कभी नहीं (Never)'}
                </span>
              </label>
            ))}
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

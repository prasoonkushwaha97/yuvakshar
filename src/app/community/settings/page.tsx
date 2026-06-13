"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Bell, 
  Eye, 
  BookOpen, 
  ShieldCheck, 
  Save 
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function CommunitySettingsPage() {
  const { currentUser, updateUserProfile } = useCms();
  
  // Setting states
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [mentionNotif, setMentionNotif] = useState(true);
  
  const [publicProfile, setPublicProfile] = useState(currentUser?.publicVisibility !== false);
  const [showRep, setShowRep] = useState(true);
  
  const [prefCategories, setPrefCategories] = useState<string[]>(currentUser?.interests || ["काव्य", "विचार"]);

  const toggleCategory = (cat: string) => {
    if (prefCategories.includes(cat)) {
      setPrefCategories(prefCategories.filter(c => c !== cat));
    } else {
      setPrefCategories([...prefCategories, cat]);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await updateUserProfile({
        publicVisibility: publicProfile,
        interests: prefCategories
      });
      alert("आपकी प्राथमिकताएं सफलतापूर्वक अपडेट कर दी गई हैं!");
    } catch (err) {
      console.error(err);
      alert("त्रुटि: सेटिंग्स सहेजने में विफल।");
    }
  };

  return (
    <div className="space-y-6 text-[#0F172A] dark:text-slate-200">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex items-center space-x-2 text-primary font-bold text-xs font-serif font-hindi">
        <Settings className="w-5 h-5 text-primary" />
        <span>चौपाल सेटिंग्स (Settings & Privacy)</span>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* 1. Notifications Preferences */}
        <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <Bell className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-xs font-bold font-hindi">सूचना प्राथमिकताएं (Notifications)</h3>
          </div>
          
          <div className="space-y-3 text-xs font-hindi">
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-bold">ईमेल सूचनाएं</span>
                <span className="text-[10px] text-slate-400">साप्ताहिक सारांश और नई सूचनाएं ईमेल पर प्राप्त करें।</span>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotif} 
                onChange={e => setEmailNotif(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-bold">इन-ऐप सूचनाएं (Push Notifications)</span>
                <span className="text-[10px] text-slate-400">आपकी पोस्ट्स पर नई टिप्पणियों और स्पंदनों की तुरंत सूचना पाएं।</span>
              </div>
              <input 
                type="checkbox" 
                checked={pushNotif} 
                onChange={e => setPushNotif(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block font-bold">@उल्लेख (Mentions)</span>
                <span className="text-[10px] text-slate-400">जब कोई साथी लेखक आपको पोस्ट या टिप्पणी में टैग करे।</span>
              </div>
              <input 
                type="checkbox" 
                checked={mentionNotif} 
                onChange={e => setMentionNotif(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </GlassCard>

        {/* 2. Privacy Preferences */}
        <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <Eye className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-xs font-bold font-hindi">निजता और दृश्यता (Privacy & Visibility)</h3>
          </div>
          
          <div className="space-y-3 text-xs font-hindi">
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-bold">सार्वजनिक प्रोफाइल दृश्यता</span>
                <span className="text-[10px] text-slate-400">अन्य सदस्य निर्देशिका में आपकी प्रोफाइल खोज और देख सकते हैं।</span>
              </div>
              <input 
                type="checkbox" 
                checked={publicProfile} 
                onChange={e => setPublicProfile(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block font-bold">प्रतिष्ठा स्कोर प्रदर्शित करें</span>
                <span className="text-[10px] text-slate-400">आपकी चौपाल पोस्ट्स पर आपका ⭐ साहित्यिक प्रतिष्ठा स्कोर प्रदर्शित किया जाएगा।</span>
              </div>
              <input 
                type="checkbox" 
                checked={showRep} 
                onChange={e => setShowRep(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </GlassCard>

        {/* 3. Preferred Content Categories */}
        <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <BookOpen className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-xs font-bold font-hindi">पसंदीदा साहित्यिक विषय (Content Preferences)</h3>
          </div>
          
          <div className="space-y-2 text-xs font-hindi">
            <span className="text-[10px] text-slate-400 block mb-2">अपनी रुचि के विषय चुनें, हम आपकी चौपाल फ़ीड में इनसे संबंधित प्रविष्टियों को प्राथमिकता देंगे:</span>
            <div className="flex flex-wrap gap-2">
              {["काव्य", "कहानी", "उपन्यास समीक्षा", "साहित्य आलोचना", "लघु कथा", "वैचारिक निबंध", "जीवनी विमर्श"].map((cat) => {
                const isSelected = prefCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Actions Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/10 flex items-center space-x-1.5 cursor-pointer font-hindi"
          >
            <Save className="w-4 h-4" />
            <span>सेटिंग्स सहेजें</span>
          </button>
        </div>

      </form>

    </div>
  );
}

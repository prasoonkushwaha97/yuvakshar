"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Calendar, 
  PenTool, 
  ThumbsUp, 
  User, 
  Award,
  ArrowRight,
  Send
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  fetchChallenges, 
  submitChallengeWork, 
  fetchChallengeSubmissions, 
  CommunityChallenge, 
  CommunityChallengeSubmission 
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function ChallengesPage() {
  const { currentUser } = useCms();
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<CommunityChallenge | null>(null);
  const [submissions, setSubmissions] = useState<CommunityChallengeSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Submission Form states
  const [subTitle, setSubTitle] = useState("");
  const [subContent, setSubContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadChallengesData = async () => {
    setLoading(true);
    try {
      const data = await fetchChallenges();
      setChallenges(data);
      if (data.length > 0) {
        setSelectedChallenge(data[0]);
        const subs = await fetchChallengeSubmissions(data[0].id);
        setSubmissions(subs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallengesData();
  }, []);

  const handleChallengeSelect = async (chal: CommunityChallenge) => {
    setSelectedChallenge(chal);
    setShowForm(false);
    try {
      const subs = await fetchChallengeSubmissions(chal.id);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedChallenge) return;
    if (!subTitle.trim() || !subContent.trim()) return;

    try {
      await submitChallengeWork(
        selectedChallenge.id,
        currentUser.id,
        currentUser.name || "लेखक",
        subTitle,
        subContent
      );
      
      // Reload submissions
      const subs = await fetchChallengeSubmissions(selectedChallenge.id);
      setSubmissions(subs);
      
      setSubTitle("");
      setSubContent("");
      setShowForm(false);
      alert("आपकी साहित्यिक प्रविष्टि सफलतापूर्वक जमा हो गई है! आपको +10 प्रतिष्ठा अंक मिले हैं।");
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = (subId: string) => {
    setSubmissions(submissions.map(s => {
      if (s.id === subId) return { ...s, votes_count: s.votes_count + 1 };
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Active Challenges lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((chal) => {
          const isActive = selectedChallenge?.id === chal.id;
          return (
            <button
              key={chal.id}
              onClick={() => handleChallengeSelect(chal)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[110px] ${
                isActive
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-white dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/20"
              }`}
            >
              <div className="space-y-1">
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold">
                  {chal.type}
                </span>
                <h4 className="text-xs font-bold font-serif text-slate-800 dark:text-white font-hindi">{chal.title}</h4>
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-serif w-full">
                <span>अंतिम तिथि: {new Date(chal.end_date).toLocaleDateString("hi-IN")}</span>
                <span className="font-bold text-primary">+{chal.reward_points} अंक</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedChallenge && (
        <div className="space-y-6">
          
          {/* Selected Challenge Detail Banner */}
          <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-3">
            <div className="flex items-center space-x-2 text-primary font-bold text-xs font-serif font-hindi">
              <Trophy className="w-4.5 h-4.5" />
              <span>सक्रिय साहित्यिक चुनौती (Active Challenge)</span>
            </div>
            <h3 className="font-serif text-base font-bold text-slate-800 dark:text-white font-hindi">
              {selectedChallenge.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-hindi">
              {selectedChallenge.description}
            </p>

            {currentUser ? (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer font-hindi"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>अपनी प्रविष्टि जमा करें</span>
              </button>
            ) : (
              <p className="text-[10px] text-slate-400 font-serif">प्रतियोगिता में भाग लेने के लिए कृपया लॉगिन करें।</p>
            )}
          </GlassCard>

          {/* Submission Form */}
          {showForm && currentUser && (
            <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
              <form onSubmit={handleSubSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-serif font-hindi block">प्रविष्टि का शीर्षक (Entry Title)</label>
                  <input 
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="जैसे: सावन की पहली फुहार"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-hindi"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-serif font-hindi block">रचनात्मक गद्य / कविता (Content Text)</label>
                  <textarea 
                    value={subContent}
                    onChange={(e) => setSubContent(e.target.value)}
                    placeholder="अपनी कविता या कहानी यहाँ लिखें..."
                    rows={6}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-primary resize-none font-hindi"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer font-hindi flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>प्रविष्टि पोस्ट करें</span>
                </button>
              </form>
            </GlassCard>
          )}

          {/* Submissions List / Leaderboard */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 font-hindi">
              प्रतिभागी प्रविष्टियां (Submissions & Votes)
            </h4>

            {submissions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((sub) => (
                  <GlassCard key={sub.id} className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-bold font-serif text-slate-800 dark:text-white font-hindi">{sub.title}</h5>
                        <span className="text-[9px] text-slate-400 font-serif">लेखक: {sub.user_name}</span>
                      </div>
                      
                      {/* Voting */}
                      <button
                        onClick={() => handleVote(sub.id)}
                        className="flex items-center space-x-1.5 bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-850 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-350 transition-all cursor-pointer font-hindi"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-mono">{sub.votes_count} मत</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-hindi whitespace-pre-wrap">
                      {sub.content}
                    </p>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-slate-400 font-serif">इस प्रतियोगिता में अभी तक कोई प्रविष्टि नहीं आई है। प्रथम प्रतिभागी बनें!</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

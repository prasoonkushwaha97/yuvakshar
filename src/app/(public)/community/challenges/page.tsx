"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  PenTool, 
  ThumbsUp, 
  Send,
  CalendarDays,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Search
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
      
      const subs = await fetchChallengeSubmissions(selectedChallenge.id);
      setSubmissions(subs);
      
      setSubTitle("");
      setSubContent("");
      setShowForm(false);
      alert("आपकी साहित्यिक प्रविष्टि सफलतापूर्वक जमा हो गई है! मूल्यांकन के उपरांत श्रेष्ठ प्रविष्टियों को प्रकाशित किया जाएगा।");
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = (subId: string) => {
    setSubmissions(submissions?.map(s => {
      if (s.id === subId) return { ...s, votes_count: s.votes_count + 1 };
      return s;
    }));
  };

  // Get progress percentage for deadlines
  const getDeadlineProgress = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const nowTime = new Date().getTime();
    if (nowTime >= endTime) return 100;
    if (nowTime <= startTime) return 0;
    const total = endTime - startTime;
    const current = nowTime - startTime;
    return Math.round((current / total) * 100);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      
      {/* Header title */}
      <div className="bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex items-center space-x-2 text-primary font-bold text-xs font-serif font-hindi">
        <Trophy className="w-5 h-5 text-primary" />
        <span>साहित्यिक चुनौतियां एवं प्रतियोगिताएं (Challenges)</span>
      </div>

      {/* Active Challenges list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges?.map((chal) => {
          const isActive = selectedChallenge?.id === chal.id;
          const deadlineProgress = getDeadlineProgress(chal.start_date, chal.end_date);
          const timeLeftDays = Math.max(0, Math.round((new Date(chal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

          return (
            <button
              key={chal.id}
              onClick={() => handleChallengeSelect(chal)}
              className={`text-left p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[140px] ${
                isActive
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-white dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/20"
              }`}
            >
              <div className="space-y-1 w-full">
                <div className="flex justify-between items-start w-full">
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold">
                    {chal.type}
                  </span>
                  <span className="text-[9px] text-amber-500 font-bold font-hindi flex items-center gap-0.5">
                    🪙 {chal.reward_points} अंक
                  </span>
                </div>
                <h4 className="text-xs font-bold font-serif text-slate-850 dark:text-white font-hindi line-clamp-1">{chal.title}</h4>
              </div>

              <div className="w-full space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-serif w-full">
                  <span>प्रगति: {timeLeftDays > 0 ? `${timeLeftDays} दिन शेष` : "समय समाप्त"}</span>
                  <span>अंतिम: {new Date(chal.end_date).toLocaleDateString("hi-IN")}</span>
                </div>
                {/* Deadline progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all" style={{ width: `${deadlineProgress}%` }} />
                </div>
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
            <h3 className="font-serif text-base font-bold text-slate-850 dark:text-white font-hindi">
              {selectedChallenge.title}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-hindi">
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

          {/* Submissions List & Winner Showcase */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 font-hindi">
              प्रतिभागी प्रविष्टियां (Submissions & Votes)
            </h4>

            {submissions.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {submissions?.map((sub) => {
                  const currentStepIdx = sub.is_winner ? 3 : (sub.votes_count > 10 ? 2 : (sub.votes_count > 5 ? 1 : 0));
                  const steps = ["प्रस्तुत (Submitted)", "समीक्षाधीन (Review)", "शॉर्टलिस्ट (Shortlist)", "विजेता (Winner)"];

                  return (
                    <GlassCard 
                      key={sub.id} 
                      className={`p-5 border space-y-4 transition-all ${
                        sub.is_winner 
                          ? "border-amber-400 bg-amber-500/5 dark:bg-amber-950/10 dark:border-amber-900/50 shadow-md shadow-amber-500/5" 
                          : "border-slate-200/60 dark:border-slate-800/40"
                      }`}
                    >
                      {/* Winner Showcase header banner */}
                      {sub.is_winner && (
                        <div className="flex items-center space-x-1.5 text-xs text-amber-600 dark:text-amber-400 font-serif font-bold bg-amber-500/10 w-fit px-3 py-1 rounded-full border border-amber-250/20 font-hindi">
                          <Sparkles className="w-4 h-4 fill-amber-500" />
                          <span>👑 स्वर्ण पदक विजेता (Challenge Winner)</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold font-serif text-slate-850 dark:text-white font-hindi">{sub.title}</h5>
                          <span className="text-[9px] text-slate-400 font-serif">लेखक: {sub.user_name}</span>
                        </div>
                        
                        {/* Vote Action */}
                        <button
                          onClick={() => handleVote(sub.id)}
                          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-850 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-350 transition-all cursor-pointer font-hindi"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-mono">{sub.votes_count} मत</span>
                        </button>
                      </div>

                      {/* Content body */}
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-hindi whitespace-pre-wrap">
                        {sub.content}
                      </p>

                      {/* ─── SUBMISSION TIMELINE TRACKER ─── */}
                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase text-slate-400 mb-2 font-serif">
                          <span>समीक्षा चरण (Timeline Tracking)</span>
                          <span className="text-primary">{steps[currentStepIdx]}</span>
                        </div>
                        {/* Visual timeline */}
                        <div className="grid grid-cols-4 gap-2 relative">
                          <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
                          <div 
                            className="absolute top-1.5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500" 
                            style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                          />

                          {steps?.map((step, idx) => {
                            const isPast = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            return (
                              <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-1">
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isCurrent
                                    ? "bg-white dark:bg-slate-900 border-primary ring-2 ring-primary/20 scale-110"
                                    : isPast
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                                }`}>
                                  {isPast && idx < currentStepIdx && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className={`text-[8px] font-hindi whitespace-nowrap overflow-ellipsis overflow-hidden max-w-full ${isCurrent ? "text-primary font-bold" : "text-slate-400"}`}>
                                  {step.split(" ")[0]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </GlassCard>
                  );
                })}
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

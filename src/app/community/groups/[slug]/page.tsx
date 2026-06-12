"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Plus, 
  Send, 
  Heart, 
  MessageSquare, 
  Check, 
  Sliders, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  fetchGroups, 
  fetchPosts, 
  createPost, 
  toggleLikePost,
  toggleGroupMembership,
  isUserGroupMember,
  fetchReadingProgress,
  saveReadingProgress,
  CommunityGroup, 
  CommunityPost,
  CommunityReadingProgress
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GroupDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { currentUser, users } = useCms();

  // States
  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  
  // Reading Progress states (for Reading Clubs)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(450); // Default book page length
  const [notes, setNotes] = useState("");
  const [progressLogs, setProgressLogs] = useState<CommunityReadingProgress[]>([]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      const allGroups = await fetchGroups();
      const match = allGroups.find(g => g.id === slug);
      setGroup(match || null);
      
      if (match && currentUser) {
        const memberStatus = await isUserGroupMember(match.id, currentUser.id);
        setIsMember(memberStatus);
      }

      if (match && match.category === "Reading Club") {
        const logs = await fetchReadingProgress(match.id);
        setProgressLogs(logs);
      }

      const groupPosts = await fetchPosts(match ? match.id : slug);
      setPosts(groupPosts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [slug, currentUser]);

  const handleJoinLeave = async () => {
    if (!currentUser || !group) return;
    try {
      const joined = await toggleGroupMembership(group.id, currentUser.id);
      setIsMember(joined);
      const allGroups = await fetchGroups();
      const match = allGroups.find(g => g.id === slug);
      if (match) setGroup(match);
      alert(joined ? "आप समूह में सफलतापूर्वक शामिल हो गए हैं!" : "आपने समूह छोड़ दिया है।");
    } catch (err) {
      console.error(err);
    }
  };

  // Handle post submit
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !group) return;
    if (!content.trim()) return;

    try {
      const newPost = await createPost(
        currentUser.id,
        currentUser.name || "लेखक",
        content,
        "text",
        {
          group_id: group.id,
          group_name: group.name
        }
      );
      setPosts([newPost, ...posts]);
      setContent("");
      alert("समूह में नई पोस्ट साझा कर दी गई है!");
    } catch (err) {
      console.error(err);
    }
  };

  // Handle post like
  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const newCount = await toggleLikePost(postId, currentUser.id);
      setPosts(posts.map(p => {
        if (p.id === postId) return { ...p, likesCount: newCount };
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Reading Progress Log Submit
  const handleProgressLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !group) return;
    if (currentPage > totalPages) {
      alert("वर्तमान पृष्ठ संख्या कुल पृष्ठ संख्या से अधिक नहीं हो सकती।");
      return;
    }

    try {
      await saveReadingProgress(
        group.id,
        currentUser.id,
        group.current_book || "पुस्तक",
        currentPage,
        totalPages,
        notes
      );
      const logs = await fetchReadingProgress(group.id);
      setProgressLogs(logs);
      alert("आपका पठन विवरण सफलतापूर्वक दर्ज कर लिया गया है!");
      setNotes("");
    } catch (err) {
      console.error("Error saving reading progress:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
        समूह विवरण लोड किया जा रहा है...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-serif">
        समूह नहीं मिला।
      </div>
    );
  }

  const isReadingClub = group.category === "Reading Club";

  return (
    <div className="space-y-6">
      
      {/* Navigation header */}
      <div className="flex items-center justify-between text-xs font-serif text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link href="/community/groups" className="inline-flex items-center space-x-1 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-hindi">सभी समूहों पर वापस जाएं</span>
        </Link>
      </div>

      {/* Group Detail Card Banner */}
      <GlassCard className="p-6 border-slate-200/60 dark:border-slate-800/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-serif font-bold uppercase font-hindi">
              {group.category}
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-white font-hindi">
              {group.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-450 font-serif font-hindi leading-relaxed max-w-xl">
              {group.description}
            </p>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold font-mono text-slate-500">{group.membersCount || 0} सदस्य</span>
            </div>
            
            {currentUser && (
              <button
                onClick={handleJoinLeave}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer font-hindi ${
                  isMember
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-primary text-white hover:bg-primary/95"
                }`}
              >
                {isMember ? "सदस्य हैं" : "समूह में शामिल हों"}
              </button>
            )}
          </div>
        </div>

        {/* Current Book panel for Reading clubs */}
        {isReadingClub && group.current_book && (
          <div className="p-4 bg-green-500/5 rounded-2xl border border-green-200/30 flex items-center space-x-3 text-xs text-green-600 font-serif font-bold">
            <BookOpen className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] text-green-500 uppercase font-mono tracking-wider font-bold">सक्रिय पठन सत्र</span>
              <span className="font-hindi truncate">हम पढ़ रहे हैं: {group.current_book}</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ─── READING PROGRESS WIDGETS (Only for Reading Clubs) ─── */}
      {isReadingClub && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Progress Logger Form */}
          {currentUser && (
            <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
              <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi flex items-center gap-1.5">
                <BookOpen className="w-4.5 h-4.5 text-primary" />
                <span>अपनी पठन प्रगति दर्ज करें</span>
              </h3>
              
              <form onSubmit={handleProgressLogSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-serif font-hindi block">वर्तमान पृष्ठ (Page)</label>
                    <input 
                      type="number"
                      value={currentPage}
                      onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-serif font-hindi block">कुल पृष्ठ (Total)</label>
                    <input 
                      type="number"
                      value={totalPages}
                      onChange={(e) => setTotalPages(parseInt(e.target.value) || 450)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-serif font-hindi block">पठन टिप्पणी / विचार (Shared Notes)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="इस अध्याय पर आपकी क्या राय है? (वैकल्पिक)"
                    rows={2}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none resize-none font-hindi"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer font-hindi"
                >
                  प्रगति सहेजें (Log Progress)
                </button>
              </form>
            </GlassCard>
          )}

          {/* Club Members Leaderboard / Speed logs */}
          <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-primary" />
              <span>क्लब पठन प्रगति (Member Speeds)</span>
            </h3>

            <div className="space-y-3.5">
              {progressLogs.map((log) => {
                const percent = Math.round((log.current_page / log.total_pages) * 100);
                
                return (
                  <div key={log.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-800 dark:text-slate-200 font-hindi">
                        {users.find(u => u.id === log.user_id)?.name || "समुदाय सदस्य"}
                      </span>
                      <span className="text-slate-400 font-mono">{log.current_page}/{log.total_pages} पृष्ठ ({percent}%)</span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    {log.notes && (
                      <p className="text-[10px] text-slate-450 italic font-hindi leading-relaxed font-light pl-2 border-l border-slate-200 dark:border-slate-800">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>

        </div>
      )}

      {/* ─── GROUP DISCUSSION FEED ─── */}
      <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 space-y-4">
        <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi border-b border-slate-100 dark:border-slate-800 pb-2">
          समूह संवाद (Group Feed)
        </h3>

        {/* Post composer */}
        {currentUser ? (
          <form onSubmit={handlePostSubmit} className="flex gap-2">
            <input 
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="इस समूह में कुछ साझा करें..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-hindi"
              required
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer font-hindi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-[10px] text-slate-400 font-serif">संवाद में शामिल होने के लिए कृपया लॉगिन करें।</p>
        )}

        {/* Feed Posts */}
        <div className="space-y-4 pt-2">
          {posts.length > 0 ? (
            posts.map(p => (
              <div key={p.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-150/40 dark:border-slate-800/40 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-serif">
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-hindi">{p.user_name}</span>
                  <span className="font-mono">{new Date(p.created_at).toLocaleDateString("hi-IN")}</span>
                </div>
                <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-hindi">{p.content}</p>
                <div className="flex items-center space-x-4 pt-1">
                  <button onClick={() => handleLike(p.id)} className="flex items-center space-x-1 text-slate-400 hover:text-red-500 font-mono text-[10px] cursor-pointer">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{p.likesCount}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-[10px] text-slate-400 font-serif">इस समूह में फ़िलहाल कोई संवाद नहीं है। पहले आप पहल करें!</p>
          )}
        </div>
      </GlassCard>

    </div>
  );
}

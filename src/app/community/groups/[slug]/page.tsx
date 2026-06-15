"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Send, 
  Heart, 
  Check, 
  ArrowLeft,
  Award,
  Pin,
  Shield,
  Trash2,
  AlertCircle,
  Megaphone,
  BookOpenCheck
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
  CommunityReadingProgress,
  CommunityGroupMember
} from "@/lib/communityService";
import ProfilePreviewWrapper from "@/components/yuvakshar/ProfilePreviewCard";
import HoverUserCard from "@/components/yuvakshar/HoverUserCard";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GroupDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { currentUser, users, hasRole } = useCms();

  // States
  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groupMembers, setGroupMembers] = useState<CommunityGroupMember[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  
  // Announcements & Rules state
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [announcementText, setAnnouncementText] = useState("");
  const [showModPanel, setShowModPanel] = useState(false);
  
  // Reading Progress states (for Reading Clubs)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(450); 
  const [notes, setNotes] = useState("");
  const [progressLogs, setProgressLogs] = useState<CommunityReadingProgress[]>([]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      const allGroups = await fetchGroups();
      const match = allGroups.find(g => g.id === slug);
      setGroup(match || null);
      
      if (match) {
        if (currentUser) {
          const memberStatus = await isUserGroupMember(match.id, currentUser.id);
          setIsMember(memberStatus);
        }

        // Fetch mock members of this group
        if (typeof window !== "undefined") {
          const savedMembers = localStorage.getItem("yuvakshar_c_group_members");
          let members: CommunityGroupMember[] = savedMembers ? JSON.parse(savedMembers) : [];
          // Filter members for this group
          members = members.filter(m => m.group_id === match.id);
          
          // Seed group members if empty
          if (members.length === 0) {
            members = [
              { id: "gm-1", group_id: match.id, user_id: match.owner_id, role: "Owner", joined_at: match.created_at },
              { id: "gm-2", group_id: match.id, user_id: "usr-author-1", role: "Moderator", joined_at: match.created_at },
              { id: "gm-3", group_id: match.id, user_id: "usr-author-2", role: "Mentor", joined_at: match.created_at }
            ];
            const allSavedMembers = savedMembers ? JSON.parse(savedMembers) : [];
            localStorage.setItem("yuvakshar_c_group_members", JSON.stringify([...allSavedMembers, ...members]));
          }
          setGroupMembers(members);

          // Announcements
          const savedAnn = localStorage.getItem(`yuvakshar_announcements_${match.id}`);
          if (savedAnn) {
            setAnnouncements(JSON.parse(savedAnn));
          } else {
            const defaults = ["सभी समूह सदस्यों का स्वागत है! मर्यादा बनाए रखें और सार्थक विमर्श करें।"];
            setAnnouncements(defaults);
            localStorage.setItem(`yuvakshar_announcements_${match.id}`, JSON.stringify(defaults));
          }
        }
        
        if (match.category === "Reading Club") {
          const logs = await fetchReadingProgress(match.id);
          setProgressLogs(logs);
        }

        const groupPosts = await fetchPosts(match.id);
        setPosts(groupPosts);
      }
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
      
      // Update local members list
      const savedMembers = localStorage.getItem("yuvakshar_c_group_members");
      let members: CommunityGroupMember[] = savedMembers ? JSON.parse(savedMembers) : [];
      if (joined) {
        const newMember: CommunityGroupMember = {
          id: `gm-${Date.now()}`,
          group_id: group.id,
          user_id: currentUser.id,
          role: "Member",
          joined_at: new Date().toISOString()
        };
        members.push(newMember);
      } else {
        members = members.filter(m => !(m.group_id === group.id && m.user_id === currentUser.id));
      }
      localStorage.setItem("yuvakshar_c_group_members", JSON.stringify(members));
      setGroupMembers(members.filter(m => m.group_id === group.id));

      const allGroups = await fetchGroups();
      const match = allGroups.find(g => g.id === slug);
      if (match) setGroup(match);
      
      alert(joined ? "आप समूह में सफलतापूर्वक शामिल हो गए हैं!" : "आपने समूह छोड़ दिया है।");
    } catch (err) {
      console.error(err);
    }
  };

  // Submit post
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

  // Like post
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

  // Announcements modification
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !group) return;
    const updated = [announcementText.trim(), ...announcements];
    setAnnouncements(updated);
    localStorage.setItem(`yuvakshar_announcements_${group.id}`, JSON.stringify(updated));
    setAnnouncementText("");
    alert("घोषणा सफलतापूर्वक पिन कर दी गई है!");
  };

  const handleDeleteAnnouncement = (idx: number) => {
    if (!group) return;
    const updated = announcements.filter((_, i) => i !== idx);
    setAnnouncements(updated);
    localStorage.setItem(`yuvakshar_announcements_${group.id}`, JSON.stringify(updated));
  };

  // Pinned Posts Mod Panel toggle
  const handleTogglePinPost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const nextState = !p.is_pinned;
        alert(nextState ? "पोस्ट को पिन कर दिया गया है।" : "पोस्ट अनपिन कर दी गई है।");
        return { ...p, is_pinned: nextState };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem("yuvakshar_c_posts", JSON.stringify(updated));
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

  // Roles verification
  const userMemberObj = groupMembers.find(m => m.user_id === currentUser?.id);
  const userRoleInGroup = userMemberObj?.role || (group.owner_id === currentUser?.id ? "Owner" : null);
  const isModerator = ["Owner", "Admin", "Moderator"].includes(userRoleInGroup || "") || hasRole("Admin");

  const isReadingClub = group.category === "Reading Club";

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      
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
            <h2 className="text-xl font-bold font-serif text-slate-850 dark:text-white font-hindi">
              {group.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-serif font-hindi leading-relaxed max-w-xl">
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

        {isReadingClub && group.current_book && (
          <div className="p-4 bg-green-500/5 dark:bg-green-950/10 rounded-2xl border border-green-200/30 flex items-center space-x-3 text-xs text-green-600 dark:text-green-400 font-serif font-bold">
            <BookOpen className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] text-green-500 uppercase font-mono tracking-wider font-bold">सक्रिय पठन सत्र</span>
              <span className="font-hindi truncate">हम पढ़ रहे हैं: {group.current_book}</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* 2-column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Pinned Announcements, ReadingProgress, and Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Pinned Announcements list */}
          {announcements.length > 0 && (
            <div className="space-y-3">
              {announcements.map((ann, idx) => (
                <div key={idx} className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs font-hindi shadow-sm">
                  <div className="flex items-start space-x-2.5">
                    <Megaphone className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500 font-serif">pinned announcement</span>
                      <p className="text-slate-650 dark:text-slate-300 leading-relaxed font-hindi">{ann}</p>
                    </div>
                  </div>
                  {isModerator && (
                    <button 
                      onClick={() => handleDeleteAnnouncement(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer shrink-0"
                      title="घोषणा हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reading Progress details (if Reading Club) */}
          {isReadingClub && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentUser && isMember && (
                <GlassCard className="p-4.5 border-slate-200/60 dark:border-slate-800/40 space-y-3">
                  <h4 className="font-serif text-xs font-bold text-slate-805 dark:text-white font-hindi flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>अपनी पठन प्रगति दर्ज करें</span>
                  </h4>
                  <form onSubmit={handleProgressLogSubmit} className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-slate-400 font-hindi block mb-1">वर्तमान पृष्ठ</label>
                        <input 
                          type="number"
                          value={currentPage}
                          onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 font-hindi block mb-1">कुल पृष्ठ</label>
                        <input 
                          type="number"
                          value={totalPages}
                          onChange={(e) => setTotalPages(parseInt(e.target.value) || 450)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-hindi block mb-1">पठन विचार / नोट्स</label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="अपनी टिप्पणी साझा करें..."
                        rows={2}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none resize-none font-hindi"
                      />
                    </div>
                    <button type="submit" className="bg-primary text-white font-bold px-4 py-1.8 rounded-lg font-hindi cursor-pointer text-[10px]">
                      प्रगति सहेजें
                    </button>
                  </form>
                </GlassCard>
              )}

              {/* Speed Logs list */}
              <GlassCard className="p-4.5 border-slate-200/60 dark:border-slate-800/40 space-y-3">
                <h4 className="font-serif text-xs font-bold text-slate-805 dark:text-white font-hindi flex items-center gap-1.5">
                  <BookOpenCheck className="w-4 h-4 text-primary" />
                  <span>पठन प्रगति समीक्षा</span>
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {progressLogs.map((log) => {
                    const percent = Math.round((log.current_page / log.total_pages) * 100);
                    const writer = users.find(u => u.id === log.user_id);
                    return (
                      <div key={log.id} className="space-y-1 text-[11px]">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-slate-700 dark:text-slate-300 font-hindi">{writer?.name || "सदस्य"}</span>
                          <span className="text-slate-400 font-mono">{log.current_page}/{log.total_pages} पृष्ठ ({percent}%)</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Group Feed posts */}
          <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <h3 className="font-serif text-xs font-bold text-slate-800 dark:text-white font-hindi border-b border-slate-100 dark:border-slate-800 pb-2">
              समूह विमर्श (Group Feed)
            </h3>

            {currentUser && isMember ? (
              <form onSubmit={handlePostSubmit} className="flex gap-2">
                <input 
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="इस समूह में कुछ साहित्यिक विचार साझा करें..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-hindi"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer font-hindi"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-center text-slate-400 font-hindi">
                संवाद साझा करने के लिए कृपया पहले समूह में शामिल हों।
              </div>
            )}

            {/* Pinned posts go first, followed by others */}
            <div className="space-y-4 pt-2">
              {posts.length > 0 ? (
                posts
                  .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                  .map(p => {
                    const postMemberObj = groupMembers.find(m => m.user_id === p.user_id || users.find(u => u.id === p.user_id)?.name === p.user_name);
                    const memberRole = postMemberObj?.role || (group.owner_id === p.user_id ? "Owner" : "Member");
                    
                    return (
                      <div key={p.id} className={`p-4 rounded-2xl border transition-all space-y-2 text-xs relative bg-white dark:bg-[#0E1527] ${
                        p.is_pinned 
                          ? "border-amber-200 dark:border-amber-900/40 bg-amber-500/5 dark:bg-amber-950/5 shadow-sm" 
                          : "border-slate-150/40 dark:border-slate-800/40"
                      }`}>
                        {/* Pinned Label */}
                        {p.is_pinned && (
                          <div className="flex items-center space-x-1 text-[8px] text-amber-500 font-bold uppercase font-serif">
                            <Pin className="w-2.5 h-2.5" />
                            <span>pinned post</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <HoverUserCard userId={p.user_id}>
                              <Link href={`/community/u/${p.user_id}`} className="font-bold text-slate-800 dark:text-slate-200 font-hindi hover:text-primary transition-colors">
                                {p.user_name}
                              </Link>
                            </HoverUserCard>
                            
                            {/* Role Badge inside group */}
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                              memberRole === "Owner" || memberRole === "Moderator"
                                ? "bg-red-500/10 text-red-500"
                                : memberRole === "Mentor"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            }`}>
                              {memberRole}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="font-mono text-[9px] text-slate-400">{new Date(p.created_at).toLocaleDateString("hi-IN")}</span>
                            
                            {/* Moderator action dropdown/pin triggers */}
                            {isModerator && (
                              <button 
                                onClick={() => handleTogglePinPost(p.id)}
                                className="text-slate-400 hover:text-amber-500 p-0.5 transition-colors cursor-pointer"
                                title={p.is_pinned ? "अनपिन करें" : "पिन करें"}
                              >
                                <Pin className={`w-3.5 h-3.5 ${p.is_pinned ? "rotate-45 text-amber-500 fill-amber-500" : ""}`} />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-hindi">{p.content}</p>
                        
                        <div className="flex items-center space-x-4 pt-1">
                          <button onClick={() => handleLike(p.id)} className="flex items-center space-x-1.5 text-slate-400 hover:text-red-500 font-mono text-[10px] cursor-pointer">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{p.likesCount}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-center py-6 text-[10px] text-slate-400 font-serif">इस समूह में फ़िलहाल कोई संवाद नहीं है। पहले आप पहल करें!</p>
              )}
            </div>
          </GlassCard>

        </div>

        {/* RIGHT COLUMN: Group Rules, Moderator Panel, and Member directory */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Moderator Dashboard Controls (Announcements addition) */}
          {isModerator && (
            <GlassCard className="p-4.5 border-slate-200/60 dark:border-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xs font-bold text-slate-850 dark:text-white font-hindi flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span>व्यवस्थापक नियंत्रण</span>
                </h3>
                <button 
                  onClick={() => setShowModPanel(!showModPanel)} 
                  className="text-[9px] text-primary hover:underline font-hindi cursor-pointer font-bold"
                >
                  {showModPanel ? "छोटा करें" : "विस्तार करें"}
                </button>
              </div>

              {showModPanel && (
                <form onSubmit={handleAddAnnouncement} className="space-y-2 mt-2">
                  <div>
                    <label className="text-[9px] text-slate-400 font-hindi block mb-1">समूह में नई घोषणा पिन करें</label>
                    <textarea 
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="घोषणा पत्र लिखें..."
                      rows={2}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none font-hindi"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-1.8 rounded-lg text-[9px] font-hindi cursor-pointer">
                    घोषणा पिन करें
                  </button>
                </form>
              )}
            </GlassCard>
          )}

          {/* Group Rules Widget */}
          <GlassCard className="p-4.5 border-slate-200/60 dark:border-slate-800/40 space-y-3">
            <h3 className="font-serif text-xs font-bold text-slate-850 dark:text-white font-hindi flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span>समूह नियमावली</span>
            </h3>
            <ul className="space-y-2 text-[10px] text-slate-550 dark:text-slate-400 font-hindi leading-relaxed">
              <li className="flex items-start gap-1">
                <span>१.</span>
                <span>परस्पर सम्मान और साहित्यिक मर्यादा बनाए रखें।</span>
              </li>
              <li className="flex items-start gap-1">
                <span>२.</span>
                <span>केवल रचनात्मक एवं साहित्यिक प्रविष्टियाँ ही साझा करें।</span>
              </li>
              <li className="flex items-start gap-1">
                <span>३.</span>
                <span>कॉपीराइट नियमों का सम्मान करें, चोरी न करें।</span>
              </li>
            </ul>
          </GlassCard>

          {/* Group Member directory list */}
          <GlassCard className="p-4.5 border-slate-200/60 dark:border-slate-800/40 space-y-3">
            <h3 className="font-serif text-xs font-bold text-slate-850 dark:text-white font-hindi flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span>समूह सदस्य ({groupMembers.length})</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {groupMembers.map((member) => {
                const userProfile = users.find(u => u.id === member.user_id);
                return (
                  <div key={member.id} className="flex items-center justify-between text-xs">
                    <HoverUserCard userId={member.user_id}>
                      <Link href={`/community/u/${member.user_id}`} className="flex items-center space-x-2 min-w-0 hover:opacity-80 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-500 uppercase shrink-0 overflow-hidden">
                          {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt={userProfile.name} className="w-full h-full object-cover" />
                          ) : (
                            userProfile?.name[0] || "M"
                          )}
                        </div>
                        <span className="font-bold font-hindi truncate text-slate-800 dark:text-slate-200 hover:text-primary transition-colors">
                          {userProfile?.name || "सदस्य"}
                        </span>
                      </Link>
                    </HoverUserCard>

                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      member.role === "Owner" || member.role === "Moderator"
                        ? "bg-red-500/10 text-red-500"
                        : member.role === "Mentor"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                    }`}>
                      {member.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
}

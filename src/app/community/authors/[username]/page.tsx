"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Send, 
  Share2, 
  Users, 
  ArrowLeft,
  Mail,
  UserPlus,
  Briefcase,
  CheckCircle,
  Clock,
  Heart
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { fetchPosts, toggleLikePost, CommunityPost } from "@/lib/communityService";
import type { Profile } from "@/store/types";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getLiteraryIdentities } from "@/lib/repositoryService";

interface CollaborationRequest {
  id: string;
  sender_name: string;
  project_title: string;
  description: string;
  deadline: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export default function AuthorPortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  const { users, currentUser, followAuthor } = useCms();

  // States
  const [author, setAuthor] = useState<any>(null);
  const [authorPosts, setAuthorPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "info" | "collab">("posts");

  // Collaboration form states
  const [collabTitle, setCollabTitle] = useState("");
  const [collabDesc, setCollabDesc] = useState("");
  const [collabDeadline, setCollabDeadline] = useState("");
  const [collabInvites, setCollabInvites] = useState<CollaborationRequest[]>([
    { id: "collab-1", sender_name: "अमित कुमार", project_title: "तुलसीदास के राम और निराला के राम", description: "हम दोनों तुलसीदास और निराला के राम के आदर्शों की तुलनात्मक समीक्षा का संयुक्त लेख लिखेंगे।", deadline: "30 जून २०२६", status: "accepted", created_at: "2026-06-10T12:00:00Z" },
    { id: "collab-2", sender_name: "सरिता वर्मा", project_title: "आधुनिक युग में हिंदी विमर्श", description: "हिंदी विमर्श के बदलते स्वरूप पर एक साझा शोध आलेख की तैयारी।", deadline: "15 जुलाई २०२६", status: "pending", created_at: "2026-06-12T10:00:00Z" }
  ]);

  const loadAuthorDetails = async () => {
    setLoading(true);
    try {
      // Find author matching slug/id
      const match = users.find((u: Profile) => u.slug === username || u.id === username);
      setAuthor(match || null);

      if (match) {
        const posts = await fetchPosts();
        const filtered = posts.filter(p => p.user_id === match.id);
        setAuthorPosts(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthorDetails();
  }, [username, users]);

  const isFollowing = currentUser && author ? (author.followers || []).includes(currentUser.id) : false;

  const toggleFollow = async () => {
    if (!currentUser || !author) {
      alert("फॉलो करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      await followAuthor(author.id, currentUser.id);
      // Refetch author to update follower status
      const match = users.find((u: Profile) => u.slug === username || u.id === username);
      if (match) setAuthor(match);
    } catch (err) {
      console.error("Error following author:", err);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      alert("पसंद करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      const newCount = await toggleLikePost(postId, currentUser.id);
      setAuthorPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) return { ...p, likesCount: newCount };
        return p;
      }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleCollabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !author) return;

    const newInvite: CollaborationRequest = {
      id: `collab-${Date.now()}`,
      sender_name: currentUser.name || "लेखक",
      project_title: collabTitle,
      description: collabDesc,
      deadline: collabDeadline,
      status: "pending",
      created_at: new Date().toISOString()
    };

    setCollabInvites([newInvite, ...collabInvites]);
    setCollabTitle("");
    setCollabDesc("");
    setCollabDeadline("");
    alert(`लेखक ${author.name} को सह-लेखन (Co-author) आमंत्रण सफलतापूर्वक भेज दिया गया है!`);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
        लेखक प्रोफ़ाइल लोड की जा रही है...
      </div>
    );
  }

  if (!author) {
    return (
      <div className="py-20 text-center text-xs text-slate-450 font-serif">
        लेखक प्रोफ़ाइल नहीं मिली।
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Navigation header */}
      <div className="flex items-center justify-between text-xs font-serif text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link href="/community/authors" className="inline-flex items-center space-x-1 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-hindi">लेखक निर्देशिका पर वापस जाएं</span>
        </Link>
      </div>

      {/* Author Portfolio Banner Card */}
      <GlassCard className="p-6 border-slate-200/60 dark:border-slate-800/40 relative overflow-hidden">
        
        {/* Cover banner background */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-primary/10 to-amber-500/10 border-b border-slate-150/50 dark:border-slate-800/30" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start pt-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 flex items-center justify-center shrink-0 shadow-md">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-lg text-primary uppercase">
              {author.name[0]}
            </div>
          </div>

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-white font-hindi">{author.name}</h2>
              {author.verification_badge && (
                <span className="text-[9px] bg-green-500/10 text-green-600 border border-green-200/40 px-2 py-0.5 rounded font-serif font-bold font-hindi">
                  {author.verification_badge}
                </span>
              )}
              {currentUser && author.id !== currentUser.id && (
                <button
                  onClick={toggleFollow}
                  className={`text-[9px] px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer font-hindi flex items-center gap-1 ${
                    isFollowing
                      ? "bg-green-650 text-white bg-green-600"
                      : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>फॉलो किया</span>
                    </>
                  ) : (
                    <span>फॉलो करें</span>
                  )}
                </button>
              )}
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed font-hindi">
              {author.designation || author.role} {author.institution ? `| ${author.institution}` : ""}
            </p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-serif">
              {author.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {author.location}</span>
              )}
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> सदस्य बने: {author.joinDate || "2026"}</span>
            </div>
          </div>
        </div>

        {/* Stats details */}
        <div className="grid grid-cols-3 gap-4 text-center border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6 text-xs">
          <div>
            <span className="block font-black text-primary font-hindi text-ellipsis overflow-hidden whitespace-nowrap px-1">
              {getLiteraryIdentities(author, []).slice(0, 1)[0] || "लेखक"}
            </span>
            <span className="text-[10px] text-slate-400 font-serif">साहित्यिक पहचान</span>
          </div>
          <div>
            <span className="block font-black text-slate-700 dark:text-slate-300 font-mono">{author.followers?.length || 0}</span>
            <span className="text-[10px] text-slate-400 font-serif">फॉलोवर्स</span>
          </div>
          <div>
            <span className="block font-black text-slate-700 dark:text-slate-300 font-mono">{authorPosts.length}</span>
            <span className="text-[10px] text-slate-400 font-serif">समुदाय पोस्ट</span>
          </div>
        </div>

      </GlassCard>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
        {[
          { id: "posts", name: "पोस्ट्स" },
          { id: "info", name: "अकादमिक बायो" },
          { id: "collab", name: "सह-लेखन आमंत्रण" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-hindi ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-500"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Contents: Posts */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {authorPosts.length > 0 ? (
            authorPosts.map(p => (
              <GlassCard key={p.id} className="p-4 border-slate-200/60 dark:border-slate-800/40 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-serif">
                  <span className="font-mono">{new Date(p.created_at).toLocaleDateString("hi-IN")}</span>
                </div>
                <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-hindi">{p.content}</p>
                 <div className="flex items-center space-x-4 pt-1">
                  <button 
                    onClick={() => handleLike(p.id)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-red-500 font-mono text-[10px] cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>{p.likesCount}</span>
                  </button>
                 </div>
              </GlassCard>
            ))
          ) : (
            <p className="text-center py-10 text-xs text-slate-400 font-serif">इस लेखक ने अभी चौपाल पर कोई पोस्ट साझा नहीं की है।</p>
          )}
        </div>
      )}

      {/* Tab Contents: Info & Biography */}
      {activeTab === "info" && (
        <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4 text-xs font-hindi">
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2">जीवनी (Biography)</h3>
            <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-serif">
              {author.bio || "सृजनात्मक विचारक और लेखक। भाषा विमर्श, आलोचनात्मक गद्य लेखन और शिक्षा से जुड़ाव। साहित्य विमर्श और पत्र-पत्रिकाओं में आलेख प्रकाशन।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-xs text-primary">शोध एवं विशेषज्ञता क्षेत्र</h4>
              <div className="flex flex-wrap gap-1.5">
                {(author.expertise_tags || ["हिंदी आलोचना", "निराला साहित्य", "छायावाद"]).map((t: string) => (
                  <span key={t} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-500">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-xs text-primary">संबद्ध संस्थान</h4>
              <p className="text-slate-500 flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {author.institution || "स्वतंत्र शोधकर्ता"}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab Contents: Co-author Collaboration Invitation Form */}
      {activeTab === "collab" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Form */}
          <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi">सह-लेखन आमंत्रण भेजें</h3>
            
            <form onSubmit={handleCollabSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-serif font-hindi block">परियोजना का शीर्षक (Project Title)</label>
                <input 
                  type="text"
                  value={collabTitle}
                  onChange={(e) => setCollabTitle(e.target.value)}
                  placeholder="जैसे: कबीर के दोहे और सामाजिक चेतना"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-hindi"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-serif font-hindi block">विवरण / लेखन प्रस्ताव (Proposal Description)</label>
                <textarea
                  value={collabDesc}
                  onChange={(e) => setCollabDesc(e.target.value)}
                  placeholder="साझा लेख या शोध पत्र की रूपरेखा का संक्षिप्त विवरण लिखें..."
                  rows={3}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-primary resize-none font-hindi"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-serif font-hindi block">लक्ष्य समयसीमा (Target Deadline)</label>
                <input 
                  type="text"
                  value={collabDeadline}
                  onChange={(e) => setCollabDeadline(e.target.value)}
                  placeholder="जैसे: 25 जुलाई २०२६"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-hindi"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer font-hindi flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>आमंत्रण भेजें</span>
              </button>
            </form>
          </GlassCard>

          {/* Current sent requests status */}
          <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi">आमंत्रण स्थिति (Collaboration Status)</h3>
            
            <div className="space-y-3.5">
              {collabInvites.map((invite) => (
                <div key={invite.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-150/40 dark:border-slate-805/40 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-800 dark:text-slate-200 font-hindi">{invite.project_title}</span>
                    <span className={`px-2 py-0.5 rounded-full font-serif font-bold text-[9px] ${
                      invite.status === "accepted" 
                        ? "bg-green-500/10 text-green-600 border border-green-200/30" 
                        : "bg-amber-500/10 text-amber-600 border border-amber-200/30"
                    }`}>
                      {invite.status === "accepted" ? "स्वीकृत" : "प्रतीक्षारत"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-hindi">"{invite.description}"</p>
                  <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-serif pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>डेडलाइन: {invite.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      )}

    </div>
  );
}

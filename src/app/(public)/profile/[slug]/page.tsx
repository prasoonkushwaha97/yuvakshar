"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, 
  Calendar, 
  Users, 
  UserCheck,
  GraduationCap,
  BookOpen, 
  Eye, 
  Award, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Download, 
  ExternalLink,
  ChevronRight,
  Send,
  Sparkles,
  Heart,
  Video,
  X,
  MessageSquare,
  Activity,
  Bookmark
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { Profile } from "@/store/types";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { getLiteraryIdentities } from "@/lib/repositoryService";
import PostCard from "@/components/yuvakshar/PostCard";
import { CommunityPost, fetchUserPosts, toggleLikePost } from "@/lib/communityService";

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { users, articles, videos, currentUser, followAuthor, openAuthModal } = useCms();

  // Contact modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("सामान्य पूछताछ");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Active tab state for unified profile
  const [activeTab, setActiveTab] = useState("articles"); // articles | community | bookmarks | about
  
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Find user by slug
  const dbUser = useMemo(() => {
    return users.find(u => u.slug === slug);
  }, [users, slug]);

  const user = useMemo(() => {
    if (dbUser) return dbUser;
    
    const derivedName = slug
      ? slug
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "पाठक (Reader)";
      
    return {
      id: "fallback-" + (slug || "reader"),
      name: derivedName,
      slug: slug || "reader",
      username: slug || "reader",
      bio: "युवाक्षर का उत्साही पाठक एवं सदस्य।",
      role: null,
      status: "active",
      location: "भारत",
      joinDate: "जून २०२६",
      expertise_tags: [],
      followers: [] as string[],
      reputation_score: 10,
      reputation_tier: "Bronze",
      cover_banner: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      avatar_url: "",
      verification_badge: undefined,
      social_links: {},
      orcid_id: undefined,
      google_scholar_url: undefined,
      portfolio: [] as any[],
      timeline: [] as any[],
      achievements: [] as any[]
    } as Profile;
  }, [dbUser, slug]);

  // Filter content written by this user
  const userArticles = useMemo(() => {
    return articles.filter(a => a.author === user.name && a.status === "Published");
  }, [articles, user.name]);

  useEffect(() => {
    if (activeTab === "community" && user.id) {
      setPostsLoading(true);
      fetchUserPosts(user.id).then(posts => {
        setUserPosts(posts);
        setPostsLoading(false);
      });
    }
  }, [activeTab, user.id]);

  // Derived sections
  const latestArticles = useMemo(() => {
    return [...userArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userArticles]);

  const popularArticles = useMemo(() => {
    return [...userArticles].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [userArticles]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    userArticles.forEach(a => {
      if (a.category) cats.add(a.category as string);
    });
    return Array.from(cats);
  }, [userArticles]);

  const userVideos = useMemo(() => {
    return videos.filter(v => 
      v.status === "Published" && 
      (v.title.includes(user.name) || v.description.includes(user.name))
    );
  }, [videos, user.name]);

  // Check if current user follows this user
  const isFollowing = currentUser ? (user.followers?.includes(currentUser.id) || false) : false;

  const handleFollowToggle = () => {
    if (!currentUser) {
      openAuthModal(
        () => {},
        "फ़ॉलो करने के लिए कृपया लॉग इन करें!"
      );
      return;
    }
    followAuthor(user.id, currentUser.id);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setTimeout(() => {
        setSubmitSuccess(false);
        setContactOpen(false);
      }, 2000);
    }, 1200);
  };

  // Get total view counts of user's articles
  const totalArticleViews = userArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalArticleLikes = userArticles.reduce((sum, a) => sum + (a.likes || 0), 0);

  const isLeadership = ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(user.role || "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.name,
    "jobTitle": user.designation || user.role,
    "worksFor": {
      "@type": "Organization",
      "name": "युवाक्षर"
    },
    "description": user.bio,
    "image": user.avatar_url,
    "url": `https://yuvakshar.org/profile/${user.slug}`,
    "sameAs": [
      user.orcid_id ? `https://orcid.org/${user.orcid_id}` : "",
      user.google_scholar_url || "",
      user.social_links?.twitter || "",
      user.social_links?.linkedin || ""
    ].filter(Boolean)
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-200 transition-colors duration-300 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Profile Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-105 dark:bg-slate-900">
        {user.cover_banner ? (
          <img src={user.cover_banner} alt="Cover Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#EA580C]/20 to-[#0F172A]" />
        )}
        <Link 
          href="/"
          className="absolute top-6 left-4 sm:left-8 bg-white/90 dark:bg-[#0F172A]/90 hover:bg-white dark:hover:bg-[#0F172A] border border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-bold font-serif flex items-center gap-1.5 transition-all shadow-md z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative -mt-20 sm:-mt-24 z-10">
        <div className="flex flex-col gap-8">
          
          {/* MAIN COLUMN: Details Info */}
          <div className="w-full space-y-6">
            <GlassCard 
              glow={isLeadership ? "gold" : "none"} 
              className={`p-6 sm:p-8 rounded-3xl border ${
                isLeadership 
                  ? "border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/5 to-white dark:from-[#1E1B15]/5 dark:to-[#0F172A]"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-[#0F172A] overflow-hidden bg-white dark:bg-slate-900 shadow-md shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <span className="text-3xl font-bold uppercase">{user.name[0]}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-850 dark:text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.verification_badge && (
                          <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10 shrink-0" />
                        )}
                      </h1>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-serif rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 shadow-sm">
                        <span>@{user.username}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 font-serif text-xs">
                      {user.designation || user.role ? (
                        <p className="text-primary font-bold flex items-center gap-1 text-sm">
                          <span>{user.designation || user.role}</span>
                          {user.current_role && (
                            <span className="text-slate-400 dark:text-slate-500 font-normal">
                              | {user.current_role}
                            </span>
                          )}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-450">
                        {user.institution && (
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">•</span>
                            <span>{user.institution}</span>
                          </span>
                        )}
                        {user.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.location}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>सदस्यता: {user.joinDate || "जून २०२६"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleFollowToggle}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold font-serif transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        isFollowing 
                          ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700" 
                          : "bg-primary hover:bg-primary/95 text-white"
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4 text-green-500" /> : <Users className="w-4 h-4" />}
                      <span>{isFollowing ? "फ़ॉलो किया है" : "फ़ॉलो करें"}</span>
                    </button>

                    <button
                      onClick={() => setContactOpen(true)}
                      className="bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-5 py-2.5 rounded-xl text-xs font-bold font-serif transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Mail className="w-4 h-4 text-primary" />
                      <span>संपर्क करें</span>
                    </button>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-3 font-serif">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">संक्षिप्त परिचय (Bio)</h4>
                  <p className="text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {user.bio}
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Content Tabs Navigation */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-sm font-serif">
              <button
                onClick={() => setActiveTab("articles")}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "articles" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>लेख व आलेख</span>
              </button>
              <button
                onClick={() => setActiveTab("community")}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "community" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>चौपाल पोस्ट</span>
              </button>
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "bookmarks" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>बुकमार्क्स</span>
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "about" ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>प्रोफ़ाइल विवरण</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="space-y-6">
              
              {/* Tab 1: Articles List */}
              {activeTab === "articles" && (
                <div className="space-y-8">
                  {/* Category Chips */}
                  {uniqueCategories.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-serif border-l-2 border-primary pl-2 uppercase tracking-wide">
                        लेखन श्रेणियाँ (Categories)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueCategories.map(cat => (
                          <Link key={cat} href={`/category/${cat}`} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Articles */}
                  {popularArticles.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-serif border-l-2 border-primary pl-2 uppercase tracking-wide">
                        लोकप्रिय आलेख (Popular)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {popularArticles.slice(0, 4).map(art => (
                          <GlassCard key={art.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between group hover:shadow-md transition-all">
                            <div className="space-y-2 font-serif">
                              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{art.category}</span>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                <Link href={`/article/${art.slug}`}>{art.title}</Link>
                              </h4>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 text-[10px] text-slate-400">
                              <span>{art.date}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{art.views || 0}</span>
                              </span>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Latest Articles */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-serif border-l-2 border-primary pl-2 uppercase tracking-wide">
                      नवीनतम आलेख (Latest)
                    </h3>
                    {latestArticles.length === 0 ? (
                      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center font-serif">
                        <BookOpen className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                        <p className="font-bold text-slate-700 dark:text-white text-xs">कोई लेख उपलब्ध नहीं है</p>
                      </div>
                    ) : (
                      latestArticles.map(art => (
                        <GlassCard key={art.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-5 items-stretch group hover:shadow-md transition-all">
                          {art.coverImage && (
                            <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-slate-105 shrink-0">
                              <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          )}
                          <div className="flex-grow flex flex-col justify-between py-0.5 space-y-2 font-serif">
                            <div>
                              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{art.category}</span>
                              <h3 className="font-bold text-slate-800 dark:text-white text-sm mt-1.5 group-hover:text-primary transition-colors line-clamp-1">
                                <Link href={`/article/${art.slug}`}>{art.title}</Link>
                              </h3>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{art.summary}</p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-2 shrink-0">
                              <span>{art.date}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{art.views || 0}</span>
                              </span>
                              <span>•</span>
                              <span>{art.readTime}</span>
                            </div>
                          </div>
                        </GlassCard>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Community */}
              {activeTab === "community" && (
                <div className="space-y-4">
                  {postsLoading ? (
                    <div className="py-20 text-center text-xs text-slate-400 font-serif animate-pulse">
                      चौपाल पोस्ट्स लोड हो रही हैं...
                    </div>
                  ) : userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          authorProfile={user}
                          currentUser={currentUser}
                          isBookmarked={false}
                          onLike={async (id) => {
                            if (currentUser) {
                              const newLikes = await toggleLikePost(id, currentUser.id);
                              setUserPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: newLikes } : p));
                            }
                          }}
                          onBookmark={() => {}}
                          onShare={() => {}}
                          onPollVote={() => {}}
                          renderContentWithHashtags={(text) => <span>{text}</span>}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center font-serif">
                      <MessageSquare className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 dark:text-white text-xs">चौपाल पोस्ट्स</p>
                      <p className="text-[10px] text-slate-400">इस उपयोगकर्ता ने अभी तक कोई चौपाल चर्चा शुरू नहीं की है।</p>
                    </div>
                  )}


                  {/* --- Moved from Right Sidebar --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-8">
                    {/* Analytics Statistics */}
                    <GlassCard glow="none" className="p-5 space-y-4 font-serif">
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2 uppercase tracking-wide">गतिविधि एवं प्रभाव</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">कुल आलेख</span>
                    <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{userArticles.length}</span>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">कुल पाठक व्यूज</span>
                    <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{totalArticleViews}</span>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">फ़ॉलोवर्स</span>
                    <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{user.followers?.length || 0}</span>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">संवाद और लाइक</span>
                    <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{totalArticleLikes}</span>
                    </div>
                    </div>
                    </GlassCard>
                    
                    {/* Achievements Section */}
                    {user.achievements && user.achievements.length > 0 && (
                    <GlassCard glow="none" className="p-5 space-y-4 font-serif">
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2 uppercase tracking-wide">पुरस्कार एवं उपलब्धियाँ</h3>
                    <div className="space-y-3.5">
                    {user.achievements?.map((ach) => (
                    <div key={ach.id} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-850/80 pb-3 last:border-b-0 last:pb-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Award className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate leading-snug">{ach.title}</p>
                    {ach.year && <span className="text-[9px] text-slate-400 font-sans font-bold">{ach.year}</span>}
                    </div>
                    {ach.description && <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">{ach.description}</p>}
                    </div>
                    </div>
                    ))}
                    </div>
                    </GlassCard>
                    )}
                    
                    {/* Chronological Milestone Timeline */}
                    {user.timeline && user.timeline.length > 0 && (
                    <GlassCard glow="none" className="p-5 space-y-4 font-serif">
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2 uppercase tracking-wide">विकास यात्रा (Milestones)</h3>
                    
                    <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-6 py-1 ml-1.5">
                    {user.timeline?.map((event) => (
                    <div key={event.id} className="relative group">
                    <span className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-[#0A0F1D] border-2 border-primary group-hover:scale-120 transition-transform duration-200" />
                    <div className="space-y-0.5">
                    <span className="text-[9px] font-sans font-bold text-primary">{event.date}</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug">{event.title}</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed mt-0.5">{event.description}</p>
                    </div>
                    </div>
                    ))}
                    </div>
                    </GlassCard>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Bookmarks */}
              {activeTab === "bookmarks" && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center font-serif">
                    <Bookmark className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 dark:text-white text-xs">बुकमार्क्स</p>
                    <p className="text-[10px] text-slate-400">इस उपयोगकर्ता के बुकमार्क्स सार्वजनिक नहीं हैं।</p>
                  </div>
                </div>
              )}

              {/* Tab 4: About & Achievements */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  {user.portfolio && user.portfolio.length > 0 && (
                    <div className="space-y-4 font-serif">
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-serif border-l-2 border-primary pl-2 uppercase tracking-wide">
                        अकादमिक रिसर्च (Portfolio)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.portfolio.map(item => (
                          <GlassCard key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-sans">
                                {item.type.replace("_", " ")}
                              </span>
                              <h4 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-2 leading-snug">{item.name}</h4>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 text-[10px]">
                              <span className="text-slate-400">PDF दस्तावेज़</span>
                              <a href={item.url} download className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer">
                                <Download className="w-3.5 h-3.5" />
                                <span>डाउनलोड</span>
                              </a>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Desk */}
                  {userVideos.length > 0 && (
                    <div className="space-y-4 font-serif">
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-serif border-l-2 border-primary pl-2 uppercase tracking-wide">
                        वीडियो डेस्क
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {userVideos.map(vid => (
                          <GlassCard key={vid.id} className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group">
                            {vid.thumbnailUrl && (
                              <div className="h-40 w-full overflow-hidden bg-slate-105 shrink-0 relative">
                                <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-md shadow-primary/25">▶</span>
                                </div>
                              </div>
                            )}
                            <div className="p-4 flex-grow flex flex-col justify-between font-serif">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-primary uppercase tracking-wide">{vid.category}</span>
                                <h4 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-2 leading-relaxed">{vid.title}</h4>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 text-[10px] text-slate-400">
                                <span>{vid.publishDate}</span>
                                <a href={vid.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer">
                                  <span>देखें</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CONTACT MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 px-6 py-4 flex items-center justify-between font-serif">
              <div>
                <h3 className="font-bold text-slate-850 dark:text-white text-sm">संपर्क करें</h3>
                <span className="text-[10px] text-slate-400 leading-none block mt-0.5">उपयोगकर्ता: {user.name}</span>
              </div>
              <button onClick={() => setContactOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 font-serif">
              {submitSuccess ? (
                <div className="py-8 text-center space-y-2.5">
                  <div className="w-10 h-10 bg-green-500/15 rounded-full flex items-center justify-center text-green-500 mx-auto">
                    <Send className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">संदेश सफलतापूर्वक भेजा गया</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">आपका संपर्क अनुरोध संप्रेषित कर दिया गया है।</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-450 block font-medium">आपका नाम</label>
                    <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-450 block font-medium">आपका ईमेल</label>
                    <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-455 block font-medium">संदेश</label>
                    <textarea rows={4} required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary leading-relaxed" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/95 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md mt-2">
                    {isSubmitting ? <span>संप्रेषित किया जा रहा है...</span> : <><Send className="w-4 h-4" /><span>संदेश भेजें</span></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

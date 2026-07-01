"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { Send, X, MessageSquare, Download, ExternalLink, BookOpen } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { Profile } from "@/store/types";
import { CommunityPost, fetchUserPosts, toggleLikePost } from "@/lib/communityService";
import PostCard from "@/components/yuvakshar/PostCard";
import { getCanonicalProfileUrl, resolveProfileIdentifier } from "@/utils/username";

import ProfileCover from "@/components/profile/ProfileCover";
import ProfileIdentityCard from "@/components/profile/ProfileIdentityCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabs, { ProfileTabId } from "@/components/profile/ProfileTabs";
import ProfileArticleCard from "@/components/profile/ProfileArticleCard";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileSettingsTab from "@/components/profile/ProfileSettingsTab";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  
  // Decoding the URL param just in case it's encoded or has an @ prefix
  const rawParam = params?.username as string;
  const decodedParam = rawParam ? decodeURIComponent(rawParam) : "";
  const username = decodedParam.startsWith("@") ? decodedParam.substring(1) : decodedParam;

  const { users, articles, videos, currentUser, followAuthor, openAuthModal, authLoading, cmsDataLoading } = useCms();

  // Contact modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<ProfileTabId>("articles");
  
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Find user by canonical identifier
  const { profile: dbUser, needsRedirect } = useMemo(() => {
    return resolveProfileIdentifier(username, users);
  }, [users, username]);

  useEffect(() => {
    if (needsRedirect && dbUser) {
      // Requested by legacy slug/id, but has canonical username. Redirect to canonical!
      router.replace(getCanonicalProfileUrl(dbUser));
    }
  }, [needsRedirect, dbUser, router]);

  const isLoading = authLoading || cmsDataLoading || (!dbUser && users.length === 0);
  const user = dbUser || ({} as any);
  const isOwner = currentUser?.id === user.id;

  // Filter content written by this user
  const userArticles = useMemo(() => {
    return articles.filter(a => {
      const isPublished = a.status === "Published";
      const matchId = (a as any).author_id === user.id;
      const matchName = (a as any).author === user.name && !["NEW USER", "पाठक (Reader)", "Admin"].includes(user.name);
      return isPublished && (matchId || matchName);
    });
  }, [articles, user.id, user.name]);

  useEffect(() => {
    if (activeTab === "community" && user.id) {
      setPostsLoading(true);
      fetchUserPosts(user.id).then(posts => {
        setUserPosts(posts);
        setPostsLoading(false);
      });
    }
  }, [activeTab, user.id]);

  const latestArticles = useMemo(() => {
    return [...userArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userArticles]);

  const userVideos = useMemo(() => {
    return videos.filter(v => 
      v.status === "Published" && 
      (v.title.includes(user.name) || v.description.includes(user.name))
    );
  }, [videos, user.name]);

  const isFollowing = currentUser ? (user.followers?.includes(currentUser.id) || false) : false;

  const handleFollowToggle = () => {
    if (!currentUser) {
      openAuthModal(() => {}, "फ़ॉलो करने के लिए कृपया लॉग इन करें!");
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

  const totalArticleViews = userArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalArticleLikes = userArticles.reduce((sum, a) => sum + (a.likes || 0), 0);

  const isLeadership = ["संस्थापक", "प्रशासन", "Editor-in-Chief", "Managing Editor"].includes(user.role || "");

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!dbUser) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.display_name || user.name,
    "jobTitle": user.designation || user.role,
    "worksFor": {
      "@type": "Organization",
      "name": "युवाक्षर"
    },
    "description": user.bio,
    "image": user.avatar_url,
    "url": `https://yuvakshar.org${getCanonicalProfileUrl(user)}`,
    "sameAs": [
      user.social_links?.twitter || "",
      user.social_links?.linkedin || ""
    ].filter(Boolean)
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Cover Section */}
      <ProfileCover coverUrl={user.cover_url} isOwner={isOwner} onCoverUpload={() => {}} />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Floating Identity Card & Stats */}
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-10 items-start">
          <div className="w-full xl:w-2/3">
            <ProfileIdentityCard user={user} isLeadership={isLeadership} />
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <ProfileActions 
                isOwner={isOwner} 
                isFollowing={isFollowing} 
                onFollowToggle={handleFollowToggle}
                onMessageClick={() => setContactOpen(true)}
                onShareClick={() => {
                  navigator.clipboard.writeText(`https://yuvakshar.org${getCanonicalProfileUrl(user)}`);
                  alert("Link copied to clipboard!");
                }}
                onEditClick={() => setActiveTab("settings")}
                onSettingsClick={() => setActiveTab("settings")}
              />
            </div>
            
            <div className="mt-8">
              <ProfileStats 
                articlesCount={userArticles.length}
                followersCount={user.followers?.length || 0}
                followingCount={user.following?.length || 0}
                viewsCount={totalArticleViews}
                likesCount={totalArticleLikes}
              />
            </div>
          </div>

          <div className="hidden xl:block xl:w-1/3 pt-6 relative z-10">
             {/* Sidebar moved below */}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-12">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} />
        </div>

        {/* Content & Sidebar Layout */}
        <div className="mt-8 flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Main Content Area */}
          <div className="w-full lg:flex-1 min-w-0">
            {activeTab === "articles" && (
              <div className="space-y-4">
                {latestArticles.length === 0 ? (
                  <div className="py-24 text-center font-serif">
                    <p className="text-2xl font-bold text-slate-300 dark:text-slate-700">कोई आलेख नहीं</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {latestArticles.map(art => (
                      <ProfileArticleCard key={art.id} article={art} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {["overview", "magazine", "media", "activity", "followers", "following", "about", "bookmarks", "drafts"].includes(activeTab) && (
              <div className="py-24 text-center font-serif">
                <p className="text-2xl font-bold text-slate-300 dark:text-slate-700">जल्द आ रहा है</p>
                <p className="text-slate-500 mt-2">यह अनुभाग अभी निर्माणाधीन है।</p>
              </div>
            )}

            {activeTab === "community" && (
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="py-20 text-center text-sm text-slate-400 font-serif animate-pulse">
                    चौपाल पोस्ट्स लोड हो रही हैं...
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-6">
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
                  <div className="py-24 text-center font-serif">
                    <MessageSquare className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                    <p className="text-xl font-bold text-slate-400 dark:text-slate-600">कोई चौपाल पोस्ट नहीं</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-8">
                {userVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {userVideos.map(vid => (
                      <div key={vid.id} className="group flex flex-col space-y-3 cursor-pointer">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                          {vid.thumbnailUrl && (
                            <Image src={vid.thumbnailUrl} alt={vid.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                              ▶
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider">{vid.category}</span>
                          <h3 className="font-bold font-serif text-slate-900 dark:text-white mt-1 leading-snug line-clamp-2">{vid.title}</h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 block">{vid.publishDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center font-serif">
                    <p className="text-2xl font-bold text-slate-300 dark:text-slate-700">मीडिया उपलब्ध नहीं</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && isOwner && (
              <ProfileSettingsTab user={user} />
            )}

          </div>

          {/* Right Sidebar */}
          <ProfileSidebar user={user} />
          
        </div>
      </div>

      {/* CONTACT MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold font-serif text-xl text-slate-900 dark:text-white">संपर्क करें</h3>
                <span className="text-xs text-slate-500 font-sans mt-1 block">उपयोगकर्ता: {user.name}</span>
              </div>
              <button onClick={() => setContactOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8">
              {submitSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
                    <Send className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold font-serif text-xl text-slate-900 dark:text-white">संदेश भेजा गया</h4>
                  <p className="text-sm text-slate-500 font-sans">आपका संपर्क अनुरोध {user.name} तक संप्रेषित कर दिया गया है।</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">आपका नाम</label>
                    <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-shadow" placeholder="अपना पूरा नाम लिखें" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">आपका ईमेल</label>
                    <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-shadow" placeholder="example@email.com" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">संदेश</label>
                    <textarea rows={4} required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-shadow resize-none" placeholder="अपना संदेश यहाँ लिखें..." />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#F97316] hover:bg-[#F97316]/90 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold font-serif py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#F97316]/20">
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

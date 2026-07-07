"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { X, Play, Eye, Heart, MessageSquare, AlertCircle, Maximize2, ChevronLeft, ChevronRight, Share2, FileText, Layers } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { Profile } from "@/store/types";
import { resolveProfileIdentifier, getCanonicalProfileUrl } from "@/utils/username";
import { SITE_URL } from "@/utils/routes";

import ProfileCover from "@/components/profile/ProfileCover";
import ProfileIdentityCard from "@/components/profile/ProfileIdentityCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabs, { ProfileTabId } from "@/components/profile/ProfileTabs";
import ProfileArticleCard from "@/components/profile/ProfileArticleCard";
import ProfileSettingsTab from "@/components/profile/ProfileSettingsTab";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ShareModal from "@/components/shared/ShareModal";
import FollowersModal from "@/components/profile/FollowersModal";

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  
  // URL Param decoding
  const rawParam = params?.username as string;
  const decodedParam = rawParam ? decodeURIComponent(rawParam) : "";
  const username = decodedParam.startsWith("@") ? decodedParam.substring(1) : decodedParam;

  const { users, articles, videos, currentUser, followAuthor, openAuthModal, authLoading, cmsDataLoading } = useCms();

  // Dialog & Tabs States
  const [activeTab, setActiveTab] = useState<ProfileTabId>("articles");
  const [shareOpen, setShareOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followersType, setFollowersType] = useState<"followers" | "following">("followers");
  const [contactOpen, setContactOpen] = useState(false);
  
  // Fullscreen Media Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Find user by username
  const { profile: dbUser, needsRedirect } = useMemo(() => {
    return resolveProfileIdentifier(username, users);
  }, [users, username]);

  useEffect(() => {
    if (needsRedirect && dbUser) {
      const canonicalUrl = getCanonicalProfileUrl(dbUser);
      if (canonicalUrl) {
        router.replace(canonicalUrl);
      }
    }
  }, [needsRedirect, dbUser, router]);

  const isLoading = authLoading || cmsDataLoading || (!dbUser && users.length === 0);
  const user = dbUser || ({} as any);
  console.log("LOGGING: Profile page user state/props:", user);
  const isOwner = currentUser?.id === user.id;

  // Published articles filter
  const userArticles = useMemo(() => {
    return (articles || []).filter(a => {
      const isPublished = a.status === "Published" || a.status === "Approved";
      const matchId = (a as any).author_id === user.id;
      const matchName = (a as any).author === user.name && !["NEW USER", "पाठक (Reader)", "Admin"].includes(user.name);
      return isPublished && (matchId || matchName);
    });
  }, [articles, user.id, user.name]);

  // Drafts filter (Visible ONLY to owner)
  const userDrafts = useMemo(() => {
    if (!isOwner) return [];
    return (articles || []).filter(a => {
      const isDraft = a.status === "Draft";
      const matchId = (a as any).author_id === user.id;
      const matchName = (a as any).author === user.name;
      return isDraft && (matchId || matchName);
    });
  }, [articles, user.id, user.name, isOwner]);

  // User videos
  const userVideos = useMemo(() => {
    return (videos || []).filter(v => 
      v.status === "Published" && 
      (v.title?.includes(user.name) || v.description?.includes(user.name))
    );
  }, [videos, user.name]);

  // Collect unique media: Cover images from articles + User videos
  const userMedia = useMemo(() => {
    const mediaList: Array<{ type: "image" | "video"; url: string; title: string }> = [];
    const seenUrls = new Set<string>();

    // 1. Article Cover Images
    userArticles.forEach((art) => {
      const img = art.coverImage || art.cover_image;
      if (img && !seenUrls.has(img)) {
        seenUrls.add(img);
        mediaList.push({
          type: "image",
          url: img,
          title: art.title,
        });
      }
    });

    // 2. Videos
    userVideos.forEach((vid) => {
      const url = vid.thumbnailUrl || "/images/placeholder-news.jpg";
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        mediaList.push({
          type: "video",
          url: url,
          title: vid.title,
        });
      }
    });

    return mediaList;
  }, [userArticles, userVideos]);

  // Overview Layout configurations
  const featuredArticle = useMemo(() => {
    return userArticles.find((art) => art.featured || art.isFeatured || art.pinned) || null;
  }, [userArticles]);

  const latestArticles = useMemo(() => {
    const list = featuredArticle
      ? userArticles.filter((art) => art.id !== featuredArticle.id)
      : userArticles;
    return list.slice(0, 6);
  }, [userArticles, featuredArticle]);

  const recentMedia = useMemo(() => {
    return userMedia.slice(0, 4);
  }, [userMedia]);

  const isFollowing = currentUser ? (user.followers?.includes(currentUser.id) || false) : false;

  const handleFollowToggle = () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    followAuthor(user.id, currentUser.id);
  };

  const handleShareClick = async () => {
    const profileUrl = typeof window !== "undefined"
      ? `${window.location.origin}${getCanonicalProfileUrl(user) ?? `/u/${user.username || user.id}`}`
      : `${SITE_URL}/u/${user.username || user.id}`;

    const shareData = {
      title: `${user.name} | युवाक्षर लेखक`,
      text: user.bio || "युवाक्षर लेखक प्रोफाइल",
      url: profileUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Share failed, falling back to modal", err);
        setShareOpen(true);
      }
    } else {
      setShareOpen(true);
    }
  };

  const openFollowersModal = (type: "followers" | "following") => {
    setFollowersType(type);
    setFollowersOpen(true);
  };

  const openViewer = (index: number) => {
    setActiveMediaIndex(index);
    setViewerOpen(true);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!dbUser) {
    notFound();
  }

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}${getCanonicalProfileUrl(user) ?? `/u/${user.username || user.id}`}`
    : `${SITE_URL}/u/${user.username || user.id}`;

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      
      {/* Cover Banner */}
      <ProfileCover coverUrl={user.cover_url} isOwner={isOwner} />

      {/* Profile Card Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Identity & Details card */}
        <ProfileIdentityCard user={user} />

        {/* Action button triggers */}
        <div className="mt-6 flex justify-center md:justify-start">
          <ProfileActions 
            isOwner={isOwner} 
            isFollowing={isFollowing} 
            onFollowToggle={handleFollowToggle}
            onMessageClick={() => setContactOpen(true)}
            onShareClick={handleShareClick}
            onEditClick={() => setActiveTab("settings")}
            onSettingsClick={() => setActiveTab("settings")}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8">
          <ProfileStats 
            articlesCount={userArticles.length}
            followersCount={user.followers?.length || 0}
            mediaCount={userMedia.length}
            draftsCount={userDrafts.length}
            isOwner={isOwner}
            onFollowersClick={() => openFollowersModal("followers")}
            onFollowingClick={() => openFollowersModal("following")}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mt-10">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} />
        </div>

        {/* Content switch list */}
        <div className="mt-8">
          
          {activeTab === "articles" && (
            <div className="space-y-12">
              
              {/* Overview Summary Panel */}
              <div className="space-y-8">
                
                {/* 1. Featured pinned Article */}
                {featuredArticle && (
                  <div className="bg-[#FAF9F6] dark:bg-[#0E1322] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    <span className="text-[10px] text-[#F97316] font-bold uppercase tracking-wider block mb-3">★ पिन किया गया लेख (Featured)</span>
                    <ProfileArticleCard article={featuredArticle} />
                  </div>
                )}

                {/* 2. Latest Articles Feed */}
                {latestArticles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-455 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">नवीनतम आलेख (Latest Articles)</h3>
                    <div className="flex flex-col">
                      {latestArticles.map((art) => (
                        <ProfileArticleCard key={art.id} article={art} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Recent Media preview block */}
                {recentMedia.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-455 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">हालिया मीडिया (Recent Media)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {recentMedia.map((m, idx) => (
                        <button
                          key={idx}
                          onClick={() => openViewer(idx)}
                          className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                        >
                          <Image src={m.url} alt={m.title} fill className="object-cover" sizes="200px" />
                          {m.type === "video" && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {userArticles.length === 0 && (
                  <div className="py-20 text-center font-serif">
                    <FileText className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                    <p className="text-xl font-bold text-slate-400 dark:text-slate-600">कोई आलेख प्रकाशित नहीं हैं।</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-455 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">सभी मीडिया फ़ाइलें (All Media)</h3>
              
              {userMedia.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userMedia.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => openViewer(idx)}
                      className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:scale-[1.01] transition-transform duration-300 cursor-pointer shadow-sm"
                    >
                      <Image src={m.url} alt={m.title} fill className="object-cover" sizes="240px" />
                      
                      {/* Hover stats overlays */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {m.type === "video" ? (
                          <Play className="w-8 h-8 text-white fill-white" />
                        ) : (
                          <Maximize2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center font-serif">
                  <Layers className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <p className="text-xl font-bold text-slate-400 dark:text-slate-600">कोई मीडिया फ़ाइल उपलब्ध नहीं है।</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && isOwner && (
            <ProfileSettingsTab user={user} />
          )}

        </div>

      </div>

      {/* Reusable Share Component */}
      <ShareModal 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        title={`${user.name} | युवाक्षर लेखक`}
        url={profileUrl}
        summary={user.bio}
      />

      {/* Reusable Followers Modal */}
      <FollowersModal 
        isOpen={followersOpen}
        onClose={() => setFollowersOpen(false)}
        title={followersType === "followers" ? "फ़ॉलोअर्स (Followers)" : "फ़ॉलोइंग (Following)"}
        type={followersType}
        targetUser={user}
      />

      {/* Fullscreen Media Lightbox Viewer */}
      {viewerOpen && userMedia.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white py-2 px-4 z-10 shrink-0">
            <span className="text-xs font-semibold font-sans bg-white/10 px-3 py-1 rounded-full">
              {activeMediaIndex + 1} / {userMedia.length}
            </span>
            <button 
              onClick={() => setViewerOpen(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Main Slide view */}
          <div className="flex-1 flex items-center justify-center relative min-h-0">
            
            {/* Prev arrow */}
            {userMedia.length > 1 && (
              <button 
                onClick={() => setActiveMediaIndex((prev) => (prev === 0 ? userMedia.length - 1 : prev - 1))}
                className="absolute left-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer z-10 active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Content box */}
            <div className="max-w-4xl max-h-[70vh] w-full h-full relative aspect-video shrink-0 bg-stone-900 rounded-xl overflow-hidden border border-white/5 shadow-2xl">
              <Image 
                src={userMedia[activeMediaIndex].url} 
                alt={userMedia[activeMediaIndex].title} 
                fill 
                className="object-contain" 
                priority
              />
              {userMedia[activeMediaIndex].type === "video" && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-2xl scale-100 hover:scale-105 active:scale-95 transition-all">
                    <Play className="w-6 h-6 text-stone-900 fill-stone-900 ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Next arrow */}
            {userMedia.length > 1 && (
              <button 
                onClick={() => setActiveMediaIndex((prev) => (prev === userMedia.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer z-10 active:scale-95 transition-transform"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

          </div>

          {/* Details footer */}
          <div className="text-center text-white max-w-2xl mx-auto py-4 px-6 z-10 shrink-0 space-y-1">
            <h4 className="font-serif font-black text-sm md:text-base leading-snug line-clamp-1">
              {userMedia[activeMediaIndex].title}
            </h4>
            <span className="text-[10px] text-slate-400 font-sans tracking-wide uppercase">
              {userMedia[activeMediaIndex].type === "video" ? "वीडियो (Video)" : "चित्र आलेख कवर (Image)"}
            </span>
          </div>

        </div>
      )}

      {/* CONTACT MODAL SIMULATOR */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold font-serif text-lg text-slate-900 dark:text-white">संपर्क करें (Contact Author)</h3>
                <span className="text-[10px] text-slate-400 mt-1 block">लेखक: {user.name}</span>
              </div>
              <button onClick={() => setContactOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
                <Play className="w-8 h-8 rotate-90" />
              </div>
              <h4 className="font-bold font-serif text-base text-slate-900 dark:text-white">संदेश अनुकार</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                यह कार्यक्षमता अभी इस डेवलपर परिवेश में सिमुलेटेड है।
              </p>
              <button onClick={() => setContactOpen(false)} className="w-full bg-[#F97316] text-white py-3 rounded-xl font-bold text-xs">
                ठीक है (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

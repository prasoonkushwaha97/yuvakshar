"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { X, Play, Eye, Heart, MessageSquare, AlertCircle, Share2, FileText } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { Profile } from "@/store/types";
import { resolveProfileIdentifier, getCanonicalProfileUrl } from "@/utils/username";
import { SITE_URL } from "@/utils/routes";

import ProfileCover from "@/components/profile/ProfileCover";
import ProfileIdentityCard from "@/components/profile/ProfileIdentityCard";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileTabs, { ProfileTabId } from "@/components/profile/ProfileTabs";
import ProfileArticleCard from "@/components/profile/ProfileArticleCard";
import ProfileDraftsTab from "@/components/profile/ProfileDraftsTab";
import ProfileBookmarksTab from "@/components/profile/ProfileBookmarksTab";
import ProfileAboutTab from "@/components/profile/ProfileAboutTab";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ShareModal from "@/components/shared/ShareModal";
import CreateUsernameModal from "@/components/profile/CreateUsernameModal";

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  
  // URL Param decoding
  const rawParam = params?.username as string;
  const decodedParam = rawParam ? decodeURIComponent(rawParam) : "";
  const username = decodedParam.startsWith("@") ? decodedParam.substring(1) : decodedParam;

  const { users, articles, currentUser, openAuthModal, authLoading, cmsDataLoading } = useCms();

  // Dialog & Tabs States
  const [activeTab, setActiveTab] = useState<ProfileTabId>("articles");
  const [shareOpen, setShareOpen] = useState(false);

  const [contactOpen, setContactOpen] = useState(false);

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
      <ProfileCover user={user} coverUrl={user.cover_url} isOwner={isOwner} />

      {/* Profile Card Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Identity & Details floating section */}
        <ProfileIdentityCard 
          user={user} 
          isOwner={isOwner}
          onMessageClick={() => setContactOpen(true)}
          onShareClick={handleShareClick}
        />

        {/* Navigation Tabs */}
        <div className="mt-6">
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
                  <div className="flex flex-col">
                    {latestArticles.map((art) => (
                      <ProfileArticleCard key={art.id} article={art} />
                    ))}
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


          {activeTab === "about" && (
            <ProfileAboutTab user={user} />
          )}

          {activeTab === "drafts" && isOwner && (
            <ProfileDraftsTab user={user} />
          )}

          {activeTab === "bookmarks" && isOwner && (
            <ProfileBookmarksTab user={user} />
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

      {/* Create Username Modal (Prompt if mandatory username is missing) */}
      {isOwner && (!currentUser?.username || currentUser.username.trim() === "") && (
        <CreateUsernameModal 
          isOpen={true}
          onSuccess={(newUsername) => {
            router.replace(`/u/${newUsername}`);
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        />
      )}

    </div>
  );
}

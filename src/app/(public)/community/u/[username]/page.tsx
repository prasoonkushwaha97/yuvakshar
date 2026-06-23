"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, MapPin, Link as LinkIcon, Edit, UserPlus, Mail,
  Star, Trophy, Flame, FolderOpen, Share2, ShieldCheck, UserCheck, MessageSquare, BookOpen, PenTool, Heart
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  getUserSocialTimeline, 
  toggleFollowUser, 
  isUserFollowing, 
  toggleLikePost,
  CommunityPost 
} from "@/lib/communityService";
import type { Profile } from "@/store/types";
import PostCard from "@/components/yuvakshar/PostCard";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function SocialProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { users, currentUser } = useCms();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activity" | "posts" | "replies" | "bookmarks">("activity");
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);
  const [isFollowingState, setIsFollowingState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("yuvakshar_c_post_bookmarks");
    if (saved) setBookmarkedPostIds(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Fallback for mock environment, creating default user if not found but matches current user
        let match = users.find((u: Profile) => u.slug === username || u.id === username);
        if (!match && currentUser && (currentUser.slug === username || currentUser.id === username)) {
            match = currentUser;
        }

        if (match) {
          // Defaults for missing social fields
          const socialProfile = {
            ...match,
            followers: match.followers || [],
            following: match.following || [],
            social_posts_count: match.social_posts_count || 0,
            social_replies_count: match.social_replies_count || 0,
            groups_count: match.groups_count || 0
          };
          setProfile(socialProfile);
          
          if (currentUser) {
            const isFollow = await isUserFollowing(currentUser.id, match.id);
            setIsFollowingState(isFollow);
          }

          const events = await getUserSocialTimeline(match.id);
          setTimeline(events);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username, users, currentUser]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      alert("फॉलो करने के लिए कृपया लॉगिन करें।");
      return;
    }
    if (!profile) return;
    
    try {
      const isNowFollowing = await toggleFollowUser(currentUser.id, profile.id);
      setIsFollowingState(isNowFollowing);
      // Optimistic update
      setProfile(prev => {
        if (!prev) return prev;
        const currentFollowers = prev.followers || [];
        return {
          ...prev,
          followers: isNowFollowing 
            ? [...currentFollowers, currentUser.id] 
            : currentFollowers.filter(id => id !== currentUser.id)
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const newCount = await toggleLikePost(postId, currentUser.id);
      setTimeline(prev => prev.map(t => {
        if (t.id === postId) return { ...t, likesCount: newCount };
        return t;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = (postId: string) => {
    if (!currentUser) {
      alert("बुकमार्क करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    let updated = [...bookmarkedPostIds];
    const exists = updated.includes(postId);
    if (exists) {
      updated = updated.filter(id => id !== postId);
      alert("पोस्ट को आपकी लाइब्रेरी से हटा दिया गया है।");
    } else {
      updated.push(postId);
      alert("पोस्ट को आपकी लाइब्रेरी में सहेज लिया गया है!");
    }
    setBookmarkedPostIds(updated);
    localStorage.setItem("yuvakshar_c_post_bookmarks", JSON.stringify(updated));
  };

  const triggerShare = (post: CommunityPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title || `${post.user_name} की साहित्यिक प्रविष्टि`,
        text: post.content,
        url: `${window.location.origin}/community/discussion/thread/${post.id}`
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/community/discussion/thread/${post.id}`);
      alert("लिंक कॉपी कर लिया गया है!");
    }
  };

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.startsWith("#")) {
        const cleanTag = part.replace(/[^\w\u0900-\u097F]/g, "");
        return (
          <Link 
            key={idx} 
            href={`/community?search=${encodeURIComponent("#" + cleanTag)}`}
            className="text-primary hover:underline font-bold transition-all"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-serif animate-pulse">
        प्रोफ़ाइल लोड हो रही है...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-hindi">खाता नहीं मिला</h2>
        <p className="text-slate-500 font-serif mt-2 max-w-md">यह उपयोगकर्ता मौजूद नहीं है या प्रोफ़ाइल को निजी कर दिया गया है।</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const isEditorialRole = profile.role && ["Founder", "Owner", "Admin", "Editor-in-Chief", "Managing Editor", "Editor", "Author", "Contributor"].includes(profile.role);

  // Filter timeline based on tabs
  const displayTimeline = timeline.filter(event => {
    if (activeTab === "posts") return event.post_type !== "reply" && event.activity_type !== "Replied";
    if (activeTab === "replies") return event.activity_type === "Replied";
    if (activeTab === "bookmarks") return bookmarkedPostIds.includes(event.id || event.post_id);
    return true; // "activity" shows everything
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-[1200px] mx-auto w-full">
      {/* LEFT COLUMN: Profile Header & Info */}
      <div className="w-full md:w-[340px] shrink-0 space-y-6">
        
        {/* Modern Social Header */}
        <div className="bg-white dark:bg-[#070B14] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary/80 to-blue-600/80 w-full relative">
            {profile.cover_banner && (
              <img src={profile.cover_banner} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Avatar & Actions Row */}
          <div className="px-5 pt-3 pb-4 relative">
            <div className="flex justify-between items-start">
              {/* Overlapping Avatar */}
              <div className="relative -mt-12 w-20 h-20 rounded-full border-4 border-white dark:border-[#070B14] bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400 font-serif">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2">
                {isOwnProfile ? (
                  <button className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-hindi">
                    प्रोफ़ाइल बदलें
                  </button>
                ) : (
                  <>
                    <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary transition-all">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleToggleFollow}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all font-hindi flex items-center gap-1.5 ${
                        isFollowingState 
                          ? "bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300" 
                          : "bg-primary text-white border border-primary hover:bg-primary/90"
                      }`}
                    >
                      {isFollowingState ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>{isFollowingState ? "फॉलो कर रहे हैं" : "फॉलो करें"}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-hindi flex items-center gap-1.5">
                {profile.name}
                {profile.verification_badge && (
                  <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />
                )}
              </h1>
              <p className="text-sm text-slate-500 font-mono">@{profile.slug || profile.id}</p>
            </div>

            {profile.bio && (
              <p className="mt-3 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-hindi">
                {profile.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 font-hindi">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.social_links?.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <a href={profile.social_links.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {profile.social_links.website.replace("https://", "")}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>जुड़े: {profile.joinDate || "2024"}</span>
              </div>
            </div>

            {/* Cross-Profile Linking (MANDATORY) */}
            {isEditorialRole && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href={`/community/authors/${profile.slug || profile.id}`} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-bold text-xs transition-colors font-hindi group">
                  <PenTool className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span>✍️ लेखक प्रोफ़ाइल (Author Profile)</span>
                </Link>
              </div>
            )}

            {/* Social Stats */}
            <div className="mt-5 flex items-center gap-5">
              <Link href={`/community/u/${username}/following`} className="flex gap-1.5 items-baseline group">
                <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:underline">
                  {profile.following?.length || 0}
                </span>
                <span className="text-xs text-slate-500 font-hindi">फ़ॉलोइंग</span>
              </Link>
              <Link href={`/community/u/${username}/followers`} className="flex gap-1.5 items-baseline group">
                <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:underline">
                  {profile.followers?.length || 0}
                </span>
                <span className="text-xs text-slate-500 font-hindi">फ़ॉलोअर्स</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Yuvakshar Enhancements Module */}
        <div className="bg-white dark:bg-[#070B14] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
          <h3 className="text-xs uppercase font-bold text-slate-400 font-serif tracking-wider">साहित्यिक उपलब्धियां</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-hindi">प्रतिष्ठा स्तर</span>
                  <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Beginner</span>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-600">0</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-hindi">पठन शृंखला (Streak)</span>
                  <span className="block text-[10px] text-slate-500 font-mono mt-0.5">लगातार पठन</span>
                </div>
              </div>
              <span className="text-sm font-bold text-orange-600">0 दिन</span>
            </div>
          </div>

          {profile.badges && profile.badges.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 mb-3 font-hindi uppercase">बैज (Badges)</span>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded-md border border-slate-200 dark:border-slate-700 font-hindi font-medium flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Timeline & Feed */}
      <div className="flex-1 space-y-4">
        {/* Timeline Tabs */}
        <div className="flex bg-white dark:bg-[#070B14] rounded-2xl border border-slate-200 dark:border-slate-800 px-2 overflow-x-auto no-scrollbar">
          {[
            { id: "activity", label: "गतिविधियाँ" },
            { id: "posts", label: "पोस्ट्स" },
            { id: "replies", label: "उत्तर" },
            { id: "bookmarks", label: "सुरक्षित" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all font-hindi ${
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          {displayTimeline.length > 0 ? (
            displayTimeline.map((item, idx) => {
              if (item.post_type === "reply" || item.activity_type === "Replied") {
                return (
                  <GlassCard key={`reply-${idx}`} className="p-5 border border-slate-200/60 dark:border-slate-800/60 relative">
                    <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-400 font-bold font-hindi uppercase">
                      <MessageSquare className="w-3 h-3 text-primary" />
                      <span>{profile.name} ने उत्तर दिया</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-hindi leading-relaxed border-l-2 border-primary/20 pl-3 ml-2">
                      {item.content}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-slate-400 text-xs">
                      <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{item.likesCount || 0}</span>
                      </button>
                      <Link href={`/community/discussion/thread/${item.post_id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                        चर्चा देखें
                      </Link>
                    </div>
                  </GlassCard>
                );
              }
              
              // Standard PostCard
              return (
                <div key={`post-${idx}`} className="relative">
                  {item.activity_type && item.activity_type !== "Posted" && (
                     <div className="flex items-center gap-2 mb-2 text-[10px] text-slate-400 font-bold font-hindi uppercase px-2">
                       <Share2 className="w-3 h-3 text-primary" />
                       <span>{profile.name} ने {item.activity_type}</span>
                     </div>
                  )}
                  <PostCard 
                    post={item} 
                    onLike={handleLike} 
                    onPollVote={() => {}} 
                    isBookmarked={bookmarkedPostIds.includes(item.id)}
                    currentUser={currentUser}
                    onBookmark={handleBookmarkToggle}
                    onShare={triggerShare}
                    renderContentWithHashtags={renderContentWithHashtags}
                  />
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-slate-400 font-serif bg-white dark:bg-[#070B14] rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
              कोई {activeTab === "activity" ? "गतिविधि" : "पोस्ट"} नहीं मिली।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

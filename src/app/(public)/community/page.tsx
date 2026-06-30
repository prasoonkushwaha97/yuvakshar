"use client";

import React, { useState, useEffect, Suspense } from "react";
import { 
  Send, 
  AlertCircle
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useSearchParams } from "next/navigation";
import { 
  fetchPosts, 
  toggleLikePost, 
  CommunityPost, 
  fetchGroups, 
  CommunityGroup,
  CommunityGroupMember
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/yuvakshar/PostCard";

export default function CommunityFeedPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-xs text-slate-400 font-serif animate-pulse">
        चौपाल फ़ीड लोड हो रही है...
      </div>
    }>
      <CommunityFeedPageContent />
    </Suspense>
  );
}

function CommunityFeedPageContent() {
  const { currentUser, loginUser, users } = useCms();
  const searchParams = useSearchParams();
  
  // State variables
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<CommunityGroupMember[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);
  const [followedHashtags, setFollowedHashtags] = useState<string[]>(["काव्य", "कहानी", "हिंदीसाहित्य"]);
  const [activeTab, setActiveTab] = useState<"for-you" | "following" | "trending" | "latest">("for-you");
  const [loading, setLoading] = useState(true);

  // Load feed data
  const loadFeedData = async () => {
    setLoading(true);
    try {
      const allPosts = await fetchPosts();
      setPosts(allPosts);
      const allGroups = await fetchGroups();
      setGroups(allGroups);

      if (typeof window !== "undefined") {
        const savedMembers = null;
        if (savedMembers) setGroupMembers(JSON.parse(savedMembers));
        
        const savedBookmarked = null;
        if (savedBookmarked) setBookmarkedPostIds(JSON.parse(savedBookmarked));
        
        const savedHashtags = null;
        if (savedHashtags) setFollowedHashtags(JSON.parse(savedHashtags));
      }
    } catch (err) {
      console.error("Error loading feed data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedData();

    // Listen for custom post creation event from global layout
    const handlePostCreated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { user_id, user_name, content, post_type, extra } = customEvent.detail;
        
        // Simulating the post creation and inserting in list
        const newPost: CommunityPost = {
          id: `post-${Date.now()}`,
          user_id,
          user_name,
          content,
          post_type,
          is_pinned: false,
          is_locked: false,
          is_solved: false,
          created_at: new Date().toISOString(),
          likesCount: 0,
          commentsCount: 0,
          ...extra
        };

        // Prepend new post
        setPosts(prev => [newPost, ...prev]);
        
        // Persist to local storage
        if (typeof window !== "undefined") {
          const currentSaved = null;
          const postsList = currentSaved ? JSON.parse(currentSaved) : [];
        }
      }
    };

    window.addEventListener("yuvakshar:postCreated", handlePostCreated);
    return () => {
      window.removeEventListener("yuvakshar:postCreated", handlePostCreated);
    };
  }, []);

  // Handle Poll Vote
  const handlePollVote = (postId: string, optionIdx: number) => {
    if (!currentUser) {
      alert("मतदान करने के लिए कृपया लॉगिन करें।");
      return;
    }
    
    const updatedPosts = posts?.map(p => {
      if (p.id === postId) {
        const votes = { ...(p.poll_votes || {}) };
        votes[currentUser.id] = optionIdx;
        const updated = { ...p, poll_votes: votes };
        return updated;
      }
      return p;
    });

    setPosts(updatedPosts);
    if (typeof window !== "undefined") {
    }
    alert("आपका मत दर्ज कर लिया गया है!");
  };

  // Handle Post Like
  const handleLike = async (postId: string) => {
    if (!currentUser) {
      alert("पसंद करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      const newCount = await toggleLikePost(postId, currentUser.id);
      const updatedPosts = posts?.map(p => {
        if (p.id === postId) return { ...p, likesCount: newCount };
        return p;
      });
      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Handle Bookmark Toggle
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
  };

  // Trigger Share Dialog
  const triggerShare = (post: CommunityPost) => {
    window.dispatchEvent(new CustomEvent("yuvakshar:openShareModal", {
      detail: {
        title: post.title || `${post.user_name} की साहित्यिक प्रविष्टि`,
        url: `${window.location.origin}/community/discussion/thread/${post.id}`
      }
    }));
  };

  // Convert post to article
  const convertPostToArticle = (post: CommunityPost) => {
    alert(`पोस्ट '${post.title || "बिना शीर्षक की पोस्ट"}' को सफलतापूर्वक लेख ड्राफ्ट में बदल दिया गया है!\nसंपादकीय टीम द्वारा समीक्षा के बाद इसे प्रकाशित किया जाएगा।`);
  };

  // Handle Delete Post from Feed State
  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // Handle Edit Post from Feed State
  const handleEditPost = (postId: string, updatedPost: CommunityPost) => {
    setPosts(prev => prev?.map(p => p.id === postId ? updatedPost : p));
  };

  // Parse hashtags into clickable links
  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(\s+)/);
    return parts?.map((part, idx) => {
      if (part.startsWith("#")) {
        const cleanTag = part.replace(/[^\w\u0900-\u097F]/g, ""); // Devanagari Unicode supported
        return (
          <Link 
            key={idx} 
            href={`/community?search=${encodeURIComponent("#" + cleanTag)}`}
            className="text-primary hover:underline font-bold transition-all"
            onClick={(_e) => {
              // Set search in input
              const searchInput = document.querySelector('input[placeholder*="खोजें"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.value = "#" + cleanTag;
              }
            }}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  // Get post type details
  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case "text":
      case "article":
        return { text: "✍️ लेख", class: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" };
      case "poetry":
        return { text: "📝 कविता", class: "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/30" };
      case "thought":
        return { text: "💭 विचार", class: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" };
      case "poll":
      case "question":
        return { text: "❓ प्रश्न", class: "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border-green-100 dark:border-green-900/30" };
      case "image":
        return { text: "🖼️ चित्र", class: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30" };
      case "pdf":
        return { text: "📄 दस्तावेज़", class: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/30" };
      case "link":
        return { text: "🔗 लिंक", class: "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 border-sky-100 dark:border-sky-900/30" };
      default:
        return { text: "✍️ लेख", class: "bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-100 dark:border-slate-800" };
    }
  };

  // Follower filter lists
  const followingUserIds = users
    .filter(u => u.followers?.includes(currentUser?.id || ""))
    .map(u => u.id);
  const joinedGroupIds = groupMembers
    .filter(gm => gm.user_id === currentUser?.id)
    .map(gm => gm.group_id);

  // Get aggregated & filtered posts
  const getFilteredPosts = () => {
    let list = [...posts];

    // Filter by activeTab
    if (activeTab === "following") {
      if (!currentUser) return [];
      list = list.filter(post => {
        const isUserFollowed = followingUserIds.includes(post.user_id);
        const isGroupFollowed = post.group_id && joinedGroupIds.includes(post.group_id);
        const isHashtagFollowed = followedHashtags.some(tag => post.content.includes('#' + tag));
        return isUserFollowed || isGroupFollowed || isHashtagFollowed;
      });
    } else if (activeTab === "trending") {
      list.sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount));
    } else if (activeTab === "latest") {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Filter by search query parameter
    const searchQuery = searchParams.get("search") || "";
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.content.toLowerCase().includes(q) || 
        p.title?.toLowerCase().includes(q) || 
        p.user_name.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="space-y-6">
      
      {/* ─── 1. UNIFIED CREATE POST BOX (Trigger only) ─── */}
      {currentUser ? (
        <GlassCard 
          className="p-4 border-slate-200/60 dark:border-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700/60 transition-all cursor-pointer" 
          onClick={() => window.dispatchEvent(new CustomEvent("yuvakshar:openCreateModal", { detail: { type: "text" } }))}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 uppercase shrink-0 overflow-hidden">
              {currentUser.avatar_url ? (
                <Image src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" fill />
              ) : (
                currentUser.name[0]
              )}
            </div>
            <div className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-full px-4 py-2.5 text-slate-400 hover:text-slate-500 text-xs font-hindi flex items-center justify-between">
              <span>{currentUser.name}, आज आप क्या विचार साझा करना चाहते हैं? विचारों को आवाज़ दीजिए...</span>
              <Send className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-500 font-semibold font-hindi">
            <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("yuvakshar:openCreateModal", { detail: { type: "text" } })); }} className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>✍️</span> लेख
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("yuvakshar:openCreateModal", { detail: { type: "poetry" } })); }} className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>📝</span> कविता
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("yuvakshar:openCreateModal", { detail: { type: "thought" } })); }} className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>💭</span> विचार
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("yuvakshar:openCreateModal", { detail: { type: "poll" } })); }} className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>❓</span> प्रश्न
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("yuvakshar:openCreateModal", { detail: { type: "image" } })); }} className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>🖼️</span> चित्र
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-950/20 p-5 rounded-2xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold font-serif text-slate-800 dark:text-white font-hindi">साहित्यिक विमर्श में भाग लें!</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-serif">
              विचारों को आवाज़ देने और साथी लेखकों से संवाद स्थापित करने के लिए कृपया लॉगिन करें।
            </p>
            <button 
              onClick={() => loginUser("yuvakshar.editor@gmail.com")}
              className="text-[10px] text-primary hover:text-primary/95 font-bold cursor-pointer font-hindi"
            >
              यहाँ क्लिक करके तुरंत लॉगिन करें →
            </button>
          </div>
        </div>
      )}

      {/* ─── 2. FEED FILTER TABS ─── */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
        {[
          { id: "for-you", name: "सभी चौपाल" },
          { id: "following", name: "अनुसरण किए गए" },
          { id: "trending", name: "लोकप्रिय" },
          { id: "latest", name: "नवीनतम" }
        ]?.map((tab) => (
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

      {/* ─── 3. FEED POSTS LIST ─── */}
      <div className="space-y-5">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
            फ़ीड लोड की जा रही है... कृपया प्रतीक्षा करें।
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts?.map((post) => {
            const authorProfile = users.find(u => u.id === post.user_id || u.name === post.user_name);
            const isBookmarked = bookmarkedPostIds.includes(post.id);

            return (
              <PostCard 
                key={post.id}
                post={post}
                authorProfile={authorProfile}
                currentUser={currentUser}
                isBookmarked={isBookmarked}
                onLike={handleLike}
                onBookmark={handleBookmarkToggle}
                onShare={triggerShare}
                onPollVote={handlePollVote}
                onConvert={convertPostToArticle}
                renderContentWithHashtags={renderContentWithHashtags}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            );
          })
        ) : (
          <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs">
            इस फ़ीड में फ़िलहाल कोई प्रविष्टि नहीं है।
          </div>
        )}
      </div>

    </div>
  );
}

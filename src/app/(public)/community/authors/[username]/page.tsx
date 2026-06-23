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
  Heart,
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Trophy,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Lock,
  Check,
  BookMarked,
  FolderPlus
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { fetchPosts, toggleLikePost, CommunityPost } from "@/lib/communityService";
import type { Profile } from "@/store/types";
import PostCard from "@/components/yuvakshar/PostCard";
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

interface CollectionItem {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface CollectionFolder {
  id: string;
  name: string;
  is_public: boolean;
  items: CollectionItem[];
}

export default function AuthorPortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  const { users, currentUser, followAuthor, articles, updateUserProfile } = useCms();

  // States
  const [author, setAuthor] = useState<any>(null);
  const [authorPosts, setAuthorPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "showcase" | "info" | "collab">("showcase");
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("yuvakshar_c_post_bookmarks");
    if (saved) setBookmarkedPostIds(JSON.parse(saved));
  }, []);

  // Collections state
  const [collections, setCollections] = useState<CollectionFolder[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState("");

  // Inline profile editing states (for gamified completion)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editExpertise, setEditExpertise] = useState("");

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
        // Load community posts
        const posts = await fetchPosts();
        const filtered = posts.filter(p => p.user_id === match.id);
        setAuthorPosts(filtered);

        // Prepopulate editing states
        setEditBio(match.bio || "");
        setEditInstitution(match.institution || "");
        setEditLocation(match.location || "");
        setEditExpertise(match.expertise_tags ? match.expertise_tags.join(", ") : "");

        // Load collections
        const savedCollections = localStorage.getItem(`yuvakshar_collections_${match.id}`);
        if (savedCollections) {
          setCollections(JSON.parse(savedCollections));
        } else {
          // Preseed collections
          const preseeded: CollectionFolder[] = [
            { 
              id: "col-1", 
              name: "काव्य मंजरी 📝", 
              is_public: true, 
              items: [
                { id: "mock-p1", title: "वसन्त का स्वर (काव्य स्पंदन)", type: "poetry", url: "#" }
              ] 
            },
            { 
              id: "col-2", 
              name: "समीक्षात्मक निबंध ✍️", 
              is_public: true, 
              items: [] 
            }
          ];
          setCollections(preseeded);
          localStorage.setItem(`yuvakshar_collections_${match.id}`, JSON.stringify(preseeded));
        }
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
      setAuthorPosts(prevPosts => prevPosts?.map(p => {
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

  // Profile Completion calculations
  const calculateProfileCompletion = () => {
    if (!author) return 0;
    let score = 0;
    if (author.avatar_url) score += 20;
    if (author.bio) score += 20;
    if (author.location) score += 20;
    if (author.institution) score += 20;
    if (author.expertise_tags && author.expertise_tags.length > 0) score += 20;
    return score;
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.id !== author.id) return;

    try {
      const updatedData = {
        bio: editBio,
        institution: editInstitution,
        location: editLocation,
        expertise_tags: editExpertise.split(",")?.map(t => t.trim()).filter(Boolean)
      };

      await updateUserProfile(updatedData);
      setIsEditingProfile(false);
      
      // Update local author state
      setAuthor((prev: any) => ({ ...prev, ...updatedData }));
      alert("आपकी प्रोफाइल विवरण सफलतापूर्वक सहेज ली गई हैं!");
    } catch (err) {
      console.error(err);
      alert("त्रुटि: प्रोफाइल सहेजने में विफल।");
    }
  };

  // Reputation Engine (dynamic points calculation)
  const calculateReputation = () => {
    if (!author) return { score: 100, tier: "Bronze", nextGoal: 150, percent: 0 };
    const base = 100;
    const postPts = authorPosts.length * 15;
    const totalLikes = authorPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    const likePts = totalLikes * 5;
    const verifPts = author.verification_badge ? 150 : 0;
    const instPts = author.institution ? 50 : 0;
    const followerPts = (author.followers?.length || 0) * 10;
    
    const score = base + postPts + likePts + verifPts + instPts + followerPts;
    
    let tier: "Bronze" | "Silver" | "Gold" | "Platinum" = "Bronze";
    let nextGoal = 150;
    let percent = 0;
    let tierBase = 0;

    if (score < 150) {
      tier = "Bronze";
      nextGoal = 150;
      tierBase = 0;
      percent = Math.min(Math.round(((score - tierBase) / (nextGoal - tierBase)) * 100), 100);
    } else if (score >= 150 && score < 300) {
      tier = "Silver";
      nextGoal = 300;
      tierBase = 150;
      percent = Math.min(Math.round(((score - tierBase) / (nextGoal - tierBase)) * 100), 100);
    } else if (score >= 300 && score < 600) {
      tier = "Gold";
      nextGoal = 600;
      tierBase = 300;
      percent = Math.min(Math.round(((score - tierBase) / (nextGoal - tierBase)) * 100), 100);
    } else {
      tier = "Platinum";
      nextGoal = 1000;
      tierBase = 600;
      percent = Math.min(Math.round(((score - tierBase) / (nextGoal - tierBase)) * 100), 100);
    }

    return { score, tier, nextGoal, percent };
  };

  const repData = calculateReputation();

  const getTierHindiName = (tier: string) => {
    switch (tier) {
      case "Bronze": return "नवोदित रचनाकार (Bronze)";
      case "Silver": return "सक्रिय साहित्यकार (Silver)";
      case "Gold": return "लब्धप्रतिष्ठ लेखक (Gold)";
      case "Platinum": return "शीर्षस्थ मनीषी (Platinum)";
      default: return "साहित्यकार";
    }
  };

  // Collections Operations
  const saveCollections = (updated: CollectionFolder[]) => {
    setCollections(updated);
    localStorage.setItem(`yuvakshar_collections_${author.id}`, JSON.stringify(updated));
  };

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const newCol: CollectionFolder = {
      id: `col-${Date.now()}`,
      name: newCollectionName.trim(),
      is_public: true,
      items: []
    };
    saveCollections([...collections, newCol]);
    setNewCollectionName("");
    setShowNewCollectionForm(false);
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm("क्या आप वाकई इस संग्रह को हटाना चाहते हैं?")) {
      const updated = collections.filter(c => c.id !== id);
      saveCollections(updated);
      if (activeCollectionId === id) setActiveCollectionId(null);
    }
  };

  const handleAddItemToCollection = (colId: string) => {
    if (!selectedItemToAdd) return;
    const col = collections.find(c => c.id === colId);
    if (!col) return;

    let newItem: CollectionItem | null = null;
    
    // Check if adding an article or a post
    if (selectedItemToAdd.startsWith("art-")) {
      const art = articles.find(a => a.id === selectedItemToAdd);
      if (art) {
        newItem = { id: art.id, title: art.title, type: "article", url: `/editorial?id=${art.id}` };
      }
    } else {
      const post = authorPosts.find(p => p.id === selectedItemToAdd);
      if (post) {
        newItem = { 
          id: post.id, 
          title: post.title || (post.content.length > 30 ? post.content.substring(0, 30) + "..." : post.content), 
          type: post.post_type, 
          url: `/community/discussion/thread/${post.id}` 
        };
      }
    }

    if (newItem) {
      if (col.items.some(i => i.id === newItem!.id)) {
        alert("यह रचना पहले से ही इस संग्रह में उपलब्ध है।");
        return;
      }
      const updatedCol = { ...col, items: [...col.items, newItem] };
      const updated = collections?.map(c => c.id === colId ? updatedCol : c);
      saveCollections(updated);
      setSelectedItemToAdd("");
      alert("सफलतापूर्वक संग्रह में जोड़ा गया!");
    }
  };

  const handleRemoveItemFromCollection = (colId: string, itemId: string) => {
    const col = collections.find(c => c.id === colId);
    if (!col) return;
    const updatedCol = { ...col, items: col.items.filter(i => i.id !== itemId) };
    const updated = collections?.map(c => c.id === colId ? updatedCol : c);
    saveCollections(updated);
  };

  // --- PostCard Handlers ---
  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const newCount = await toggleLikePost(postId, currentUser.id);
      setAuthorPosts(authorPosts?.map(p => p.id === postId ? { ...p, likesCount: newCount } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = (postId: string) => {
    if (!currentUser) return;
    let updated = [...bookmarkedPostIds];
    if (updated.includes(postId)) {
      updated = updated.filter(id => id !== postId);
    } else {
      updated.push(postId);
    }
    setBookmarkedPostIds(updated);
    localStorage.setItem("yuvakshar_c_post_bookmarks", JSON.stringify(updated));
  };

  const triggerShare = (post: CommunityPost) => {
    window.dispatchEvent(new CustomEvent("yuvakshar:openShareModal", {
      detail: { title: post.title || "साहित्यिक प्रविष्टि", url: `${window.location.origin}/community/discussion/thread/${post.id}` }
    }));
  };

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(\s+)/);
    return parts?.map((part, idx) => {
      if (part.startsWith("#")) {
        const cleanTag = part.replace(/[^\w\u0900-\u097F]/g, "");
        return (
          <Link key={idx} href={`/community?search=${encodeURIComponent("#" + cleanTag)}`} className="text-primary hover:underline font-bold transition-all">
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  // Author Showcase Filtering
  const getFeaturedShowcase = () => {
    // 1. Featured Article (written by this author in the CMS)
    const authorArticles = articles.filter(a => a.author === author.name);
    const featuredArticle = authorArticles[0] || null;

    // 2. Featured Poem (poetry type post from the author)
    const featuredPoem = authorPosts.find(p => (p.post_type as string) === "poetry" || p.content.includes("#काव्य") || p.title?.includes("कविता")) || null;

    // 3. Featured Discussion (thought/discussion with comments or likes)
    const featuredDiscussion = authorPosts.find(p => p.post_type === "discussion" || p.post_type === "poll" || p.commentsCount > 0) || authorPosts[0] || null;

    return { featuredArticle, featuredPoem, featuredDiscussion };
  };

  const showcase = getFeaturedShowcase();

  const handleOpenShare = () => {
    const shareUrl = window.location.href;
    const shareText = `युवाक्षर पर ${author.name} की साहित्यकार प्रोफाइल देखें!`;
    window.dispatchEvent(new CustomEvent("yuvakshar:openShareModal", {
      detail: { title: shareText, url: shareUrl }
    }));
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-455 animate-pulse font-serif">
        साहित्यकार प्रोफ़ाइल लोड की जा रही है...
      </div>
    );
  }

  if (!author) {
    return (
      <div className="py-20 text-center text-xs text-slate-455 font-serif">
        साहित्यकार प्रोफ़ाइल नहीं मिली।
      </div>
    );
  }

  const isSelf = currentUser && author.id === currentUser.id;

  return (
    <div className="space-y-6 text-[#0F172A] dark:text-slate-200">
      
      {/* Navigation header */}
      <div className="flex items-center justify-between text-xs font-serif text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link href="/community/authors" className="inline-flex items-center space-x-1 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-hindi">साहित्यकार निर्देशिका पर वापस जाएं</span>
        </Link>
        <button 
          onClick={handleOpenShare}
          className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer font-hindi"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>प्रोफ़ाइल साझा करें</span>
        </button>
      </div>

      {/* Author Portfolio Banner Card */}
      <GlassCard className="p-6 border-slate-200/60 dark:border-slate-800/40 relative overflow-hidden">
        
        {/* Cover banner background */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/10 to-amber-500/10 border-b border-slate-150/50 dark:border-slate-800/30" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start pt-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 flex items-center justify-center shrink-0 shadow-md">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt={author.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-2xl text-primary uppercase">
                {author.name[0]}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-1.5 flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-white font-hindi">{author.name}</h2>
              {author.verification_badge && (
                <span className="text-[9px] bg-green-500/10 text-green-600 border border-green-200/40 px-2.5 py-0.5 rounded font-serif font-bold font-hindi">
                  {author.verification_badge}
                </span>
              )}
              
              {currentUser && author.id !== currentUser.id && (
                <button
                  onClick={toggleFollow}
                  className={`text-[9px] px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer font-hindi flex items-center gap-1 ${
                    isFollowing
                      ? "bg-green-600 text-white"
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
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> सदस्य बने: {author.joinDate || "२०२६"}</span>
            </div>
          </div>
        </div>

        {/* Stats details */}
        <div className="grid grid-cols-4 gap-4 text-center border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6 text-xs">
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
          <div>
            <span className="block font-black text-amber-500 font-mono flex items-center justify-center gap-0.5">
              ⭐ {repData.score}
            </span>
            <span className="text-[10px] text-slate-400 font-serif">साहित्यिक प्रतिष्ठा</span>
          </div>
        </div>

      </GlassCard>

      {/* Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR: Gamified widgets, Reputation card, Collections list */}
        <div className="md:col-span-4 space-y-6">
          
          {/* 1. ⭐ Literary Reputation Score (साहित्यिक प्रतिष्ठा) Card */}
          <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-150/60 dark:border-slate-850">
              <Trophy className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="text-xs font-bold font-hindi">⭐ साहित्यिक प्रतिष्ठा (Reputation Tier)</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-hindi block">वर्तमान स्तर</span>
                <span className="text-sm font-black text-amber-500 font-hindi">
                  {getTierHindiName(repData.tier)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-500">{repData.score} अंक</span>
                  <span className="text-slate-400">अगला स्तर: {repData.nextGoal} अंक</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${repData.percent}%` }} />
                </div>
              </div>

              {/* Achievements Trophies */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
                <span className="text-[9px] text-slate-400 font-hindi block font-bold">साहित्यिक उपलब्धियाँ:</span>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-200/35 px-2 py-0.5 rounded text-[9px] font-hindi">
                    <Sparkles className="w-3 h-3" />
                    <span>कलमवीर</span>
                  </div>
                  {authorPosts.length >= 3 && (
                    <div className="flex items-center gap-1 bg-purple-500/10 text-purple-650 border border-purple-200/35 px-2 py-0.5 rounded text-[9px] font-hindi">
                      <Trophy className="w-3 h-3" />
                      <span>शब्द शिल्पी</span>
                    </div>
                  )}
                  {author.verification_badge && (
                    <div className="flex items-center gap-1 bg-green-500/10 text-green-600 border border-green-200/35 px-2 py-0.5 rounded text-[9px] font-hindi">
                      <ShieldCheck className="w-3 h-3" />
                      <span>सत्यापित विद्वान</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Points calculation breakdown dropdown */}
              <details className="text-[10px] text-slate-400 font-hindi font-serif cursor-pointer select-none">
                <summary className="hover:text-primary transition-colors font-bold">प्रतिष्ठा अंकों की गणना प्रणाली देखें</summary>
                <ul className="mt-1.5 space-y-1 pl-3.5 list-disc text-[9px] text-slate-500 leading-normal">
                  <li>आधार अंक (नवोदित): १०० अंक</li>
                  <li>प्रति चौपाल पोस्ट योगदान: +१५ अंक</li>
                  <li>पोस्ट पर प्राप्त प्रति स्पंदन (Like): +५ अंक</li>
                  <li>संपादकीय प्रोफाइल सत्यापन: +१५० अंक</li>
                  <li>अकादमिक संस्थान संबद्धता: +५० अंक</li>
                  <li>प्रति अनुयायी (Follower): +१० अंक</li>
                </ul>
              </details>

            </div>
          </GlassCard>

          {/* 2. 📈 Profile Completion Meter (Interactive for self) */}
          <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-150/60 dark:border-slate-850">
              <Award className="w-4.5 h-4.5 text-primary" />
              <h3 className="text-xs font-bold font-hindi">📈 साहित्यिक परिचय पूर्णता (Profile Completeness)</h3>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-650 dark:text-slate-350 font-hindi">परिचय स्तर</span>
                  <span className="text-primary font-mono">{calculateProfileCompletion()}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${calculateProfileCompletion()}%` }} />
                </div>
              </div>

              {/* Checklist details */}
              <div className="space-y-2 text-[10px] font-hindi">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Check className={`w-3.5 h-3.5 ${author.avatar_url ? 'text-green-500' : 'text-slate-300'}`} />
                    <span>प्रोफ़ाइल चित्र (Profile Photo)</span>
                  </span>
                  <span className="text-slate-400 font-serif">+२०%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Check className={`w-3.5 h-3.5 ${author.bio ? 'text-green-500' : 'text-slate-300'}`} />
                    <span>परिचय जीवनी (Author Bio)</span>
                  </span>
                  <span className="text-slate-400 font-serif">+२०%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Check className={`w-3.5 h-3.5 ${author.location ? 'text-green-500' : 'text-slate-300'}`} />
                    <span>भौगोलिक अवस्थिति (Location)</span>
                  </span>
                  <span className="text-slate-400 font-serif">+२०%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Check className={`w-3.5 h-3.5 ${author.institution ? 'text-green-500' : 'text-slate-300'}`} />
                    <span>संबद्ध शैक्षणिक संस्थान (Institution)</span>
                  </span>
                  <span className="text-slate-400 font-serif">+२०%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Check className={`w-3.5 h-3.5 ${(author.expertise_tags && author.expertise_tags.length > 0) ? 'text-green-500' : 'text-slate-300'}`} />
                    <span>शोध एवं विशेषज्ञता क्षेत्र (Expertise Tags)</span>
                  </span>
                  <span className="text-slate-400 font-serif">+२०%</span>
                </div>
              </div>

              {/* Editing controls for profile owner */}
              {isSelf && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all cursor-pointer font-hindi"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>साहित्यिक विवरण संपादित करें</span>
                    </button>
                  ) : (
                    <form onSubmit={handleProfileSave} className="space-y-2.5 pt-1 text-[10px]">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-hindi font-serif">संक्षिप्त जीवनी (Bio)</label>
                        <textarea
                          value={editBio}
                          onChange={e => setEditBio(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-hindi"
                          rows={2}
                          placeholder="अपनी साहित्यिक यात्रा के बारे में लिखें..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-hindi font-serif">संबद्ध संस्थान (Institution)</label>
                        <input
                          type="text"
                          value={editInstitution}
                          onChange={e => setEditInstitution(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-hindi"
                          placeholder="उदा. दिल्ली विश्वविद्यालय"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-hindi font-serif">स्थान (Location)</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={e => setEditLocation(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-hindi"
                          placeholder="उदा. दिल्ली, भारत"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-hindi font-serif">विशेषज्ञता क्षेत्र (Expertise, अल्पविराम लगाएँ)</label>
                        <input
                          type="text"
                          value={editExpertise}
                          onChange={e => setEditExpertise(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-hindi"
                          placeholder="उदा. छायावाद, आलोचना, काव्य विमर्श"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl transition-all cursor-pointer font-hindi"
                        >
                          सहेजें (Save)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-500 rounded-xl transition-all cursor-pointer font-hindi"
                        >
                          रद्द
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          {/* 3. 📁 Literary Collections (साहित्यिक संग्रह) Card */}
          <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-150/60 dark:border-slate-850">
              <div className="flex items-center space-x-2">
                <BookMarked className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-xs font-bold font-hindi">📁 साहित्यिक संग्रह (Public Collections)</h3>
              </div>
              
              {isSelf && (
                <button
                  onClick={() => setShowNewCollectionForm(!showNewCollectionForm)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-primary transition-all cursor-pointer"
                  title="नया संग्रह जोड़ें"
                >
                  <FolderPlus className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Create new collection inline form */}
            {showNewCollectionForm && (
              <form onSubmit={handleAddCollection} className="space-y-2 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10px]">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  placeholder="संग्रह का नाम (उदा. श्रेष्ठ कविताएँ)"
                  className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg font-hindi"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg transition-all cursor-pointer font-hindi"
                  >
                    बनाएं
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCollectionForm(false)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-all cursor-pointer font-hindi"
                  >
                    रद्द
                  </button>
                </div>
              </form>
            )}

            {/* Folder Lists */}
            <div className="space-y-2">
              {collections.length > 0 ? (
                collections?.map(col => {
                  const isActive = activeCollectionId === col.id;
                  return (
                    <div key={col.id} className="space-y-1.5">
                      <div
                        onClick={() => setActiveCollectionId(isActive ? null : col.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 border-transparent text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="w-4.5 h-4.5 text-primary shrink-0" />
                          <span className="font-hindi truncate max-w-[150px]">{col.name}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="font-mono text-[9px] bg-slate-200/50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-full text-slate-500 font-bold">
                            {col.items?.length || 0}
                          </span>
                          {isSelf && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCollection(col.id);
                              }}
                              className="p-1 hover:text-red-500 rounded hover:bg-red-500/10 cursor-pointer"
                              title="संग्रह हटाएँ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-90 text-primary" : "text-slate-400"}`} />
                        </div>
                      </div>

                      {/* Display items inside collection */}
                      {isActive && (
                        <div className="pl-3.5 border-l-2 border-primary/20 space-y-2 pt-1 pb-2">
                          {col.items && col.items.length > 0 ? (
                            col.items?.map(item => (
                              <div key={item.id} className="flex justify-between items-center text-[10px] bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-150/40 dark:border-slate-850/40 font-hindi">
                                {item.url !== "#" ? (
                                  <Link href={item.url} className="text-slate-700 dark:text-slate-300 hover:text-primary transition-colors font-semibold truncate flex-1">
                                    {item.title}
                                  </Link>
                                ) : (
                                  <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{item.title}</span>
                                )}
                                
                                {isSelf && (
                                  <button
                                    onClick={() => handleRemoveItemFromCollection(col.id, item.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded cursor-pointer shrink-0"
                                    title="हटाएँ"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-[9px] text-slate-400 italic pl-1 font-hindi">इस संग्रह में अभी कोई रचना नहीं है।</p>
                          )}

                          {/* Add item to this collection helper */}
                          {isSelf && (
                            <div className="flex gap-1.5 pt-1.5 text-[9px] font-hindi">
                              <select
                                value={selectedItemToAdd}
                                onChange={e => setSelectedItemToAdd(e.target.value)}
                                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1 text-[9px]"
                              >
                                <option value="">रचना चुनें...</option>
                                <optgroup label="साहित्यिक लेख (Articles)">
                                  {articles.filter(a => a.author === author.name)?.map(a => (
                                    <option key={a.id} value={a.id}>{a.title}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="चौपाल पोस्ट्स (Posts)">
                                  {authorPosts?.map(p => (
                                    <option key={p.id} value={p.id}>{p.title || p.content.substring(0, 20) + "..."}</option>
                                  ))}
                                </optgroup>
                              </select>
                              <button
                                onClick={() => handleAddItemToCollection(col.id)}
                                className="px-2.5 py-1 bg-primary text-white font-bold rounded hover:bg-primary/95 transition-all cursor-pointer"
                              >
                                जोड़ें
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-400 font-hindi italic">कोई संग्रह उपलब्ध नहीं है।</p>
              )}
            </div>
          </GlassCard>

          {/* 🔒 4. Private Stats Section (ONLY visible to the profile owner) */}
          {isSelf && (
            <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 bg-slate-500/5 space-y-3">
              <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-150/60 dark:border-slate-850">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <h3 className="text-xs font-bold font-hindi">🔒 केवल आपके लिए दृश्यमान (Private Logs)</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150/40 dark:border-slate-850/40">
                  <span className="block text-[9px] text-slate-400 font-hindi">पढ़े गए लेख</span>
                  <span className="text-sm font-bold font-mono text-primary">{author.articlesReadCount || 12}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150/40 dark:border-slate-855/40">
                  <span className="block text-[9px] text-slate-400 font-hindi">कुल पठन समय</span>
                  <span className="text-sm font-bold font-mono text-primary">{author.totalReadingTime || 45} मि.</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-hindi italic leading-normal">युवाक्षर निजता गारंटी: आपके पठन आँकड़े पूरी तरह से निजी हैं और सार्वजनिक प्रोफ़ाइल पर अन्य पाठकों को कभी नहीं दिखाई देते हैं।</p>
            </GlassCard>
          )}

        </div>

        {/* RIGHT COLUMN: Showcase, Posts, Bio, Collaborations tabs */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
            {[
              { id: "showcase", name: "✨ विशेष रचनाएँ" },
              { id: "posts", name: "चौपाल पोस्ट्स" },
              { id: "info", name: "अकादमिक परिचय" },
              { id: "collab", name: "सह-लेखन" }
            ]?.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-hindi ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-950 text-slate-850 dark:text-white shadow-sm font-black"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content: Showcase (विशेष रचनाएँ) */}
          {activeTab === "showcase" && (
            <div className="space-y-6">
              
              {/* Description */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex items-center space-x-3 text-xs text-primary font-bold font-hindi">
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>विशेष रचनाएँ (Showcased Works): साहित्यकार द्वारा चुनिंदा एवं उत्कृष्ट कृतियों का प्रदर्शन।</span>
              </div>

              {/* Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Featured Article */}
                <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-3">
                    <span className="text-[8px] bg-blue-500/10 text-blue-600 border border-blue-200/35 px-2 py-0.5 rounded font-bold font-hindi inline-block">
                      ✍️ विशेष लेख (Editorial)
                    </span>
                    {showcase.featuredArticle ? (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-hindi text-slate-800 dark:text-white line-clamp-2">
                          {showcase.featuredArticle.title}
                        </h4>
                        <span className="block text-[9px] text-slate-400 font-serif">
                          श्रेणी: {showcase.featuredArticle.category} | {showcase.featuredArticle.readTime}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3 font-hindi leading-relaxed">
                          {showcase.featuredArticle.summary || showcase.featuredArticle.content?.substring(0, 100) + "..."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-hindi text-slate-800 dark:text-white">
                          हिन्दी आलोचना का विकास
                        </h4>
                        <span className="block text-[9px] text-slate-400 font-serif">
                          साहित्य समीक्षा | ६ मिनट पठन
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic font-hindi leading-relaxed">
                          समकालीन हिन्दी साहित्य और आलोचना के विभिन्न स्वरूपों तथा प्रमुख वैचारिक आंदोलनों की समीक्षा...
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {showcase.featuredArticle ? (
                    <Link href={`/editorial?id=${showcase.featuredArticle.id}`} className="block text-[10px] text-primary hover:underline font-bold font-hindi pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60">
                      आलेख पढ़ें →
                    </Link>
                  ) : (
                    <span className="block text-[9px] text-slate-400 italic pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 font-hindi">
                      आलेख प्रकाशन शीघ्र...
                    </span>
                  )}
                </GlassCard>

                {/* 2. Featured Poem */}
                <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-3">
                    <span className="text-[8px] bg-purple-500/10 text-purple-600 border border-purple-200/35 px-2 py-0.5 rounded font-bold font-hindi inline-block">
                      📝 उत्कृष्ट काव्य (Poetry)
                    </span>
                    {showcase.featuredPoem ? (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold font-hindi text-slate-800 dark:text-white truncate">
                          {showcase.featuredPoem.title || "काव्य रचना"}
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-900/65 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 italic text-center font-hindi whitespace-pre-line leading-relaxed">
                            {showcase.featuredPoem.content.substring(0, 100)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold font-hindi text-slate-800 dark:text-white truncate">
                          वसन्त का स्वर
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-900/65 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 italic text-center font-hindi whitespace-pre-line leading-relaxed">
                            "शब्दों के इस मरुस्थल में, संवेदना की बूँद हूँ मैं,<br/>
                            मौन की इस मुखर सभा में, मौन का ही स्वर हूँ मैं..."
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {showcase.featuredPoem ? (
                    <Link href={`/community/discussion/thread/${showcase.featuredPoem.id}`} className="block text-[10px] text-primary hover:underline font-bold font-hindi pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60">
                      पूर्ण कविता और चर्चा देखें →
                    </Link>
                  ) : (
                    <span className="block text-[9px] text-slate-400 italic pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 font-hindi">
                      काव्य सृजन संग्रह...
                    </span>
                  )}
                </GlassCard>

                {/* 3. Featured Discussion */}
                <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-3">
                    <span className="text-[8px] bg-amber-500/10 text-amber-600 border border-amber-200/35 px-2 py-0.5 rounded font-bold font-hindi inline-block">
                      💭 शीर्ष चर्चा (Discussion)
                    </span>
                    {showcase.featuredDiscussion ? (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold font-hindi text-slate-800 dark:text-white line-clamp-2">
                          {showcase.featuredDiscussion.title || "साहित्यिक विमर्श"}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3 font-hindi leading-relaxed">
                          {showcase.featuredDiscussion.content}
                        </p>
                        <div className="text-[9px] text-slate-400 font-serif flex items-center gap-1.5 pt-1.5">
                          <span>💬 {showcase.featuredDiscussion.commentsCount || 4} टिप्पणियाँ</span>
                          <span>•</span>
                          <span>❤️ {showcase.featuredDiscussion.likesCount || 8} स्पंदन</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold font-hindi text-slate-800 dark:text-white">
                          क्या आज की पीढ़ी साहित्य से दूर हो रही है?
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-hindi leading-relaxed">
                          समकालीन डिजिटल युग में युवा वर्ग की साहित्य और पुस्तक पठन में रुचि पर एक गंभीर वैचारिक बहस...
                        </p>
                        <div className="text-[9px] text-slate-400 font-serif flex items-center gap-1.5 pt-1.5">
                          <span>💬 १२ टिप्पणियाँ</span>
                          <span>•</span>
                          <span>❤️ २५ स्पंदन</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {showcase.featuredDiscussion ? (
                    <Link href={`/community/discussion/thread/${showcase.featuredDiscussion.id}`} className="block text-[10px] text-primary hover:underline font-bold font-hindi pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60">
                      चर्चा में भाग लें →
                    </Link>
                  ) : (
                    <span className="block text-[9px] text-slate-400 italic pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 font-hindi">
                      चर्चा प्रारंभ शीघ्र...
                    </span>
                  )}
                </GlassCard>

              </div>
            </div>
          )}

          {/* Tab Content: Posts */}
          {activeTab === "posts" && (
            <div className="space-y-4 max-w-[800px]">
              {authorPosts.length > 0 ? (
                authorPosts?.map(p => (
                  <PostCard 
                    key={p.id} 
                    post={p} 
                    authorProfile={users.find(u => u.id === p.user_id) || author}
                    currentUser={currentUser}
                    isBookmarked={bookmarkedPostIds.includes(p.id)}
                    onLike={handleLikePost}
                    onBookmark={handleBookmarkToggle}
                    onShare={triggerShare}
                    onPollVote={(pid, optIdx) => {
                      setAuthorPosts(authorPosts?.map(p2 => {
                        if (p2.id === pid && p2.poll_options) {
                          const updatedOps = [...p2.poll_options] as any[];
                          updatedOps[optIdx].votes = (updatedOps[optIdx].votes || 0) + 1;
                          return { ...p2, poll_options: updatedOps };
                        }
                        return p2;
                      }));
                    }}
                    renderContentWithHashtags={renderContentWithHashtags}
                  />
                ))
              ) : (
                <p className="text-center py-10 text-xs text-slate-450 font-hindi border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">इस लेखक ने अभी चौपाल पर कोई पोस्ट साझा नहीं की है।</p>
              )}
            </div>
          )}

          {/* Tab Content: Info & Biography */}
          {activeTab === "info" && (
            <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-5 text-xs font-hindi">
              
              {/* Bio */}
              <div className="space-y-2 border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-white">जीवनी (Biography)</h3>
                <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-serif">
                  {author.bio || "सृजनात्मक विचारक और लेखक। भाषा विमर्श, आलोचनात्मक गद्य लेखन और शिक्षा से जुड़ाव। साहित्य विमर्श और पत्र-पत्रिकाओं में आलेख प्रकाशन।"}
                </p>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-xs text-primary">शोध एवं विशेषज्ञता क्षेत्र</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(author.expertise_tags || ["हिंदी आलोचना", "निराला साहित्य", "छायावाद"])?.map((t: string) => (
                      <span key={t} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-xs text-primary">संबद्ध संस्थान</h4>
                  <p className="text-slate-550 flex items-center gap-1.5 font-hindi">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{author.institution || "स्वतंत्र शोधकर्ता"}</span>
                  </p>
                </div>

                {author.orcid_id && (
                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-xs text-primary">ORCID ID</h4>
                    <p className="text-slate-500 font-mono">{author.orcid_id}</p>
                  </div>
                )}

                {author.academic_background && (
                  <div className="space-y-1.5 md:col-span-2">
                    <h4 className="font-serif font-bold text-xs text-primary">अकादमिक पृष्ठभूमि</h4>
                    <p className="text-slate-500 font-serif leading-relaxed">{author.academic_background}</p>
                  </div>
                )}

              </div>
            </GlassCard>
          )}

          {/* Tab Content: Co-author Collaboration Invitation Form */}
          {activeTab === "collab" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Form */}
              <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
                <h3 className="font-serif text-sm font-bold text-slate-850 dark:text-white font-hindi">सह-लेखन आमंत्रण भेजें</h3>
                
                <form onSubmit={handleCollabSubmit} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-serif font-hindi block">परियोजना का शीर्षक (Project Title)</label>
                    <input 
                      type="text"
                      value={collabTitle}
                      onChange={(e) => setCollabTitle(e.target.value)}
                      placeholder="जैसे: कबीर के दोहे और सामाजिक चेतना"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-hindi"
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
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary resize-none font-hindi"
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
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-hindi"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer font-hindi flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>आमंत्रण भेजें</span>
                  </button>
                </form>
              </GlassCard>

              {/* Current sent requests status */}
              <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
                <h3 className="font-serif text-sm font-bold text-slate-850 dark:text-white font-hindi">आमंत्रण स्थिति (Collaboration Status)</h3>
                
                <div className="space-y-3.5">
                  {collabInvites?.map((invite) => (
                    <div key={invite.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-150/40 dark:border-slate-850/40 space-y-2 text-xs">
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

      </div>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  BarChart2, 
  Link as LinkIcon, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  FileEdit, 
  Check, 
  AlertCircle
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  fetchPosts, 
  createPost, 
  toggleLikePost, 
  CommunityPost, 
  fetchGroups, 
  CommunityGroup 
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";

export default function CommunityFeedPage() {
  const { currentUser, loginUser, supabaseConfigured } = useCms();
  
  // State variables
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [activeTab, setActiveTab] = useState<"for-you" | "trending" | "latest">("for-you");
  const [loading, setLoading] = useState(true);
  
  // Composer states
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<CommunityPost["post_type"]>("text");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  
  // Poll composer states
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  
  // Attachment state simulation
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Load posts and groups
  const loadFeedData = async () => {
    setLoading(true);
    try {
      const allPosts = await fetchPosts();
      setPosts(allPosts);
      const allGroups = await fetchGroups();
      setGroups(allGroups);
    } catch (err) {
      console.error("Error loading feed data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedData();
  }, []);

  // Handle post submit
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("पोस्ट करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    if (!content.trim() && postType !== "poll") return;

    try {
      const extraData: Partial<CommunityPost> = {};
      if (selectedGroup) {
        const groupObj = groups.find(g => g.id === selectedGroup);
        if (groupObj) {
          extraData.group_id = groupObj.id;
          extraData.group_name = groupObj.name;
        }
      }

      if (postType === "poll") {
        extraData.poll_question = pollQuestion;
        extraData.poll_options = pollOptions.filter(o => o.trim() !== "");
        extraData.poll_votes = {};
      }

      if (postType === "link") {
        extraData.link_url = linkUrl;
      }

      if (attachedFile) {
        extraData.media_url = attachedFile;
      }

      if (title.trim()) {
        extraData.title = title;
      }

      const newPost = await createPost(
        currentUser.id,
        currentUser.name || "लेखक",
        content,
        postType,
        extraData
      );

      setPosts([newPost, ...posts]);
      
      // Reset composer states
      setContent("");
      setTitle("");
      setLinkUrl("");
      setSelectedGroup("");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setAttachedFile(null);
      setPostType("text");
      
      alert("आपकी पोस्ट सफलतापूर्वक साझा कर दी गई है और आपको +5 प्रतिष्ठा अंक मिले हैं!");
    } catch (err) {
      console.error("Error submitting post:", err);
    }
  };

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  // Handle Poll Vote
  const handlePollVote = (postId: string, optionIdx: number) => {
    if (!currentUser) {
      alert("मतदान करने के लिए कृपया लॉगिन करें।");
      return;
    }
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const votes = { ...(p.poll_votes || {}) };
        votes[currentUser.id] = optionIdx;
        return { ...p, poll_votes: votes };
      }
      return p;
    }));
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
      setPosts(posts.map(p => {
        if (p.id === postId) return { ...p, likesCount: newCount };
        return p;
      }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Convert post to article
  const convertPostToArticle = (post: CommunityPost) => {
    alert(`पोस्ट '${post.title || "बिना शीर्षक की पोस्ट"}' को सफलतापूर्वक लेख ड्राफ्ट में बदल दिया गया है!\nसंपादकीय टीम द्वारा समीक्षा के बाद इसे प्रकाशित किया जाएगा।`);
  };

  return (
    <div className="space-y-6">
      
      {/* ─── POST COMPOSER WIDGET ─── */}
      {currentUser ? (
        <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
          <form onSubmit={handlePostSubmit} className="space-y-4">
            
            {/* Title (for discussions/resources) */}
            {(postType === "discussion" || postType === "resource") && (
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="शीर्षक दर्ज करें..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-bold font-hindi"
                required
              />
            )}

            {/* Content Textarea */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${currentUser.name}, आज आप क्या विचार साझा करना चाहते हैं? विचारों को आवाज़ दीजिए...`}
                rows={3}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-foreground pl-4 focus:outline-none focus:border-primary resize-none font-hindi"
                required={postType !== "poll"}
              />
            </div>

            {/* Poll Composer Area */}
            {postType === "poll" && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                <input 
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="अपना मतदान प्रश्न यहाँ लिखें..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-bold font-hindi"
                  required
                />
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <input 
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      placeholder={`विकल्प ${idx + 1}`}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-hindi"
                      required
                    />
                  ))}
                </div>
                {pollOptions.length < 6 && (
                  <button 
                    type="button" 
                    onClick={addPollOption}
                    className="text-[10px] text-primary hover:text-primary/95 font-bold flex items-center space-x-1 cursor-pointer font-hindi"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>विकल्प जोड़ें</span>
                  </button>
                )}
              </div>
            )}

            {/* Link Attachment Area */}
            {postType === "link" && (
              <input 
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/shared-link"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                required
              />
            )}

            {/* Simulating File attachments */}
            {attachedFile && (
              <div className="flex items-center space-x-2 p-2 bg-green-500/10 text-green-600 rounded-xl border border-green-200/50 text-[10px]">
                <Check className="w-4 h-4 shrink-0" />
                <span>फ़ाइल अटैच हो गई: {attachedFile}</span>
                <button type="button" onClick={() => setAttachedFile(null)} className="ml-auto text-red-500 hover:text-red-600 font-bold">हटाएं</button>
              </div>
            )}

            {/* Footer row: selectors, group target, submit */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              
              {/* Post format selectors */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPostType("text")}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${postType === "text" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-500"}`}
                  title="Text Post"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostType("image");
                    setAttachedFile("cover_art.png");
                  }}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${postType === "image" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-500"}`}
                  title="Image Post"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostType("pdf");
                    setAttachedFile("study_materials_hindi.pdf");
                  }}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${postType === "pdf" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-500"}`}
                  title="PDF Document"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("poll")}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${postType === "poll" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-500"}`}
                  title="Create Poll"
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("link")}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${postType === "link" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-500"}`}
                  title="Share Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Group target Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 font-serif font-hindi">पोस्ट का समूह:</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-foreground focus:outline-none cursor-pointer font-hindi"
                >
                  <option value="">मुख्य चौपाल (Main feed)</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-4.5 py-1.8 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer font-hindi"
                >
                  <span>साझा करें</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </form>
        </GlassCard>
      ) : (
        <div className="bg-orange-50/60 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-950/20 p-5 rounded-2xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold font-serif text-slate-800 dark:text-white font-hindi">साहित्यिक विमर्श में भाग लें!</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-serif">
              विचारों को आवाज़ देने और साथी लेखकों से संवाद स्थापित करने के लिए कृपया लॉगिन करें।
            </p>
            <button 
              onClick={() => loginUser("yuvakshar.editor@gmail.com", "Admin")}
              className="text-[10px] text-primary hover:text-primary/95 font-bold cursor-pointer font-hindi"
            >
              यहाँ क्लिक करके तुरंत लॉगिन करें →
            </button>
          </div>
        </div>
      )}

      {/* ─── FEED TABS ─── */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
        {[
          { id: "for-you", name: "आपके लिए" },
          { id: "trending", name: "चर्चित" },
          { id: "latest", name: "नवीनतम" }
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

      {/* ─── FEED POSTS LIST ─── */}
      <div className="space-y-5">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-serif animate-pulse">
            फ़ीड लोड की जा रही है... कृपया प्रतीक्षा करें।
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const hasVoted = post.poll_votes && currentUser && currentUser.id in post.poll_votes;
            const voteTotal = post.poll_votes ? Object.keys(post.poll_votes).length : 0;
            
            return (
              <GlassCard key={post.id} className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
                
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 uppercase shrink-0">
                      {post.user_name ? post.user_name[0] : "U"}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/community/profile/${post.user_id}`} className="text-xs font-bold text-slate-800 dark:text-white hover:text-primary font-hindi">
                          {post.user_name}
                        </Link>
                        {post.user_rank && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold font-serif">
                            {post.user_rank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-0.5">
                        <span className="font-mono">{new Date(post.created_at).toLocaleDateString("hi-IN")}</span>
                        {post.group_name && (
                          <>
                            <span>•</span>
                            <Link href={`/community/group/${post.group_id}`} className="text-primary hover:underline font-hindi font-semibold">
                              {post.group_name}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Title (if discussion) */}
                {post.title && (
                  <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi">
                    {post.title}
                  </h3>
                )}

                {/* Post Content */}
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-hindi whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Post type rendering: Poll */}
                {post.post_type === "poll" && post.poll_question && post.poll_options && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-850/80 space-y-2.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-300 font-serif font-hindi">{post.poll_question}</p>
                    <div className="space-y-2">
                      {post.poll_options.map((opt, idx) => {
                        // Count votes for this option
                        const optVotes = post.poll_votes 
                          ? Object.values(post.poll_votes).filter(v => v === idx).length 
                          : 0;
                        const percent = voteTotal > 0 ? Math.round((optVotes / voteTotal) * 100) : 0;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePollVote(post.id, idx)}
                            disabled={!!hasVoted}
                            className="w-full relative flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs transition-all overflow-hidden bg-white dark:bg-slate-950 cursor-pointer disabled:cursor-default"
                          >
                            {/* Visual progress bar fill background */}
                            <div 
                              className="absolute top-0 left-0 bottom-0 bg-primary/10 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                            
                            <span className="relative z-10 font-hindi">{opt}</span>
                            <span className="relative z-10 font-bold font-mono text-[10px] text-slate-400">
                              {percent}% ({optVotes})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono">कुल मत: {voteTotal}</p>
                  </div>
                )}

                {/* Post type rendering: Image attachment */}
                {post.post_type === "image" && post.media_url && (
                  <div className="relative h-[250px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
                      [छवि फाइल: {post.media_url}]
                    </div>
                  </div>
                )}

                {/* Post type rendering: PDF attachment */}
                {post.post_type === "pdf" && post.media_url && (
                  <div className="flex items-center space-x-3 p-3 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-200/50 text-xs text-red-500 transition-all cursor-pointer">
                    <FileText className="w-5 h-5 shrink-0 text-red-500" />
                    <div className="min-w-0">
                      <span className="block font-bold font-mono truncate">{post.media_url}</span>
                      <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">PDF दस्तावेज़ पठन</span>
                    </div>
                  </div>
                )}

                {/* Post Footer: Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-150/40 dark:border-slate-800/40">
                  <div className="flex items-center space-x-6">
                    
                    {/* Likes */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="font-mono text-[10px] font-bold">{post.likesCount}</span>
                    </button>

                    {/* Comments */}
                    <Link
                      href={`/community/discussions/thread/${post.id}`}
                      className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-primary transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-mono text-[10px] font-bold">{post.commentsCount}</span>
                    </Link>

                    {/* Bookmark */}
                    <button className="text-slate-400 hover:text-primary transition-all cursor-pointer">
                      <Bookmark className="w-4 h-4" />
                    </button>

                  </div>

                  {/* Convert Post to Article Draft (Admin/Authors/Contributors only) */}
                  {currentUser && ["Admin", "Owner", "Editor", "Author", "Contributor"].includes(currentUser.role || "") && (
                    <button
                      onClick={() => convertPostToArticle(post)}
                      className="text-[10px] text-primary hover:text-primary/95 font-bold flex items-center space-x-1 cursor-pointer font-hindi"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>लेख में बदलें (Convert to Article)</span>
                    </button>
                  )}

                </div>

              </GlassCard>
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

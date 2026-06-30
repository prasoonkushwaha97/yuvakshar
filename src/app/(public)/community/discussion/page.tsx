"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Pin,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { fetchPosts, createPost, CommunityPost } from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categories = [
  { id: "General", name: "सामान्य विमर्श (General Discussion)", desc: "साहित्य और समाज से जुड़े किसी भी सामान्य विषय पर चर्चा।" },
  { id: "Writing Help", name: "लेखन सहायता (Writing Help)", desc: "व्याकरण, शैली, छंद और शब्दों के चयन पर मार्गदर्शन।" },
  { id: "Criticism", name: "साहित्यिक आलोचना (Literary Criticism)", desc: "साहित्यिक रचनाओं, आलोचनाओं और सिद्धांतों पर बौद्धिक बहस।" },
  { id: "Publishing", name: "प्रकाशन एवं मुद्रण (Publishing)", desc: "किताबों के प्रकाशन, कॉपीराइट और रॉयल्टी से जुड़े प्रश्न।" },
  { id: "Magazine", name: "पत्रिका विमर्श (Magazine Discussion)", desc: "युवाक्षर के नए अंकों और संपादकीय नीतियों पर चर्चा।" },
  { id: "Research", name: "शोध विमर्श (Research Discussion)", desc: "शोध पत्रिकाओं, संदर्भों और अकादमिक लेखों पर विमर्श।" }
];

export default function ForumBoardPage() {
  const { currentUser } = useCms();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("General");
  const [loading, setLoading] = useState(true);
  
  // Composer states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      const allPosts = await fetchPosts();
      // Filter to posts that have forum_category defined
      const discussions = allPosts.filter(p => p.post_type === "discussion" || p.forum_category);
      setPosts(discussions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  useEffect(() => {
    const articleId = searchParams?.get("articleId");
    const articleTitle = searchParams?.get("title");
    if (articleId && articleTitle) {
      setSelectedCat("Criticism");
      setTitle(`चर्चा: ${articleTitle}`);
      setContent(`मैंने अभी युवाक्षर पर यह लेख पढ़ा: "${articleTitle}"\n\nइस पर मेरे विचार हैं:\n\n`);
      setShowComposer(true);
    }
  }, [searchParams]);

  const handleSubmitThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !content.trim()) return;

    try {
      const newThread = await createPost(
        currentUser.id,
        currentUser.name || "लेखक",
        content,
        "discussion",
        {
          title,
          forum_category: selectedCat as any
        }
      );
      setPosts([newThread, ...posts]);
      setTitle("");
      setContent("");
      setShowComposer(false);
      alert("नया चर्चा सूत्र सफलतापूर्वक शुरू कर दिया गया है!");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPosts = posts.filter(p => p.forum_category === selectedCat);

  return (
    <div className="space-y-6">
      
      {/* Forum categories list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCat(cat.id);
              setShowComposer(false);
            }}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[100px] ${
              selectedCat === cat.id
                ? "bg-primary/5 border-primary shadow-sm"
                : "bg-white dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/20"
            }`}
          >
            <div>
              <h4 className="text-xs font-bold font-serif text-slate-800 dark:text-white font-hindi">{cat.name}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-hindi line-clamp-2 leading-relaxed">{cat.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Control bar: Create button */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-serif text-sm font-black text-slate-800 dark:text-white font-hindi">
          चर्चा धागे (Threads) - {categories.find(c => c.id === selectedCat)?.name.split(" ")[0]}
        </h3>
        
        {currentUser && (
          <button
            onClick={() => setShowComposer(!showComposer)}
            className="bg-primary hover:bg-primary/95 text-white px-3.5 py-1.8 rounded-xl text-[10px] font-bold transition-all shadow-md flex items-center space-x-1 cursor-pointer font-hindi"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नयी चर्चा शुरू करें</span>
          </button>
        )}
      </div>

      {/* Composer modal/card */}
      {showComposer && currentUser && (
        <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
          <form onSubmit={handleSubmitThread} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-serif font-hindi block">चर्चा का विषय/शीर्षक (Thread Title)</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="विषय का मुख्य सारांश..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary font-hindi"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-serif font-hindi block">विस्तृत विचार/प्रश्न (Thread Description)</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="चर्चा शुरू करने के लिए अपना विस्तृत प्रस्ताव या प्रश्न यहाँ लिखें..."
                rows={4}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-primary resize-none font-hindi"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white px-4.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer font-hindi"
            >
              धागा पोस्ट करें (Publish Thread)
            </button>
          </form>
        </GlassCard>
      )}

      {/* Threads listing */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
            चर्चा सूत्र लोड हो रहे हैं...
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts?.map((post) => (
            <GlassCard key={post.id} className="p-4 border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between gap-4">
              
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  
                  {/* Pinned / Solved status badges */}
                  {post.is_pinned && (
                    <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-200/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 font-hindi shrink-0">
                      <Pin className="w-2.5 h-2.5" /> पिन
                    </span>
                  )}
                  {post.is_solved && (
                    <span className="text-[8px] bg-green-500/10 text-green-600 border border-green-200/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 font-hindi shrink-0">
                      <CheckCircle className="w-2.5 h-2.5" /> हल हुआ
                    </span>
                  )}

                  <Link href={`/community/discussion/thread/${post.id}`} className="font-serif text-xs font-bold text-slate-800 dark:text-white hover:text-primary truncate font-hindi">
                    {post.title}
                  </Link>
                </div>

                <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-serif">
                  <span className="font-hindi">{post.user_name}</span>
                  <span>•</span>
                  <span className="font-mono">{new Date(post.created_at).toLocaleDateString("hi-IN")}</span>
                </div>
              </div>

              {/* Replies counts and navigation */}
              <div className="flex items-center space-x-4 shrink-0 text-xs">
                <div className="text-center font-mono">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">{post.commentsCount || 0}</span>
                  <span className="text-[9px] text-slate-400 font-serif">उत्तर</span>
                </div>
                
                <Link 
                  href={`/community/discussion/thread/${post.id}`}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-primary hover:text-white transition-all text-slate-400 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </GlassCard>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs">
            इस श्रेणी में फ़िलहाल कोई सक्रीय चर्चा नहीं है।
          </div>
        )}
      </div>

    </div>
  );
}

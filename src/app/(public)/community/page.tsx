"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FeedTabs from "@/components/chaupal/feed/FeedTabs";
import FeedCard from "@/components/chaupal/feed/FeedCard";
import SkeletonLoader from "@/components/chaupal/shared/SkeletonLoader";
import { useCms } from "@/store/CmsContext";
import { getFeedPosts } from "@/lib/actions/chaupalFeedActions";
import { useInView } from "react-intersection-observer";
import { Loader2, RefreshCw, X } from "lucide-react";
import PostComposer from "@/components/chaupal/feed/PostComposer";
import { motion, AnimatePresence } from "framer-motion";

export default function ChaupalFeedPage() {
  const { currentUser, authLoading } = useCms();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const isComposing = searchParams?.get("compose") === "true";
  
  const [activeTab, setActiveTab] = useState<"for-you" | "latest" | "trending" | "following" | "groups">("latest");
  const [posts, setPosts] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  const fetchPosts = async (cursor?: string) => {
    try {
      const fetchedPosts = await getFeedPosts(cursor, 20, activeTab);
      if (fetchedPosts.length < 20) {
        setHasNextPage(false);
      } else {
        setHasNextPage(true);
      }
      return fetchedPosts;
    } catch (err) {
      console.error("Failed to load feed:", err);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function initialLoad() {
      setIsLoading(true);
      setHasNextPage(true);
      const data = await fetchPosts();
      if (isMounted) {
        setPosts(data);
        setIsLoading(false);
      }
    }

    initialLoad();

    return () => { isMounted = false; };
  }, [activeTab]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      loadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isLoading]);

  const loadMore = async () => {
    if (posts.length === 0) return;
    setIsFetchingNextPage(true);
    const lastPost = posts[posts.length - 1];
    const data = await fetchPosts(lastPost.timestamp);
    setPosts(prev => [...prev, ...data]);
    setIsFetchingNextPage(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setHasNextPage(true);
    const data = await fetchPosts();
    setPosts(data);
    setIsRefreshing(false);
  };

  const closeComposer = () => {
    if (pathname) {
      router.push(pathname, { scroll: false }); // removes query params
    } else {
      router.push('/community', { scroll: false });
    }
  };

  const handlePostCreated = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
    closeComposer();
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      <AnimatePresence>
        {isComposing && currentUser && (
          <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-white sm:bg-slate-900/50 sm:backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full h-full sm:h-auto sm:max-w-2xl bg-white dark:bg-[#0F172A] sm:rounded-2xl sm:shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold">नई चर्चा</h2>
                <button onClick={closeComposer} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-0">
                <PostComposer 
                  currentUser={currentUser} 
                  onPostCreated={handlePostCreated}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="sticky top-[52px] lg:top-0 z-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md px-4 sm:px-6 pt-2">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="px-0 sm:px-6 pt-2 pb-6">
        {/* Pull to refresh (desktop view refresh button) */}
        <div className="hidden lg:flex justify-end mb-4">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 text-sm font-bold text-[#f97316] hover:bg-[#f97316]/10 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            रिफ्रेश करें
          </button>
        </div>

        {/* Feed Stream */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <SkeletonLoader type="feed-card" count={3} />
          ) : posts.length > 0 ? (
            <>
              {posts.map((post, i) => (
                <FeedCard key={`${post.id}-${i}`} post={post} onDelete={handleDeletePost} />
              ))}
              
              {/* Infinite Scroll Trigger */}
              {hasNextPage && (
                <div ref={ref} className="py-8 flex justify-center">
                  {isFetchingNextPage ? (
                    <Loader2 className="w-6 h-6 text-[#f97316] animate-spin" />
                  ) : null}
                </div>
              )}

              {!hasNextPage && (
                <div className="text-center py-12 text-slate-500 text-sm font-medium">
                  आप अंत तक पहुँच गए हैं।
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mt-4">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">अभी तक कोई चर्चा नहीं</h3>
              <p className="text-slate-500">चर्चा की शुरुआत करने वाले पहले व्यक्ति बनें।</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

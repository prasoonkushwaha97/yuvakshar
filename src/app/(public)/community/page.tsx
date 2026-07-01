"use client";

import React, { useState, useEffect } from "react";
import ChaupalPageHeader from "@/components/chaupal/layout/ChaupalPageHeader";
import FeedTabs from "@/components/chaupal/feed/FeedTabs";
import PostComposer from "@/components/chaupal/feed/PostComposer";
import FeedCard from "@/components/chaupal/feed/FeedCard";
import SkeletonLoader from "@/components/chaupal/shared/SkeletonLoader";
import { useCms } from "@/store/CmsContext";
import { getFeedPosts } from "@/lib/actions/chaupalFeedActions";

export default function ChaupalFeedPage() {
  const { currentUser, authLoading } = useCms();
  const [activeTab, setActiveTab] = useState<"for-you" | "latest" | "trending" | "following" | "groups">("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    async function loadPosts() {
      setIsLoading(true);
      try {
        const fetchedPosts = await getFeedPosts(1, 20, activeTab);
        if (isMounted) {
          setPosts(fetchedPosts);
        }
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPosts();

    return () => { isMounted = false; };
  }, [activeTab]);

  return (
    <>
      {/* Mobile Top Header (hidden on Desktop since Desktop has Sidebar) */}
      <div className="lg:hidden">
        <ChaupalPageHeader title="चौपाल" />
      </div>

      {/* Tabs */}
      <div className="sticky top-14 lg:top-0 z-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md px-4 sm:px-6">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="px-0 sm:px-6 py-6">
        {/* Post Composer - Visible only for logged in users */}
        {authLoading ? (
          <div className="mb-6">
            <div className="p-4 sm:p-6 flex items-center gap-4 animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
          </div>
        ) : currentUser ? (
          <PostComposer 
            currentUser={{
              id: currentUser.id,
              name: currentUser.name || "लेखक",
              avatarUrl: currentUser.avatar_url,
            }}
            onPostCreated={(newPost) => setPosts([newPost, ...posts])}
          />
        ) : (
          <div className="px-4 mb-6 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center">
            चौपाल में विचार साझा करने के लिए कृपया लॉगिन करें।
          </div>
        )}

        {/* Feed Stream */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <SkeletonLoader type="feed-card" count={3} />
          ) : posts.length > 0 ? (
            posts.map(post => (
              <FeedCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              कोई पोस्ट नहीं मिली।
            </div>
          )}
        </div>
      </div>
    </>
  );
}

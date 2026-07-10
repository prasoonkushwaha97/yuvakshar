"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchChaupal } from "@/lib/actions/chaupalSearchActions";
import FeedCard from "@/components/chaupal/feed/FeedCard";
import SkeletonLoader from "@/components/chaupal/shared/SkeletonLoader";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import JoinGroupButton from "@/components/chaupal/shared/JoinGroupButton";
import Avatar from "@/components/shared/Avatar";

export default function ChaupalSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams?.get("q") || "";
  const tabParam = searchParams?.get("tab") as 'discussions' | 'users' | 'groups' | null;
  const initialTab = tabParam || "discussions";

  const [activeTab, setActiveTab] = useState<'discussions' | 'users' | 'groups'>(initialTab);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(q);

  useEffect(() => {
    if (q) {
      setSearchTerm(q);
      performSearch(q, activeTab);
    }
  }, [q, activeTab]);

  const performSearch = async (query: string, tab: 'discussions' | 'users' | 'groups') => {
    setIsLoading(true);
    setResults([]);
    try {
      const data = await searchChaupal(query, tab);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/community/search?q=${encodeURIComponent(searchTerm)}&tab=${activeTab}`);
  };

  const handleTabChange = (tab: 'discussions' | 'users' | 'groups') => {
    setActiveTab(tab);
    router.push(`/community/search?q=${encodeURIComponent(searchTerm)}&tab=${tab}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center p-4 gap-3">
          <Link href="/community" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </Link>
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="चौपाल पर खोजें..."
              className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-shadow"
            />
          </form>
        </div>
        
        {/* Search Tabs */}
        <div className="flex border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'discussions', label: 'चर्चा' },
            { id: 'users', label: 'लोग' },
            { id: 'groups', label: 'समूह' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-[#f97316] text-[#f97316]' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 p-4 sm:p-6 bg-slate-50 dark:bg-transparent">
        {isLoading ? (
          <SkeletonLoader type="feed-card" count={3} />
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeTab === 'discussions' && results.map((post, i) => (
              <FeedCard key={`${post.id}-${i}`} post={post} />
            ))}

            {activeTab === 'users' && results.map((user) => (
              <div key={user.id} className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 relative shrink-0">
                    <Avatar url={user.avatar_url} alt={user.name} className="w-full h-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      {user.name}
                    </h4>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                    <p className="text-xs text-slate-400">{user.public_identity || user.role}</p>
                  </div>
                </div>

              </div>
            ))}

            {activeTab === 'groups' && results.map((group) => (
              <div key={group.id} className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 relative shrink-0">
                    <Avatar url={group.avatar_url} alt={group.name} className="w-full h-full rounded-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      {group.name}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{group.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{group.is_private ? 'प्राइवेट' : 'पब्लिक'} समूह</p>
                  </div>
                </div>
                <JoinGroupButton groupId={group.id} />
              </div>
            ))}
          </div>
        ) : q ? (
          <div className="text-center py-16 text-slate-500">
            कोई परिणाम नहीं मिला।
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            खोजने के लिए ऊपर टाइप करें।
          </div>
        )}
      </div>
    </div>
  );
}

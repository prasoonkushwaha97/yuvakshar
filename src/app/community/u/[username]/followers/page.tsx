"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, UserPlus, UserCheck } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import type { Profile } from "@/store/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { isUserFollowing, toggleFollowUser } from "@/lib/communityService";

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { users, currentUser } = useCms();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Local follow state tracking (targetUserId -> isFollowing)
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      let match = users.find((u: Profile) => u.slug === username || u.id === username);
      if (!match && currentUser && (currentUser.slug === username || currentUser.id === username)) {
          match = currentUser;
      }
      
      if (match) {
        setProfile(match);
        // Find actual profiles from the followers list
        const followerIds = match.followers || [];
        const followerProfiles = users.filter((u: Profile) => followerIds.includes(u.id));
        setFollowers(followerProfiles);

        if (currentUser) {
          const initialFollowStates: Record<string, boolean> = {};
          followerProfiles.forEach((f: Profile) => {
            initialFollowStates[f.id] = isUserFollowing(currentUser.id, f.id);
          });
          setFollowStates(initialFollowStates);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [username, users, currentUser]);

  const handleToggleFollow = async (targetUserId: string) => {
    if (!currentUser) return;
    const isNowFollowing = await toggleFollowUser(currentUser.id, targetUserId);
    setFollowStates(prev => ({ ...prev, [targetUserId]: isNowFollowing }));
  };

  const filteredFollowers = followers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (f.slug && f.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-500 font-serif">लोड हो रहा है...</div>;
  if (!profile) return <div className="text-center py-20 font-hindi">खाता नहीं मिला।</div>;

  return (
    <div className="max-w-[600px] mx-auto w-full bg-white dark:bg-[#070B14] rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[80vh]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#070B14]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white font-hindi">{profile.name}</h1>
          <p className="text-xs text-slate-500">@{profile.slug || profile.id}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <div className="flex-1 text-center py-3 border-b-2 border-primary font-bold text-slate-900 dark:text-white font-hindi text-sm">फ़ॉलोअर्स</div>
        <Link href={`/community/u/${username}/following`} className="flex-1 text-center py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-hindi text-sm">फ़ॉलोइंग</Link>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="फ़ॉलोअर्स खोजें..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors font-hindi text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {filteredFollowers.length > 0 ? (
          filteredFollowers.map(f => (
            <div key={f.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
              <Link href={`/community/u/${f.slug || f.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                  {f.avatar_url ? <img src={f.avatar_url} alt={f.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="truncate pr-4">
                  <div className="font-bold text-sm text-slate-900 dark:text-white font-hindi truncate">{f.name}</div>
                  <div className="text-xs text-slate-500 truncate">@{f.slug || f.id}</div>
                  {f.bio && <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5 font-hindi">{f.bio}</div>}
                </div>
              </Link>
              {currentUser && currentUser.id !== f.id && (
                <button 
                  onClick={() => handleToggleFollow(f.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold font-hindi shrink-0 transition-colors ${
                    followStates[f.id] 
                      ? "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                  }`}
                >
                  {followStates[f.id] ? "फ़ॉलोइंग" : "फ़ॉलो करें"}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-500 font-hindi">कोई फ़ॉलोअर नहीं मिला।</div>
        )}
      </div>
    </div>
  );
}

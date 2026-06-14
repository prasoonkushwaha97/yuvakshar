"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Globe, MapPin, Share2, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { Profile, Article } from "@/store/types";
import { RoleBadgeList } from "@/components/ui/RoleBadge";

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const { users, articles } = useCms();
  const [user, setUser] = useState<Profile | null | undefined>(undefined);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  // Decode URL parameter
  const decodedParam = decodeURIComponent(params.username);
  
  // Enforce the @ prefix
  if (!decodedParam.startsWith("@")) {
    // If we want to strictly NOT implement /username, we can just 404 here.
    return notFound();
  }

  const actualUsername = decodedParam.substring(1);

  useEffect(() => {
    if (users.length > 0) {
      const foundUser = users.find(u => u.username?.toLowerCase() === actualUsername.toLowerCase());
      if (foundUser) {
        setUser(foundUser);
        const filteredArticles = articles.filter(a => (a as any).author === foundUser.name && a.status === "Published");
        setUserArticles(filteredArticles);
      } else {
        setUser(null);
      }
    }
  }, [users, articles, actualUsername]);

  if (user === undefined) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">Loading...</div>;
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-black text-slate-300 dark:text-slate-800 mb-4">404</h1>
          <h2 className="text-xl font-bold font-serif mb-2">प्रोफ़ाइल नहीं मिली</h2>
          <p className="text-sm text-slate-500 mb-6">यह यूज़रनेम मौजूद नहीं है या बदल दिया गया है।</p>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-xl font-bold transition-all hover:bg-primary/90">
            होम पेज पर लौटें
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-hindi pb-20">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-orange-400/20 w-full relative">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">
          
          {/* Avatar */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-orange-400 p-1 shadow-lg ring-4 ring-white dark:ring-[#0A0F1D] overflow-hidden flex items-center justify-center text-4xl font-black text-white uppercase">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              user.name[0]?.toUpperCase() || "U"
            )}
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black font-serif text-slate-900 dark:text-white leading-tight">
                  {user.name}
                </h1>
                <p className="text-slate-500 font-mono text-sm mt-1">
                  @{user.username}
                </p>
                {(user as any).roles && <div className="mt-2"><RoleBadgeList roles={(user as any).roles} /></div>}
              </div>
              
              <div className="flex gap-2">
                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-xl transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {user.bio && (
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 pt-2">
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.social_links && Object.keys(user.social_links).length > 0 && (
                <div className="flex items-center gap-3 ml-auto border-l pl-4 border-slate-200 dark:border-slate-700">
                  {user.social_links.website && <a href={user.social_links.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary"><Globe className="w-4 h-4" /></a>}
                  {user.social_links.twitter && <a href={user.social_links.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#1DA1F2]">X</a>}
                  {user.social_links.linkedin && <a href={user.social_links.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0A66C2]">in</a>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Published Articles Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
              प्रकाशित लेख 
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-sans">
                {userArticles.length}
              </span>
            </h2>
          </div>

          {userArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userArticles.map(article => (
                <Link href={`/articles/${article.slug}`} key={article.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {(article as any).imageUrl || (article as any).coverImage ? (
                      <img src={(article as any).imageUrl || (article as any).coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-white/90 backdrop-blur text-primary px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {article.summary}
                      </p>
                    )}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(article.date || "").toLocaleDateString("hi-IN")}
                      </span>
                      <span className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        पढ़ें <BookOpen className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold font-serif text-slate-700 dark:text-slate-300">कोई लेख नहीं</h3>
              <p className="text-sm text-slate-500 mt-2">इस यूज़र ने अभी तक कोई लेख प्रकाशित नहीं किया है।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

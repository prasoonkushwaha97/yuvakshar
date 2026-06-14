"use client";

import React, { useState } from "react";
import { useCms } from "@/store/CmsContext";
import { User, MapPin, Calendar, Globe, Edit, BookOpen, Share2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { currentUser, articles } = useCms();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm text-center border border-slate-200 dark:border-slate-800">
          <User className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2">लॉगिन आवश्यक है</h2>
          <p className="text-sm text-slate-500 mb-6">अपना प्रोफ़ाइल देखने के लिए कृपया लॉगिन करें।</p>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-xl font-bold transition-all hover:bg-primary/90">
            मुख्य पृष्ठ पर लौटें
          </Link>
        </div>
      </div>
    );
  }

  // Find articles published by this user
  const userArticles = articles.filter(a => (a as any).author === currentUser.name && a.status === "Published");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-hindi pb-20">
      
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-orange-400/20 w-full relative">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-start md:items-center">
          
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-lg flex items-center justify-center text-4xl font-bold text-primary overflow-hidden">
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name[0]?.toUpperCase() || "U"
            )}
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black font-serif text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </h1>
                {/* Username handle */}
                <p className="text-slate-500 font-mono text-sm mt-1">
                  @{currentUser.username}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link href="/settings" className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  प्रोफ़ाइल संपादित करें
                </Link>
                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-xl transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentUser.bio && (
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                {currentUser.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 pt-2">
              {currentUser.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{currentUser.location}</span>
                </div>
              )}
              {currentUser.joinDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>सदस्यता: {new Date(currentUser.joinDate).getFullYear()}</span>
                </div>
              )}
              {currentUser.social_links && Object.keys(currentUser.social_links).length > 0 && (
                <div className="flex items-center gap-3 ml-auto border-l pl-4 border-slate-200 dark:border-slate-700">
                  {currentUser.social_links.website && <a href={currentUser.social_links.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary"><Globe className="w-4 h-4" /></a>}
                  {currentUser.social_links.twitter && <a href={currentUser.social_links.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#1DA1F2]">X</a>}
                  {currentUser.social_links.linkedin && <a href={currentUser.social_links.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0A66C2]">in</a>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Published Articles Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
              प्रकाशित रचनाएँ
            </h2>
            <div className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {userArticles.length} लेख
            </div>
          </div>

          {userArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userArticles.map(article => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  {article.coverImage && (
                    <div className="h-48 w-full overflow-hidden relative">
                      <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {article.category && (
                        <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                          {article.category}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
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
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold font-serif mb-2 text-slate-700 dark:text-slate-300">कोई लेख प्रकाशित नहीं</h3>
              <p className="text-sm text-slate-500">इस लेखक ने अभी तक कोई लेख प्रकाशित नहीं किया है।</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

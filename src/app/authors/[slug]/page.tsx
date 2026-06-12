"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, 
  Calendar, 
  Users, 
  UserCheck,
  GraduationCap,
  BookOpen, 
  Eye, 
  Award, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Download, 
  ExternalLink,
  ChevronRight,
  Send,
  Sparkles,
  Heart,
  Video,
  X
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function AuthorProfile() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { users, articles, videos, currentUser, followAuthor, openAuthModal } = useCms();

  // Contact modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("सामान्य पूछताछ");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Active tab state for content library
  const [activeTab, setActiveTab] = useState("articles"); // articles | magazine | portfolio | videos

  // Find author by slug
  const author = useMemo(() => {
    return users.find(u => u.slug === slug);
  }, [users, slug]);

  // If author not found
  if (!author) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">प्रोफ़ाइल उपलब्ध नहीं है</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-serif">
            यह लेखक प्रोफ़ाइल मौजूद नहीं है या इसे हटाया जा चुका है। कृपया यूआरएल की जांच करें।
          </p>
          <button 
            onClick={() => router.push("/authors")}
            className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold font-serif cursor-pointer hover:bg-primary/95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>लेखक सूची पर वापस जाएं</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter content written by this author
  const authorArticles = useMemo(() => {
    return articles.filter(a => a.author === author.name && a.status === "Published");
  }, [articles, author.name]);

  // Filter magazine articles
  const magazineArticles = useMemo(() => {
    return authorArticles.filter(a => a.category === "पत्रिका" || (a.section as string) === "magazine");
  }, [authorArticles]);

  // Filter standard articles
  const standardArticles = useMemo(() => {
    return authorArticles.filter(a => a.category !== "पत्रिका" && (a.section as string) !== "magazine");
  }, [authorArticles]);

  // Filter videos containing author's name
  const authorVideos = useMemo(() => {
    return videos.filter(v => 
      v.status === "Published" && 
      (v.title.includes(author.name) || v.description.includes(author.name))
    );
  }, [videos, author.name]);

  // Check if current user follows this author
  const isFollowing = currentUser ? (author.followers?.includes(currentUser.id) || false) : false;

  const handleFollowToggle = () => {
    if (!currentUser) {
      openAuthModal(
        () => {},
        "लेखक को फ़ॉलो करने के लिए कृपया लॉग इन करें!"
      );
      return;
    }
    followAuthor(author.id, currentUser.id);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmitting(true);
    // Simulate API request saving contact submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setTimeout(() => {
        setSubmitSuccess(false);
        setContactOpen(false);
      }, 2000);
    }, 1200);
  };

  // Get total view counts of author's articles
  const totalArticleViews = authorArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalArticleLikes = authorArticles.reduce((sum, a) => sum + (a.likes || 0), 0);

  // Reputation badge style mapping
  const getReputationGaugeColor = (tier?: string) => {
    switch (tier) {
      case "Platinum":
        return "from-indigo-500 to-blue-600";
      case "Gold":
        return "from-amber-400 to-orange-500";
      case "Silver":
        return "from-slate-400 to-slate-500";
      default:
        return "from-orange-500 to-amber-600";
    }
  };

  // Check if leadership
  const isLeadership = ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(author.role || "");

  // Schema.org Person & Author JSON-LD Payload
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "jobTitle": author.designation || author.role,
    "worksFor": {
      "@type": "Organization",
      "name": "युवाक्षर"
    },
    "description": author.bio,
    "image": author.avatar_url,
    "url": `https://yuvakshar.org/authors/${author.slug}`,
    "sameAs": [
      author.orcid_id ? `https://orcid.org/${author.orcid_id}` : "",
      author.google_scholar_url || "",
      author.social_links?.twitter || "",
      author.social_links?.linkedin || ""
    ].filter(Boolean)
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-200 transition-colors duration-300 pb-16">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Profile Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-105 dark:bg-slate-900">
        {author.cover_banner ? (
          <img src={author.cover_banner} alt="Cover Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#EA580C]/20 to-[#0F172A]" />
        )}
        {/* Back navigation button */}
        <Link 
          href="/authors"
          className="absolute top-6 left-4 sm:left-8 bg-white/90 dark:bg-[#0F172A]/90 hover:bg-white dark:hover:bg-[#0F172A] border border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-bold font-serif flex items-center gap-1.5 transition-all shadow-md z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>लेखक निर्देशिका</span>
        </Link>
      </div>

      {/* Profile Header Detail Overlap Grid */}
      <div className="max-w-7xl mx-auto px-4 relative -mt-20 sm:-mt-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Author Details Info */}
          <div className="lg:col-span-8 space-y-6">
            <GlassCard 
              glow={isLeadership ? "gold" : "none"} 
              className={`p-6 sm:p-8 rounded-3xl border ${
                isLeadership 
                  ? "border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/5 to-white dark:from-[#1E1B15]/5 dark:to-[#0F172A]"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Profile Top Bio Info */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-[#0F172A] overflow-hidden bg-white dark:bg-slate-900 shadow-md shrink-0">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <span className="text-3xl font-bold uppercase">{author.name[0]}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-850 dark:text-white flex items-center gap-1.5">
                        <span>{author.name}</span>
                        {author.verification_badge && (
                          <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10 shrink-0" />
                        )}
                      </h1>

                      {/* Reputation badge pill */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold font-serif rounded-full px-3 py-1 bg-gradient-to-r text-white ${getReputationGaugeColor(author.reputation_tier)}`}>
                        <Award className="w-3.5 h-3.5" />
                        <span>{author.reputation_tier} श्रेणी ({author.reputation_score || 100} अंक)</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 font-serif text-xs">
                      {/* Designation */}
                      <p className="text-primary font-bold flex items-center gap-1 text-sm">
                        <span>{author.designation || "युवाक्षर लेखक"}</span>
                        {author.current_role && (
                          <span className="text-slate-400 dark:text-slate-500 font-normal">
                            | {author.current_role}
                          </span>
                        )}
                      </p>

                      {/* Meta links */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-450">
                        {author.institution && (
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">•</span>
                            <span>{author.institution}</span>
                          </span>
                        )}
                        {author.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{author.location}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>सदस्यता: {author.joinDate || "जून २०२६"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons Follow/Contact */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleFollowToggle}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold font-serif transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        isFollowing 
                          ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700" 
                          : "bg-primary hover:bg-primary/95 text-white"
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4 text-green-500" /> : <Users className="w-4 h-4" />}
                      <span>{isFollowing ? "फ़ॉलो किया है" : "फ़ॉलो करें"}</span>
                    </button>

                    <button
                      onClick={() => setContactOpen(true)}
                      className="bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-5 py-2.5 rounded-xl text-xs font-bold font-serif transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Mail className="w-4 h-4 text-primary" />
                      <span>लेखक से संपर्क करें</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio description */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-3 font-serif">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">संक्षिप्त परिचय (Biography)</h4>
                <p className="text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {author.bio || "युवाक्षर मंच के सक्रिय लेखक एवं प्रबुद्ध वैचारिक स्तंभकार। स्वतंत्र चिंतन, समाज, राजनीति और भाषाई पत्रकारिता के संवर्धन में निरंतर सक्रिय योगदान।"}
                </p>
              </div>

              {/* Academic Identifiers (ORCID, Google Scholar) & Degrees */}
              {(author.orcid_id || author.google_scholar_url || (author.academic_credentials && author.academic_credentials.length > 0)) && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 font-serif">
                  {/* Credentials / Affiliations */}
                  {author.academic_credentials && author.academic_credentials.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">शैक्षणिक योग्यता एवं संबद्धता</h4>
                      <div className="space-y-1.5">
                        {author.academic_credentials.map((cred, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350">
                            <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{cred}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Identifiers */}
                  {(author.orcid_id || author.google_scholar_url) && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">अकादमिक पहचानकर्ता (Identifiers)</h4>
                      <div className="flex flex-col gap-2">
                        {author.orcid_id && (
                          <a 
                            href={`https://orcid.org/${author.orcid_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline hover:opacity-90 font-medium"
                          >
                            <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-sans font-bold">ORCID</span>
                            <span>{author.orcid_id}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {author.google_scholar_url && (
                          <a 
                            href={author.google_scholar_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline hover:opacity-90 font-medium"
                          >
                            <span className="bg-blue-500/10 px-2 py-0.5 rounded text-[10px] font-sans font-bold">Google Scholar</span>
                            <span>विद्वान प्रोफ़ाइल खोलें</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Content Tabs Navigation */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-sm font-serif">
              <button
                onClick={() => setActiveTab("articles")}
                className={`flex-1 min-w-[80px] text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "articles"
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                लेख व आलेख ({standardArticles.length})
              </button>
              <button
                onClick={() => setActiveTab("magazine")}
                className={`flex-1 min-w-[80px] text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "magazine"
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                पत्रिका स्तंभ ({magazineArticles.length})
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`flex-1 min-w-[80px] text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "portfolio"
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                अकादमिक रिसर्च ({author.portfolio?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`flex-1 min-w-[80px] text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "videos"
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                वीडियो डेस्क ({authorVideos.length})
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="space-y-6">
              
              {/* Tab 1: Standard Articles List */}
              {activeTab === "articles" && (
                <div className="space-y-4">
                  {standardArticles.length === 0 ? (
                    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center font-serif">
                      <BookOpen className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 dark:text-white text-xs">कोई लेख उपलब्ध नहीं है</p>
                      <p className="text-[10px] text-slate-400">इस लेखक के पास वर्तमान में कोई प्रकाशित आलेख नहीं है।</p>
                    </div>
                  ) : (
                    standardArticles.map(art => (
                      <GlassCard key={art.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-5 items-stretch group hover:shadow-md transition-all">
                        {art.coverImage && (
                          <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-slate-105 shrink-0">
                            <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-grow flex flex-col justify-between py-0.5 space-y-2 font-serif">
                          <div>
                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{art.category}</span>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm mt-1.5 group-hover:text-primary transition-colors line-clamp-1">
                              <Link href={`/article/${art.slug}`}>{art.title}</Link>
                            </h3>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{art.summary}</p>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-2 shrink-0">
                            <span>{art.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{art.views || 0}</span>
                            </span>
                            <span>•</span>
                            <span>{art.readTime}</span>
                          </div>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Magazine Pieces */}
              {activeTab === "magazine" && (
                <div className="space-y-4">
                  {magazineArticles.length === 0 ? (
                    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center font-serif">
                      <BookOpen className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 dark:text-white text-xs">कोई पत्रिका स्तंभ उपलब्ध नहीं है</p>
                      <p className="text-[10px] text-slate-400">इस लेखक के पास वर्तमान में कोई प्रकाशित पत्रिका सामग्री नहीं है।</p>
                    </div>
                  ) : (
                    magazineArticles.map(art => (
                      <GlassCard key={art.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-5 items-stretch group hover:shadow-md transition-all">
                        {art.coverImage && (
                          <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-slate-105 shrink-0">
                            <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-grow flex flex-col justify-between py-0.5 space-y-2 font-serif">
                          <div>
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded">पत्रिका स्तंभ</span>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm mt-1.5 group-hover:text-primary transition-colors line-clamp-1">
                              <Link href={`/article/${art.slug}`}>{art.title}</Link>
                            </h3>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{art.summary}</p>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-2 shrink-0">
                            <span>{art.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{art.views || 0}</span>
                            </span>
                            <span>•</span>
                            <span>{art.readTime}</span>
                          </div>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Academic Portfolio Downloads */}
              {activeTab === "portfolio" && (
                <div className="space-y-4 font-serif">
                  {!author.portfolio || author.portfolio.length === 0 ? (
                    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
                      <FileText className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 dark:text-white text-xs">कोई शोध पत्र या दस्तावेज़ उपलब्ध नहीं है</p>
                      <p className="text-[10px] text-slate-400">इस लेखक के पास वर्तमान में कोई अकादमिक दस्तावेज़ संलग्न नहीं है।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {author.portfolio.map(item => (
                        <GlassCard key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-sans">
                              {item.type.replace("_", " ")}
                            </span>
                            <h4 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-2 leading-snug">{item.name}</h4>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 text-[10px]">
                            <span className="text-slate-400">PDF दस्तावेज़</span>
                            <a 
                              href={item.url} 
                              download
                              onClick={(e) => {
                                if (item.url === "#") {
                                  e.preventDefault();
                                  alert("डेमो मोड: डाउनलोड सिम्युलेट किया गया!");
                                }
                              }}
                              className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>डाउनलोड</span>
                            </a>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Video Desk List */}
              {activeTab === "videos" && (
                <div className="space-y-4">
                  {authorVideos.length === 0 ? (
                    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center font-serif">
                      <Video className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 dark:text-white text-xs">कोई वीडियो प्रसारण नहीं है</p>
                      <p className="text-[10px] text-slate-400">इस लेखक के पास वर्तमान में कोई संबद्ध वीडियो संवाद नहीं है।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {authorVideos.map(vid => (
                        <GlassCard key={vid.id} className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group">
                          {vid.thumbnailUrl && (
                            <div className="h-40 w-full overflow-hidden bg-slate-105 shrink-0 relative">
                              <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-md shadow-primary/25">
                                  ▶
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="p-4 flex-grow flex flex-col justify-between font-serif">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-primary uppercase tracking-wide">{vid.category}</span>
                              <h4 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-2 leading-relaxed">{vid.title}</h4>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 text-[10px] text-slate-400">
                              <span>प्रसारण: {vid.publishDate}</span>
                              <a 
                                href={vid.youtubeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>यूट्यूब पर देखें</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: Statistics & Timeline milestones */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Author Analytics Statistics */}
            <GlassCard glow="none" className="p-5 space-y-4 font-serif">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2 uppercase tracking-wide">गतिविधि एवं प्रभाव</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">कुल आलेख</span>
                  <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{authorArticles.length}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">कुल पाठक व्यूज</span>
                  <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{totalArticleViews}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">फ़ॉलोवर्स</span>
                  <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{author.followers?.length || 0}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">संवाद और लाइक</span>
                  <span className="text-xl font-bold font-sans text-slate-800 dark:text-white mt-1 block">{totalArticleLikes}</span>
                </div>
              </div>
            </GlassCard>

            {/* Achievements Section */}
            {author.achievements && author.achievements.length > 0 && (
              <GlassCard glow="none" className="p-5 space-y-4 font-serif">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2 uppercase tracking-wide">पुरस्कार एवं उपलब्धियाँ</h3>
                <div className="space-y-3.5">
                  {author.achievements.map((ach) => (
                    <div key={ach.id} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-850/80 pb-3 last:border-b-0 last:pb-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Award className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate leading-snug">{ach.title}</p>
                          {ach.year && <span className="text-[9px] text-slate-400 font-sans font-bold">{ach.year}</span>}
                        </div>
                        {ach.description && <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">{ach.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Chronological Milestone Timeline */}
            {author.timeline && author.timeline.length > 0 && (
              <GlassCard glow="none" className="p-5 space-y-4 font-serif">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2 uppercase tracking-wide">विकास यात्रा (Milestones)</h3>
                
                {/* Timeline chain */}
                <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-6 py-1 ml-1.5">
                  {author.timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-[#0A0F1D] border-2 border-primary group-hover:scale-120 transition-transform duration-200" />
                      
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans font-bold text-primary">{event.date}</span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug">{event.title}</h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed mt-0.5">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Professional Memberships */}
            {author.professional_memberships && author.professional_memberships.length > 0 && (
              <GlassCard glow="none" className="p-5 space-y-3 font-serif">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2 uppercase tracking-wide">व्यावसायिक सदस्यता</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {author.professional_memberships.map((member, i) => (
                    <span 
                      key={i} 
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2.5 py-1 rounded-lg"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}

          </div>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 px-6 py-4 flex items-center justify-between font-serif">
              <div>
                <h3 className="font-bold text-slate-850 dark:text-white text-sm">लेखक से संपर्क करें</h3>
                <span className="text-[10px] text-slate-400 leading-none block mt-0.5">लेखक: {author.name}</span>
              </div>
              <button 
                onClick={() => setContactOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 font-serif">
              {submitSuccess ? (
                <div className="py-8 text-center space-y-2.5">
                  <div className="w-10 h-10 bg-green-500/15 rounded-full flex items-center justify-center text-green-500 mx-auto">
                    <Send className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">संदेश सफलतापूर्वक भेजा गया</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">आपका संपर्क अनुरोध लेखक को संप्रेषित कर दिया गया है। वे यथाशीघ्र आपके ईमेल पर उत्तर देंगे।</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-450 block font-medium">आपका नाम (Full Name)</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="उदा. राहुल पाठक"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-450 block font-medium">आपका ईमेल (Email Address)</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="उदा. visitor@demo.com"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-455 block font-medium">पूछताछ का प्रकार (Inquiry Type)</label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="सामान्य पूछताछ">सामान्य पूछताछ (General Inquiry)</option>
                      <option value="साक्षात्कार">साक्षात्कार (Interview Request)</option>
                      <option value="मीडिया संबंध">मीडिया संबंध (Media Query)</option>
                      <option value="सहयोग/लेखन">सहयोग/लेखन (Collaboration)</option>
                      <option value="संगोष्ठी/निमंत्रण">संगोष्ठी/निमंत्रण (Event Invitation)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-455 block font-medium">संदेश (Message)</label>
                    <textarea 
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="लेखक के लिए अपना संदेश लिखें..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/95 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md mt-2"
                  >
                    {isSubmitting ? (
                      <span>संप्रेषित किया जा रहा है...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>संदेश भेजें</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

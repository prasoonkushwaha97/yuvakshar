import React from "react";
import { Users, FileText, MessageSquare, BookOpen, AlertTriangle, Clock, CheckCircle, PenTool, FolderTree, Settings, Edit3, XCircle, Archive, Star, UserPlus, Mail, ChevronRight, Sparkles, ExternalLink, Bell } from "lucide-react";
import { dashboardAnalyticsService } from "@/lib/dashboardAnalyticsService";
import { getContactStats } from "@/lib/actions/contactActions";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function getHindiGreeting(userName: string = "संपादक"): { greeting: string; subtitle: string } {
  const currentHour = new Date().getHours();
  let greetingText = "";

  if (currentHour >= 5 && currentHour < 12) {
    greetingText = `सुप्रभात, ${userName}!`;
  } else if (currentHour >= 12 && currentHour < 17) {
    greetingText = `शुभ दोपहर, ${userName}!`;
  } else if (currentHour >= 17 && currentHour < 21) {
    greetingText = `शुभ संध्या, ${userName}!`;
  } else {
    greetingText = `शुभ रात्रि, ${userName}!`;
  }

  return {
    greeting: greetingText,
    subtitle: "आज के संपादकीय कक्ष की वर्तमान स्थिति",
  };
}

const formatHindiNumber = (num: number) => new Intl.NumberFormat("hi-IN").format(num || 0);

export default async function AdminDashboardPage() {
  const data = await dashboardAnalyticsService.getDashboardStats();
  const contactRes = await getContactStats();
  const contactStats = contactRes.stats;

  const { greeting, subtitle } = getHindiGreeting("संपादक");

  const stats = [
    { label: "प्रकाशित लेख", value: formatHindiNumber(data.publishedArticles), icon: CheckCircle, link: "/admin/articles?tab=published", color: "text-green-500" },
    { label: "प्रारूप", value: formatHindiNumber(data.draftArticles), icon: PenTool, link: "/admin/articles?tab=drafts" },
    { label: "समीक्षा हेतु लंबित", value: formatHindiNumber(data.pendingReview), icon: Clock, link: "/admin/articles?tab=pending", color: "text-orange-500" },
    { label: "संशोधन आवश्यक", value: formatHindiNumber(data.needsRevision), icon: Edit3, link: "/admin/articles?tab=revision" },
    { label: "अस्वीकृत", value: formatHindiNumber(data.rejectedArticles), icon: XCircle, link: "/admin/articles?tab=rejected", color: "text-red-500" },
    { label: "संग्रहीत", value: formatHindiNumber(data.archivedArticles), icon: Archive, link: "/admin/articles?tab=archived" },
    { label: "विशेष लेख", value: formatHindiNumber(data.featuredArticles), icon: Star, link: "/admin/articles?featured=true", color: "text-yellow-500" },
    { label: "प्राथमिकता वाले कार्य", value: formatHindiNumber(data.priorityAssignments), icon: AlertTriangle, link: "/admin/articles?tab=priority", color: "text-red-600" },
    { label: "पत्रिका के अंक", value: formatHindiNumber(data.magazineIssues), icon: BookOpen, link: "/admin/magazine", color: "text-indigo-500" },
    { label: "संपादकीय टीम", value: formatHindiNumber(data.editorialTeamMembers), icon: Users, link: "/admin/users", color: "text-blue-500" },
    { label: "चौपाल पाठक", value: formatHindiNumber(data.communityUsers), icon: MessageSquare, link: "/admin/users" },
    { label: "कुल उपयोगकर्ता", value: formatHindiNumber(data.totalUsers), icon: UserPlus, link: "/admin/users", color: "text-purple-500" },
  ];

  const menuItems = [
    { name: "लेख", href: "/admin/articles", icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { name: "श्रेणियाँ", href: "/admin/categories", icon: FolderTree, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { name: "पत्रिका", href: "/admin/magazine", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { name: "चौपाल", href: "/admin/community", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { name: "संपर्क संदेश", href: "/admin/contact-messages", icon: Mail, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", badge: contactStats.newCount },
    { name: "उपयोगकर्ता", href: "/admin/users", icon: Users, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
    { name: "बैनर गैलरी", href: "/admin/media/banners", icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { name: "सूचनाएँ", href: "/admin/notifications", icon: Bell, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { name: "सेटिंग्स", href: "/admin/cms/settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-900/20" },
  ];

  return (
    <>
    {/* MOBILE MENU (App Drawer Style) */}
    <div className="md:hidden flex flex-col h-[calc(100vh-14px)]">
      <div className="px-6 py-8">
        <h1 className="text-3xl font-serif font-black text-primary tracking-tight">युवाक्षर<span className="text-slate-800 dark:text-white">एडमिन</span></h1>
        <p className="text-slate-500 mt-2 text-sm">सामग्री प्रबंधन हेतु विकल्प चुनें।</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 px-6 pb-20">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform">
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-extrabold bg-orange-500 text-white rounded-full animate-pulse">
                  {formatHindiNumber(item.badge)} नए
                </span>
              )}
              <div className={`p-4 rounded-full ${item.bg} ${item.color}`}>
                <Icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>

    {/* DESKTOP DASHBOARD */}
    <div className="hidden md:block space-y-8 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">{greeting}</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/admin/articles/new" 
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            <span>नया लेख</span>
          </Link>
          <Link 
            href="/admin/media/banners" 
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>बैनर गैलरी</span>
          </Link>
          <Link 
            href="/" 
            target="_blank"
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>वेबसाइट देखें</span>
          </Link>
        </div>
      </div>

      {/* CONTACT MESSAGES WIDGET */}
      <div className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#EA580C] text-white rounded-2xl shadow-md shrink-0">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>संपर्क संदेश</span>
              {contactStats.newCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-extrabold bg-orange-500 text-white rounded-full animate-pulse">
                  {formatHindiNumber(contactStats.newCount)} नए
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              पाठकों द्वारा भेजे गए प्रश्नों और संदेशों का विवरण।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="px-3 py-1.5 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">कुल संदेश</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{formatHindiNumber(contactStats.total)}</span>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-orange-500 font-bold block">नए संदेश</span>
              <span className="text-lg font-bold text-[#EA580C]">{formatHindiNumber(contactStats.newCount)}</span>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">आज के संदेश</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{formatHindiNumber(contactStats.todayCount)}</span>
            </div>
          </div>

          <Link
            href="/admin/contact-messages"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <span>सभी संदेश देखें</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.link} key={idx} className="group p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 rounded-2xl transition-all shadow-sm hover:shadow-md block">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500'} group-hover:bg-primary/10 transition-colors`}>
                  <Icon className={`w-6 h-6 group-hover:text-primary transition-colors`} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
    </>
  );
}

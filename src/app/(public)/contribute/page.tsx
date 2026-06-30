import React from "react";
import Link from "next/link";
import { PenTool, CheckCircle, Clock, BookOpen, AlertCircle } from "lucide-react";

export default function ContributorPortalPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white mb-6">
          Write for Yuvakshar
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          Join our community of verified authors, experts, and readers. Share your stories, analysis, and ideas with millions of Hindi readers across the globe.
        </p>
      </div>

      {/* Entry Points */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        
        {/* Guest / New Reader Submission */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Guest Submission</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Don't have an account? You can still submit your article for review. If approved, we will contact you via email.
          </p>
          <Link 
            href="/contribute/guest"
            className="inline-block w-full text-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl hover:border-primary hover:text-primary transition-colors"
          >
            Submit as Guest
          </Link>
        </div>

        {/* Registered Reader / Author Workspace */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 border border-primary/20">
          <div className="flex items-start justify-between mb-4">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contributor Workspace</h2>
             <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Recommended</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Log in to access your drafts, track submission status, and communicate directly with our editorial team.
          </p>
          <Link 
            href="/contribute/dashboard"
            className="inline-block w-full text-center bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Go to My Dashboard
          </Link>
        </div>

      </div>

      {/* Guidelines & Process */}
      <div className="grid md:grid-cols-3 gap-8">
        
        <div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Editorial Guidelines</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            We accept original, well-researched, and fact-checked content. Plagiarism is strictly prohibited and leads to a permanent ban.
          </p>
        </div>

        <div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Process</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Once submitted, your article enters our Editorial Queue. Our editors will review, verify facts, and may request revisions before publishing.
          </p>
        </div>

        <div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Expected Time</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Our editorial team aims to respond to all submissions within 3-5 business days. You can track the exact status in your Dashboard.
          </p>
        </div>

      </div>

    </div>
  );
}

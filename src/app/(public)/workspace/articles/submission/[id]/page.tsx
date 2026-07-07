import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, AlertCircle, MessageSquare } from "lucide-react";
import { getSubmissionDetails } from "@/lib/actions/contributeActions";
import { notFound } from "next/navigation";

export default async function SubmissionDetailsPage({ params }: { params: { id: string } }) {
  const { data: submission, error } = await getSubmissionDetails(params.id);

  if (error || !submission) {
    notFound();
  }

  const isRevisionRequested = submission.status?.toLowerCase() === "revision_requested";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/workspace/articles" className="inline-flex items-center text-sm font-hindi text-slate-500 hover:text-[#EA580C] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            कार्यक्षेत्र पर वापस जाएँ (Back to Dashboard)
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 border-b border-[#E7E2D8] dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {isRevisionRequested ? (
                <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase flex items-center gap-1.5 font-hindi border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-4 h-4"/> 
                  संशोधन आवश्यक (Revision Needed)
                </span>
              ) : (
                <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase flex items-center gap-1.5 font-hindi border border-blue-100 dark:border-blue-900/30">
                  {submission.status || "Submitted"}
                </span>
              )}
              <span className="text-sm text-slate-500 font-hindi flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4" /> 
                {new Date(submission.created_at).toLocaleDateString("hi-IN")}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black font-hindi tracking-tight text-gray-900 leading-tight">
              {submission.title || "बिना शीर्षक"}
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-sm font-bold transition-colors font-hindi shadow-sm">
              संपादित करें (Edit Article)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#0D1527] border border-[#E7E2D8] dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-6 font-hindi flex items-center gap-2 border-b border-[#E7E2D8] dark:border-slate-800 pb-4">
                <FileText className="w-5 h-5 text-slate-400" />
                मूल लेख (Original Content)
              </h2>
              <div className="prose prose-slate dark:prose-invert font-hindi text-base leading-loose max-w-none whitespace-pre-wrap">
                {submission.content}
              </div>
            </div>
          </div>

          {/* Sidebar / Feedback Area */}
          <div className="space-y-6">
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white mb-6 font-hindi flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                संपादकीय प्रतिक्रिया
              </h3>
              
              <div className="space-y-6">
                {submission.notes.length === 0 ? (
                  <p className="text-sm text-slate-500 font-hindi">अभी तक कोई संपादकीय प्रतिक्रिया नहीं है।</p>
                ) : (
                  submission.notes.map((msg: any) => (
                    <div key={msg.id} className="relative pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                      <div className="absolute w-3 h-3 bg-amber-400 rounded-full -left-[7px] top-1.5 border-2 border-white dark:border-[#0D1527]"></div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-hindi">
                        {msg.profiles?.username || "संपादक"} • {new Date(msg.created_at).toLocaleDateString("hi-IN")}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-hindi leading-relaxed">
                        {msg.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              {isRevisionRequested && (
                <div className="mt-8 pt-6 border-t border-amber-200/50 dark:border-amber-900/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mb-3">
                    संपादक के सुझावों के अनुसार लेख को अपडेट करें और पुनः सबमिट करें।
                  </p>
                  <button className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-colors font-hindi">
                    संशोधित लेख प्रेषित करें
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

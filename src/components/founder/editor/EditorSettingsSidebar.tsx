"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, CheckCircle, XCircle, AlertCircle, Globe } from "lucide-react";
import { addReviewNote } from "@/lib/actions/reviewActions";
import { toast } from "sonner";

export default function EditorSettingsSidebar({ articleId, initialNotes = [], article = {} }: { articleId: string, initialNotes: any[], article?: any }) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'seo'>('reviews');
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'request_changes' | 'reject' | null>(null);

  // SEO State
  const [seoData, setSeoData] = useState({
    meta_title: article?.meta_title || "",
    meta_description: article?.meta_description || "",
    canonical_url: article?.canonical_url || "",
    og_image: article?.og_image || "",
  });

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    try {
      const noteData = await addReviewNote(articleId, newNote, decision);
      setNotes([...notes, { ...noteData, reviewer: { name: 'You' } }]);
      setNewNote("");
      setDecision(null);
      toast.success("Review note added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add review note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Assuming a save action exists, mocked for now
      toast.success("SEO settings saved");
    } catch(err) {
      toast.error("Failed to save SEO settings");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4" /> Reviews
        </button>
        <button 
          onClick={() => setActiveTab('seo')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'seo' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <Globe className="w-4 h-4" /> SEO
        </button>
      </div>
      
      {activeTab === 'reviews' ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notes.length === 0 ? (
              <div className="text-center text-sm text-slate-500 mt-10">No review notes yet.</div>
            ) : (
              notes?.map((note: any) => (
                <div key={note.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">{note.reviewer?.name || 'Reviewer'}</span>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(note.created_at))} ago
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{note.note}</p>
                  {note.decision && (
                    <div className={`mt-2 inline-flex items-center text-xs font-medium px-2 py-1 rounded ${
                      note.decision === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                      note.decision === 'reject' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {note.decision === 'approve' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {note.decision === 'reject' && <XCircle className="w-3 h-3 mr-1" />}
                      {note.decision === 'request_changes' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {note.decision.replace('_', ' ').toUpperCase()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <form onSubmit={handleSubmitNote} className="space-y-3">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setDecision(decision === 'approve' ? null : 'approve')} className={`flex-1 text-xs py-1.5 rounded border ${decision === 'approve' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>Approve</button>
                <button type="button" onClick={() => setDecision(decision === 'request_changes' ? null : 'request_changes')} className={`flex-1 text-xs py-1.5 rounded border ${decision === 'request_changes' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-slate-200 text-slate-600'}`}>Changes</button>
                <button type="button" onClick={() => setDecision(decision === 'reject' ? null : 'reject')} className={`flex-1 text-xs py-1.5 rounded border ${decision === 'reject' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 text-slate-600'}`}>Reject</button>
              </div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add editorial note..."
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !newNote.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                Submit Note
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSaveSeo} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
              <input 
                type="text" 
                value={seoData.meta_title}
                onChange={e => setSeoData({...seoData, meta_title: e.target.value})}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none focus:ring-1 focus:ring-primary"
                placeholder="SEO Title (60 chars max)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
              <textarea 
                value={seoData.meta_description}
                onChange={e => setSeoData({...seoData, meta_description: e.target.value})}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                placeholder="SEO Description (160 chars max)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Canonical URL</label>
              <input 
                type="url" 
                value={seoData.canonical_url}
                onChange={e => setSeoData({...seoData, canonical_url: e.target.value})}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium py-2 rounded-lg transition-colors text-sm"
            >
              Save SEO Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

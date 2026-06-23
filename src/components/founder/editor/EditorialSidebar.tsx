"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { addReviewNote } from "@/lib/actions/reviewActions";
import { toast } from "sonner";

export default function EditorialSidebar({ articleId, initialNotes = [] }: { articleId: string, initialNotes: any[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'request_changes' | 'reject' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-bold flex items-center text-slate-900 dark:text-white">
          <MessageSquare className="w-4 h-4 mr-2" /> Editorial Reviews
        </h2>
      </div>
      
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
                  note.decision === 'approve' ? 'bg-green-100 text-green-700' :
                  note.decision === 'reject' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setDecision(decision === 'approve' ? null : 'approve')} className={`flex-1 text-xs py-1.5 rounded border ${decision === 'approve' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>Approve</button>
            <button type="button" onClick={() => setDecision(decision === 'request_changes' ? null : 'request_changes')} className={`flex-1 text-xs py-1.5 rounded border ${decision === 'request_changes' ? 'bg-yellow-100 border-yellow-200 text-yellow-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>Changes</button>
            <button type="button" onClick={() => setDecision(decision === 'reject' ? null : 'reject')} className={`flex-1 text-xs py-1.5 rounded border ${decision === 'reject' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>Reject</button>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a review note..."
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
    </div>
  );
}

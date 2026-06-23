"use client";

import React, { useState } from "react";
import { Article, ReviewNote } from "@/types/content";
import { addReviewNote } from "@/lib/actions/reviewActions";

function NoteThread({ note, depth = 0 }: { note: ReviewNote; depth?: number }) {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await addReviewNote(note.article_id, replyText, null, note.id);
    setReplyText("");
    setIsReplying(false);
  };

  return (
    <div className={`mb-4 ${depth > 0 ? "ml-8 border-l-2 pl-4" : "border rounded-lg p-4"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
          <span className="font-semibold text-sm">{note.reviewer?.name || 'Unknown'}</span>
          <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleString()}</span>
        </div>
        {note.decision && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            note.decision === 'approve' ? 'bg-green-100 text-green-800' :
            note.decision === 'reject' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {note.decision.replace('_', ' ').toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700">{note.note}</p>
      
      <button onClick={() => setIsReplying(!isReplying)} className="text-xs text-blue-500 mt-2 hover:underline">
        Reply
      </button>

      {isReplying && (
        <div className="mt-2 flex space-x-2">
          <input 
            type="text" 
            value={replyText} 
            onChange={e => setReplyText(e.target.value)} 
            className="flex-1 text-sm border rounded px-2 py-1" 
            placeholder="Write a reply..."
          />
          <button onClick={handleReply} className="px-3 py-1 bg-blue-600 text-white text-xs rounded">Send</button>
        </div>
      )}

      {note.replies && note.replies.length > 0 && (
        <div className="mt-4">
          {note.replies?.map(reply => <NoteThread key={reply.id} note={reply} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function ReviewPanel({ article, initialNotes }: { article: Article; initialNotes: ReviewNote[] }) {
  const [newNote, setNewNote] = useState("");
  const [decision, setDecision] = useState<'approve' | 'request_changes' | 'reject' | ''>('');

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    await addReviewNote(article.id, newNote, decision === '' ? null : decision);
    setNewNote("");
    setDecision('');
  };

  return (
    <div className="flex h-[calc(100vh-150px)]">
      {/* Left: Content Preview */}
      <div className="w-2/3 border-r overflow-y-auto pr-6">
        <h2 className="text-3xl font-bold mb-4">{article.title_hi}</h2>
        {article.title_en && <h3 className="text-xl text-gray-500 mb-4">{article.title_en}</h3>}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm">
          <p><strong>Status:</strong> {article.status}</p>
          <p><strong>Category:</strong> {article.categories?.name_hi}</p>
          <p><strong>Author:</strong> {article.profiles?.name}</p>
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* Right: Review Notes */}
      <div className="w-1/3 pl-6 flex flex-col h-full">
        <h3 className="font-bold text-lg mb-4">Review Discussion</h3>
        <div className="flex-1 overflow-y-auto mb-4">
          {initialNotes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No notes yet.</p>
          ) : (
            initialNotes?.map(note => <NoteThread key={note.id} note={note} />)
          )}
        </div>

        <div className="border-t pt-4">
          <textarea 
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            placeholder="Leave a review note..."
          />
          <div className="flex justify-between items-center">
            <select 
              value={decision}
              onChange={e => setDecision(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="">General Note</option>
              <option value="approve">Approve</option>
              <option value="request_changes">Request Changes</option>
              <option value="reject">Reject</option>
            </select>
            <button 
              onClick={handleSubmitNote}
              disabled={!newNote.trim()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm disabled:opacity-50"
            >
              Post Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { hi } from "date-fns/locale";
import { useCms } from "@/store/CmsContext";
import { Heart, Flag, Edit2, Trash2, Reply, MoreVertical, User, ChevronDown, ChevronUp, X } from "lucide-react";

interface CommentSectionProps {
  articleId: string;
}

// Basic formatting for rich text (bold, italic)
const formatRichText = (text: string) => {
  if (!text) return "";
  const html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
  return html;
};

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { comments, currentUser, openAuthModal, addComment, likeComment, editComment, deleteComment, reportComment } = useCms();
  
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const articleComments = useMemo(() => {
    return comments.filter(c => c.article_id === articleId && c.status === "approved").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [comments, articleId]);

  const parentComments = articleComments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => articleComments.filter(c => c.parent_id === parentId);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return openAuthModal();
    if (!newComment.trim()) return;

    await addComment(articleId, currentUser.name, newComment.trim(), replyTo?.id);
    setNewComment("");
    setReplyTo(null);
  };

  const CommentCard = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => {
    const replies = getReplies(comment.id);
    const [isEditing, setIsEditing] = useState(false);
    const [editVal, setEditVal] = useState(comment.content);
    const [showReplies, setShowReplies] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const isOwner = currentUser?.name === comment.name;
    const isEditor = currentUser?.role === "Editor" || currentUser?.role === "Founder";

    const handleEdit = async () => {
      if (!editVal.trim()) return;
      await editComment(comment.id, editVal);
      setIsEditing(false);
    };

    return (
      <div className={`flex gap-4 ${isReply ? "ml-8 lg:ml-12 mt-4" : "mt-6"}`}>
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 relative group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">{comment.name}</span>
                {comment.name === "Editor" && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">सम्पादक</span>
                )}
                {comment.name === "Founder" && (
                  <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">संस्थापक</span>
                )}
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: hi })}
                </span>
              </div>
              
              {/* Actions Menu */}
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-10 py-1">
                    {isOwner && (
                      <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Edit2 className="w-4 h-4" /> संपादित करें
                      </button>
                    )}
                    {(isOwner || isEditor) && (
                      <button onClick={() => { deleteComment(comment.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600">
                        <Trash2 className="w-4 h-4" /> हटाएँ
                      </button>
                    )}
                    <button onClick={() => { reportComment(comment.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Flag className="w-4 h-4" /> रिपोर्ट करें
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea 
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700">रद्द करें</button>
                  <button onClick={handleEdit} className="px-3 py-1 text-xs bg-primary text-white rounded-lg font-medium hover:bg-primary/90">सहेजें</button>
                </div>
              </div>
            ) : (
              <div 
                className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatRichText(comment.content) }}
              />
            )}
          </div>

          {/* Comment Action Bar */}
          <div className="flex items-center gap-4 mt-2 px-2">
            <button onClick={() => { if (currentUser) { likeComment(comment.id); } else { openAuthModal(); } }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#f97316] transition-colors">
              <Heart className={`w-3.5 h-3.5 ${comment.likes > 0 ? "fill-current text-[#f97316]" : ""}`} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>
            {!isReply && (
              <button onClick={() => { if (currentUser) { setReplyTo({ id: comment.id, name: comment.name }); } else { openAuthModal(); } }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                <Reply className="w-3.5 h-3.5" /> जवाब दें
              </button>
            )}
            {replies.length > 0 && (
              <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-xs font-bold text-primary ml-auto">
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {replies.length} जवाब
              </button>
            )}
          </div>

          {/* Nested Replies */}
          {showReplies && replies.map(r => <CommentCard key={r.id} comment={r} isReply />)}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-8" id="comments">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          विचार विमर्श
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm px-2.5 py-0.5 rounded-full font-sans">
            {articleComments.length}
          </span>
        </h3>
      </div>

      {/* Comment Input Box */}
      <div className="bg-white dark:bg-[#0A0F1D] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-8 relative">
        {!currentUser && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
            <button onClick={() => openAuthModal()} className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg">
              टिप्पणी करने के लिए लॉग इन करें
            </button>
          </div>
        )}
        
        {replyTo && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg mb-3">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold">{replyTo.name}</span> को जवाब दे रहे हैं...
            </span>
            <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
          </div>
        )}

        <form onSubmit={handleAddComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="अपने विचार साझा करें... (*bold* या **bold** का उपयोग करें)"
            className="w-full bg-transparent resize-none focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 min-h-[100px]"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400">सभ्य भाषा का प्रयोग करें।</div>
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              प्रकाशित करें
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-2">
        {parentComments.slice(0, visibleCount).map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>

      {/* Load More */}
      {visibleCount < parentComments.length && (
        <div className="mt-8 text-center">
          <button 
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
          >
            और टिप्पणियाँ लोड करें
          </button>
        </div>
      )}
    </div>
  );
}

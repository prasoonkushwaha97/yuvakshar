"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Star, 
  Heart, 
  MessageSquare, 
  Pin, 
  Lock, 
  ShieldAlert,
  Award
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  fetchPosts, 
  fetchComments, 
  addComment, 
  toggleLikePost, 
  toggleLikeComment,
  creditReputationPoints,
  CommunityPost, 
  CommunityComment 
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DiscussionThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const { currentUser } = useCms();

  // States
  const [thread, setThread] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState("");

  const loadThreadDetails = async () => {
    setLoading(true);
    try {
      const allPosts = await fetchPosts();
      const match = allPosts.find(p => p.id === threadId);
      setThread(match || null);
      
      const postComments = await fetchComments(threadId);
      setComments(postComments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreadDetails();
  }, [threadId]);

  // Submit main comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !thread) return;
    if (!replyContent.trim()) return;

    try {
      const newComment = await addComment(
        threadId,
        currentUser.id,
        currentUser.name || "लेखक",
        replyContent,
        null
      );
      setComments([...comments, newComment]);
      setReplyContent("");
      alert("आपकी टिप्पणी सफलतापूर्वक दर्ज कर ली गई है!");
    } catch (err) {
      console.error(err);
    }
  };

  // Submit nested reply comment
  const handleNestedReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!currentUser || !thread) return;
    if (!nestedReplyText.trim()) return;

    try {
      const newReply = await addComment(
        threadId,
        currentUser.id,
        currentUser.name || "लेखक",
        nestedReplyText,
        parentId
      );

      setComments(comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      }));

      setNestedReplyText("");
      setActiveReplyBox(null);
      alert("आपकी प्रतिक्रिया दर्ज कर ली गई है!");
    } catch (err) {
      console.error(err);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      alert("पसंद करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      const newCount = await toggleLikeComment(commentId, currentUser.id);
      setComments(prevComments => prevComments.map(c => {
        if (c.id === commentId) return { ...c, likesCount: newCount };
        if (c.replies && c.replies.length > 0) {
          const updatedReplies = c.replies.map(r => r.id === commentId ? { ...r, likesCount: newCount } : r);
          return { ...c, replies: updatedReplies };
        }
        return c;
      }));
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  // Mark Best Answer Workflow
  const handleAcceptAnswer = async (comment: CommunityComment) => {
    if (!currentUser || !thread) return;
    // Only thread author or Admin can accept answer
    if (thread.user_id !== currentUser.id && currentUser.role !== "Admin") {
      alert("केवल धागा शुरू करने वाले लेखक ही 'सर्वश्रेष्ठ उत्तर' का चयन कर सकते हैं।");
      return;
    }

    try {
      // Award reputation points to responder
      await creditReputationPoints(comment.user_id, 10, "Best Answer");
      
      // Update comment state
      setComments(comments.map(c => {
        if (c.id === comment.id) return { ...c, is_accepted_answer: true };
        return c;
      }));

      // Update thread state to solved
      setThread({
        ...thread,
        is_solved: true,
        best_answer_id: comment.id
      });

      alert(`बधाई! आपने इस उत्तर को सर्वश्रेष्ठ घोषित किया है। लेखक ${comment.user_name} के इस योगदान को सर्वश्रेष्ठ उत्तर के रूप में चिह्नित किया गया है।`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
        धागा लोड किया जा रहा है...
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="py-20 text-center text-xs text-slate-450 font-serif">
        चर्चा सूत्र नहीं मिला।
      </div>
    );
  }

  const acceptedAnswer = comments.find(c => c.is_accepted_answer || c.id === thread.best_answer_id);
  const remainingComments = comments.filter(c => c.id !== thread.best_answer_id && !c.is_accepted_answer);

  return (
    <div className="space-y-6">
      
      {/* Navigation header */}
      <div className="flex items-center justify-between text-xs font-serif text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link href="/community/discussion" className="inline-flex items-center space-x-1 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-hindi">चर्चा मंच पर वापस जाएं</span>
        </Link>
      </div>

      {/* Main Thread Card */}
      <GlassCard className="p-6 border-slate-200/60 dark:border-slate-800/40 space-y-4">
        
        {/* Author header */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-serif">
          <span className="font-bold text-slate-700 dark:text-slate-300 font-hindi">{thread.user_name} द्वारा शुरू</span>
          <span className="font-mono">{new Date(thread.created_at).toLocaleString("hi-IN")}</span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold font-serif text-slate-800 dark:text-white font-hindi">
          {thread.title}
        </h2>

        {/* Content */}
        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap font-hindi">
          {thread.content}
        </p>

        {/* Moderator quick indicators */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[8px] font-bold uppercase font-serif">
          {thread.is_pinned && (
            <span className="bg-red-500/10 text-red-600 border border-red-200/35 px-2 py-0.5 rounded font-hindi flex items-center gap-0.5">
              <Pin className="w-2.5 h-2.5" /> पिन पोस्ट
            </span>
          )}
          {thread.is_solved && (
            <span className="bg-green-500/10 text-green-600 border border-green-200/35 px-2 py-0.5 rounded font-hindi flex items-center gap-0.5">
              <CheckCircle className="w-2.5 h-2.5" /> समाधानित (Solved)
            </span>
          )}
        </div>

      </GlassCard>

      {/* ─── BEST ANSWER SECTION (Prominent highlight) ─── */}
      {acceptedAnswer && (
        <div className="bg-green-500/5 dark:bg-green-950/10 border-2 border-green-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-green-500">
            <Star className="w-5 h-5 fill-green-500" />
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-green-600 font-serif font-hindi">
            <Award className="w-4.5 h-4.5" />
            <span>सर्वश्रेष्ठ उत्तर (Best Answer)</span>
          </div>
          <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-hindi whitespace-pre-wrap">
            {acceptedAnswer.content}
          </p>
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-serif border-t border-green-500/10 pt-2">
            <span className="font-hindi">उत्तरदाता: {acceptedAnswer.user_name}</span>
            <span className="font-mono">{new Date(acceptedAnswer.created_at).toLocaleDateString("hi-IN")}</span>
          </div>
        </div>
      )}

      {/* ─── COMMENT FEED LIST ─── */}
      <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-6">
        <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi border-b border-slate-100 dark:border-slate-800 pb-2">
          उत्तर एवं टिप्पणियां ({comments.length})
        </h3>

        {/* Form to post replies */}
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input 
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="इस धागे पर अपनी टिप्पणी लिखें..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-hindi"
              required
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer font-hindi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-[10px] text-slate-400 font-serif">प्रतिक्रिया देने के लिए कृपया लॉगिन करें।</p>
        )}

        {/* Comment list */}
        <div className="space-y-6">
          {remainingComments.length > 0 || (comments.length === 1 && !acceptedAnswer) ? (
            comments.map((comment) => {
              if (comment.id === thread.best_answer_id || comment.is_accepted_answer) return null;
              
              return (
                <div key={comment.id} className="space-y-3.5 p-3 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-all border border-slate-150/40 dark:border-slate-800/40">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-serif">
                    <span className="font-bold text-slate-700 dark:text-slate-350 font-hindi">{comment.user_name}</span>
                    <span className="font-mono">{new Date(comment.created_at).toLocaleString("hi-IN")}</span>
                  </div>

                  {/* Body */}
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-hindi">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex space-x-4">
                      
                      {/* Likes */}
                      <button 
                        onClick={() => handleLikeComment(comment.id)} 
                        className="flex items-center space-x-1 text-slate-400 hover:text-red-500 font-mono cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{comment.likesCount}</span>
                      </button>

                      {/* Reply button */}
                      {currentUser && (
                        <button 
                          onClick={() => {
                            setActiveReplyBox(activeReplyBox === comment.id ? null : comment.id);
                            setNestedReplyText("");
                          }}
                          className="flex items-center space-x-1 text-slate-400 hover:text-primary font-hindi cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>उत्तर दें</span>
                        </button>
                      )}

                    </div>

                    {/* Mark as Best Answer (only for thread owner/admin when thread not solved yet) */}
                    {currentUser && (thread.user_id === currentUser.id || currentUser.role === "Admin") && !thread.is_solved && (
                      <button
                        onClick={() => handleAcceptAnswer(comment)}
                        className="text-green-600 hover:text-green-700 font-bold font-hindi flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>सर्वश्रेष्ठ उत्तर चुनें</span>
                      </button>
                    )}
                  </div>

                  {/* Sub-Replies rendering */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-4 border-l border-slate-200 dark:border-slate-800 space-y-3 pt-2 mt-2">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-serif">
                            <span className="font-bold text-slate-700 dark:text-slate-300 font-hindi">{reply.user_name}</span>
                            <span className="font-mono">{new Date(reply.created_at).toLocaleDateString("hi-IN")}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-hindi">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nested Reply compose form */}
                  {activeReplyBox === comment.id && currentUser && (
                    <form onSubmit={(e) => handleNestedReplySubmit(e, comment.id)} className="flex gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 pt-2">
                      <input 
                        type="text"
                        value={nestedReplyText}
                        onChange={(e) => setNestedReplyText(e.target.value)}
                        placeholder={`उत्तर दें...`}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-hindi"
                        required
                      />
                      <button type="submit" className="bg-primary text-white p-1.5 rounded-xl cursor-pointer">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}

                </div>
              );
            })
          ) : (
            <p className="text-center py-6 text-[10px] text-slate-400 font-serif">इस धागे पर अभी तक कोई और टिप्पणी नहीं आई है।</p>
          )}
        </div>

      </GlassCard>

    </div>
  );
}

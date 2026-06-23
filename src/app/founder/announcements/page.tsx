"use client";

import React, { useEffect, useState } from "react";
import { getAnnouncements, createAnnouncement, updateAnnouncementStatus } from "@/lib/actions/announcementActions";
import { Megaphone, Plus, Pin, CalendarDays, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

export default function FounderAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (status: 'draft' | 'published') => {
    if (!title || !content) {
      toast.error("Title and content are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedExpires = expiresAt ? new Date(expiresAt).toISOString() : null;
      await createAnnouncement(title, content, status, isPinned, formattedExpires);
      toast.success(`Announcement ${status === 'published' ? 'published' : 'saved as draft'}.`);
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setIsPinned(false);
      setExpiresAt("");
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || "Failed to create announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await updateAnnouncementStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <Megaphone className="w-6 h-6 mr-3 text-primary" />
            Platform Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast important updates, maintenance alerts, or features to all users.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 hidden md:table-cell">Schedule</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading announcements...</td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                    <Megaphone className="w-8 h-8 opacity-20" />
                    <span>No announcements have been created yet.</span>
                  </td>
                </tr>
              ) : (
                announcements?.map(ann => (
                  <tr key={ann.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                        ann.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        ann.status === 'archived' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {ann.status}
                      </span>
                      {ann.is_pinned && (
                        <span className="ml-2 inline-flex items-center text-[10px] font-bold uppercase text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                          <Pin className="w-3 h-3 mr-1" /> Pinned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{ann.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{ann.content}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-xs text-slate-500 space-y-1">
                        {ann.published_at ? (
                          <div className="flex items-center"><CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Pub: {new Date(ann.published_at).toLocaleDateString()}</div>
                        ) : (
                          <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Not published</div>
                        )}
                        {ann.expires_at && (
                          <div className="flex items-center"><CalendarDays className="w-3 h-3 mr-1 text-red-400" /> Exp: {new Date(ann.expires_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ann.status === 'draft' && (
                        <button onClick={() => handleUpdateStatus(ann.id, 'published')} className="text-xs font-semibold text-green-600 hover:underline mr-3">Publish</button>
                      )}
                      {ann.status === 'published' && (
                        <button onClick={() => handleUpdateStatus(ann.id, 'archived')} className="text-xs font-semibold text-slate-500 hover:underline mr-3">Archive</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        title="Create Announcement"
        description="Draft a new message to broadcast to the community."
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Announcement Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Scheduled Maintenance"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-[#0F172A] outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What do you want to say?"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-[#0F172A] outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expiration Date (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-[#0F172A] outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col justify-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPinned} 
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-primary focus:ring-primary" 
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pin to Top</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleCreate('draft')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Save Draft
            </button>
            <button 
              onClick={() => handleCreate('published')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Publish Now
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

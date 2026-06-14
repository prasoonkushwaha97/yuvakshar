"use client";

import React, { useEffect, useState } from "react";
import { getOpenReports, moderateReport } from "@/lib/actions/moderationActions";
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, EyeOff, Gavel, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

export default function ModeratorQueuePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getOpenReports();
      setReports(data);
    } catch (err) {
      toast.error("Failed to load moderation queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (actionType: 'dismiss' | 'warn' | 'hide' | 'suspend' | 'escalate') => {
    if (!selectedReport) return;
    if (actionNotes.length < 5 && actionType !== 'dismiss') {
      toast.error("Please provide at least 5 characters of context in the notes.");
      return;
    }

    setIsSubmitting(true);
    try {
      await moderateReport(selectedReport.id, actionType, actionNotes);
      toast.success(`Report successfully processed: ${actionType}`);
      setSelectedReport(null);
      setActionNotes("");
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || "Failed to process report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-red-500" />
            Moderation Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review community flags and enforce platform guidelines.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Target Type</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 hidden md:table-cell">Reported Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading queue...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                    <CheckCircle className="w-8 h-8 opacity-20 text-green-500" />
                    <span>The queue is clean! Excellent work.</span>
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium capitalize text-slate-700 dark:text-slate-300">
                      {report.target_type}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[300px] block" title={report.reason}>
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500 text-xs">
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary rounded transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        open={!!selectedReport} 
        onOpenChange={(open) => !open && setSelectedReport(null)}
        title="Review Report"
        description="Analyze the flag and determine the appropriate administrative action."
      >
        {selectedReport && (
          <div className="space-y-4 pt-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Reported {selectedReport.target_type}</div>
              <div className="text-slate-900 dark:text-slate-100 mb-3">{selectedReport.reason}</div>
              <div className="text-xs text-slate-400 font-mono">ID: {selectedReport.target_id}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Audit Notes / Evidence</label>
              <textarea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="Explain the reason for your decision..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-[#0F172A] outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => handleAction('dismiss')}
                disabled={isSubmitting}
                className="flex items-center justify-center py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" /> Dismiss
              </button>
              
              <button 
                onClick={() => handleAction('warn')}
                disabled={isSubmitting}
                className="flex items-center justify-center py-2 px-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors"
              >
                <AlertTriangle className="w-4 h-4 mr-2" /> Warn User
              </button>

              <button 
                onClick={() => handleAction('hide')}
                disabled={isSubmitting}
                className="flex items-center justify-center py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-sm font-medium transition-colors"
              >
                <EyeOff className="w-4 h-4 mr-2" /> Hide Content
              </button>

              <button 
                onClick={() => handleAction('escalate')}
                disabled={isSubmitting}
                className="flex items-center justify-center py-2 px-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" /> Escalate
              </button>
            </div>
            
            {selectedReport.target_type === 'user' && (
              <button 
                onClick={() => handleAction('suspend')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center mt-2 py-2 px-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                <Gavel className="w-4 h-4 mr-2" /> Suspend Account (Admin Only)
              </button>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}

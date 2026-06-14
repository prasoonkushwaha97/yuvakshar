"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getGlobalAuditLogs } from "@/lib/actions/auditActions";
import { Search, SlidersHorizontal, Download, History } from "lucide-react";
import { toast } from "sonner";

export default function AuditCenterPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getGlobalAuditLogs();
        setLogs(data);
      } catch (err) {
        toast.error("Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const targetName = log.target_user_details?.name?.toLowerCase() || "";
      const targetEmail = log.target_user_details?.email?.toLowerCase() || "";
      const actorName = log.performed_by_details?.name?.toLowerCase() || "";
      const roleName = log.roles?.name?.toLowerCase() || "";

      const matchesSearch = 
        targetName.includes(searchTerm.toLowerCase()) || 
        targetEmail.includes(searchTerm.toLowerCase()) ||
        actorName.includes(searchTerm.toLowerCase()) ||
        roleName.includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter ? log.action === actionFilter : true;
      
      let matchesDate = true;
      if (dateRange === "today") {
        matchesDate = new Date(log.created_at).toDateString() === new Date().toDateString();
      } else if (dateRange === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = new Date(log.created_at) >= sevenDaysAgo;
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, searchTerm, actionFilter, dateRange]);

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return toast.error("No data to export");

    const headers = ["Timestamp", "Action", "Target User", "Target Email", "Performed By", "Role", "Note"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.action,
        `"${log.target_user_details?.name || 'Unknown'}"`,
        `"${log.target_user_details?.email || 'Unknown'}"`,
        `"${log.performed_by_details?.name || 'System'}"`,
        `"${log.roles?.name || 'Unknown'}"`,
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Audit & Compliance Center</h1>
          <p className="text-sm text-slate-500">Immutable record of all role modifications across the platform.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users, emails, or roles..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] text-sm outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-40 flex-shrink-0">
          <select 
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] text-sm outline-none focus:ring-2 focus:ring-primary appearance-none"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="assign">Assign</option>
            <option value="remove">Remove</option>
            <option value="promote">Promote</option>
            <option value="demote">Demote</option>
          </select>
        </div>
        <div className="relative w-full sm:w-40 flex-shrink-0">
          <select 
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] text-sm outline-none focus:ring-2 focus:ring-primary appearance-none"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target User</th>
                <th className="px-6 py-4">Role Affected</th>
                <th className="px-6 py-4 hidden md:table-cell">Note</th>
                <th className="px-6 py-4 hidden lg:table-cell">Performed By</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                    <History className="w-8 h-8 opacity-20" />
                    <span>No audit logs found matching your filters.</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                        log.action === 'assign' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        log.action === 'remove' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{log.target_user_details?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{log.target_user_details?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{log.roles?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-slate-500 truncate max-w-[200px] block" title={log.notes}>
                        {log.notes || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-slate-500">
                      {log.performed_by_details?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

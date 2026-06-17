"use client";

import React, { useEffect, useState } from "react";
import { getAuthorsList, AdminUserRecord } from "@/lib/actions/userManagementActions";
import { assignAuthorRoleByEmail, removeAuthorRoleByUserId } from "@/lib/actions/roleActions";
import { Search, PenTool, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AuthorsPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const data = await getAuthorsList();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) return;
    setIsAssigning(true);
    try {
      const res = await assignAuthorRoleByEmail(targetEmail);
      if (!res.success) throw new Error(res.error);
      toast.success(`Author role assigned to ${targetEmail}`);
      setTargetEmail("");
      fetchAuthors();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign role");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRevokeAuthor = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke author privileges?")) return;
    try {
      const res = await removeAuthorRoleByUserId(userId);
      if (!res?.success && res?.error) throw new Error(res.error);
      toast.success("Author privileges revoked");
      fetchAuthors();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke role");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <PenTool className="w-6 h-6 mr-3 text-primary" />
            Author Management Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage author onboarding, credentials, and publishing privileges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-[#0F172A] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Onboard New Author</h2>
          <form onSubmit={handleAssignAuthor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Email Address</label>
              <input 
                type="email" 
                value={targetEmail}
                onChange={e => setTargetEmail(e.target.value)}
                placeholder="author@yuvakshar.com"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isAssigning}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isAssigning ? "Assigning..." : "Grant Author Role"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Active Authors Pipeline</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search authors..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] text-sm outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4 text-center">Articles</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading pipeline...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                      <CheckCircle className="w-8 h-8 opacity-20 text-green-500" />
                      <span>No authors found in the pipeline.</span>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {user.article_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRevokeAuthor(user.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, UserPlus, Search, Shield } from "lucide-react";
import { getCommunityUsersList, promoteUserToEditor, promoteUserToAdmin, AdminUserRecord } from "@/lib/actions/userManagementActions";
import { toast } from "sonner";
import Avatar from "@/components/shared/Avatar";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: AdminUserRecord) => void;
}

export function AddMemberModal({ open, onOpenChange, onSuccess }: AddMemberModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [results, setResults] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    async function searchUsers() {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await getCommunityUsersList({
          search: debouncedSearchTerm,
          perPage: 5,
          statusFilter: "active"
        });
        setResults(data as AdminUserRecord[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (open) {
      searchUsers();
    }
  }, [debouncedSearchTerm, open]);

  const handlePromote = async (user: AdminUserRecord, role: "admin" | "editor") => {
    setPromotingId(user.id);
    try {
      const res = role === "admin" ? await promoteUserToAdmin(user.id) : await promoteUserToEditor(user.id);
      if (res.success) {
        toast.success(`${user.name} promoted to ${role === "admin" ? "Admin" : "Editor"}!`);
        const updatedUser = { 
            ...user, 
            roles: [{ id: role, name: role === "admin" ? "Admin" : "Editor", slug: role }] 
        };
        onSuccess(updatedUser);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to promote user");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Promote to Editorial Team
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto">
            <p className="text-sm text-slate-500">
              Search for an existing Community User to promote them to the Editorial Team.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Username, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white" 
              />
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-8 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Searching users...
                </div>
              ) : debouncedSearchTerm.trim() === "" ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  Type a name or email to begin searching.
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No community users found matching "{debouncedSearchTerm}".
                </div>
              ) : (
                results.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0">
                        <Avatar url={user.avatar_url} alt={user.name} name={user.name} className="w-full h-full" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email || `@${user.username}`}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePromote(user, 'editor')}
                          disabled={promotingId === user.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {promotingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                          Make Editor
                        </button>
                        <button
                          onClick={() => handlePromote(user, 'admin')}
                          disabled={promotingId === user.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {promotingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                          Make Admin
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

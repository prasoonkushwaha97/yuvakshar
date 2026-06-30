"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { removeRole, getRolesList } from "@/lib/actions/roleActions";
import { toast } from "sonner";
import { RoleBadge } from "@/components/ui/RoleBadge";

export const ALL_ROLES = [
  { id: "10000000-0000-0000-0000-000000000001", slug: "founder", name: "Founder", rank: 0 },
  { id: "10000000-0000-0000-0000-000000000002", slug: "co_founder", name: "Co-Founder", rank: 1 },
  { id: "10000000-0000-0000-0000-000000000003", slug: "super_admin", name: "Super Admin", rank: 2 },
  { id: "10000000-0000-0000-0000-000000000004", slug: "admin", name: "प्रशासन", rank: 3 },
  { id: "10000000-0000-0000-0000-000000000005", slug: "editor_in_chief", name: "Editor-in-Chief", rank: 4 },
  { id: "10000000-0000-0000-0000-000000000006", slug: "editor", name: "Editor", rank: 5 },
  { id: "10000000-0000-0000-0000-000000000007", slug: "moderator", name: "Moderator", rank: 6 },
  { id: "10000000-0000-0000-0000-000000000008", slug: "reviewer", name: "Reviewer", rank: 7 },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserName: string;
  roleToRemoveId: string;
  onSuccess?: () => void;
}

export function RoleRemovalModal({ open, onOpenChange, targetUserId, targetUserName, roleToRemoveId, onSuccess }: Props) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbRoles, setDbRoles] = useState<{ id: string; slug: string; name: string }[]>([]);

  useEffect(() => {
    async function loadRoles() {
      try {
        const roles = await getRolesList();
        setDbRoles(roles);
      } catch (err) {
        console.error("Failed to load roles from DB:", err);
      }
    }
    if (open) {
      loadRoles();
    }
  }, [open]);

  const dbRole = dbRoles.find(dr => dr.id === roleToRemoveId);
  const targetRole = dbRole ? ALL_ROLES.find(r => r.slug === dbRole.slug) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim().length < 10) return;
    
    setLoading(true);
    try {
      const res = await removeRole(targetUserId, roleToRemoveId, note.trim());
      if (res.success) {
        toast.success(`Role removed from ${targetUserName} successfully!`);
        onOpenChange(false);
        setNote(""); // Reset
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to remove role");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getWarningMessage = () => {
    if (!targetRole) return null;
    if (targetRole.slug === "founder" || targetRole.slug === "co_founder") {
      return `⚠️ DANGER: You are attempting to strip a highly protected role (${targetRole.name}). Make absolutely sure this is correct.`;
    }
    return null;
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Remove Role from ${targetUserName}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {targetRole && (
          <div className="flex items-center space-x-3 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
            <span className="text-sm font-medium text-red-800 dark:text-red-200">Role to strip:</span>
            <RoleBadge role={targetRole} />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold flex justify-between">
            <span>Audit Note (Required)</span>
            <span className={`text-xs ${note.trim().length >= 10 ? 'text-green-500' : 'text-red-500'}`}>
              {note.trim().length}/10 chars
            </span>
          </label>
          <textarea 
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none resize-none"
            placeholder="भूमिका हटाने का कारण..."
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
          />
        </div>

        {getWarningMessage() && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-sm text-amber-800 dark:text-amber-200">
            {getWarningMessage()}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={note.trim().length < 10 || loading}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {loading ? "Removing..." : "Remove Role"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

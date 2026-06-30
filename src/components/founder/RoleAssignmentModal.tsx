"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { assignRole, getRolesList } from "@/lib/actions/roleActions";
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
  currentRoles: { id: string; slug: string; name: string }[];
  onSuccess?: () => void;
}

export function RoleAssignmentModal({ open, onOpenChange, targetUserId, targetUserName, currentRoles, onSuccess }: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
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

  const currentHighestRank = currentRoles.length > 0 
    ? Math.min(...currentRoles?.map(r => ALL_ROLES.find(ar => ar.slug === r.slug)?.rank ?? 999))
    : 999;
    
  const currentHighestRole = ALL_ROLES.find(r => r.rank === currentHighestRank);
  
  const dbSelectedRole = dbRoles.find(dr => dr.id === selectedRoleId);
  const targetRole = dbSelectedRole ? ALL_ROLES.find(r => r.slug === dbSelectedRole.slug) : undefined;
  
  const resultingRank = targetRole ? Math.min(currentHighestRank, targetRole.rank) : currentHighestRank;
  const resultingRole = ALL_ROLES.find(r => r.rank === resultingRank);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    
    setLoading(true);
    try {
      const res = await assignRole(targetUserId, selectedRoleId, `Assigned by admin via UI`);
      if (res.success) {
        toast.success(`Role assigned to ${targetUserName} successfully!`);
        setSelectedRoleId("");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to assign role");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getWarningMessage = () => {
    if (!targetRole) return null;
    if (targetRole.slug === "founder") {
      return "⚠️ The Founder role is strictly protected. Only existing Founders can assign it. This grants absolute ownership over the system.";
    }
    if (targetRole.rank <= 2) {
      return `⚠️ Assigning ${targetRole.name} grants platform-wide management authority and bypasses standard moderation checks.`;
    }
    return null;
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Assign Role to ${targetUserName}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="block text-xs text-slate-500 font-bold uppercase mb-1.5">Current Authority</span>
            {currentHighestRole ? <RoleBadge role={currentHighestRole} /> : <span className="text-sm font-medium">None</span>}
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-bold uppercase mb-1.5">Resulting Authority</span>
            {resultingRole ? <RoleBadge role={resultingRole} /> : <span className="text-sm font-medium">None</span>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Select Target Role</label>
          <select 
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Choose a Role --</option>
            {ALL_ROLES?.map(role => {
              const isAlreadyAssigned = currentRoles.some(cr => cr.slug === role.slug);
              const dbRole = dbRoles.find(dr => dr.slug === role.slug);
              const realId = dbRole ? dbRole.id : role.id;
              return (
                <option key={role.slug} value={realId} disabled={isAlreadyAssigned || !dbRole}>
                  {role.name} {isAlreadyAssigned ? "(Already Assigned)" : ""} {!dbRole ? "(Loading...)" : ""}
                </option>
              );
            })}
          </select>
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
            disabled={!selectedRoleId || loading}
            className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {loading ? "Assigning..." : "Assign Role"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

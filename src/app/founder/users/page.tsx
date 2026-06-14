"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getAdminUsersList, AdminUserRecord } from "@/lib/actions/userManagementActions";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Search, SlidersHorizontal, ShieldAlert, UserCog, UserMinus, Eye } from "lucide-react";
import { RoleAssignmentModal, ALL_ROLES } from "@/components/founder/RoleAssignmentModal";
import { RoleRemovalModal } from "@/components/founder/RoleRemovalModal";
import { UserDetailDrawer } from "@/components/founder/UserDetailDrawer";
import { toast } from "sonner";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modal States
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  
  const [removalModalOpen, setRemovalModalOpen] = useState(false);
  const [roleToRemoveId, setRoleToRemoveId] = useState("");
  
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsersList();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesRole = roleFilter 
        ? user.roles.some(r => r.slug === roleFilter)
        : true;
        
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const openAssignModal = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setAssignModalOpen(true);
  };

  const openRemoveModal = (user: AdminUserRecord) => {
    if (user.roles.length === 0) {
      toast.error("User has no roles to remove");
      return;
    }
    // Simplification for UI: We pick the highest rank role to remove by default, or open a selector.
    // Let's just pick the first one for now, or build a sub-menu in a real app.
    // For this demonstration, we'll pick the user's highest role.
    const highestRank = Math.min(...user.roles.map(r => ALL_ROLES.find(ar => ar.slug === r.slug)?.rank ?? 999));
    const roleToRemove = user.roles.find(r => ALL_ROLES.find(ar => ar.slug === r.slug)?.rank === highestRank);
    
    if (roleToRemove) {
      setSelectedUser(user);
      setRoleToRemoveId(roleToRemove.id);
      setRemovalModalOpen(true);
    }
  };

  const openDrawer = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">User Administration</h1>
          <p className="text-sm text-slate-500">Manage community members, assign roles, and govern permissions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, username, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] text-sm outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48 flex-shrink-0">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] text-sm outline-none focus:ring-2 focus:ring-primary appearance-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {ALL_ROLES.map(r => (
              <option key={r.slug} value={r.slug}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Roles & Authority</th>
                <th className="px-6 py-4 hidden md:table-cell">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                    <ShieldAlert className="w-8 h-8 opacity-20" />
                    <span>No users found matching your filters.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.slice(0, 1).map(r => (
                            <RoleBadge key={r.id} role={r as any} />
                          ))}
                          {user.roles.length > 1 && (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              +{user.roles.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openDrawer(user)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openAssignModal(user)}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-md transition-colors"
                          title="Assign Role"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openRemoveModal(user)}
                          disabled={user.roles.length === 0}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Remove Highest Role"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Drawers */}
      {selectedUser && (
        <>
          <RoleAssignmentModal 
            open={assignModalOpen} 
            onOpenChange={setAssignModalOpen}
            targetUserId={selectedUser.id}
            targetUserName={selectedUser.name}
            currentRoles={selectedUser.roles}
            onSuccess={fetchUsers}
          />
          <RoleRemovalModal
            open={removalModalOpen}
            onOpenChange={setRemovalModalOpen}
            targetUserId={selectedUser.id}
            targetUserName={selectedUser.name}
            roleToRemoveId={roleToRemoveId}
            onSuccess={fetchUsers}
          />
          <UserDetailDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            user={selectedUser}
          />
        </>
      )}

    </div>
  );
}

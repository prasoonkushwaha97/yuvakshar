"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getAdminUsersList, AdminUserRecord } from "@/lib/actions/userManagementActions";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Search, SlidersHorizontal, ShieldAlert, UserCog, UserMinus, Eye, MoreVertical, Ban, RefreshCw, ChevronLeft, ChevronRight, Shield, Users } from "lucide-react";
import { RoleAssignmentModal } from "@/components/founder/RoleAssignmentModal";
import { RoleRemovalModal } from "@/components/founder/RoleRemovalModal";
import { UserDetailDrawer } from "@/components/founder/UserDetailDrawer";
import { toast } from "sonner";
import { CreateStaffModal, ResetPasswordModal } from "@/components/admin/StaffModals";
import { formatDistanceToNow } from "date-fns";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Modal States
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [removalModalOpen, setRemovalModalOpen] = useState(false);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [roleToRemoveId, setRoleToRemoveId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Action Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
        
      const matchesRole = roleFilter !== "All" 
        ? user.roles.some(r => r.slug === roleFilter)
        : true;
        
      const matchesStatus = statusFilter !== "All"
        ? user.status === statusFilter
        : true;
        
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, currentPage]);

  const handleActionClick = (userId: string) => {
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your {users.length} registered users
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">All Roles</option>
              <option value="founder">Founder</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="moderator">Moderator</option>
              <option value="author">Author</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[1.5px] shrink-0">
                          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name ? user.name[0].toUpperCase() : "U"
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles?.map(role => (
                            <RoleBadge key={role.id} role={role} />
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'suspended' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {user.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {user.last_sign_in_at ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true }) : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleActionClick(user.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {activeMenu === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setDrawerOpen(true);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-2 text-slate-400" />
                              View Profile
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setAssignModalOpen(true);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                            >
                              <Shield className="w-4 h-4 mr-2 text-slate-400" />
                              Manage Roles
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                            <button
                              onClick={() => {
                                toast.info("Password reset logic pending");
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reset Password
                            </button>
                            <button
                              onClick={() => {
                                if (user.roles.some(r => r.slug === 'founder')) {
                                  toast.error("Cannot suspend a founder.");
                                  return;
                                }
                                toast.info("Suspend user logic pending");
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900 dark:text-white">{((currentPage - 1) * usersPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredUsers.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
          <UserDetailDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            user={selectedUser}
          />
          <RoleRemovalModal
            open={removalModalOpen}
            onOpenChange={setRemovalModalOpen}
            targetUserId={selectedUser.id}
            targetUserName={selectedUser.name}
            roleToRemoveId={roleToRemoveId}
            onSuccess={() => {
              fetchUsers();
              setDrawerOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

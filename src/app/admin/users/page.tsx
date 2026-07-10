"use client";
import Image from "next/image";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { deleteUser, getAdminUsersList, AdminUserRecord, checkIfCurrentUserIsFounder, getCommunityUsersList, suspendUser, activateUser } from "@/lib/actions/userManagementActions";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Search, Eye, MoreVertical, Ban, RefreshCw, ChevronLeft, ChevronRight, Shield, Users, Trash2, CheckCircle } from "lucide-react";
import { RoleAssignmentModal } from "@/components/founder/RoleAssignmentModal";
import { RoleRemovalModal } from "@/components/founder/RoleRemovalModal";
import { UserDetailDrawer } from "@/components/founder/UserDetailDrawer";
import { AddMemberModal } from "@/components/founder/AddMemberModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { UserPlus } from "lucide-react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [communityUsers, setCommunityUsers] = useState<any[]>([]);
  const [totalCommunityUsers, setTotalCommunityUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userGroup, setUserGroup] = useState<"admin" | "community">("admin");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const [currentUserIsFounder, setCurrentUserIsFounder] = useState(false);

  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsersList();
      setUsers(data);
      
      const isFounder = await checkIfCurrentUserIsFounder();
      setCurrentUserIsFounder(isFounder);
    } catch (err) {
      toast.error("Failed to fetch admin users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityUsers = useCallback(async () => {
    setCommunityLoading(true);
    try {
      const { data, count } = await getCommunityUsersList({
        page: currentPage,
        perPage: usersPerPage,
        search: debouncedSearchTerm,
        statusFilter,
      });
      setCommunityUsers(data);
      setTotalCommunityUsers(count);
    } catch (err) {
      toast.error("Failed to fetch community users");
    } finally {
      setCommunityLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  useEffect(() => {
    if (userGroup === "community") {
      fetchCommunityUsers();
    }
  }, [userGroup, fetchCommunityUsers]);

  const filteredAdminUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        
      const matchesRole = roleFilter !== "All" 
        ? user.roles.some(r => r.slug === roleFilter)
        : true;
        
      const matchesStatus = statusFilter !== "All"
        ? user.status === statusFilter
        : true;

      const isAdmin = user.roles.some(r => ["founder", "eic", "managing_editor", "editor"].includes(r.slug.toLowerCase()));
        
      return matchesSearch && matchesRole && matchesStatus && isAdmin;
    });
  }, [users, debouncedSearchTerm, roleFilter, statusFilter]);

  // Pagination logic
  const totalPages = userGroup === "admin" 
    ? Math.ceil(filteredAdminUsers.length / usersPerPage)
    : Math.ceil(totalCommunityUsers / usersPerPage);
    
  const paginatedUsers = useMemo(() => {
    if (userGroup === "community") return communityUsers;
    const start = (currentPage - 1) * usersPerPage;
    return filteredAdminUsers.slice(start, start + usersPerPage);
  }, [filteredAdminUsers, communityUsers, currentPage, userGroup]);

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
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button 
          onClick={() => { setUserGroup('admin'); setCurrentPage(1); }}
          className={`px-6 py-3 text-sm font-medium transition-colors ${userGroup === 'admin' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Admin Team
        </button>
        <button 
          onClick={() => { setUserGroup('community'); setCurrentPage(1); }}
          className={`px-6 py-3 text-sm font-medium transition-colors ${userGroup === 'community' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Community Users
        </button>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {userGroup === 'admin' ? 'Admin Team' : 'Community Users'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your {userGroup === 'admin' ? 'editorial staff' : 'readers and community members'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {userGroup === 'admin' && (
            <button
              onClick={() => setCreateStaffOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          )}

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
            {userGroup === 'admin' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="All">All Roles</option>
                <option value="founder">Founder</option>
                <option value="eic">Editor-in-Chief</option>
                <option value="managing_editor">Managing Editor</option>
                <option value="editor">Editor</option>
              </select>
            )}
            
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

      {/* Users Table (Desktop) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden hidden md:block">
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
                              <Image src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" fill />
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
                          user.roles?.map((role: any) => (
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
                            {!user.roles?.some((r: any) => r.slug === 'founder') && (
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
                            )}
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                            {userGroup === 'admin' && (
                              <button
                                onClick={() => {
                                  toast.info("Password reset logic pending");
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                              >
                                <RefreshCw className="w-4 h-4 mr-2 text-slate-400" />
                                Reset Password
                              </button>
                            )}
                            {!user.roles?.some((r: any) => r.slug === 'founder') && (
                              user.status === 'suspended' ? (
                                <button
                                  onClick={async () => {
                                    const res = await activateUser(user.id);
                                    if(res.success) {
                                      toast.success("User activated successfully");
                                      userGroup === 'admin' ? fetchAdminUsers() : fetchCommunityUsers();
                                    } else {
                                      toast.error(res.error || "Failed to activate user");
                                    }
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate User
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if(confirm("Are you sure you want to suspend this user?")) {
                                      const res = await suspendUser(user.id);
                                      if(res.success) {
                                        toast.success("User suspended successfully");
                                        userGroup === 'admin' ? fetchAdminUsers() : fetchCommunityUsers();
                                      } else {
                                        toast.error(res.error || "Failed to suspend user");
                                      }
                                    }
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend User
                                </button>
                              )
                            )}
                            {(currentUserIsFounder || userGroup === 'community') && !user.roles?.some((r: any) => r.slug === 'founder') && (
                              <button
                                onClick={async () => {
                                  if(confirm("Are you sure you want to delete this user?")) {
                                    const res = await deleteUser(user.id);
                                    if(res.success) {
                                      toast.success("User deleted successfully");
                                      userGroup === 'admin' ? fetchAdminUsers() : fetchCommunityUsers();
                                    } else {
                                      toast.error(res.error || "Failed to delete user");
                                    }
                                  }
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </button>
                            )}
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
      </div>

      {/* Mobile Responsive Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading users...
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No users found matching your filters.
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div key={user.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" fill />
                      ) : (
                        user.name ? user.name[0].toUpperCase() : "U"
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleActionClick(user.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
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
                      {!user.roles?.some((r: any) => r.slug === 'founder') && (
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
                      )}
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                      {!user.roles?.some((r: any) => r.slug === 'founder') && (
                        user.status === 'suspended' ? (
                          <button
                            onClick={async () => {
                              const res = await activateUser(user.id);
                              if(res.success) {
                                toast.success("User activated successfully");
                                userGroup === 'admin' ? fetchAdminUsers() : fetchCommunityUsers();
                              } else {
                                toast.error(res.error || "Failed to activate user");
                              }
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate User
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if(confirm("Are you sure you want to suspend this user?")) {
                                const res = await suspendUser(user.id);
                                if(res.success) {
                                  toast.success("User suspended successfully");
                                  userGroup === 'admin' ? fetchAdminUsers() : fetchCommunityUsers();
                                } else {
                                  toast.error(res.error || "Failed to suspend user");
                                }
                              }
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspend User
                          </button>
                        )
                      )}
                      {(currentUserIsFounder || userGroup === 'community') && !user.roles?.some((r: any) => r.slug === 'founder') && (
                        <button
                          onClick={async () => {
                            if(confirm("Are you sure you want to delete this user?")) {
                              const res = await deleteUser(user.id);
                              if(res.success) {
                                toast.success("User deleted successfully");
                                userGroup === 'admin' ? fetchAdminUsers() : fetchCommunityUsers();
                              } else {
                                toast.error(res.error || "Failed to delete user");
                              }
                            }
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {user.roles.length > 0 ? (
                  user.roles.map((role: any) => (
                    <RoleBadge key={role.id} role={role} />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No roles</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                  user.status === 'suspended' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {user.status === 'suspended' ? 'Suspended' : 'Active'}
                </span>
                <span className="text-slate-500">
                  {user.last_sign_in_at ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true }) : 'Never active'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && (userGroup === 'admin' ? filteredAdminUsers.length > 0 : totalCommunityUsers > 0) && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 rounded-b-xl">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900 dark:text-white">{((currentPage - 1) * usersPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * usersPerPage, userGroup === 'admin' ? filteredAdminUsers.length : totalCommunityUsers)}</span> of <span className="font-medium text-slate-900 dark:text-white">{userGroup === 'admin' ? filteredAdminUsers.length : totalCommunityUsers}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Modals & Drawers */}
      {selectedUser && (
        <>
          <RoleAssignmentModal
            open={assignModalOpen}
            onOpenChange={setAssignModalOpen}
            targetUserId={selectedUser!.id}
            targetUserName={selectedUser!.name}
            currentRoles={selectedUser!.roles}
            onSuccess={userGroup === 'admin' ? fetchAdminUsers : fetchCommunityUsers}
          />
          <UserDetailDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            user={selectedUser!}
          />
          <RoleRemovalModal
            open={removalModalOpen}
            onOpenChange={setRemovalModalOpen}
            targetUserId={selectedUser!.id}
            targetUserName={selectedUser!.name}
            roleToRemoveId={roleToRemoveId}
            onSuccess={() => {
              userGroup === 'admin' ? fetchAdminUsers() : fetchCommunityUsers();
              setDrawerOpen(false);
            }}
          />
        </>
      )}

      <AddMemberModal 
        open={createStaffOpen} 
        onOpenChange={setCreateStaffOpen} 
        onSuccess={fetchAdminUsers} 
        currentUserIsFounder={currentUserIsFounder}
      />
    </div>
  );
}

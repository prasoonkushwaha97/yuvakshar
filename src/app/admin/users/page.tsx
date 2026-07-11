"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  deleteUser, getAdminUsersList, AdminUserRecord, checkIfCurrentUserIsFounder, 
  getCommunityUsersList, suspendUser, activateUser, promoteUserToEditor, 
  promoteUserToAdmin, changeEditorialRole, removeEditorialRole 
} from "@/lib/actions/userManagementActions";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Search, Eye, MoreVertical, Ban, RefreshCw, ChevronLeft, ChevronRight, Users, Trash2, CheckCircle, ArrowRightLeft, UserMinus, Shield } from "lucide-react";
import { UserDetailDrawer } from "@/components/founder/UserDetailDrawer";
import { AddMemberModal } from "@/components/founder/AddMemberModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { UserPlus } from "lucide-react";
import Avatar from "@/components/shared/Avatar";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [communityUsers, setCommunityUsers] = useState<AdminUserRecord[]>([]);
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
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
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
      setCommunityUsers(data as AdminUserRecord[]);
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

      const isAdmin = user.roles.some(r => ["founder", "admin", "editor"].includes(r.slug.toLowerCase()));
        
      return matchesSearch && matchesRole && matchesStatus && isAdmin;
    });
  }, [users, debouncedSearchTerm, roleFilter, statusFilter]);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- ACTIONS ---

  const handleMakeEditor = async (user: AdminUserRecord) => {
    if(!confirm(`Promote User\n\nPromote ${user.name} to Editor?\n\nEditors can:\n• Create Articles\n• Edit Articles\n• Publish Articles\n\nClick OK to Promote.`)) return;
    const res = await promoteUserToEditor(user.id);
    if(res.success) {
      toast.success(`${user.name} promoted to Editor`);
      const updatedUser = { ...user, roles: [{ id: 'editor', name: 'Editor', slug: 'editor' }] };
      setCommunityUsers(prev => prev.filter(u => u.id !== user.id));
      setUsers(prev => prev.some(u => u.id === user.id) ? prev.map(u => u.id === user.id ? updatedUser : u) : [updatedUser, ...prev]);
    } else {
      toast.error(res.error || "Failed to promote user");
    }
    setActiveMenu(null);
  };

  const handleMakeAdmin = async (user: AdminUserRecord) => {
    if(!confirm(`Promote User\n\nPromote ${user.name} to Admin?\n\nClick OK to Promote.`)) return;
    const res = await promoteUserToAdmin(user.id);
    if(res.success) {
      toast.success(`${user.name} promoted to Admin`);
      const updatedUser = { ...user, roles: [{ id: 'admin', name: 'Admin', slug: 'admin' }] };
      setCommunityUsers(prev => prev.filter(u => u.id !== user.id));
      setUsers(prev => prev.some(u => u.id === user.id) ? prev.map(u => u.id === user.id ? updatedUser : u) : [updatedUser, ...prev]);
    } else {
      toast.error(res.error || "Failed to promote user");
    }
    setActiveMenu(null);
  };

  const handleChangeRole = async (user: AdminUserRecord, newRole: string) => {
    if(!confirm(`Change role of ${user.name} to ${newRole === 'admin' ? 'Admin' : 'Editor'}?`)) return;
    const res = await changeEditorialRole(user.id, newRole);
    if(res.success) {
      toast.success(`Role changed to ${newRole}`);
      const updatedUser = { ...user, roles: [{ id: newRole, name: newRole.charAt(0).toUpperCase() + newRole.slice(1), slug: newRole }] };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    } else {
      toast.error(res.error || "Failed to change role");
    }
    setActiveMenu(null);
  };

  const handleRemoveRole = async (user: AdminUserRecord) => {
    if(!confirm(`Remove Editorial Role?\n\nThis user will become a Community User.`)) return;
    const res = await removeEditorialRole(user.id);
    if(res.success) {
      toast.success(`${user.name} removed from Editorial Team`);
      const updatedUser = { ...user, roles: [] };
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setCommunityUsers(prev => prev.some(u => u.id === user.id) ? prev.map(u => u.id === user.id ? updatedUser : u) : [updatedUser, ...prev]);
    } else {
      toast.error(res.error || "Failed to remove role");
    }
    setActiveMenu(null);
  };

  const handleSuspendToggle = async (user: AdminUserRecord) => {
    const isSuspended = user.status === 'suspended';
    if(isSuspended) {
      const res = await activateUser(user.id);
      if(res.success) {
        toast.success("User activated successfully");
        const updatedUser = { ...user, status: 'active' };
        if(userGroup === 'admin') setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        else setCommunityUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      } else {
        toast.error(res.error || "Failed to activate user");
      }
    } else {
      if(confirm(`Are you sure you want to suspend ${user.name}?`)) {
        const res = await suspendUser(user.id);
        if(res.success) {
          toast.success("User suspended successfully");
          const updatedUser = { ...user, status: 'suspended' };
          if(userGroup === 'admin') setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
          else setCommunityUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        } else {
          toast.error(res.error || "Failed to suspend user");
        }
      }
    }
    setActiveMenu(null);
  };

  const handleDelete = async (user: AdminUserRecord) => {
    if(confirm(`Are you sure you want to delete ${user.name}? This cannot be undone.`)) {
      const res = await deleteUser(user.id);
      if(res.success) {
        toast.success("User deleted successfully");
        if(userGroup === 'admin') setUsers(prev => prev.filter(u => u.id !== user.id));
        else setCommunityUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    }
    setActiveMenu(null);
  };

  const renderActionMenu = (user: AdminUserRecord) => {
    const isFounder = user.roles?.some((r: any) => r.slug === 'founder');
    const isEditor = user.roles?.some((r: any) => r.slug === 'editor');
    const isAdmin = user.roles?.some((r: any) => r.slug === 'admin');

    return (
      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
        <button
          onClick={() => { setSelectedUser(user); setDrawerOpen(true); setActiveMenu(null); }}
          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
        >
          <Eye className="w-4 h-4 mr-2 text-slate-400" />
          View Profile
        </button>
        
        {isFounder ? (
          <>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
            <button
              onClick={() => handleRemoveRole(user)}
              className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Remove From Editorial Team
            </button>
          </>
        ) : (
          <>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
            
            {userGroup === 'community' ? (
              <>
                <button
                  onClick={() => handleMakeEditor(user)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2 text-primary" />
                  Make Editor
                </button>
                <button
                  onClick={() => handleMakeAdmin(user)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2 text-primary" />
                  Make Admin
                </button>
              </>
            ) : (
              <>
                {isEditor && (
                  <button
                    onClick={() => handleChangeRole(user, 'admin')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2 text-slate-400" />
                    Change Role → Admin
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleChangeRole(user, 'editor')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2 text-slate-400" />
                    Change Role → Editor
                  </button>
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                <button
                  onClick={() => handleRemoveRole(user)}
                  className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove From Editorial Team
                </button>
              </>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

            <button
              onClick={() => handleSuspendToggle(user)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center ${user.status === 'suspended' ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
            >
              {user.status === 'suspended' ? <CheckCircle className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
              {user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
            </button>
            {(currentUserIsFounder || userGroup === 'community') && (
              <button
                onClick={() => handleDelete(user)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </button>
            )}
          </>
        )}
      </div>
    );
  };

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
              Promote Member
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
                <option value="admin">Admin</option>
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

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hidden md:block">
        <div className="w-full">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">User</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading || (userGroup === 'community' && communityLoading) ? (
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
                          <div className="relative w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                            <Avatar url={user.avatar_url} alt={user.name} name={user.name} className="w-full h-full" />
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
                    <td className="px-6 py-4 text-right relative action-menu-container">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleActionClick(user.id); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeMenu === user.id && renderActionMenu(user)}
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
        {loading || (userGroup === 'community' && communityLoading) ? (
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
                    <div className="relative w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                      <Avatar url={user.avatar_url} alt={user.name} name={user.name} className="w-full h-full" />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                
                <div className="relative action-menu-container" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleActionClick(user.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeMenu === user.id && renderActionMenu(user)}
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
      {!(loading || (userGroup === 'community' && communityLoading)) && (userGroup === 'admin' ? filteredAdminUsers.length > 0 : totalCommunityUsers > 0) && (
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
      
      {/* Drawers & Modals */}
      {selectedUser && (
        <UserDetailDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          user={selectedUser!}
        />
      )}

      <AddMemberModal 
        open={createStaffOpen} 
        onOpenChange={setCreateStaffOpen} 
        onSuccess={(promotedUser) => {
           setCommunityUsers(prev => prev.filter(u => u.id !== promotedUser.id));
           setUsers(prev => prev.some(u => u.id === promotedUser.id) ? prev.map(u => u.id === promotedUser.id ? promotedUser : u) : [promotedUser, ...prev]);
        }} 
      />
    </div>
  );
}

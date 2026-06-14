"use client";

import React, { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Calendar, Mail, Shield, User } from "lucide-react";
import { AdminUserRecord } from "@/lib/actions/userManagementActions";
import { getAuditLogsForUser } from "@/lib/actions/auditActions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserRecord | null;
}

export function UserDetailDrawer({ open, onOpenChange, user }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user?.id) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const res = await getAuditLogsForUser(user.id);
          setLogs(res);
        } catch (e) {
          console.error("Failed to fetch audit logs");
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [open, user?.id]);

  if (!user) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="User Details">
      <div className="space-y-8">
        
        {/* Header Profile */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{user.name}</h3>
            <p className="text-sm text-slate-500">@{user.username}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-[#1E293B] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <Mail className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Email Address</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-[#1E293B] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Joined Date</span>
              <span className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Current Roles
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.roles.length > 0 ? (
              user.roles.map(r => (
                <RoleBadge key={r.id} role={r as any} />
              ))
            ) : (
              <span className="text-sm text-slate-500 italic">No roles assigned</span>
            )}
          </div>
        </div>

        {/* Audit History */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Audit History</h4>
          <div className="bg-slate-50 dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">Loading audit logs...</div>
            ) : logs.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <div key={log.id} className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        log.action === 'assign' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        log.action === 'remove' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {log.roles?.name ? `Role: ${log.roles.name}` : 'Unknown Role'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Note: {log.notes || 'None'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">No audit logs found for this user.</div>
            )}
          </div>
        </div>

      </div>
    </Drawer>
  );
}

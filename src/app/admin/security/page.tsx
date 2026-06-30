"use client";

import React, { useState, useEffect } from "react";
import { Shield, Key, Users, Activity, Lock, Smartphone, Search, AlertTriangle, Monitor, MoreVertical, XCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { globalSecurityService } from "../../../domains/platform/security/services/securityService";
import { globalPermissionInspector } from "../../../domains/platform/security/services/permissionInspector";
import { ActiveSession, APIKey } from "../../../domains/platform/security/types/security";

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "sessions" | "apikeys" | "rbac">("dashboard");
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [rbacResult, setRbacResult] = useState<any>(null);
  const [rbacSearch, setRbacSearch] = useState("admin-1");

  useEffect(() => {
    globalSecurityService.getActiveSessions().then(setSessions);
    globalSecurityService.getAPIKeys().then(setApiKeys);
  }, []);

  const handleInspect = async () => {
    const res = await globalPermissionInspector.inspectUser(rbacSearch);
    setRbacResult(res);
  };

  const handleRevokeSession = async (id: string) => {
    await globalSecurityService.revokeSession(id, "admin-1");
    setSessions(sessions.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Identity & Security Center
          </h2>
        </div>
        
        {/* Quick Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
           <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>2 High Risk Events</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Active Sessions:</span>
            <span className="text-slate-900 dark:text-white font-bold">142</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shrink-0 overflow-y-auto hidden md:block">
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <Activity className="w-4 h-4" /> Overview
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("sessions")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'sessions' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <Monitor className="w-4 h-4" /> Active Sessions
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("apikeys")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'apikeys' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <Key className="w-4 h-4" /> API Keys
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("rbac")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'rbac' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <ShieldCheck className="w-4 h-4" /> RBAC Inspector
              </button>
            </li>
          </ul>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-white dark:bg-[#0F172A] overflow-y-auto p-6 lg:p-8">
          
          {activeTab === "sessions" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Sessions</h3>
                  <p className="text-sm text-slate-500">Manage currently logged in devices and browsers.</p>
                </div>
                <button className="text-sm font-bold text-red-600 dark:text-red-400 hover:underline">Revoke All Sessions</button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Device / OS</th>
                      <th className="px-6 py-3">Location / IP</th>
                      <th className="px-6 py-3">Last Active</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             {s.os === 'iOS' || s.os === 'Android' ? <Smartphone className="w-5 h-5 text-slate-400" /> : <Monitor className="w-5 h-5 text-slate-400" />}
                             <div>
                               <p className="font-bold text-slate-900 dark:text-white">{s.device}</p>
                               <p className="text-xs text-slate-500">{s.browser} on {s.os}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-medium text-slate-900 dark:text-white">{s.ipAddress}</p>
                           <p className="text-xs text-slate-500">{s.country}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                           {new Date(s.lastActivity).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                            onClick={() => handleRevokeSession(s.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors"
                            title="Revoke Session"
                           >
                             <XCircle className="w-5 h-5" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "rbac" && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permission Inspector</h3>
                <p className="text-sm text-slate-500">Debug effective permissions for a user across all roles and policies.</p>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={rbacSearch}
                    onChange={(e) => setRbacSearch(e.target.value)}
                    placeholder="Enter User ID (e.g., admin-1)" 
                    className="pl-11 pr-4 py-3 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <button 
                  onClick={handleInspect}
                  className="bg-primary text-white px-6 font-bold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Inspect
                </button>
              </div>

              {rbacResult && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Assigned Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {rbacResult.assignedRoles.map((r: string) => (
                        <span key={r} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-bold rounded-lg border border-blue-200 dark:border-blue-800/30">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Effective Permissions</h4>
                    <ul className="space-y-2">
                      {rbacResult.effectivePermissions.map((p: string) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <CheckCircle2 className="w-4 h-4" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rbacResult.deniedPermissions.length > 0 && (
                    <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Explicitly Denied</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {rbacResult.deniedPermissions.map((p: string) => (
                          <li key={p} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30">
                            <XCircle className="w-4 h-4" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                     <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Policy Engine Log</h4>
                     <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                        {JSON.stringify(rbacResult.policiesApplied, null, 2)}
                     </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
               <Shield className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
               <p className="font-medium">Security Dashboard Overview</p>
               <p className="text-sm mt-2">Select an option from the sidebar to manage identity and security.</p>
            </div>
          )}

          {activeTab === "apikeys" && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
               <Key className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
               <p className="font-medium">API Key Management</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

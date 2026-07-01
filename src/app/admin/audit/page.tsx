"use client";

import React, { useState, useEffect } from "react";
import { Activity, Search, Filter, Download, ArrowRight, User, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { globalAuditService } from "../../../domains/platform/audit/services/auditService";
import { AuditRecord } from "../../../domains/platform/audit/types/audit";

export default function AuditCenter() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);

  useEffect(() => {
    // In production, this would be a server action or API call
    globalAuditService.getLogs().then(setLogs);
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" /> Activity & Audit Center
          </h1>
          <p className="text-slate-500 mt-1">Immutable ledger of all platform operations and security events</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="इवेंट, उपयोगकर्ता या मॉड्यूल खोजें..." 
              className="pl-9 pr-4 py-2 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          
          <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
            <option>All Modules</option>
            <option>Articles</option>
            <option>Media</option>
            <option>Security</option>
            <option>Experiences</option>
          </select>
          
          <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
            <option>All Actions</option>
            <option>CREATE</option>
            <option>UPDATE</option>
            <option>DELETE</option>
            <option>PUBLISH</option>
          </select>
          
          <button className="flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-950">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Actor</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Module</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{log.actorId}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{log.actorRole}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      log.action === 'PUBLISH' || log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {log.module === 'security' ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <FileText className="w-4 h-4 text-slate-400" />}
                      <span className="capitalize">{log.module}</span>
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-md" title={log.description}>
                      {log.description}
                    </p>
                  </td>
                  
                  <td className="py-4 px-6 text-right">
                    <button className="text-sm font-bold text-primary hover:text-primary/80 flex items-center justify-end gap-1 ml-auto">
                      View Diff <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
               <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
               <p className="font-medium">No audit logs found matching criteria.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-sm text-slate-500">
           <span>Showing 1 to 3 of 3 entries</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 disabled:opacity-50">Previous</button>
             <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 disabled:opacity-50">Next</button>
           </div>
        </div>

      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

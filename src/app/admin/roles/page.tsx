"use client";

import React, { useEffect, useState } from "react";
import { getRoleGovernanceData } from "@/lib/actions/roleGovernanceActions";
import { Users, Layers, CornerDownRight } from "lucide-react";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { toast } from "sonner";

export default function RoleGovernancePage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const data = await getRoleGovernanceData();
        setRoles(data);
      } catch (err) {
        toast.error("Failed to fetch role data");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <Layers className="w-6 h-6 mr-3 text-primary" />
            Role Governance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hierarchical overview of system roles and active assignments.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading hierarchy tree...</div>
        ) : (
          <div className="space-y-4">
            {roles?.map((role, index) => (
              <div key={role.id} className="relative">
                {/* Visual Connector for Hierarchy */}
                {index > 0 && (
                  <div 
                    className="absolute border-l-2 border-b-2 border-slate-200 dark:border-slate-800 rounded-bl-lg"
                    style={{
                      left: `${(index - 1) * 1.5 + 1.25}rem`,
                      top: '-1rem',
                      height: '2.5rem',
                      width: '1.5rem'
                    }}
                  />
                )}
                
                <div 
                  className="flex items-start bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl shadow-sm transition-all hover:shadow-md"
                  style={{ marginLeft: `${index * 1.5}rem`, zIndex: 10, position: 'relative' }}
                >
                  {index > 0 && <CornerDownRight className="w-5 h-5 text-slate-300 dark:text-slate-600 mr-3 mt-0.5 shrink-0" />}
                  
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <RoleBadge role={role as any} />
                        <span className="text-xs text-slate-400 font-mono">Rank {role.rank}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                        {role.description || "No description provided for this role."}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-white dark:bg-[#0F172A] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{role.member_count}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Members</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

"use client";

import React, { useEffect, useState } from "react";
import { getPermissionsMatrix } from "@/lib/actions/permissionActions";
import { Check, Minus, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function PermissionsCenterPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      setLoading(true);
      try {
        const data = await getPermissionsMatrix();
        setRoles(data.roles);
        setPermissions(data.permissions);
        setMatrix(data.matrix);
      } catch (err) {
        toast.error("Failed to fetch permissions matrix");
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  // Group permissions by category for cleaner rendering
  const permissionsByCategory: Record<string, any[]> = {};
  permissions.forEach(p => {
    if (!permissionsByCategory[p.category]) {
      permissionsByCategory[p.category] = [];
    }
    permissionsByCategory[p.category].push(p);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white flex items-center">
            <KeyRound className="w-6 h-6 mr-3 text-primary" />
            Permissions Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global matrix of all access rights across the platform. (Read-only view)
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="px-6 py-12 text-center text-slate-500">Loading matrix data...</div>
        ) : roles.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">No data found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 sticky left-0 bg-slate-50 dark:bg-[#1E293B] z-10 w-64 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Category / Permission</div>
                  </th>
                  {roles?.map(role => (
                    <th key={role.id} className="px-4 py-4 text-center min-w-[120px]">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {role.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{role.slug}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {Object.entries(permissionsByCategory)?.map(([category, perms]) => (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-50/50 dark:bg-[#1E293B]/50">
                      <td 
                        colSpan={roles.length + 1} 
                        className="px-6 py-2 sticky left-0 font-bold text-xs uppercase tracking-widest text-primary bg-slate-50/50 dark:bg-[#1E293B]/50"
                      >
                        {category}
                      </td>
                    </tr>
                    {/* Permissions Rows */}
                    {perms?.map(perm => (
                      <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/30 transition-colors">
                        <td className="px-6 py-3 sticky left-0 bg-white dark:bg-[#0F172A] z-10 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{perm.name}</span>
                            {perm.description && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={perm.description}>
                                {perm.description}
                              </span>
                            )}
                          </div>
                        </td>
                        {roles?.map(role => {
                          const hasPerm = matrix[perm.id]?.[role.id] || false;
                          return (
                            <td key={role.id} className="px-4 py-3 text-center border-l border-slate-50 dark:border-slate-800/30">
                              <div className="flex justify-center">
                                {hasPerm ? (
                                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

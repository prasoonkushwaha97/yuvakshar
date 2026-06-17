import React from "react";
import { FileText, MessageSquare, Award } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AuthorDashboardPage() {
  const statCards = [
    { label: "My Articles", value: 0, icon: FileText, color: "text-blue-500" },
    { label: "Review Notes", value: 0, icon: MessageSquare, color: "text-pink-500" },
    { label: "Certificates", value: 0, icon: Award, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Author Workspace</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

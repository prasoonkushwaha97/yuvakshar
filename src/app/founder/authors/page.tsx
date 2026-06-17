import React from "react";
import { Construction } from "lucide-react";

export default function AuthorsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Authors Management
      </h1>
      <p className="text-slate-500 max-w-md">
        This module is currently under construction. Check back soon for updates to the Authors workflow.
      </p>
    </div>
  );
}

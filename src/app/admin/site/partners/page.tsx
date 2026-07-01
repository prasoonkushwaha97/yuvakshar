"use client";

import React, { useState } from "react";
import { Plus, Building2, Globe, Settings2, Trash2 } from "lucide-react";

export default function PartnerManagement() {
  const [partners] = useState([
    { id: "p1", name: "Global News Network", tagline: "International Reporting Partner", url: "https://gnn.example.com", status: "active" },
    { id: "p2", name: "Tech Weekly", tagline: "Technology Insights", url: "https://techweekly.example.com", status: "active" },
    { id: "p3", name: "Local Voices", tagline: "Community Journalism", url: "https://localvoices.example.com", status: "inactive" },
  ]);

  return (
    <div className="max-w-5xl mx-auto py-8">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white">Partner Management</h1>
          <p className="text-slate-500 mt-1">Manage official partners and collaborations</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" /> Add Partner
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {partners.map(partner => (
          <div key={partner.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative group">
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button className="p-1.5 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-900 rounded-lg"><Settings2 className="w-4 h-4" /></button>
              <button className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-900 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
               <Building2 className="w-8 h-8 text-slate-400" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{partner.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{partner.tagline}</p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <a href={partner.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                <Globe className="w-4 h-4" /> Website
              </a>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                partner.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {partner.status}
              </span>
            </div>
            
          </div>
        ))}

      </div>

    </div>
  );
}

export const dynamic = 'force-dynamic';

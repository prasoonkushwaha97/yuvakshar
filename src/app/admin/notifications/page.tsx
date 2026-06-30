"use client";

import React, { useState, useEffect } from "react";
import { Bell, Search, Inbox, Archive, Settings, Circle, CheckCircle2, Trash2, Mail, LayoutDashboard, Clock, FileText, AlertTriangle } from "lucide-react";
import { globalCommunicationHub } from "../../../domains/platform/notifications/services/communicationHub";
import { NotificationPayload } from "../../../domains/platform/notifications/types/notifications";

export default function CommunicationHub() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [activeTab, setActiveTab] = useState<"inbox" | "unread" | "archived">("inbox");
  const [selectedNotifs, setSelectedNotifs] = useState<Set<string>>(new Set());

  useEffect(() => {
    // In production, we pass the current user's ID
    globalCommunicationHub.getInbox("user-123").then(setNotifications);
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedNotifs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedNotifs(newSet);
  };

  const selectAll = () => {
    if (selectedNotifs.size === notifications.length) {
      setSelectedNotifs(new Set());
    } else {
      setSelectedNotifs(new Set(notifications.map(n => n.id)));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Communication Hub
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              className="pl-9 pr-4 py-2 w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button className="flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Folders */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shrink-0 overflow-y-auto hidden md:block">
          <button 
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 px-4 rounded-xl mb-6 hover:bg-primary/90 transition-colors"
          >
             <Mail className="w-4 h-4" /> New Message
          </button>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Mailbox</h3>
          <ul className="space-y-1 mb-8">
            <li>
              <button 
                onClick={() => setActiveTab("inbox")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'inbox' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <span className="flex items-center gap-2"><Inbox className={`w-4 h-4 ${activeTab === 'inbox' ? 'text-primary' : ''}`} /> Inbox</span>
                {notifications.some(n => !n.isRead) && <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">{notifications.filter(n => !n.isRead).length}</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("unread")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'unread' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <span className="flex items-center gap-2"><Circle className={`w-4 h-4 ${activeTab === 'unread' ? 'text-primary' : ''}`} /> Unread</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("archived")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'archived' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'}`}
              >
                <span className="flex items-center gap-2"><Archive className={`w-4 h-4 ${activeTab === 'archived' ? 'text-primary' : ''}`} /> Archive</span>
              </button>
            </li>
          </ul>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-1">
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors">
                <FileText className="w-4 h-4" /> Editorial
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors">
                <AlertTriangle className="w-4 h-4" /> System & Security
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Community
              </button>
            </li>
          </ul>
        </div>

        {/* Center Canvas - Inbox List */}
        <div className="flex-1 bg-white dark:bg-[#0F172A] flex flex-col overflow-hidden relative">
          
          {/* Action Toolbar */}
          <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 shrink-0 bg-white dark:bg-[#0F172A]">
            <input 
              type="checkbox" 
              checked={selectedNotifs.size === notifications.length && notifications.length > 0} 
              onChange={selectAll}
              className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-slate-900 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2"></div>
            
            <button 
              className={`p-2 rounded-lg transition-colors ${selectedNotifs.size > 0 ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
              disabled={selectedNotifs.size === 0}
            >
               <CheckCircle2 className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 rounded-lg transition-colors ${selectedNotifs.size > 0 ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
              disabled={selectedNotifs.size === 0}
            >
               <Archive className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 rounded-lg transition-colors ${selectedNotifs.size > 0 ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
              disabled={selectedNotifs.size === 0}
            >
               <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-500">
                 <Inbox className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
                 <p className="font-medium">No notifications in {activeTab}</p>
               </div>
            ) : (
               <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                 {notifications.map(n => (
                   <div 
                    key={n.id} 
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${!n.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                   >
                     <input 
                        type="checkbox" 
                        checked={selectedNotifs.has(n.id)}
                        onChange={(e) => { e.stopPropagation(); toggleSelect(n.id); }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-slate-900 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                      />
                      
                      <div className="w-2 flex justify-center shrink-0">
                         {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                      </div>

                      <div className="w-32 shrink-0 truncate">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          n.priority === 'Urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {n.category}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-3">
                         <h4 className={`text-sm truncate ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                           {n.title}
                         </h4>
                         <span className="text-slate-300 dark:text-slate-600">-</span>
                         <p className="text-sm text-slate-500 truncate">{n.message}</p>
                      </div>

                      <div className="w-32 shrink-0 text-right text-xs font-medium text-slate-500 flex items-center justify-end gap-1">
                         {n.priority === 'Urgent' && <Clock className="w-3 h-3 text-amber-500" />}
                         {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { createMagazineIssue } from "@/lib/actions/magazineActions";
import { useRouter } from "next/navigation";

export default function CreateIssueModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [volume, setVolume] = useState(1);
  const [issueNum, setIssueNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!title || !slug) return alert("Title and Slug required");
    setLoading(true);
    try {
      const issue = await createMagazineIssue({ title, slug, volume, issue_number: issueNum });
      setIsOpen(false);
      router.push(`/founder/magazine/builder/${issue.id}`);
    } catch (e: any) {
      alert("Failed to create issue: " + e.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
      >
        + Create Issue
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Issue</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg p-2" placeholder="e.g. June 2026 Edition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full border rounded-lg p-2" placeholder="e.g. june-2026" />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                  <input type="number" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full border rounded-lg p-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue No.</label>
                  <input type="number" value={issueNum} onChange={e => setIssueNum(Number(e.target.value))} className="w-full border rounded-lg p-2" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={handleCreate} 
                disabled={loading}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

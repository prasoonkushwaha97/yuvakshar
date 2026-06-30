"use client";

import React, { useState } from "react";
import { addSectionToIssue, updateIssueStatus } from "@/lib/actions/magazineActions";
import AddArticleToSectionModal from "./AddArticleToSectionModal";

export default function IssueBuilder({ initialIssue }: { initialIssue: any }) {
  const [issue, setIssue] = useState(initialIssue);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSection = async () => {
    if (!newSectionTitle) return;
    setLoading(true);
    try {
      const sec = await addSectionToIssue(issue.id, newSectionTitle);
      setIssue({ ...issue, sections: [...(issue.sections || []), sec] });
      setNewSectionTitle("");
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateIssueStatus(issue.id, newStatus);
      setIssue({ ...issue, status: newStatus });
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
    setLoading(false);
  };

  // Group articles by section
  const articlesBySection: Record<string, any[]> = {};
  const unassignedArticles: any[] = [];

  (issue.articles || []).forEach((magArticle: any) => {
    if (magArticle.section_id) {
      if (!articlesBySection[magArticle.section_id]) articlesBySection[magArticle.section_id] = [];
      articlesBySection[magArticle.section_id].push(magArticle);
    } else {
      unassignedArticles.push(magArticle);
    }
  });

  return (
    <div className="flex space-x-6">
      {/* LEFT: Builder Canvas */}
      <div className="flex-1 space-y-6">
        
        {/* Sections */}
        {(issue.sections || [])?.map((section: any) => (
          <div key={section.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-lg">{section.title}</h3>
              <AddArticleToSectionModal issueId={issue.id} sectionId={section.id} />
            </div>
            
            <div className="space-y-2">
              {articlesBySection[section.id]?.length > 0 ? (
                articlesBySection[section.id]?.map(ma => (
                  <div key={ma.article_id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                    <div>
                      <div className="font-medium text-sm">{ma.article?.title_hi}</div>
                      <div className="text-xs text-gray-500">By {ma.article?.profiles?.name} &bull; {ma.article?.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No articles in this section yet.</div>
              )}
            </div>
          </div>
        ))}

        {/* Add Section */}
        <div className="bg-gray-50 border border-dashed rounded-lg p-4 flex items-center space-x-4">
          <input 
            type="text" 
            value={newSectionTitle} 
            onChange={e => setNewSectionTitle(e.target.value)} 
            placeholder="नया अनुभाग शीर्षक..." 
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button 
            onClick={handleAddSection} 
            disabled={!newSectionTitle || loading}
            className="px-4 py-2 bg-slate-900 text-white rounded text-sm disabled:opacity-50"
          >
            Add Section
          </button>
        </div>

      </div>

      {/* RIGHT: Tools & Metadata */}
      <div className="w-80 space-y-6">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Issue Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded border text-sm">
              Generate TOC
            </button>
            <select 
              value={issue.status}
              onChange={e => handleStatusChange(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={loading}
            >
              <option value="draft">Draft</option>
              <option value="in_production">In Production</option>
              <option value="ready_for_publish">Ready for Publish</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="font-bold mb-2">Editorial Note</h3>
          <textarea 
            className="w-full border rounded p-2 text-sm h-32" 
            placeholder="संपादकीय नोट लिखें..."
            defaultValue={issue.editorial_note || ""}
          ></textarea>
          <button className="mt-2 px-3 py-1 bg-slate-900 text-white rounded text-xs w-full">Save Note</button>
        </div>
      </div>
    </div>
  );
}

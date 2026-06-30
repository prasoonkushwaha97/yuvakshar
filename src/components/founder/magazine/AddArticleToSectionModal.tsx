"use client";

import React, { useState } from "react";
import { addArticleToIssue } from "@/lib/actions/magazineActions";
import { getArticles } from "@/lib/actions/articleActions";
import { Article } from "@/types/content";

export default function AddArticleToSectionModal({ issueId, sectionId }: { issueId: string, sectionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Only search published articles for the magazine
      const data = await getArticles({ status: "published", search }, { page: 1, limit: 10, sortBy: "created_at", sortOrder: "desc" });
      setResults(data.data);
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAdd = async (articleId: string) => {
    setAddingId(articleId);
    try {
      await addArticleToIssue(issueId, articleId, sectionId);
      setIsOpen(false);
    } catch (e: any) {
      alert("Failed to add article: " + e.message);
    }
    setAddingId(null);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
      >
        + Add Article
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Article to Section</h2>
            
            <div className="flex space-x-2 mb-4">
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 border rounded p-2 text-sm"
                placeholder="प्रकाशित लेख खोजें..."
              />
              <button 
                onClick={handleSearch}
                className="px-4 py-2 bg-slate-900 text-white rounded text-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded divide-y mb-4">
              {results?.map(a => (
                <div key={a.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-sm">{a.title_hi}</div>
                    <div className="text-xs text-gray-500">By {a.profiles?.name}</div>
                  </div>
                  <button 
                    onClick={() => handleAdd(a.id)}
                    disabled={addingId === a.id}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    {addingId === a.id ? "Adding..." : "Add"}
                  </button>
                </div>
              ))}
              {results.length === 0 && !loading && search && (
                <div className="p-4 text-center text-sm text-gray-500">No articles found.</div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

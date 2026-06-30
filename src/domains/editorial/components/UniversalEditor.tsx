"use client";

import React, { useState } from "react";
import { ContentDocument, EditorBlock } from "../types/schema";
import { BlockRenderer } from "../renderer/BlockRenderer";
import { Plus, GripVertical, Settings2, Trash2 } from "lucide-react";

export function UniversalEditor({ 
  initialDocument,
  onChange
}: { 
  initialDocument: ContentDocument;
  onChange?: (doc: ContentDocument) => void;
}) {
  const [doc, setDoc] = useState<ContentDocument>(initialDocument);

  const addBlock = (type: EditorBlock["type"]) => {
    // Scaffold a new block based on type
    const newBlock: any = {
      id: crypto.randomUUID(),
      type,
      order: doc.blocks.length,
    };

    if (type === "heading") newBlock.content = { text: "New Heading", level: 2 };
    if (type === "paragraph") newBlock.content = { text: "Start writing..." };
    if (type === "quote") newBlock.content = { text: "Quote", author: "" };
    if (type === "image") newBlock.content = { url: "" };
    if (type === "divider") newBlock.content = {};

    const newDoc = {
      ...doc,
      blocks: [...doc.blocks, newBlock]
    };
    
    setDoc(newDoc);
    onChange?.(newDoc);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Title Field (implicitly part of metadata or a special block, assuming metadata for now) */}
      <input 
        type="text" 
        placeholder="लेख का शीर्षक"
        className="w-full text-5xl font-serif font-black bg-transparent border-none outline-none text-slate-900 dark:text-white mb-8 placeholder-slate-300 dark:placeholder-slate-700"
      />

      <div className="space-y-4">
        {doc.blocks.map((block, _index) => (
          <div key={block.id} className="group relative flex items-start gap-4 p-4 -mx-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
            
            {/* Block Controls (shown on hover) */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
               <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                 <GripVertical className="w-4 h-4" />
               </button>
               <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                 <Settings2 className="w-4 h-4" />
               </button>
               <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>

            {/* Block Content (Rendered vs Edit Mode) */}
            <div className="flex-1 min-w-0">
               {/* For this scaffold, we just use the renderer to show it. In reality, clicking it turns it into an input. */}
               <BlockRenderer block={block} />
            </div>
          </div>
        ))}
      </div>

      {/* Add Block Menu */}
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
        <div className="flex items-center gap-2">
          <button onClick={() => addBlock("paragraph")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Paragraph
          </button>
          <button onClick={() => addBlock("heading")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Heading
          </button>
          <button onClick={() => addBlock("image")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Image
          </button>
          <button onClick={() => addBlock("quote")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Quote
          </button>
        </div>
      </div>
      
    </div>
  );
}

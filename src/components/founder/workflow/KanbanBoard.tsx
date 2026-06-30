"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Article } from "@/types/content";
import { moveArticleStatus } from "@/lib/actions/workflowActions";

const COLUMNS = [
  { id: "draft", title: "Draft" },
  { id: "review", title: "Review" },
  { id: "fact_check", title: "Fact Check" },
  { id: "editor_review", title: "Editor Review" },
  { id: "scheduled", title: "Scheduled" },
  { id: "published", title: "Published" },
];

function SortableItem(props: { id: string; article: Article }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id, data: { type: "Article", article: props.article } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border rounded p-3 mb-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-500"
    >
      <div className="font-semibold text-sm">{props.article.title_hi}</div>
      <div className="text-xs text-gray-500 mt-1 truncate">{props.article.categories?.name_hi || 'Uncategorized'}</div>
    </div>
  );
}

export default function KanbanBoard({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeArticleId = active.id as string;
    const overId = over.id as string;

    const activeArticle = articles.find(a => a.id === activeArticleId);
    if (!activeArticle) return;

    // Is the over element a column or an article?
    // If we drop on an empty column, the overId is the column id
    // If we drop on an article, the overId is the article id. We need to find its column.
    
    let targetStatus = overId;
    const overArticle = articles.find(a => a.id === overId);
    if (overArticle) {
      targetStatus = overArticle.status;
    }

    // Only "review" is slightly mismatched in our standard enum if we use "in_review"
    if (targetStatus === "review") targetStatus = "in_review";

    if (activeArticle.status !== targetStatus && COLUMNS?.map(c => c.id).includes(targetStatus.replace('in_review', 'review'))) {
      const oldStatus = activeArticle.status;
      
      // Optimistic update
      setArticles(prev => prev?.map(a => a.id === activeArticleId ? { ...a, status: targetStatus as any } : a));

      try {
        await moveArticleStatus(activeArticleId, targetStatus);
      } catch (e: any) {
        console.error(e);
        // Revert on error
        setArticles(prev => prev?.map(a => a.id === activeArticleId ? { ...a, status: oldStatus } : a));
        alert("Failed to move article: " + e.message);
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-row space-x-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {COLUMNS?.map((col) => {
          // 'in_review' is the actual enum for 'review'
          const colStatus = col.id === 'review' ? 'in_review' : col.id;
          const colArticles = articles.filter((a) => a.status === colStatus);

          return (
            <div key={col.id} className="flex-shrink-0 w-72 flex flex-col bg-gray-50 rounded-lg p-3">
              <h3 className="font-bold text-gray-700 mb-3">{col.title} ({colArticles.length})</h3>
              
              <SortableContext 
                id={col.id}
                items={colArticles?.map(a => a.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 overflow-y-auto min-h-[150px]">
                  {colArticles?.map((article) => (
                    <SortableItem key={article.id} id={article.id} article={article} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white border rounded p-3 shadow-xl opacity-80">
            <div className="font-semibold text-sm">
              {articles.find(a => a.id === activeId)?.title_hi}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

import React from "react";
import { getArticleById } from "@/lib/actions/articleActions";
import { getReviewNotes } from "@/lib/actions/reviewActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";
import EditorClient from "@/components/founder/editor/EditorClient";

export const dynamic = "force-dynamic";

export default async function ArticleEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  
  const canEdit = await hasPermission("manage_articles");
  if (!canEdit) {
    redirect("/admin/unauthorized");
  }

  let article = null;
  let reviewNotes: any[] = [];

  if (!isNew) {
    article = await getArticleById(id);
    if (!article) {
      redirect("/admin/articles");
    }
    reviewNotes = await getReviewNotes(id);
  }

  return (
    <EditorClient 
      article={article} 
      isNew={isNew} 
      reviewNotes={reviewNotes} 
    />
  );
}

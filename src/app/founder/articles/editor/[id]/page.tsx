import React from "react";
import { getArticleById } from "@/lib/actions/articleActions";
import { getReviewNotes } from "@/lib/actions/reviewActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";
import EditorClient from "@/components/founder/editor/EditorClient";

export const dynamic = "force-dynamic";

export default async function ArticleEditor({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  
  const canEdit = await hasPermission("manage_articles");
  if (!canEdit) {
    redirect("/founder/unauthorized");
  }

  let article = null;
  let reviewNotes: any[] = [];

  if (!isNew) {
    article = await getArticleById(params.id);
    if (!article) {
      redirect("/founder/articles");
    }
    reviewNotes = await getReviewNotes(params.id);
  }

  return (
    <EditorClient 
      article={article} 
      isNew={isNew} 
      reviewNotes={reviewNotes} 
    />
  );
}

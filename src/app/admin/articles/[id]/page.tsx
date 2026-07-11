import React from "react";
import { getArticleById } from "@/lib/actions/articleActions";
import { hasPermission } from "@/lib/rbacService";
import { redirect } from "next/navigation";
import EditorClient from "@/components/editor/SharedEditorClient";

export const dynamic = "force-dynamic";

export default async function ArticleEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  
  const canEdit = await hasPermission("manage_articles");
  if (!canEdit) {
    redirect("/admin/unauthorized");
  }

  let article = null;
  if (!isNew) {
    article = await getArticleById(id);
    if (!article) {
      redirect("/admin/articles");
    }
  }

  return (
    <EditorClient 
      article={article} 
      isNew={isNew} 
      isEditorialRole={true}
    />
  );
}

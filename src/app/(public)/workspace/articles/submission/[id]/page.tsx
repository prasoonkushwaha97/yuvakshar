import React from "react";
import { getSubmissionDetails } from "@/lib/actions/userSubmissionActions";
import { notFound } from "next/navigation";
import EditorClient from "@/components/editor/SharedEditorClient";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: submission, error } = await getSubmissionDetails(id);

  if (error || !submission) {
    notFound();
  }

  return (
    <EditorClient 
      article={submission} 
      isNew={false} 
      isEditorialRole={false}
    />
  );
}

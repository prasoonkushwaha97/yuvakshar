import React from "react";
import EditorClient from "@/components/editor/SharedEditorClient";

export const dynamic = "force-dynamic";

export default function ContributorSubmissionPage() {
  return (
    <EditorClient 
      article={null} 
      isNew={true} 
      isEditorialRole={false}
    />
  );
}

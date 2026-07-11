import React from "react";
import { getUserSubmissions } from "@/lib/actions/userSubmissionActions";
import ArticlesDashboardClient from "./ArticlesDashboardClient";

export default async function UserDashboard() {
  const { submissions, error } = await getUserSubmissions();
  
  return <ArticlesDashboardClient initialSubmissions={submissions || []} error={error} />;
}

import React from "react";
import { getContributorSubmissions } from "@/lib/actions/contributeActions";
import ArticlesDashboardClient from "./ArticlesDashboardClient";

export default async function ContributorDashboard() {
  const { submissions, error } = await getContributorSubmissions();
  
  return <ArticlesDashboardClient initialSubmissions={submissions || []} error={error} />;
}

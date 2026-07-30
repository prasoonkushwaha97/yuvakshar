import React from "react";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbacService";
import { getEditorialPicks } from "@/lib/actions/articleActions";
import EditorialPicksManager from "@/components/admin/EditorialPicksManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editorial Picks Management | Yuvakshar Admin",
  description: "Manage, reorder, and feature articles in the homepage Editorial Picks section",
};

export default async function EditorialPicksAdminPage() {
  const canManage = await hasPermission("manage_articles");
  if (!canManage) {
    redirect("/admin/unauthorized");
  }

  const picks = await getEditorialPicks(50);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <EditorialPicksManager initialPicks={picks} />
    </div>
  );
}

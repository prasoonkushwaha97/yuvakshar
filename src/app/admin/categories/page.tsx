import React from "react";
import { getCategories } from "@/lib/actions/categoryActions";
import CategoryManager from "@/components/founder/categories/CategoryManager";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CategoryManager initialCategories={categories} />
    </div>
  );
}

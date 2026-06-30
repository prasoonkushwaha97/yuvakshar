import { supabase } from "../../../lib/supabaseClient";
import { Category } from "../../../store/types";

export interface ICategoryRepository {
  getCategories(): Promise<Category[]>;
}

export class SupabaseCategoryRepository implements ICategoryRepository {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error("Error fetching categories", error);
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || "",
      parentId: row.parent_id,
      language_code: row.language_code || 'hi',
      language: row.language_code === 'en' ? 'English' : 'Hindi'
    }));
  }
}

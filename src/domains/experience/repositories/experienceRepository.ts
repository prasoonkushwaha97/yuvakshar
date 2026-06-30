import { supabase } from "@/lib/supabaseClient";
import { HomepageLayout } from "@/store/types";

export interface IExperienceRepository {
  getPublishedHomepageLayout(): Promise<HomepageLayout | null>;
  getAllHomepageLayouts(): Promise<HomepageLayout[]>;
  getHomepageLayoutById(id: string): Promise<HomepageLayout | null>;
  createHomepageLayout(layout: Omit<HomepageLayout, "id">): Promise<HomepageLayout>;
  updateHomepageLayout(id: string, updates: Partial<HomepageLayout>): Promise<void>;
  publishHomepageLayout(id: string): Promise<void>;
  deleteHomepageLayout(id: string): Promise<void>;
}

export class SupabaseExperienceRepository implements IExperienceRepository {
  
  private mapDbToLayout(row: any): HomepageLayout {
    return {
      id: row.id,
      name: row.name,
      layout_json: row.layout_json,
      version: row.version,
      is_published: row.is_published,
    };
  }

  async getPublishedHomepageLayout(): Promise<HomepageLayout | null> {
    const { data, error } = await supabase
      .from('homepage_layouts')
      .select('*')
      .eq('is_published', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data ? this.mapDbToLayout(data) : null;
  }

  async getAllHomepageLayouts(): Promise<HomepageLayout[]> {
    const { data, error } = await supabase
      .from('homepage_layouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(this.mapDbToLayout) : [];
  }

  async getHomepageLayoutById(id: string): Promise<HomepageLayout | null> {
    const { data, error } = await supabase
      .from('homepage_layouts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data ? this.mapDbToLayout(data) : null;
  }

  async createHomepageLayout(layout: Omit<HomepageLayout, "id">): Promise<HomepageLayout> {
    const payload = {
      name: layout.name,
      layout_json: layout.layout_json,
      version: layout.version,
      is_published: layout.is_published
    };

    const { data, error } = await supabase
      .from('homepage_layouts')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToLayout(data);
  }

  async updateHomepageLayout(id: string, updates: Partial<HomepageLayout>): Promise<void> {
    const { error } = await supabase
      .from('homepage_layouts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async publishHomepageLayout(id: string): Promise<void> {
    // Unpublish all others
    await supabase
      .from('homepage_layouts')
      .update({ is_published: false })
      .neq('id', id);

    // Publish the target
    await this.updateHomepageLayout(id, { is_published: true });
  }

  async deleteHomepageLayout(id: string): Promise<void> {
    const { error } = await supabase
      .from('homepage_layouts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

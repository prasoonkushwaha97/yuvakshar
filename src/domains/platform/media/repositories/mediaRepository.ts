import { supabase } from "@/lib/supabaseClient";
import { MediaAsset, MediaFolder } from "../types/media";

export class SupabaseMediaRepository {
  async getFolders(parentId: string | null = null): Promise<MediaFolder[]> {
    
    let query = supabase.from("media_folders").select("*");
    
    if (parentId) {
      query = query.eq("parent_id", parentId);
    } else {
      query = query.is("parent_id", null);
    }

    const { data, error } = await query.order("name");
    if (error) {
      console.error("Error fetching media folders:", error);
      return [];
    }
    return data as MediaFolder[];
  }

  async createFolder(folder: Partial<MediaFolder>): Promise<MediaFolder> {
    
    const { data, error } = await supabase.from("media_folders").insert(folder).select().single();
    if (error) throw error;
    return data as MediaFolder;
  }

  async getAssets(folderId: string | null = null): Promise<MediaAsset[]> {
    
    let query = supabase.from("media_assets").select("*");
    
    if (folderId) {
      query = query.eq("folder_id", folderId);
    } else {
      query = query.is("folder_id", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching media assets:", error);
      return [];
    }
    return data as MediaAsset[];
  }

  async saveAsset(asset: Partial<MediaAsset>): Promise<MediaAsset> {
    
    if (asset.id) {
      const { data, error } = await supabase.from("media_assets").update(asset).eq("id", asset.id).select().single();
      if (error) throw error;
      return data as MediaAsset;
    } else {
      const { data, error } = await supabase.from("media_assets").insert(asset).select().single();
      if (error) throw error;
      return data as MediaAsset;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    
    const { error } = await supabase.from("media_assets").delete().eq("id", id);
    if (error) throw error;
  }
}

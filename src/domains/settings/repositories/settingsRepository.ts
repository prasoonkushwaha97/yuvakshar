import { supabase } from "@/lib/supabaseClient";
import { GeneralSettings, AppearanceSettings, FooterSettings } from "@/store/types";

export interface NavigationMenu {
  id: string;
  name: string;
  items: any[];
}

export interface Partner {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  display_order: number;
}

export interface ISettingsRepository {
  getSetting<T>(key: string): Promise<T | null>;
  updateSetting<T>(key: string, value: T): Promise<void>;
  
  getNavigationMenus(): Promise<NavigationMenu[]>;
  getNavigationMenuByName(name: string): Promise<NavigationMenu | null>;
  updateNavigationMenu(name: string, items: any[]): Promise<void>;

  getPartners(): Promise<Partner[]>;
  updatePartner(id: string, updates: Partial<Partner>): Promise<void>;
  createPartner(partner: Omit<Partner, "id">): Promise<Partner>;
  deletePartner(id: string): Promise<void>;
}

export class SupabaseSettingsRepository implements ISettingsRepository {
  
  // ─── Settings ─────────────────────────────────────────────────────────────
  async getSetting<T>(key: string): Promise<T | null> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data?.value as T;
  }

  async updateSetting<T>(key: string, value: T): Promise<void> {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value });

    if (error) throw error;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  async getNavigationMenus(): Promise<NavigationMenu[]> {
    const { data, error } = await supabase
      .from('navigation_menus')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async getNavigationMenuByName(name: string): Promise<NavigationMenu | null> {
    const { data, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data || null;
  }

  async updateNavigationMenu(name: string, items: any[]): Promise<void> {
    const { error } = await supabase
      .from('navigation_menus')
      .upsert({ name, items }, { onConflict: 'name' });

    if (error) throw error;
  }

  // ─── Partners ─────────────────────────────────────────────────────────────
  async getPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
    const { error } = await supabase
      .from('partners')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async createPartner(partner: Omit<Partner, "id">): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .insert(partner)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePartner(id: string): Promise<void> {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

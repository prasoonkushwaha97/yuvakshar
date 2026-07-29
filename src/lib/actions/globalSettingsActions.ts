'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { notifyBrandingUpdated, notifyLogoChanged, notifySeoUpdated } from '@/lib/notificationService';

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('is_public', true);

  if (error) {
    console.error('Error fetching site settings:', error);
    return [];
  }
  return data || [];
}

export async function updateSiteSetting(key: string, value: any, is_public: boolean = true) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, is_public }, { onConflict: 'key' });

  if (error) {
    console.error(`Error updating setting ${key}:`, error);
    return { success: false, error: error.message };
  }

  // Notify on branding-related keys
  const lk = key.toLowerCase();
  if (lk.includes('logo')) {
    notifyLogoChanged().catch(() => {});
  } else if (lk.includes('seo') || lk.includes('meta')) {
    notifySeoUpdated().catch(() => {});
  } else if (lk.includes('brand') || lk.includes('color') || lk.includes('theme') || lk.includes('favicon')) {
    notifyBrandingUpdated().catch(() => {});
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getFeatureFlags() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*');

  if (error) {
    console.error('Error fetching feature flags:', error);
    return [];
  }
  return data || [];
}

export async function toggleFeatureFlag(flag_key: string, is_enabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('feature_flags')
    .update({ is_enabled })
    .eq('flag_key', flag_key);

  if (error) {
    console.error(`Error updating feature flag ${flag_key}:`, error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getNavigationMenus() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('navigation_menus')
    .select('*, navigation_items(*)')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching navigation menus:', error);
    return [];
  }
  return data || [];
}

export async function createNavigationItem(menu_id: string, label: string, url: string, sort_order: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('navigation_items')
    .insert([{ menu_id, label, url, sort_order }]);

  if (error) {
    console.error('Error creating navigation item:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteNavigationItem(item_id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('navigation_items')
    .delete()
    .eq('id', item_id);

  if (error) {
    console.error('Error deleting navigation item:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getHomepageSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching homepage sections:', error);
    return [];
  }
  return data || [];
}

export async function updateHomepageSection(id: string, updates: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('homepage_sections')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error(`Error updating homepage section ${id}:`, error);
    return { success: false, error: error.message };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getAdvertisements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
  return data || [];
}

export async function updateAdvertisement(id: string, updates: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('advertisements')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error(`Error updating ad ${id}:`, error);
    return { success: false, error: error.message };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getSeoSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*');

  if (error) {
    console.error('Error fetching SEO settings:', error);
    return [];
  }
  return data || [];
}

export async function updateSeoSetting(id: string, updates: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('seo_settings')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error(`Error updating SEO ${id}:`, error);
    return { success: false, error: error.message };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

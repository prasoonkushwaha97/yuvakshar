import { supabase } from "../../../lib/supabaseClient";
import { Profile } from "../../../store/types";

export interface IUserRepository {
  getProfiles(): Promise<Profile[]>;
  getProfileById(id: string): Promise<Profile | null>;
}

export class SupabaseUserRepository implements IUserRepository {
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error("Error fetching profiles", error);
      return [];
    }
    return data.map(this.mapDbToProfile);
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error || !data) return null;
    return this.mapDbToProfile(data);
  }

  private mapDbToProfile(row: any): Profile {
    return {
      id: row.id,
      name: row.name,
      username: row.username || "",
      email: row.email || "", // Might be stored elsewhere based on schema, but let's map it
      mobile: row.mobile,
      role: row.role as any,

      status: row.status as any,
      joinDate: row.join_date || row.created_at,
      avatar_url: row.avatar_url,
      bio: row.bio,
      
      // Extended fields
      slug: row.slug,
      cover_banner: row.cover_banner,
      designation: row.designation,
      current_role: row.current_role,
      verification_badge: row.verification_badge,
      institution: row.institution,
      expertise_tags: row.expertise_tags || [],
      orcid_id: row.orcid_id,
      google_scholar_url: row.google_scholar_url,
      academic_credentials: row.academic_credentials || [],

      education: row.education,
      academic_background: row.academic_background,
      research_interests: row.research_interests,
      professional_experience: row.professional_experience,
      social_contributions: row.social_contributions,
      publications_list: row.publications_list,
      publicVisibility: row.public_visibility,
      
      articlesReadCount: row.articles_read_count || 0,
      totalReadingTime: row.total_reading_time_minutes || 0,

      interests: row.interests || [],
      dob: row.dob,
      gender: row.gender,
      location: row.location
    };
  }
}

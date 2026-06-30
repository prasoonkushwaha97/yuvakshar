import { supabase } from "@/lib/supabaseClient";
import { MagazineIssue } from "@/store/types";

export class SupabaseMagazineRepository {
  async getAllIssues(): Promise<MagazineIssue[]> {
    const { data, error } = await supabase
      .from("magazine_issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapDbToMagazine);
  }

  async getPublishedIssues(): Promise<MagazineIssue[]> {
    const { data, error } = await supabase
      .from("magazine_issues")
      .select("*")
      .in("status", ["Published", "Archived"])
      .order("publish_date", { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapDbToMagazine);
  }

  async getIssueById(id: string): Promise<MagazineIssue | null> {
    const { data, error } = await supabase
      .from("magazine_issues")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return this.mapDbToMagazine(data);
  }

  async createIssue(issue: Omit<MagazineIssue, "id">): Promise<MagazineIssue> {
    const { data, error } = await supabase
      .from("magazine_issues")
      .insert(this.mapMagazineToDb(issue))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToMagazine(data);
  }

  async updateIssue(id: string, updates: Partial<MagazineIssue>): Promise<MagazineIssue> {
    const dbUpdates = this.mapMagazineToDb(updates);
    const { data, error } = await supabase
      .from("magazine_issues")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToMagazine(data);
  }

  async deleteIssue(id: string): Promise<void> {
    const { error } = await supabase
      .from("magazine_issues")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private mapDbToMagazine(row: any): MagazineIssue {
    return {
      id: row.id,
      issue: row.issue,
      edition: row.edition,
      month: row.month,
      year: row.year,
      coverImage: row.cover_image,
      description: row.description,
      category: row.category,
      accessLevel: row.access_level,
      status: row.status,
      pdfSourceUrl: row.pdf_source_url,
      isFeatured: row.is_featured,
      isRecommended: row.is_recommended,
      pages: row.pages_json || [],
      publishDate: row.publish_date
    };
  }

  private mapMagazineToDb(issue: Partial<MagazineIssue>): any {
    const row: any = {};
    if (issue.issue !== undefined) row.issue = issue.issue;
    if (issue.edition !== undefined) row.edition = issue.edition;
    if (issue.month !== undefined) row.month = issue.month;
    if (issue.year !== undefined) row.year = issue.year;
    if (issue.coverImage !== undefined) row.cover_image = issue.coverImage;
    if (issue.description !== undefined) row.description = issue.description;
    if (issue.category !== undefined) row.category = issue.category;
    if (issue.accessLevel !== undefined) row.access_level = issue.accessLevel;
    if (issue.status !== undefined) row.status = issue.status;
    if (issue.pdfSourceUrl !== undefined) row.pdf_source_url = issue.pdfSourceUrl;
    if (issue.isFeatured !== undefined) row.is_featured = issue.isFeatured;
    if (issue.isRecommended !== undefined) row.is_recommended = issue.isRecommended;
    if (issue.pages !== undefined) row.pages_json = issue.pages;
    if (issue.publishDate !== undefined) row.publish_date = issue.publishDate;
    return row;
  }
}

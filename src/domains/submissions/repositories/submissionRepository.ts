import { supabase } from "@/lib/supabaseClient";
import { Submission } from "@/store/types";

export interface ISubmissionRepository {
  getSubmissions(): Promise<Submission[]>;
  getSubmissionById(id: string): Promise<Submission | null>;
  createSubmission(submission: Omit<Submission, "id" | "created_at">): Promise<Submission>;
  updateSubmissionStatus(id: string, status: Submission["status"]): Promise<void>;
  deleteSubmission(id: string): Promise<void>;
}

export class SupabaseSubmissionRepository implements ISubmissionRepository {
  
  private mapDbToSubmission(row: any): Submission {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      email: row.email,
      mobile: row.mobile || undefined,
      subject: row.subject || undefined,
      content: row.content,
      status: row.status,
      category: row.category || undefined,
      title: row.title || undefined,
      image_url: row.image_url || undefined,
      pdf_url: row.pdf_url || undefined,
      doc_url: row.doc_url || undefined,
      created_at: row.created_at,
    };
  }

  async getSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(this.mapDbToSubmission) : [];
  }

  async getSubmissionById(id: string): Promise<Submission | null> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data ? this.mapDbToSubmission(data) : null;
  }

  async createSubmission(submission: Omit<Submission, "id" | "created_at">): Promise<Submission> {
    const payload = {
      type: submission.type,
      name: submission.name,
      email: submission.email,
      mobile: submission.mobile,
      subject: submission.subject,
      content: submission.content,
      status: submission.status,
      category: submission.category,
      title: submission.title,
      image_url: submission.image_url,
      pdf_url: submission.pdf_url,
      doc_url: submission.doc_url
    };

    const { data, error } = await supabase
      .from('submissions')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToSubmission(data);
  }

  async updateSubmissionStatus(id: string, status: Submission["status"]): Promise<void> {
    const { error } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteSubmission(id: string): Promise<void> {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

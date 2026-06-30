import { supabase } from "@/lib/supabaseClient";
import { EditorialAssignment } from "@/store/types";

export interface IEditorialRepository {
  getAssignments(): Promise<EditorialAssignment[]>;
  getAssignmentById(id: string): Promise<EditorialAssignment | null>;
  createAssignment(assignment: Omit<EditorialAssignment, "id" | "created_at">): Promise<EditorialAssignment>;
  updateAssignmentStatus(id: string, status: EditorialAssignment["status"]): Promise<void>;
  deleteAssignment(id: string): Promise<void>;
}

export class SupabaseEditorialRepository implements IEditorialRepository {
  
  private mapDbToAssignment(row: any): EditorialAssignment {
    return {
      id: row.id,
      article_id: row.article_id,
      submission_id: row.submission_id,
      author_id: row.author_id,
      reviewer_id: row.reviewer_id,
      section_editor_id: row.section_editor_id,
      deadline: row.deadline,
      status: row.status,
      created_at: row.created_at,
    };
  }

  async getAssignments(): Promise<EditorialAssignment[]> {
    const { data, error } = await supabase
      .from('editorial_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(this.mapDbToAssignment) : [];
  }

  async getAssignmentById(id: string): Promise<EditorialAssignment | null> {
    const { data, error } = await supabase
      .from('editorial_assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data ? this.mapDbToAssignment(data) : null;
  }

  async createAssignment(assignment: Omit<EditorialAssignment, "id" | "created_at">): Promise<EditorialAssignment> {
    const payload = {
      article_id: assignment.article_id,
      author_id: assignment.author_id,
      reviewer_id: assignment.reviewer_id,
      section_editor_id: assignment.section_editor_id,
      deadline: assignment.deadline,
      status: assignment.status
    };

    const { data, error } = await supabase
      .from('editorial_assignments')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToAssignment(data);
  }

  async updateAssignmentStatus(id: string, status: EditorialAssignment["status"]): Promise<void> {
    const { error } = await supabase
      .from('editorial_assignments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteAssignment(id: string): Promise<void> {
    const { error } = await supabase
      .from('editorial_assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

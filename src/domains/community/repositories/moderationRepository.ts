import { supabase } from "@/lib/supabaseClient";

export interface ModerationReport {
  id: string;
  content_type: "post" | "comment" | "user";
  content_id: string;
  reporter_id?: string;
  reason: string;
  status: "Pending" | "Resolved" | "Dismissed";
  created_at: string;
}

export interface ModerationAction {
  id: string;
  report_id?: string;
  content_type: string;
  content_id: string;
  action_taken: string;
  moderator_id?: string;
  notes?: string;
  resolved_at: string;
}

export class SupabaseModerationRepository {
  async getPendingReports(): Promise<ModerationReport[]> {
    const { data, error } = await supabase
      .from("moderation_reports")
      .select("*")
      .eq("status", "Pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ModerationReport[];
  }

  async createReport(report: Omit<ModerationReport, "id" | "created_at" | "status">): Promise<ModerationReport> {
    const { data, error } = await supabase
      .from("moderation_reports")
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data as ModerationReport;
  }

  async resolveReport(reportId: string, actionTaken: string, moderatorId: string, notes?: string): Promise<void> {
    // 1. Get the report
    const { data: report, error: fetchError } = await supabase
      .from("moderation_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Log the action
    const { error: actionError } = await supabase
      .from("moderation_actions")
      .insert({
        report_id: report.id,
        content_type: report.content_type,
        content_id: report.content_id,
        action_taken: actionTaken,
        moderator_id: moderatorId,
        notes: notes
      });

    if (actionError) throw actionError;

    // 3. Update report status
    const { error: updateError } = await supabase
      .from("moderation_reports")
      .update({ status: "Resolved" })
      .eq("id", reportId);

    if (updateError) throw updateError;
  }
}

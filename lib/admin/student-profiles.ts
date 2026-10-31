import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { listReferenceSchools } from "@/lib/schools";
import { mapProfileRow, pickDisplayName } from "@/lib/student-profile";

export interface StudentProfileSummary {
  id: string;
  studentName: string | null;
  transcriptStatus: ReturnType<typeof mapProfileRow>["transcript"]["status"];
  ieltsStatus: ReturnType<typeof mapProfileRow>["ielts"]["status"];
  identityStatus: ReturnType<typeof mapProfileRow>["identity"]["status"];
  matchedSchools: number;
  totalSchools: number;
  submittedAt: string;
}

export async function listStudentProfileSummaries(): Promise<StudentProfileSummary[]> {
  const supabase = getSupabaseAdmin();
  const [{ data: rows }, schools] = await Promise.all([
    supabase.from("student_profiles").select("*").order("created_at", { ascending: false }),
    listReferenceSchools(),
  ]);

  return (rows ?? []).map((row) => {
    const profile = mapProfileRow(row);
    const gpa = profile.transcript.status === "hop_le" ? profile.transcript.gpa : null;
    const ielts = profile.ielts.status === "hop_le" ? profile.ielts.overall : null;
    const matchedSchools =
      gpa === null || ielts === null
        ? 0
        : schools.filter((s) => gpa >= s.minGpa && ielts >= s.minIelts).length;

    return {
      id: profile.id,
      studentName: pickDisplayName(profile),
      transcriptStatus: profile.transcript.status,
      ieltsStatus: profile.ielts.status,
      identityStatus: profile.identity.status,
      matchedSchools,
      totalSchools: schools.length,
      submittedAt: row.created_at,
    };
  });
}

export async function deleteStudentProfile(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("student_profiles").delete().eq("id", id);

  if (error) {
    throw new Error(`Không xóa được hồ sơ học viên: ${error.message}`);
  }
}

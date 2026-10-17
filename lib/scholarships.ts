import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface Scholarship {
  id: string;
  schoolId: string;
  schoolName: string;
  name: string;
  minGpa: number | null;
  minIelts: number | null;
  supportDescription: string;
}

export async function listScholarships(): Promise<Scholarship[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("scholarships")
    .select("id, school_id, name, min_gpa, min_ielts, support_description, schools(name)")
    .order("name", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    schoolId: row.school_id,
    schoolName: row.schools?.name ?? "",
    name: row.name,
    minGpa: row.min_gpa !== null ? Number(row.min_gpa) : null,
    minIelts: row.min_ielts !== null ? Number(row.min_ielts) : null,
    supportDescription: row.support_description,
  }));
}

export async function listScholarshipsForSchool(schoolId: string): Promise<Scholarship[]> {
  const scholarships = await listScholarships();
  return scholarships.filter((s) => s.schoolId === schoolId);
}

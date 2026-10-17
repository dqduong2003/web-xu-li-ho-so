import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface ReferenceSchool {
  id: string;
  name: string;
  country: string;
  minGpa: number;
  minIelts: number;
}

export async function listReferenceSchools(): Promise<ReferenceSchool[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("schools").select("*").order("name", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    country: row.country,
    minGpa: Number(row.min_gpa),
    minIelts: Number(row.min_ielts),
  }));
}

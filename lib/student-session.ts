import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { mapProfileRow, type StudentProfile } from "@/lib/student-profile";

const COOKIE_NAME = "student_session";

export type { DocStatus, StudentProfile } from "@/lib/student-profile";
export { mapProfileRow, pickDisplayName } from "@/lib/student-profile";

// The `student_session` cookie is assigned by middleware.ts for every request
// to /portal and /api/portal/*, so by the time this runs the cookie always
// exists. This function only reads the cookie and writes to the database —
// it never calls `cookies().set()`, which Next.js forbids during Server
// Component rendering (only Server Actions / Route Handlers may set cookies).
export async function getOrCreateStudentProfile(): Promise<StudentProfile> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionToken) {
    throw new Error("Thiếu student_session cookie — middleware chưa chạy cho route này.");
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (existing) return mapProfileRow(existing);

  const { data, error } = await supabase
    .from("student_profiles")
    .insert({ session_token: sessionToken })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Không tạo được hồ sơ học viên: ${error?.message}`);
  }

  return mapProfileRow(data);
}

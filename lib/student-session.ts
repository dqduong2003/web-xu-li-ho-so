import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getAuthenticatedUser } from "@/lib/auth";
import { isEmailApproved } from "@/lib/quote-requests";
import { mapProfileRow, type StudentProfile } from "@/lib/student-profile";

export type { DocStatus, StudentProfile } from "@/lib/student-profile";
export { mapProfileRow, pickDisplayName } from "@/lib/student-profile";

// Thrown when a signed-in Google account has no approved ("da_duyet") quote
// request on file — the portal page and upload route catch this to show a
// distinct "access denied" state instead of the regular profile UI/errors.
export class PortalAccessDeniedError extends Error {}

// proxy.ts redirects unauthenticated requests away from /portal and
// /api/portal/* before they reach this function, so in practice a user is
// always present here. The thrown error is just a defensive fallback.
export async function getOrCreateStudentProfile(): Promise<StudentProfile> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Bạn cần đăng nhập để sử dụng Cổng hồ sơ.");
  }

  if (!user.email || !(await isEmailApproved(user.email))) {
    throw new PortalAccessDeniedError(
      "Email của bạn chưa được duyệt yêu cầu báo giá nên chưa có quyền truy cập Cổng hồ sơ.",
    );
  }

  // Read through the signed-in user's own session so the "view own row" RLS
  // policy on student_profiles actually applies — unlike the admin client,
  // which bypasses RLS entirely.
  const supabaseAsUser = await createSupabaseServerClient();
  const { data: existing } = await supabaseAsUser
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return mapProfileRow(existing);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_profiles")
    .insert({ user_id: user.id })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Không tạo được hồ sơ học viên: ${error?.message}`);
  }

  return mapProfileRow(data);
}

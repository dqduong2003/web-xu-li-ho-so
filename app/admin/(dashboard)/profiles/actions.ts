"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { deleteStudentProfile } from "@/lib/admin/student-profiles";

export async function deleteStudentProfileAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAuthenticatedAdmin();
  if (admin?.role !== "admin") {
    return { ok: false, error: "Bạn không có quyền xóa hồ sơ học viên." };
  }

  try {
    await deleteStudentProfile(id);
    revalidatePath("/admin/profiles");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Đã có lỗi xảy ra." };
  }
}

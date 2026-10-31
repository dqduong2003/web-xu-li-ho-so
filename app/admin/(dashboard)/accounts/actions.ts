"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createInternalAccount, updateAccountRole, AccountError } from "@/lib/admin/accounts";
import type { AdminRole } from "@/lib/auth";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createAccountAction(input: {
  email: string;
  password: string;
  role: AdminRole;
}): Promise<ActionResult> {
  const admin = await getAuthenticatedAdmin();
  if (admin?.role !== "admin") {
    return { ok: false, error: "Bạn không có quyền tạo tài khoản." };
  }

  try {
    await createInternalAccount(input);
    revalidatePath("/admin/accounts");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof AccountError ? error.message : "Đã có lỗi xảy ra." };
  }
}

export async function updateAccountRoleAction(userId: string, role: AdminRole): Promise<ActionResult> {
  const admin = await getAuthenticatedAdmin();
  if (admin?.role !== "admin") {
    return { ok: false, error: "Bạn không có quyền đổi vai trò." };
  }
  if (admin.id === userId) {
    return { ok: false, error: "Không thể tự đổi vai trò của chính mình." };
  }

  try {
    await updateAccountRole(userId, role);
    revalidatePath("/admin/accounts");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof AccountError ? error.message : "Đã có lỗi xảy ra." };
  }
}

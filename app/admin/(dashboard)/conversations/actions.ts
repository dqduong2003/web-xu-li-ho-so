"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { deleteConversation } from "@/lib/admin/conversations";
import { extractLeadFromConversation } from "@/lib/admin/leads";

export async function deleteConversationAction(id: string) {
  const admin = await getAuthenticatedAdmin();
  if (admin?.role !== "admin") {
    return;
  }

  await deleteConversation(id);
  revalidatePath("/admin/conversations");
  redirect("/admin/conversations");
}

export async function extractLeadAction(
  conversationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAuthenticatedAdmin();
  if (admin?.role !== "admin") {
    return { ok: false, error: "Bạn không có quyền trích xuất lead." };
  }

  try {
    await extractLeadFromConversation(conversationId);
    revalidatePath(`/admin/conversations/${conversationId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Đã có lỗi xảy ra." };
  }
}

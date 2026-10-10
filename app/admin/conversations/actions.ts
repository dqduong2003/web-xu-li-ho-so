"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteConversation } from "@/lib/admin/conversations";
import { extractLeadFromConversation } from "@/lib/admin/leads";

export async function deleteConversationAction(id: string) {
  await deleteConversation(id);
  revalidatePath("/admin/conversations");
  redirect("/admin/conversations");
}

export async function extractLeadAction(
  conversationId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await extractLeadFromConversation(conversationId);
    revalidatePath(`/admin/conversations/${conversationId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Đã có lỗi xảy ra." };
  }
}

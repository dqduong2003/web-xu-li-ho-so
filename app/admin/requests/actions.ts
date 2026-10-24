"use server";

import { revalidatePath } from "next/cache";
import { approveQuoteRequest, deleteQuoteRequest, QuoteRequestError } from "@/lib/quote-requests";

function errorMessage(error: unknown): string {
  return error instanceof QuoteRequestError
    ? error.message
    : error instanceof Error
      ? error.message
      : "Đã có lỗi xảy ra.";
}

export async function approveQuoteRequestAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await approveQuoteRequest(id);
    revalidatePath("/admin/requests");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function rejectQuoteRequestAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await deleteQuoteRequest(id);
    revalidatePath("/admin/requests");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

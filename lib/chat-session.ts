import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const COOKIE_NAME = "chat_session";
const GREETING =
  "Chào bạn! Mình là Trợ lý AI Tư vấn Du học của DuHoc24. Bạn đang quan tâm du học nước nào, hay đang phân vân giữa vài nước ạ?";

export interface ChatMessageRow {
  role: "user" | "bot";
  content: string;
  created_at: string;
}

export async function getOrCreateConversation(): Promise<{
  conversationId: string;
  messages: ChatMessageRow[];
}> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  const supabase = getSupabaseAdmin();

  if (sessionToken) {
    const { data: conversation } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (conversation) {
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      // The `role` column is constrained to 'user' | 'bot' by a DB check constraint.
      return { conversationId: conversation.id, messages: (messages ?? []) as ChatMessageRow[] };
    }
  }

  const newToken = randomUUID();
  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .insert({ session_token: newToken })
    .select("id")
    .single();

  if (error || !conversation) {
    throw new Error(`Không tạo được cuộc hội thoại: ${error?.message}`);
  }

  const { data: greeting } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversation.id, role: "bot", content: GREETING })
    .select("role, content, created_at")
    .single();

  cookieStore.set(COOKIE_NAME, newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { conversationId: conversation.id, messages: greeting ? [greeting as ChatMessageRow] : [] };
}

export async function addMessage(conversationId: string, role: "user" | "bot", content: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from("chat_messages").insert({ conversation_id: conversationId, role, content });
  await supabase
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface ConversationSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string | null;
  leadQuality: "good" | "ok" | "spam" | null;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  createdAt: string;
}

export interface ConversationDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

export async function listConversationSummaries(): Promise<ConversationSummary[]> {
  const supabase = getSupabaseAdmin();

  const { data: conversations, error: conversationsError } = await supabase
    .from("chat_conversations")
    .select("id, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (conversationsError || !conversations || conversations.length === 0) {
    return [];
  }

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("conversation_id, content, created_at")
    .order("created_at", { ascending: true });

  const { data: leads } = await supabase.from("chat_leads").select("conversation_id, quality");

  const countByConversation = new Map<string, number>();
  const lastMessageByConversation = new Map<string, string>();

  for (const message of messages ?? []) {
    countByConversation.set(
      message.conversation_id,
      (countByConversation.get(message.conversation_id) ?? 0) + 1,
    );
    // Messages are ordered ascending, so the last write here is the latest message.
    lastMessageByConversation.set(message.conversation_id, message.content);
  }

  const qualityByConversation = new Map<string, "good" | "ok" | "spam">();
  for (const lead of leads ?? []) {
    const quality = lead.quality === "good" || lead.quality === "spam" ? lead.quality : "ok";
    qualityByConversation.set(lead.conversation_id, quality);
  }

  return conversations.map((conversation) => ({
    id: conversation.id,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    messageCount: countByConversation.get(conversation.id) ?? 0,
    lastMessagePreview: lastMessageByConversation.get(conversation.id) ?? null,
    leadQuality: qualityByConversation.get(conversation.id) ?? null,
  }));
}

export async function getConversationDetail(id: string): Promise<ConversationDetail | null> {
  const supabase = getSupabaseAdmin();

  const { data: conversation, error: conversationError } = await supabase
    .from("chat_conversations")
    .select("id, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (conversationError || !conversation) {
    return null;
  }

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return {
    id: conversation.id,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    // The `role` column is constrained to 'user' | 'bot' by a DB check constraint.
    messages: (messages ?? []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "bot",
      content: m.content,
      createdAt: m.created_at,
    })),
  };
}

export async function deleteConversation(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("chat_conversations").delete().eq("id", id);

  if (error) {
    throw new Error(`Không xóa được cuộc hội thoại: ${error.message}`);
  }
}

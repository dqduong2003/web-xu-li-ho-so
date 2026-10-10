import { NextRequest, NextResponse } from "next/server";
import { buildSystemInstruction, FALLBACK_REPLY } from "@/lib/chatbot-prompt";
import { getOrCreateConversation, addMessage, type ChatMessageRow } from "@/lib/chat-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callGemini } from "@/lib/gemini";

function toWireMessages(rows: ChatMessageRow[]) {
  return rows.map((r) => ({ from: r.role === "user" ? "user" : "bot", text: r.content }));
}

export async function GET() {
  try {
    const { messages } = await getOrCreateConversation();
    return NextResponse.json({ messages: toWireMessages(messages) });
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return NextResponse.json({ error: "Không tải được lịch sử hội thoại." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Thiếu GEMINI_API_KEY trong môi trường server." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Thiếu nội dung câu hỏi." }, { status: 400 });
  }

  const { conversationId, messages: history } = await getOrCreateConversation();
  await addMessage(conversationId, "user", message);

  const contents = [
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  let reply = FALLBACK_REPLY;
  try {
    const text = await callGemini({
      systemInstruction: { parts: [{ text: buildSystemInstruction() }] },
      contents,
    });
    if (text) reply = text;
  } catch (error) {
    console.error("Gemini API request failed:", error);
  }

  await addMessage(conversationId, "bot", reply);

  const supabase = getSupabaseAdmin();
  const { data: allMessages } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // The `role` column is constrained to 'user' | 'bot' by a DB check constraint.
  return NextResponse.json({ messages: toWireMessages((allMessages ?? []) as ChatMessageRow[]) });
}

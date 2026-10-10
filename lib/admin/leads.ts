import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callGemini } from "@/lib/gemini";
import { getConversationDetail } from "@/lib/admin/conversations";
import type { Database } from "@/lib/supabase/database.types";

export type LeadQuality = "good" | "ok" | "spam";

export interface Lead {
  id: string;
  conversationId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  targetCountry: string | null;
  educationLevel: string | null;
  major: string | null;
  availability: string | null;
  wantsConsultation: boolean | null;
  note: string | null;
  quality: LeadQuality;
  updatedAt: string;
}

const LEAD_EXTRACTION_PROMPT = `Bạn là hệ thống trích xuất dữ liệu. Đọc đoạn hội thoại giữa khách và chatbot tư vấn du học dưới đây, rồi trích xuất thông tin lead theo đúng schema JSON được yêu cầu.

Quy tắc:
- Chỉ lấy thông tin khách THỰC SỰ đã cung cấp trong hội thoại. Không suy đoán, không bịa thêm.
- Nếu một trường không được đề cập trong hội thoại, để giá trị null.
- "wants_consultation": true nếu khách đồng ý/muốn đặt lịch tư vấn, false nếu khách từ chối, null nếu chưa rõ.
- "quality" đánh giá chất lượng lead:
  - "good": khách cung cấp đủ thông tin liên hệ (tên, và email hoặc số điện thoại) và thể hiện nhu cầu du học rõ ràng, nghiêm túc.
  - "ok": khách có một phần thông tin hoặc nhu cầu chưa thật rõ ràng, nhưng vẫn có tiềm năng theo dõi.
  - "spam": hội thoại không liên quan đến du học, spam, test, hoặc khách rõ ràng không có nhu cầu thật.
- "note": tóm tắt ngắn 1-2 câu các điểm quan trọng khác về nhu cầu của khách, không lặp lại các trường đã có.`;

const LEAD_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING", nullable: true },
    email: { type: "STRING", nullable: true },
    phone: { type: "STRING", nullable: true },
    target_country: { type: "STRING", nullable: true },
    education_level: { type: "STRING", nullable: true },
    major: { type: "STRING", nullable: true },
    availability: { type: "STRING", nullable: true },
    wants_consultation: { type: "BOOLEAN", nullable: true },
    note: { type: "STRING", nullable: true },
    quality: { type: "STRING", enum: ["good", "ok", "spam"] },
  },
  required: ["quality"],
};

type LeadRow = Database["public"]["Tables"]["chat_leads"]["Row"];

function mapRow(row: LeadRow): Lead {
  const quality: LeadQuality = row.quality === "good" || row.quality === "spam" ? row.quality : "ok";
  return {
    id: row.id,
    conversationId: row.conversation_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    targetCountry: row.target_country,
    educationLevel: row.education_level,
    major: row.major,
    availability: row.availability,
    wantsConsultation: row.wants_consultation,
    note: row.note,
    quality,
    updatedAt: row.updated_at,
  };
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function getLeadForConversation(conversationId: string): Promise<Lead | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("chat_leads")
    .select("*")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  return data ? mapRow(data) : null;
}

export async function extractLeadFromConversation(conversationId: string): Promise<Lead> {
  const conversation = await getConversationDetail(conversationId);
  if (!conversation) {
    throw new Error("Không tìm thấy cuộc hội thoại.");
  }

  const transcript = conversation.messages.length
    ? conversation.messages.map((m) => `${m.role === "user" ? "Khách" : "Trợ lý"}: ${m.content}`).join("\n")
    : "(Cuộc hội thoại chưa có tin nhắn nào)";

  const text = await callGemini({
    systemInstruction: { parts: [{ text: LEAD_EXTRACTION_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: transcript }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: LEAD_RESPONSE_SCHEMA,
    },
  });

  if (!text) {
    throw new Error("Không nhận được phản hồi từ Gemini.");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Không đọc được dữ liệu JSON từ Gemini.");
  }

  const quality: LeadQuality =
    parsed.quality === "good" || parsed.quality === "spam" ? parsed.quality : "ok";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_leads")
    .upsert(
      {
        conversation_id: conversationId,
        name: nullableString(parsed.name),
        email: nullableString(parsed.email),
        phone: nullableString(parsed.phone),
        target_country: nullableString(parsed.target_country),
        education_level: nullableString(parsed.education_level),
        major: nullableString(parsed.major),
        availability: nullableString(parsed.availability),
        wants_consultation: typeof parsed.wants_consultation === "boolean" ? parsed.wants_consultation : null,
        note: nullableString(parsed.note),
        quality,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "conversation_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Không lưu được lead: ${error?.message}`);
  }

  return mapRow(data);
}

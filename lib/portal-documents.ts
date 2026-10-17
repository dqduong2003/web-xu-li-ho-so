import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callGemini } from "@/lib/gemini";
import { mapProfileRow, type StudentProfile, type DocStatus } from "@/lib/student-profile";
import type { Database } from "@/lib/supabase/database.types";

export type DocType = "transcript" | "ielts" | "identity";

const BUCKET = "student-documents";
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export class DocumentUploadError extends Error {}

interface DocTypeConfig {
  allowedMimeTypes: string[];
  prompt: string;
  schema: Record<string, unknown>;
}

const DOC_CONFIG: Record<DocType, DocTypeConfig> = {
  transcript: {
    allowedMimeTypes: ["application/pdf"],
    prompt: `Bạn là hệ thống trích xuất dữ liệu từ bảng điểm học tập (file PDF) của học viên.

Đọc file và trích xuất:
- "full_name": họ tên học viên trên bảng điểm.
- "date_of_birth": ngày sinh học viên, nếu bảng điểm có ghi (giữ nguyên văn như trong file).
- "gpa": điểm học tập tổng kết/trung bình (giữ nguyên số, đúng thang điểm ghi trong bảng điểm).

Nếu file KHÔNG phải bảng điểm học tập, quá mờ/không đọc được, hoặc thiếu các thông tin quan trọng trên, đặt "readable": false và giải thích ngắn gọn lý do trong "reason". Chỉ điền giá trị bạn đọc được thực sự từ file, không suy đoán hay bịa thêm.`,
    schema: {
      type: "OBJECT",
      properties: {
        readable: { type: "BOOLEAN" },
        reason: { type: "STRING", nullable: true },
        full_name: { type: "STRING", nullable: true },
        date_of_birth: { type: "STRING", nullable: true },
        gpa: { type: "NUMBER", nullable: true },
      },
      required: ["readable"],
    },
  },
  ielts: {
    allowedMimeTypes: ["image/jpeg", "image/png"],
    prompt: `Bạn là hệ thống trích xuất dữ liệu từ ảnh chứng chỉ IELTS (IELTS Test Report Form) của học viên.

Đọc ảnh và trích xuất:
- "full_name": họ tên trên chứng chỉ.
- "listening", "reading", "writing", "speaking": điểm từng kỹ năng Nghe, Đọc, Viết, Nói.
- "overall": điểm tổng (Overall Band Score).
- "test_date": ngày thi (giữ nguyên văn như trên chứng chỉ).

Nếu ảnh KHÔNG phải chứng chỉ IELTS, quá mờ/không đọc được, hoặc thiếu các thông tin quan trọng trên, đặt "readable": false và giải thích ngắn gọn lý do trong "reason". Chỉ điền giá trị bạn đọc được thực sự từ ảnh, không suy đoán hay bịa thêm.`,
    schema: {
      type: "OBJECT",
      properties: {
        readable: { type: "BOOLEAN" },
        reason: { type: "STRING", nullable: true },
        full_name: { type: "STRING", nullable: true },
        listening: { type: "NUMBER", nullable: true },
        reading: { type: "NUMBER", nullable: true },
        writing: { type: "NUMBER", nullable: true },
        speaking: { type: "NUMBER", nullable: true },
        overall: { type: "NUMBER", nullable: true },
        test_date: { type: "STRING", nullable: true },
      },
      required: ["readable"],
    },
  },
  identity: {
    allowedMimeTypes: ["image/jpeg", "image/png"],
    prompt: `Bạn là hệ thống trích xuất dữ liệu từ ảnh giấy tờ tùy thân (CMND/CCCD hoặc hộ chiếu) của học viên.

Đọc ảnh và trích xuất:
- "full_name": họ tên trên giấy tờ.
- "date_of_birth": ngày sinh (giữ nguyên văn như trên giấy tờ).
- "document_number": số CMND/CCCD hoặc số hộ chiếu.

Nếu ảnh KHÔNG phải CMND/CCCD/hộ chiếu, quá mờ/không đọc được, hoặc thiếu các thông tin quan trọng trên, đặt "readable": false và giải thích ngắn gọn lý do trong "reason". Chỉ điền giá trị bạn đọc được thực sự từ ảnh, không suy đoán hay bịa thêm.`,
    schema: {
      type: "OBJECT",
      properties: {
        readable: { type: "BOOLEAN" },
        reason: { type: "STRING", nullable: true },
        full_name: { type: "STRING", nullable: true },
        date_of_birth: { type: "STRING", nullable: true },
        document_number: { type: "STRING", nullable: true },
      },
      required: ["readable"],
    },
  },
};

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function processDocumentUpload(
  profileId: string,
  type: DocType,
  file: File,
): Promise<StudentProfile> {
  const config = DOC_CONFIG[type];

  if (!config.allowedMimeTypes.includes(file.type)) {
    throw new DocumentUploadError(`File không đúng định dạng. Yêu cầu: ${config.allowedMimeTypes.join(", ")}.`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new DocumentUploadError("File quá lớn, tối đa 8MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const supabase = getSupabaseAdmin();
  const extension = file.name.split(".").pop() || "bin";
  const storagePath = `${profileId}/${type}-${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new DocumentUploadError(`Không tải lên được file: ${uploadError.message}`);
  }

  const text = await callGemini({
    systemInstruction: { parts: [{ text: config.prompt }] },
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: file.type, data: base64 } },
          { text: "Hãy trích xuất thông tin theo đúng schema đã yêu cầu." },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: config.schema,
    },
  });

  let readable = false;
  let reason = "Không nhận được phản hồi từ hệ thống trích xuất, vui lòng thử lại.";
  let parsed: Record<string, unknown> = {};

  if (text) {
    try {
      parsed = JSON.parse(text);
      readable = parsed.readable === true;
      if (!readable) {
        reason = nullableString(parsed.reason) ?? "Không đọc được thông tin từ file, vui lòng nộp lại file rõ hơn.";
      }
    } catch {
      reason = "Không đọc được dữ liệu trả về từ hệ thống trích xuất, vui lòng thử lại.";
    }
  }

  const status: DocStatus = readable ? "hop_le" : "can_nop_lai";

  const update: Database["public"]["Tables"]["student_profiles"]["Update"] =
    type === "transcript"
      ? {
          transcript_status: status,
          transcript_file_name: file.name,
          transcript_storage_path: storagePath,
          transcript_full_name: readable ? nullableString(parsed.full_name) : null,
          transcript_date_of_birth: readable ? nullableString(parsed.date_of_birth) : null,
          transcript_gpa: readable ? nullableNumber(parsed.gpa) : null,
          transcript_reject_reason: readable ? null : reason,
        }
      : type === "ielts"
        ? {
            ielts_status: status,
            ielts_file_name: file.name,
            ielts_storage_path: storagePath,
            ielts_full_name: readable ? nullableString(parsed.full_name) : null,
            ielts_listening: readable ? nullableNumber(parsed.listening) : null,
            ielts_reading: readable ? nullableNumber(parsed.reading) : null,
            ielts_writing: readable ? nullableNumber(parsed.writing) : null,
            ielts_speaking: readable ? nullableNumber(parsed.speaking) : null,
            ielts_overall: readable ? nullableNumber(parsed.overall) : null,
            ielts_test_date: readable ? nullableString(parsed.test_date) : null,
            ielts_reject_reason: readable ? null : reason,
          }
        : {
            identity_status: status,
            identity_file_name: file.name,
            identity_storage_path: storagePath,
            identity_full_name: readable ? nullableString(parsed.full_name) : null,
            identity_date_of_birth: readable ? nullableString(parsed.date_of_birth) : null,
            identity_document_number: readable ? nullableString(parsed.document_number) : null,
            identity_reject_reason: readable ? null : reason,
          };

  const { data, error } = await supabase
    .from("student_profiles")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error || !data) {
    throw new DocumentUploadError(`Không lưu được kết quả trích xuất: ${error?.message}`);
  }

  return mapProfileRow(data);
}

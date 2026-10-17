import { NextRequest, NextResponse } from "next/server";
import { getOrCreateStudentProfile } from "@/lib/student-session";
import { processDocumentUpload, DocumentUploadError, type DocType } from "@/lib/portal-documents";

const VALID_TYPES: DocType[] = ["transcript", "ielts", "identity"];

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const type = formData.get("type");
  const file = formData.get("file");

  if (typeof type !== "string" || !VALID_TYPES.includes(type as DocType)) {
    return NextResponse.json({ error: "Loại giấy tờ không hợp lệ." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file cần tải lên." }, { status: 400 });
  }

  try {
    const profile = await getOrCreateStudentProfile();
    const updated = await processDocumentUpload(profile.id, type as DocType, file);
    return NextResponse.json({ profile: updated });
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Document upload failed:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại." }, { status: 500 });
  }
}

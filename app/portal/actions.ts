"use server";

import { getOrCreateStudentProfile } from "@/lib/student-session";
import { listReferenceSchools } from "@/lib/schools";
import { suggestScholarships } from "@/lib/scholarship-advisor";

export async function suggestScholarshipsAction(): Promise<
  { ok: true; text: string } | { ok: false; error: string }
> {
  try {
    const profile = await getOrCreateStudentProfile();

    const gpa = profile.transcript.status === "hop_le" ? profile.transcript.gpa : null;
    const ielts = profile.ielts.status === "hop_le" ? profile.ielts.overall : null;

    if (gpa === null || ielts === null) {
      return { ok: false, error: "Cần nộp bảng điểm và chứng chỉ IELTS hợp lệ trước khi xem gợi ý học bổng." };
    }

    const schools = await listReferenceSchools();
    const qualifiedSchools = schools.filter((s) => gpa >= s.minGpa && ielts >= s.minIelts);

    if (qualifiedSchools.length === 0) {
      return { ok: false, error: "Hồ sơ hiện chưa đạt yêu cầu điểm chuẩn trường nào, chưa có học bổng để gợi ý." };
    }

    const result = await suggestScholarships(profile, qualifiedSchools);
    return { ok: true, text: result.text };
  } catch (error) {
    console.error("suggestScholarshipsAction failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Đã có lỗi xảy ra." };
  }
}

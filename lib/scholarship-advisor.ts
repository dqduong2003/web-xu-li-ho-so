import { callGeminiParts, type GeminiPart } from "@/lib/gemini";
import { listScholarships } from "@/lib/scholarships";
import { pickDisplayName, type StudentProfile } from "@/lib/student-profile";
import type { ReferenceSchool } from "@/lib/schools";

const LOOKUP_SCHOLARSHIPS_TOOL = {
  name: "lookup_scholarships_by_school",
  description:
    "Tra cứu danh sách học bổng hiện có của một trường cụ thể, theo tên trường. Trả về tên học bổng, điều kiện tối thiểu (điểm học tập/IELTS) và mức hỗ trợ.",
  parameters: {
    type: "OBJECT",
    properties: {
      school_name: {
        type: "STRING",
        description: "Tên trường cần tra cứu học bổng, ví dụ: 'Đại học Deakin'.",
      },
    },
    required: ["school_name"],
  },
};

const SYSTEM_INSTRUCTION = `Bạn là cố vấn học bổng du học. Nhiệm vụ của bạn là gợi ý học bổng phù hợp nhất cho học viên, dựa trên hồ sơ của học viên và danh sách trường học viên đã đạt yêu cầu điểm chuẩn (danh sách này đã được hệ thống tính toán sẵn, bạn không cần tính lại).

Bạn có công cụ "lookup_scholarships_by_school" để tra cứu học bổng hiện có của một trường cụ thể. Hãy tự quyết định cần tra cứu học bổng của trường nào trong danh sách trường học viên đã đạt — có thể tra cứu một, nhiều, hoặc tất cả các trường trong danh sách, tùy bạn đánh giá. Không tra cứu trường ngoài danh sách học viên đã đạt.

Sau khi có dữ liệu học bổng từ công cụ, hãy tự đánh giá học viên có đáp ứng điều kiện tối thiểu của từng học bổng (điểm học tập, điểm IELTS) hay không, dựa trên thông tin hồ sơ đã cho. Chỉ gợi ý học bổng mà học viên thực sự đáp ứng điều kiện. Nếu không có học bổng nào phù hợp, nói rõ điều đó, không bịa thêm học bổng không có trong dữ liệu tra cứu được.

Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, nêu rõ tên học bổng, trường áp dụng, mức hỗ trợ và lý do phù hợp.`;

export interface ScholarshipAdvisorResult {
  text: string;
  toolCalls: { schoolName: string; resultCount: number }[];
}

async function lookupScholarshipsBySchool(schoolName: string) {
  const all = await listScholarships();
  const normalized = schoolName.trim().toLowerCase();
  return all.filter(
    (s) => s.schoolName.toLowerCase().includes(normalized) || normalized.includes(s.schoolName.toLowerCase()),
  );
}

function buildProfileSummary(profile: StudentProfile, qualifiedSchools: ReferenceSchool[]): string {
  const name = pickDisplayName(profile) ?? "không rõ";

  return `Thông tin học viên:
- Họ tên: ${name}
- Điểm học tập (GPA): ${profile.transcript.gpa ?? "không rõ"}
- Điểm IELTS tổng: ${profile.ielts.overall ?? "không rõ"} (Nghe ${profile.ielts.listening ?? "?"}, Đọc ${profile.ielts.reading ?? "?"}, Viết ${profile.ielts.writing ?? "?"}, Nói ${profile.ielts.speaking ?? "?"})

Danh sách trường học viên đã đạt yêu cầu điểm chuẩn:
${qualifiedSchools.map((s) => `- ${s.name} (${s.country})`).join("\n")}`;
}

export async function suggestScholarships(
  profile: StudentProfile,
  qualifiedSchools: ReferenceSchool[],
): Promise<ScholarshipAdvisorResult> {
  const contents: { role: string; parts: GeminiPart[] }[] = [
    { role: "user", parts: [{ text: buildProfileSummary(profile, qualifiedSchools) }] },
  ];

  const toolCalls: { schoolName: string; resultCount: number }[] = [];

  // Function-calling loop: the model decides whether and which school(s) to
  // look up via the tool; we execute the real lookup and feed the result
  // back until the model returns a final text answer (capped to avoid an
  // infinite loop if the model keeps calling tools).
  for (let turn = 0; turn < 5; turn++) {
    const parts = await callGeminiParts({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      tools: [{ functionDeclarations: [LOOKUP_SCHOLARSHIPS_TOOL] }],
    });

    const functionCallParts = parts.filter((p) => p.functionCall);

    if (functionCallParts.length === 0) {
      const text = parts
        .map((p) => p.text)
        .filter((t): t is string => !!t)
        .join("\n")
        .trim();
      return { text: text || "Hiện chưa có gợi ý học bổng phù hợp.", toolCalls };
    }

    contents.push({ role: "model", parts });

    const responseParts: GeminiPart[] = [];
    for (const part of functionCallParts) {
      const call = part.functionCall!;
      if (call.name === "lookup_scholarships_by_school") {
        const schoolName = String(call.args?.school_name ?? "");
        const results = await lookupScholarshipsBySchool(schoolName);
        toolCalls.push({ schoolName, resultCount: results.length });

        responseParts.push({
          functionResponse: {
            name: call.name,
            response: {
              scholarships: results.map((r) => ({
                name: r.name,
                min_gpa: r.minGpa,
                min_ielts: r.minIelts,
                support_description: r.supportDescription,
              })),
            },
          },
        });
      }
    }

    contents.push({ role: "function", parts: responseParts });
  }

  throw new Error("Vượt quá số lượt gọi công cụ cho phép.");
}

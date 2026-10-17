import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentProfile } from "@/lib/student-session";

function Field({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-medium">{value ?? "—"}</dd>
    </div>
  );
}

export function ExtractedInfo({ profile }: { profile: StudentProfile }) {
  const hasAny =
    profile.transcript.status === "hop_le" ||
    profile.ielts.status === "hop_le" ||
    profile.identity.status === "hop_le";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đã trích xuất</CardTitle>
        <p className="text-sm text-muted-foreground">
          Đây là thông tin đọc được từ giấy tờ bạn đã nộp, kiểm tra lại xem có đúng không nhé.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasAny && (
          <p className="text-sm text-muted-foreground">
            Chưa có thông tin nào được trích xuất. Hãy nộp giấy tờ ở phần trên.
          </p>
        )}

        {profile.transcript.status === "hop_le" && (
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">Bảng điểm</h4>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Field label="Họ tên" value={profile.transcript.fullName} />
              <Field label="Ngày sinh" value={profile.transcript.dateOfBirth} />
              <Field label="Điểm học tập (GPA)" value={profile.transcript.gpa} />
            </dl>
          </div>
        )}

        {profile.ielts.status === "hop_le" && (
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">Chứng chỉ IELTS</h4>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Field label="Họ tên" value={profile.ielts.fullName} />
              <Field label="Nghe" value={profile.ielts.listening} />
              <Field label="Đọc" value={profile.ielts.reading} />
              <Field label="Viết" value={profile.ielts.writing} />
              <Field label="Nói" value={profile.ielts.speaking} />
              <Field label="Điểm tổng" value={profile.ielts.overall} />
              <Field label="Ngày thi" value={profile.ielts.testDate} />
            </dl>
          </div>
        )}

        {profile.identity.status === "hop_le" && (
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">CMND/CCCD hoặc hộ chiếu</h4>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Field label="Họ tên" value={profile.identity.fullName} />
              <Field label="Ngày sinh" value={profile.identity.dateOfBirth} />
              <Field label="Số giấy tờ" value={profile.identity.documentNumber} />
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

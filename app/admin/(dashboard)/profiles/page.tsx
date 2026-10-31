import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { StatusDot, docStatusMeta } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProfileButton } from "@/components/admin/delete-profile-button";
import { listStudentProfileSummaries } from "@/lib/admin/student-profiles";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/utils";

const docLabels = [
  { key: "transcriptStatus", label: "Bảng điểm" },
  { key: "ieltsStatus", label: "IELTS" },
  { key: "identityStatus", label: "CMND/Hộ chiếu" },
] as const;

export default async function AdminProfilesPage() {
  const [profiles, admin] = await Promise.all([listStudentProfileSummaries(), getAuthenticatedAdmin()]);
  const canManage = admin?.role === "admin";

  return (
    <>
      <AdminPageHeader
        title="Hồ sơ học viên"
        description="Trạng thái giấy tờ và kết quả đối chiếu điểm chuẩn của từng học viên."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên học viên</TableHead>
              <TableHead>Trạng thái 3 giấy tờ</TableHead>
              <TableHead>Trường đạt</TableHead>
              <TableHead>Ngày nộp</TableHead>
              {canManage && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground">
                  Chưa có hồ sơ học viên nào.
                </TableCell>
              </TableRow>
            )}
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.studentName ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {docLabels.map(({ key, label }) => {
                      const status = profile[key];
                      return (
                        <span
                          key={key}
                          title={`${label}: ${docStatusMeta[status].label}`}
                          className="flex items-center gap-1.5"
                        >
                          <StatusDot tone={docStatusMeta[status].tone} />
                        </span>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {profile.matchedSchools}/{profile.totalSchools} trường
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(profile.submittedAt)}</TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <DeleteProfileButton id={profile.id} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

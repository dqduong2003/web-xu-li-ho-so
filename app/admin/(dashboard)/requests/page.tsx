import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/status-badge";
import { ApproveRequestButton } from "@/components/admin/approve-request-button";
import { RejectRequestButton } from "@/components/admin/reject-request-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { servicePackages } from "@/lib/mock-data";
import { listQuoteRequests } from "@/lib/quote-requests";
import { formatDateTime } from "@/lib/utils";

function formatVnd(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

function packageLabel(id: string) {
  return servicePackages.find((p) => p.id === id)?.name ?? id;
}

export default async function AdminRequestsPage() {
  const requests = await listQuoteRequests();

  return (
    <>
      <AdminPageHeader
        title="Yêu cầu"
        description="Danh sách yêu cầu báo giá gửi từ trang chủ, chờ đội ngũ duyệt."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khách</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Quốc gia</TableHead>
              <TableHead>Gói dịch vụ</TableHead>
              <TableHead>Báo giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Chưa có yêu cầu báo giá nào.
                </TableCell>
              </TableRow>
            )}
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.customerName}</TableCell>
                <TableCell className="text-muted-foreground">
                  <div>{req.email}</div>
                  {req.phone && <div>{req.phone}</div>}
                </TableCell>
                <TableCell>{req.country}</TableCell>
                <TableCell>{packageLabel(req.servicePackage)}</TableCell>
                <TableCell>{formatVnd(req.quotePrice)}</TableCell>
                <TableCell>
                  <RequestStatusBadge status={req.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(req.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ApproveRequestButton id={req.id} disabled={req.status !== "cho_duyet"} />
                    <RejectRequestButton id={req.id} disabled={req.status !== "cho_duyet"} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

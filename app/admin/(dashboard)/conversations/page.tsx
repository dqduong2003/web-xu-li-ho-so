import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConversationButton } from "@/components/admin/delete-conversation-button";
import { StatusBadge } from "@/components/status-badge";
import { listConversationSummaries } from "@/lib/admin/conversations";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/utils";

const leadQualityMeta = {
  good: { label: "Good", tone: "green" as const },
  ok: { label: "Ok", tone: "yellow" as const },
  spam: { label: "Spam", tone: "red" as const },
};

export default async function AdminConversationsPage() {
  const [conversations, admin] = await Promise.all([listConversationSummaries(), getAuthenticatedAdmin()]);
  const canManage = admin?.role === "admin";

  return (
    <>
      <AdminPageHeader
        title="Hội thoại"
        description="Lịch sử hội thoại của khách với chatbot hỏi đáp trên trang chủ."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kênh</TableHead>
              <TableHead>Số tin nhắn</TableHead>
              <TableHead>Tin nhắn gần nhất</TableHead>
              <TableHead>Bắt đầu lúc</TableHead>
              <TableHead>Cập nhật lúc</TableHead>
              <TableHead>Lead</TableHead>
              {canManage && <TableHead className="text-right">Hành động</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="text-center text-muted-foreground">
                  Chưa có cuộc hội thoại nào.
                </TableCell>
              </TableRow>
            )}
            {conversations.map((conv) => (
              <TableRow key={conv.id}>
                <TableCell className="p-0">
                  <Link href={`/admin/conversations/${conv.id}`} className="block px-4 py-3 font-medium">
                    Web
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/admin/conversations/${conv.id}`} className="block px-4 py-3">
                    {conv.messageCount} tin nhắn
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link
                    href={`/admin/conversations/${conv.id}`}
                    className="block max-w-xs truncate px-4 py-3 text-muted-foreground"
                  >
                    {conv.lastMessagePreview ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link
                    href={`/admin/conversations/${conv.id}`}
                    className="block px-4 py-3 text-muted-foreground"
                  >
                    {formatDateTime(conv.createdAt)}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link
                    href={`/admin/conversations/${conv.id}`}
                    className="block px-4 py-3 text-muted-foreground"
                  >
                    {formatDateTime(conv.updatedAt)}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/admin/conversations/${conv.id}`} className="block px-4 py-3">
                    {conv.leadQuality ? (
                      <StatusBadge
                        tone={leadQualityMeta[conv.leadQuality].tone}
                        label={leadQualityMeta[conv.leadQuality].label}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Link>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <DeleteConversationButton id={conv.id} />
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

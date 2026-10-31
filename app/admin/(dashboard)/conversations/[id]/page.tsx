import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteConversationButton } from "@/components/admin/delete-conversation-button";
import { LeadCard } from "@/components/admin/lead-card";
import { getConversationDetail } from "@/lib/admin/conversations";
import { getLeadForConversation } from "@/lib/admin/leads";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { cn, formatDateTime } from "@/lib/utils";

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversationDetail(id);

  if (!conversation) {
    notFound();
  }

  const [lead, admin] = await Promise.all([getLeadForConversation(id), getAuthenticatedAdmin()]);
  const canManage = admin?.role === "admin";

  return (
    <>
      <AdminPageHeader
        title="Chi tiết hội thoại"
        description={`Bắt đầu lúc ${formatDateTime(conversation.createdAt)} · ${conversation.messages.length} tin nhắn`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href="/admin/conversations">
                  <ArrowLeft />
                  Quay lại danh sách
                </Link>
              }
            />
            {canManage && <DeleteConversationButton id={conversation.id} label="Xóa hội thoại" />}
          </div>
        }
      />

      <div className="mb-6">
        <LeadCard conversationId={conversation.id} lead={lead} canManage={canManage} />
      </div>

      <Card className="space-y-4 p-6">
        {conversation.messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Cuộc hội thoại này chưa có tin nhắn nào.
          </p>
        )}
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                message.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground",
              )}
            >
              <p>{message.content}</p>
              <p
                className={cn(
                  "mt-1 text-[0.7rem]",
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {formatDateTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

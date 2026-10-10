"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteConversationAction } from "@/app/admin/conversations/actions";
import { cn } from "@/lib/utils";

export function DeleteConversationButton({
  id,
  className,
  label,
}: {
  id: string;
  className?: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Xóa cuộc hội thoại này? Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn, không thể hoàn tác.")) {
      return;
    }
    startTransition(() => {
      deleteConversationAction(id);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={label ? "sm" : "icon-sm"}
      disabled={isPending}
      onClick={handleDelete}
      aria-label="Xóa cuộc hội thoại"
      className={cn("text-destructive hover:bg-destructive/10", className)}
    >
      <Trash2 />
      {label}
    </Button>
  );
}

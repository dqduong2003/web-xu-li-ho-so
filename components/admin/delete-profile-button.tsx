"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteStudentProfileAction } from "@/app/admin/(dashboard)/profiles/actions";
import { cn } from "@/lib/utils";

export function DeleteProfileButton({ id, className }: { id: string; className?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm("Xóa hồ sơ học viên này? Toàn bộ giấy tờ đã nộp sẽ bị xóa vĩnh viễn, không thể hoàn tác.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteStudentProfileAction(id);
      if (!result.ok) {
        setError(result.error ?? "Xóa thất bại, vui lòng thử lại.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={isPending}
        onClick={handleDelete}
        aria-label="Xóa hồ sơ học viên"
        className={cn("text-destructive hover:bg-destructive/10", className)}
      >
        <Trash2 />
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

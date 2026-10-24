"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rejectQuoteRequestAction } from "@/app/admin/requests/actions";

export function RejectRequestButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleReject() {
    if (!window.confirm("Từ chối và xóa yêu cầu này? Hành động này không thể hoàn tác.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectQuoteRequestAction(id);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label="Từ chối"
        disabled={disabled || isPending}
        onClick={handleReject}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

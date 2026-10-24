"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveQuoteRequestAction } from "@/app/admin/requests/actions";

export function ApproveRequestButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveQuoteRequestAction(id);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="icon-sm"
        variant="outline"
        aria-label="Duyệt"
        disabled={disabled || isPending}
        onClick={handleApprove}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

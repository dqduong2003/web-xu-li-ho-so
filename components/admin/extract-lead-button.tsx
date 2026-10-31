"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractLeadAction } from "@/app/admin/(dashboard)/conversations/actions";

export function ExtractLeadButton({
  conversationId,
  hasLead,
}: {
  conversationId: string;
  hasLead: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExtract() {
    setError(null);
    startTransition(async () => {
      const result = await extractLeadAction(conversationId);
      if (!result.ok) {
        setError(result.error ?? "Trích xuất thất bại, vui lòng thử lại.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleExtract}>
        <Sparkles />
        {isPending ? "Đang trích xuất..." : hasLead ? "Trích xuất lại" : "Trích xuất thông tin lead"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

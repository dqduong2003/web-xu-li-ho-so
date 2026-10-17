"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { suggestScholarshipsAction } from "@/app/portal/actions";

export function ScholarshipSuggestion({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSuggest() {
    setError(null);
    startTransition(async () => {
      const result = await suggestScholarshipsAction();
      if (result.ok) {
        setText(result.text);
      } else {
        setText(null);
        setError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <CardTitle>Gợi ý học bổng</CardTitle>
        <Button type="button" size="sm" disabled={!enabled || isPending} onClick={handleSuggest}>
          <Sparkles />
          {isPending ? "Đang tìm..." : "Tìm học bổng phù hợp"}
        </Button>
      </CardHeader>
      <CardContent>
        {!enabled && (
          <p className="text-sm text-muted-foreground">
            Nộp đầy đủ và hợp lệ bảng điểm và chứng chỉ IELTS để bật tính năng gợi ý học bổng.
          </p>
        )}
        {enabled && error && <p className="text-sm text-red-600">{error}</p>}
        {enabled && text && <p className="whitespace-pre-line text-sm">{text}</p>}
        {enabled && !text && !error && (
          <p className="text-sm text-muted-foreground">
            Bấm nút để AI tra cứu và gợi ý học bổng phù hợp dựa trên các trường bạn đã đạt yêu cầu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

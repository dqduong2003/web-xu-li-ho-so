import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReferenceSchool } from "@/lib/schools";

export function SchoolMatch({
  schools,
  gpa,
  ielts,
}: {
  schools: ReferenceSchool[];
  gpa: number | null;
  ielts: number | null;
}) {
  // Pass/fail is a plain numeric comparison against the reference schools
  // table — no AI call involved, so it stays deterministic and auditable.
  const canCompare = gpa !== null && ielts !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đối chiếu điểm chuẩn</CardTitle>
        <p className="text-sm text-muted-foreground">
          So sánh điểm học tập và IELTS của bạn với điểm chuẩn từng trường.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canCompare && (
          <p className="text-sm text-muted-foreground">
            Nộp đầy đủ và hợp lệ bảng điểm và chứng chỉ IELTS để xem đối chiếu điểm chuẩn từng trường.
          </p>
        )}
        {canCompare &&
          schools.map((school) => {
            const passed = gpa >= school.minGpa && ielts >= school.minIelts;
            return (
              <div
                key={school.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-xl border p-4",
                  passed ? "border-green-200 bg-green-50" : "border-border bg-muted/30",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      passed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500",
                    )}
                  >
                    {passed ? <Check className="size-4" /> : <X className="size-4" />}
                  </span>
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">{school.country}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Yêu cầu GPA ≥ {school.minGpa.toFixed(1)}</p>
                  <p>IELTS ≥ {school.minIelts.toFixed(1)}</p>
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}

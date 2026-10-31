import { StatusBadge } from "@/components/status-badge";
import { ExtractLeadButton } from "@/components/admin/extract-lead-button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { Lead, LeadQuality } from "@/lib/admin/leads";

const qualityMeta: Record<LeadQuality, { label: string; tone: "green" | "yellow" | "red" }> = {
  good: { label: "Good", tone: "green" },
  ok: { label: "Ok", tone: "yellow" },
  spam: { label: "Spam", tone: "red" },
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}

export function LeadCard({
  conversationId,
  lead,
  canManage,
}: {
  conversationId: string;
  lead: Lead | null;
  canManage: boolean;
}) {
  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Thông tin lead (trích xuất bởi Gemini)</h2>
          {lead && (
            <p className="mt-1 text-xs text-muted-foreground">
              Cập nhật lúc {formatDateTime(lead.updatedAt)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lead && <StatusBadge tone={qualityMeta[lead.quality].tone} label={qualityMeta[lead.quality].label} />}
          {canManage && <ExtractLeadButton conversationId={conversationId} hasLead={!!lead} />}
        </div>
      </div>

      {lead ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Họ tên" value={lead.name} />
          <Field label="Email" value={lead.email} />
          <Field label="Số điện thoại" value={lead.phone} />
          <Field label="Nước du học" value={lead.targetCountry} />
          <Field label="Bậc học" value={lead.educationLevel} />
          <Field label="Ngành" value={lead.major} />
          <Field label="Availability" value={lead.availability} />
          <Field
            label="Đặt lịch tư vấn"
            value={
              lead.wantsConsultation === null
                ? null
                : lead.wantsConsultation
                  ? "Có"
                  : "Không"
            }
          />
          <div className="col-span-full">
            <Field label="Ghi chú" value={lead.note} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Chưa trích xuất thông tin lead cho cuộc hội thoại này.
        </p>
      )}
    </Card>
  );
}

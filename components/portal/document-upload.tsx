"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { FileText, IdCard, Loader2, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DocStatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { StudentProfile } from "@/lib/student-session";
import type { DocType } from "@/lib/portal-documents";

interface SlotConfig {
  type: DocType;
  icon: LucideIcon;
  title: string;
  accept: string;
  acceptLabel: string;
}

const SLOTS: SlotConfig[] = [
  { type: "transcript", icon: FileText, title: "Bảng điểm (PDF)", accept: "application/pdf", acceptLabel: "Chấp nhận PDF" },
  { type: "ielts", icon: Medal, title: "Ảnh chứng chỉ IELTS", accept: "image/jpeg,image/png", acceptLabel: "Chấp nhận JPG, PNG" },
  {
    type: "identity",
    icon: IdCard,
    title: "Ảnh CMND/CCCD hoặc hộ chiếu",
    accept: "image/jpeg,image/png",
    acceptLabel: "Chấp nhận JPG, PNG",
  },
];

export function DocumentUpload({
  profile,
  onProfileChange,
}: {
  profile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
}) {
  const [uploadingType, setUploadingType] = React.useState<DocType | null>(null);
  const [errors, setErrors] = React.useState<Partial<Record<DocType, string>>>({});
  const fileInputRefs = {
    transcript: React.useRef<HTMLInputElement>(null),
    ielts: React.useRef<HTMLInputElement>(null),
    identity: React.useRef<HTMLInputElement>(null),
  };

  async function handleFile(type: DocType, file: File) {
    setUploadingType(type);
    setErrors((prev) => ({ ...prev, [type]: undefined }));

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", file);

      const res = await fetch("/api/portal/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [type]: data.error || "Có lỗi xảy ra, vui lòng thử lại." }));
        return;
      }

      onProfileChange(data.profile);
    } catch {
      setErrors((prev) => ({ ...prev, [type]: "Không gửi được file, vui lòng kiểm tra kết nối." }));
    } finally {
      setUploadingType(null);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {SLOTS.map((slot) => {
        const doc = profile[slot.type];
        const isUploading = uploadingType === slot.type;
        const error = errors[slot.type];

        return (
          <div key={slot.type}>
            <input
              ref={fileInputRefs[slot.type]}
              type="file"
              accept={slot.accept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) handleFile(slot.type, file);
              }}
            />
            <Card
              onClick={() => !isUploading && fileInputRefs[slot.type].current?.click()}
              className={cn(
                "flex aspect-video flex-col items-center justify-center gap-2 border-none bg-foreground/5 p-6 shadow-none ring-0 duration-150 hover:bg-foreground/10",
                isUploading ? "pointer-events-none opacity-70" : "cursor-pointer",
              )}
            >
              {isUploading ? (
                <Loader2 className="size-7 animate-spin text-muted-foreground" />
              ) : (
                <slot.icon className="size-7 text-muted-foreground" />
              )}
              <span className="max-w-full truncate px-4 text-xs text-muted-foreground">
                {isUploading ? "Đang xử lý..." : doc.fileName ?? "Chưa có file, bấm để chọn"}
              </span>
            </Card>

            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{slot.title}</h3>
                <DocStatusBadge status={doc.status} />
              </div>
              <p className="mt-3 text-balance text-muted-foreground">
                {doc.status === "can_nop_lai" && doc.rejectReason ? (
                  <>
                    Cần nộp lại: <span className="text-red-600">{doc.rejectReason}</span>
                  </>
                ) : (
                  slot.acceptLabel
                )}
              </p>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

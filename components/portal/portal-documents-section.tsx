"use client";

import React from "react";
import { DocumentUpload } from "@/components/portal/document-upload";
import { ExtractedInfo } from "@/components/portal/extracted-info";
import { SchoolMatch } from "@/components/portal/school-match";
import { ScholarshipSuggestion } from "@/components/portal/scholarship-suggestion";
import type { StudentProfile } from "@/lib/student-session";
import type { ReferenceSchool } from "@/lib/schools";

export function PortalDocumentsSection({
  initialProfile,
  schools,
}: {
  initialProfile: StudentProfile;
  schools: ReferenceSchool[];
}) {
  const [profile, setProfile] = React.useState(initialProfile);

  const gpa = profile.transcript.status === "hop_le" ? profile.transcript.gpa : null;
  const ielts = profile.ielts.status === "hop_le" ? profile.ielts.overall : null;

  return (
    <>
      <div className="mt-10">
        <h2 className="text-lg font-medium">Giấy tờ cần nộp</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nộp đủ 3 loại giấy tờ dưới đây, hệ thống sẽ tự trích xuất thông tin giúp bạn.
        </p>

        <div className="mt-6">
          <DocumentUpload profile={profile} onProfileChange={setProfile} />
        </div>
      </div>

      <section className="mt-12 space-y-6">
        <ExtractedInfo profile={profile} />
        <SchoolMatch schools={schools} gpa={gpa} ielts={ielts} />
        <ScholarshipSuggestion enabled={gpa !== null && ielts !== null} />
      </section>
    </>
  );
}

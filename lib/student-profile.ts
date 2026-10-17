import type { Database } from "@/lib/supabase/database.types";

export type DocStatus = "chua_nop" | "dang_xu_ly" | "hop_le" | "can_nop_lai";

export interface StudentProfile {
  id: string;
  transcript: {
    status: DocStatus;
    fileName: string | null;
    fullName: string | null;
    dateOfBirth: string | null;
    gpa: number | null;
    rejectReason: string | null;
  };
  ielts: {
    status: DocStatus;
    fileName: string | null;
    fullName: string | null;
    listening: number | null;
    reading: number | null;
    writing: number | null;
    speaking: number | null;
    overall: number | null;
    testDate: string | null;
    rejectReason: string | null;
  };
  identity: {
    status: DocStatus;
    fileName: string | null;
    fullName: string | null;
    dateOfBirth: string | null;
    documentNumber: string | null;
    rejectReason: string | null;
  };
}

type ProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];

export function mapProfileRow(row: ProfileRow): StudentProfile {
  return {
    id: row.id,
    transcript: {
      status: row.transcript_status as DocStatus,
      fileName: row.transcript_file_name,
      fullName: row.transcript_full_name,
      dateOfBirth: row.transcript_date_of_birth,
      gpa: row.transcript_gpa,
      rejectReason: row.transcript_reject_reason,
    },
    ielts: {
      status: row.ielts_status as DocStatus,
      fileName: row.ielts_file_name,
      fullName: row.ielts_full_name,
      listening: row.ielts_listening,
      reading: row.ielts_reading,
      writing: row.ielts_writing,
      speaking: row.ielts_speaking,
      overall: row.ielts_overall,
      testDate: row.ielts_test_date,
      rejectReason: row.ielts_reject_reason,
    },
    identity: {
      status: row.identity_status as DocStatus,
      fileName: row.identity_file_name,
      fullName: row.identity_full_name,
      dateOfBirth: row.identity_date_of_birth,
      documentNumber: row.identity_document_number,
      rejectReason: row.identity_reject_reason,
    },
  };
}

export function pickDisplayName(profile: StudentProfile): string | null {
  return profile.identity.fullName ?? profile.transcript.fullName ?? profile.ielts.fullName ?? null;
}

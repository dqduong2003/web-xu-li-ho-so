export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          session_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          session_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_leads: {
        Row: {
          availability: string | null
          conversation_id: string
          created_at: string
          education_level: string | null
          email: string | null
          id: string
          major: string | null
          name: string | null
          note: string | null
          phone: string | null
          quality: string
          target_country: string | null
          updated_at: string
          wants_consultation: boolean | null
        }
        Insert: {
          availability?: string | null
          conversation_id: string
          created_at?: string
          education_level?: string | null
          email?: string | null
          id?: string
          major?: string | null
          name?: string | null
          note?: string | null
          phone?: string | null
          quality: string
          target_country?: string | null
          updated_at?: string
          wants_consultation?: boolean | null
        }
        Update: {
          availability?: string | null
          conversation_id?: string
          created_at?: string
          education_level?: string | null
          email?: string | null
          id?: string
          major?: string | null
          name?: string | null
          note?: string | null
          phone?: string | null
          quality?: string
          target_country?: string | null
          updated_at?: string
          wants_consultation?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          created_at: string
          id: string
          min_gpa: number | null
          min_ielts: number | null
          name: string
          school_id: string
          support_description: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_gpa?: number | null
          min_ielts?: number | null
          name: string
          school_id: string
          support_description: string
        }
        Update: {
          created_at?: string
          id?: string
          min_gpa?: number | null
          min_ielts?: number | null
          name?: string
          school_id?: string
          support_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          country: string
          created_at: string
          id: string
          min_gpa: number
          min_ielts: number
          name: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          min_gpa: number
          min_ielts: number
          name: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          min_gpa?: number
          min_ielts?: number
          name?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          id: string
          identity_date_of_birth: string | null
          identity_document_number: string | null
          identity_file_name: string | null
          identity_full_name: string | null
          identity_reject_reason: string | null
          identity_status: string
          identity_storage_path: string | null
          ielts_file_name: string | null
          ielts_full_name: string | null
          ielts_listening: number | null
          ielts_overall: number | null
          ielts_reading: number | null
          ielts_reject_reason: string | null
          ielts_speaking: number | null
          ielts_status: string
          ielts_storage_path: string | null
          ielts_test_date: string | null
          ielts_writing: number | null
          session_token: string
          transcript_date_of_birth: string | null
          transcript_file_name: string | null
          transcript_full_name: string | null
          transcript_gpa: number | null
          transcript_reject_reason: string | null
          transcript_status: string
          transcript_storage_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          identity_date_of_birth?: string | null
          identity_document_number?: string | null
          identity_file_name?: string | null
          identity_full_name?: string | null
          identity_reject_reason?: string | null
          identity_status?: string
          identity_storage_path?: string | null
          ielts_file_name?: string | null
          ielts_full_name?: string | null
          ielts_listening?: number | null
          ielts_overall?: number | null
          ielts_reading?: number | null
          ielts_reject_reason?: string | null
          ielts_speaking?: number | null
          ielts_status?: string
          ielts_storage_path?: string | null
          ielts_test_date?: string | null
          ielts_writing?: number | null
          session_token: string
          transcript_date_of_birth?: string | null
          transcript_file_name?: string | null
          transcript_full_name?: string | null
          transcript_gpa?: number | null
          transcript_reject_reason?: string | null
          transcript_status?: string
          transcript_storage_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          identity_date_of_birth?: string | null
          identity_document_number?: string | null
          identity_file_name?: string | null
          identity_full_name?: string | null
          identity_reject_reason?: string | null
          identity_status?: string
          identity_storage_path?: string | null
          ielts_file_name?: string | null
          ielts_full_name?: string | null
          ielts_listening?: number | null
          ielts_overall?: number | null
          ielts_reading?: number | null
          ielts_reject_reason?: string | null
          ielts_speaking?: number | null
          ielts_status?: string
          ielts_storage_path?: string | null
          ielts_test_date?: string | null
          ielts_writing?: number | null
          session_token?: string
          transcript_date_of_birth?: string | null
          transcript_file_name?: string | null
          transcript_full_name?: string | null
          transcript_gpa?: number | null
          transcript_reject_reason?: string | null
          transcript_status?: string
          transcript_storage_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

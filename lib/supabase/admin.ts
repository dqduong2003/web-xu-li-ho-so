import { createAdminClient } from "@supabase/server/core";
import type { Database } from "@/lib/supabase/database.types";

let adminClient: ReturnType<typeof createAdminClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createAdminClient<Database>();
  }
  return adminClient;
}

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { servicePackages, type ServicePackage } from "@/lib/mock-data";
import { notifyQuoteRequestCreated, notifyQuoteRequestApproved } from "@/lib/webhooks";
import type { Database } from "@/lib/supabase/database.types";

export type DegreeLevel = "thpt" | "dai_hoc" | "thac_si";
export type RequestStatus = "cho_duyet" | "da_duyet" | "tu_choi";

export interface QuoteRequest {
  id: string;
  customerName: string;
  email: string;
  phone: string | null;
  country: string;
  degreeLevel: DegreeLevel;
  servicePackage: ServicePackage;
  quotePrice: number;
  status: RequestStatus;
  createdAt: string;
}

export interface CreateQuoteRequestInput {
  customerName: string;
  email: string;
  phone?: string | null;
  country: string;
  degreeLevel: DegreeLevel;
  servicePackage: ServicePackage;
}

type Row = Database["public"]["Tables"]["quote_requests"]["Row"];

function mapRow(row: Row): QuoteRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    degreeLevel: row.degree_level as DegreeLevel,
    servicePackage: row.service_package as ServicePackage,
    quotePrice: Number(row.quote_price),
    status: row.status as RequestStatus,
    createdAt: row.created_at,
  };
}

export class QuoteRequestError extends Error {}

export async function createQuoteRequest(input: CreateQuoteRequestInput): Promise<QuoteRequest> {
  const pkg = servicePackages.find((p) => p.id === input.servicePackage);
  if (!pkg) {
    throw new QuoteRequestError("Gói dịch vụ không hợp lệ.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("quote_requests")
    .insert({
      customer_name: input.customerName,
      email: input.email,
      phone: input.phone || null,
      country: input.country,
      degree_level: input.degreeLevel,
      // The quote amount is always derived server-side from the package
      // catalog, never trusted from the client request body.
      service_package: input.servicePackage,
      quote_price: pkg.price,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new QuoteRequestError(`Không lưu được yêu cầu báo giá: ${error?.message}`);
  }

  const quoteRequest = mapRow(data);
  // Webhook failures are logged inside notifyQuoteRequestCreated and never
  // thrown, so a down Make.com scenario can't block the customer's quote.
  await notifyQuoteRequestCreated(quoteRequest);

  return quoteRequest;
}

export async function approveQuoteRequest(id: string): Promise<QuoteRequest> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("quote_requests")
    .update({ status: "da_duyet" })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new QuoteRequestError(`Không duyệt được yêu cầu: ${error?.message}`);
  }

  const quoteRequest = mapRow(data);
  await notifyQuoteRequestApproved(quoteRequest);

  return quoteRequest;
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("quote_requests").delete().eq("id", id);

  if (error) {
    throw new QuoteRequestError(`Không xóa được yêu cầu: ${error.message}`);
  }
}

export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapRow);
}

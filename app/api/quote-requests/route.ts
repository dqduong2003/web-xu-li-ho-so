import { NextRequest, NextResponse } from "next/server";
import { createQuoteRequest, QuoteRequestError } from "@/lib/quote-requests";
import { countries } from "@/lib/mock-data";
import { isValidEmail } from "@/lib/validation";
import type { DegreeLevel } from "@/lib/quote-requests";
import type { ServicePackage } from "@/lib/mock-data";

const VALID_DEGREE_LEVELS: DegreeLevel[] = ["thpt", "dai_hoc", "thac_si"];
const VALID_PACKAGES: ServicePackage[] = ["co_ban", "toan_dien"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const country = typeof body?.country === "string" ? body.country : "";
  const degreeLevel = typeof body?.degreeLevel === "string" ? body.degreeLevel : "";
  const servicePackage = typeof body?.servicePackage === "string" ? body.servicePackage : "";

  if (!customerName || !email) {
    return NextResponse.json({ error: "Thiếu họ tên hoặc email." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email không đúng định dạng." }, { status: 400 });
  }
  if (!countries.includes(country as (typeof countries)[number])) {
    return NextResponse.json({ error: "Quốc gia không hợp lệ." }, { status: 400 });
  }
  if (!VALID_DEGREE_LEVELS.includes(degreeLevel as DegreeLevel)) {
    return NextResponse.json({ error: "Bậc học không hợp lệ." }, { status: 400 });
  }
  if (!VALID_PACKAGES.includes(servicePackage as ServicePackage)) {
    return NextResponse.json({ error: "Gói dịch vụ không hợp lệ." }, { status: 400 });
  }

  try {
    const quoteRequest = await createQuoteRequest({
      customerName,
      email,
      phone: phone || null,
      country,
      degreeLevel: degreeLevel as DegreeLevel,
      servicePackage: servicePackage as ServicePackage,
    });
    return NextResponse.json({ quotePrice: quoteRequest.quotePrice });
  } catch (error) {
    if (error instanceof QuoteRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create quote request:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại." }, { status: 500 });
  }
}

import { servicePackages } from "@/lib/mock-data";
import type { QuoteRequest } from "@/lib/quote-requests";

async function postWebhook(label: string, url: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`${label} webhook failed:`, res.status, await res.text());
    }
  } catch (error) {
    console.error(`${label} webhook request failed:`, error);
  }
}

export async function notifyQuoteRequestCreated(request: QuoteRequest): Promise<void> {
  const webhookUrl = process.env.MAKE_QUOTE_WEBHOOK_URL;
  if (!webhookUrl) return;

  const packageLabel = servicePackages.find((p) => p.id === request.servicePackage)?.name ?? request.servicePackage;

  await postWebhook("Quote request", webhookUrl, {
    customer_name: request.customerName,
    email: request.email,
    service_package: packageLabel,
    price: request.quotePrice,
  });
}

export async function notifyQuoteRequestApproved(request: QuoteRequest): Promise<void> {
  const webhookUrl = process.env.MAKE_APPROVAL_WEBHOOK_URL;
  if (!webhookUrl) return;

  // /login now exists for real (Google sign-in). When deploying to a real
  // domain, just update this env var — nothing else needs to change.
  const loginLink = process.env.QUOTE_APPROVAL_LOGIN_LINK || "http://localhost:3000/login";

  await postWebhook("Quote approval", webhookUrl, {
    customer_name: request.customerName,
    email: request.email,
    login_link: loginLink,
  });
}

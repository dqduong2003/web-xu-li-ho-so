const MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiFunctionResponse {
  name: string;
  response: Record<string, unknown>;
}

export interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
}

async function postToGemini(body: Record<string, unknown>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GEMINI_API_KEY trong môi trường server.");
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Gemini API error:", res.status, await res.text());
    return null;
  }

  return res.json();
}

export async function callGemini(body: Record<string, unknown>): Promise<string | null> {
  const data = await postToGemini(body);
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || null;
}

// Returns the model's raw response parts for a turn, so callers can inspect
// `functionCall` parts and drive a multi-turn function-calling loop
// themselves (see lib/scholarship-advisor.ts).
export async function callGeminiParts(body: Record<string, unknown>): Promise<GeminiPart[]> {
  const data = await postToGemini(body);
  return data?.candidates?.[0]?.content?.parts ?? [];
}

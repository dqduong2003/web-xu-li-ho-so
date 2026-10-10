import { NextRequest, NextResponse } from "next/server";
import { buildSystemInstruction, FALLBACK_ANSWER } from "@/lib/qna-data";

const MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

interface ChatMessage {
  from: "bot" | "user";
  text: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Thiếu GEMINI_API_KEY trong môi trường server." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return NextResponse.json({ error: "Thiếu nội dung câu hỏi." }, { status: 400 });
  }

  const contents = [
    ...history.map((m) => ({
      role: m.from === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction() }] },
        contents,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json({ reply: FALLBACK_ANSWER });
    }

    const data = await res.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ reply: reply?.trim() || FALLBACK_ANSWER });
  } catch (error) {
    console.error("Gemini API request failed:", error);
    return NextResponse.json({ reply: FALLBACK_ANSWER });
  }
}

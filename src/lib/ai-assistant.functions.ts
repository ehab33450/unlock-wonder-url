import { createServerFn } from "@tanstack/react-start";

type Msg = { role: "user" | "assistant" | "system"; content: string };

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: Msg[]; context?: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "LOVABLE_API_KEY غير مهيأ" };
    }
    const sys =
      "أنت مساعد ذكي داخل منصة يسير لإدارة المشاريع والمهام والحجوزات. " +
      "أجب بالعربية بشكل موجز ومباشر ومنظم بنقاط عند الحاجة. " +
      "ساعد المستخدم على ترتيب أولويات مهامه، اقتراح أفضل الخيارات، " +
      "وشرح ميزات المنصة (الملفات، المذكرات، التقويم، الحجز، خدمات الكتاب، المحادثة، الأعضاء والصلاحيات). " +
      (data.context ? `\nسياق المستخدم الحالي:\n${data.context}` : "");

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: sys }, ...data.messages],
        }),
      });
      if (res.status === 429) return { ok: false as const, error: "تم تجاوز حد الاستخدام، حاول لاحقاً." };
      if (res.status === 402) return { ok: false as const, error: "نفد الرصيد، يرجى إضافة رصيد لمساحة العمل." };
      if (!res.ok) {
        const t = await res.text();
        return { ok: false as const, error: `خطأ ${res.status}: ${t.slice(0, 200)}` };
      }
      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content ?? "";
      return { ok: true as const, reply };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "خطأ غير معروف" };
    }
  });
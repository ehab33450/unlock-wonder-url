import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* =========================================================================
   Email via Resend (HTTP API) — works on Cloudflare Workers, no SDK needed.

   Required env:
     RESEND_API_KEY      e.g. re_xxx
     EMAIL_FROM          e.g. "منصة يسير <info@yaseersa.com>"  (domain must be
                         verified in Resend; defaults to Resend's test sender)
     SITE_URL            e.g. https://unlock-wonder-url.lovable.app  (login link)
   ========================================================================= */

const ERR = "تعذّر إرسال البريد، تأكد من إعداد Resend";

function b64Utf8(s: string): string {
  // base64 of the UTF-8 bytes (handles Arabic correctly)
  return btoa(unescape(encodeURIComponent(s)));
}

type SendOpts = { to: string | string[]; subject: string; html: string; ics?: string };

async function sendEmail({ to, subject, html, ics }: SendOpts): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[resend] RESEND_API_KEY غير مهيأ");
    throw new Error(ERR);
  }
  const from = process.env.EMAIL_FROM || "منصة يسير <onboarding@resend.dev>";
  const body: Record<string, unknown> = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (ics) {
    body.attachments = [{ filename: "invite.ics", content: b64Utf8(ics) }];
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("[resend] send error", await res.text());
    throw new Error(ERR);
  }
}

/* ============================ HTML / ICS builders ============================ */
const shell = (title: string, inner: string) => `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#f1f5f9;font-family:Tahoma,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#0ea5a4;color:#fff;border-radius:16px 16px 0 0;padding:20px 24px;font-size:20px;font-weight:bold">${title}</div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 16px 16px;padding:24px;color:#0f172a;font-size:15px;line-height:1.9">${inner}</div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">منصة يسير — لإدارة المشاريع والمهام</p>
</div></body></html>`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/* ================================ SERVER FNS ================================ */

// Admin-only: email a newly created user their login credentials + site link.
export const sendUserInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    email: string; display_name: string; username?: string; password?: string;
  }) =>
    z.object({
      email: z.string().email().max(255),
      display_name: z.string().min(1).max(120),
      username: z.string().max(60).optional(),
      password: z.string().max(72).optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdminRow } = await context.supabase
      .from("user_roles").select("role")
      .eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!isAdminRow) throw new Error("غير مصرّح");

    const siteUrl = process.env.SITE_URL || "https://unlock-wonder-url.lovable.app";
    const loginId = data.username || data.email;
    const inner = `
      <p>مرحباً <strong>${esc(data.display_name)}</strong>،</p>
      <p>تمت إضافتك إلى منصة <strong>يسير</strong>. يمكنك تسجيل الدخول الآن باستخدام البيانات التالية:</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0">
        <div>👤 اسم الدخول: <strong>${esc(loginId)}</strong></div>
        ${data.password ? `<div style="margin-top:8px">🔑 كلمة المرور: <strong>${esc(data.password)}</strong></div>` : ""}
      </div>
      <p style="text-align:center;margin:24px 0">
        <a href="${siteUrl}/auth" style="background:#0ea5a4;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:bold;display:inline-block">تسجيل الدخول</a>
      </p>
      <p style="color:#64748b;font-size:13px">يُنصح بتغيير كلمة المرور بعد أول تسجيل دخول.</p>`;
    await sendEmail({
      to: data.email,
      subject: "دعوة للانضمام إلى منصة يسير",
      html: shell("دعوة للانضمام إلى منصة يسير", inner),
    });
    return { ok: true };
  });

// Email a meeting invitation (+ calendar .ics attachment + Add-to-Google-Calendar link).
export const sendMeetingInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    to: string[]; title: string; date: string; durationMins?: number;
    location?: string; organizer?: string; notes?: string;
  }) =>
    z.object({
      to: z.array(z.string().email()).min(1).max(50),
      title: z.string().min(1).max(200),
      date: z.string().min(1),
      durationMins: z.number().int().min(5).max(1440).optional(),
      location: z.string().max(300).optional(),
      organizer: z.string().max(120).optional(),
      notes: z.string().max(2000).optional(),
    }).parse(d))
  .handler(async ({ data }) => {
    const start = new Date(data.date);
    if (isNaN(start.getTime())) throw new Error("تاريخ غير صالح");
    const end = new Date(start.getTime() + (data.durationMins ?? 30) * 60000);
    const sender = process.env.EMAIL_FROM || "no-reply@yaseersa.com";
    const dts = icsDate(start);
    const dte = icsDate(end);

    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Yaseer//Meeting//AR", "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${dts}-${Math.random().toString(36).slice(2)}@yaseersa.com`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${dts}`, `DTEND:${dte}`,
      `SUMMARY:${data.title}`,
      data.notes ? `DESCRIPTION:${data.notes.replace(/\n/g, "\\n")}` : "",
      data.location ? `LOCATION:${data.location}` : "",
      `ORGANIZER;CN=${data.organizer || "منصة يسير"}:mailto:${String(sender).replace(/.*<|>.*/g, "") || "no-reply@yaseersa.com"}`,
      "END:VEVENT", "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");

    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${dts}/${dte}` +
      (data.location ? `&location=${encodeURIComponent(data.location)}` : "") +
      (data.notes ? `&details=${encodeURIComponent(data.notes)}` : "");
    const when = start.toLocaleString("ar-EG", { dateStyle: "full", timeStyle: "short" });
    const inner = `
      <p>أنت مدعوّ لحضور اجتماع:</p>
      <h2 style="margin:8px 0;color:#0f172a">${esc(data.title)}</h2>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0">
        <div>🗓️ الموعد: <strong>${esc(when)}</strong></div>
        ${data.organizer ? `<div style="margin-top:8px">👤 المنظّم: <strong>${esc(data.organizer)}</strong></div>` : ""}
        ${data.location ? `<div style="margin-top:8px">📍 المكان: <strong>${esc(data.location)}</strong></div>` : ""}
        ${data.notes ? `<div style="margin-top:8px">📝 ${esc(data.notes)}</div>` : ""}
      </div>
      <p style="text-align:center;margin:24px 0">
        <a href="${gcal}" style="background:#0ea5a4;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:bold;display:inline-block">أضف إلى Google Calendar</a>
      </p>
      <p style="color:#64748b;font-size:13px">مرفق ملف تقويم (.ics) يمكنك فتحه بأي تطبيق تقويم.</p>`;

    await sendEmail({
      to: data.to,
      subject: `دعوة اجتماع: ${data.title}`,
      html: shell("دعوة اجتماع", inner),
      ics,
    });
    return { ok: true };
  });

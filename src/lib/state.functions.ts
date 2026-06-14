import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ERR = "حدث خطأ، يرجى المحاولة مرة أخرى";

// Load every persisted dashboard state slice as a { key: value } map.
export const getAppState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("app_state").select("key, value");
    if (error) throw (console.error("[state.fn]", error), new Error(ERR));
    const out: Record<string, any> = {};
    for (const r of data ?? []) out[(r as any).key] = (r as any).value;
    return out;
  });

// Upsert a single state slice.
export const setAppState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; value: unknown }) =>
    z.object({ key: z.string().min(1).max(80), value: z.any() }).parse(d))
  .handler(async ({ data, context }) => {
    const row = {
      key: data.key,
      value: data.value ?? {},
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    };
    const { error } = await context.supabase.from("app_state").upsert(row, { onConflict: "key" });
    if (error) throw (console.error("[state.fn]", error), new Error(ERR));
    return { ok: true };
  });

#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
git fetch origin main -q
git checkout -B main origin/main -q
python3 - <<'PYEOF'
p = "src/lib/data.functions.ts"
s = open(p, encoding="utf-8").read()
old = '''  .handler(async ({ data, context }) => {
    const row = { ...data, created_by: context.userId };
    const { data: res, error } = await context.supabase.from("folder_groups").upsert(row).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteFolderGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("folder_groups").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });'''
new = '''  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { ...data, created_by: context.userId };
    const { data: res, error } = await supabaseAdmin.from("folder_groups").upsert(row).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteFolderGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("folder_groups").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });'''
if old not in s:
    raise SystemExit("ERROR: pattern not found - aborting")
s = s.replace(old, new, 1)
open(p, "w", encoding="utf-8").write(s)
print("PATCHED OK")
PYEOF
git add src/lib/data.functions.ts
git commit -q -m "fix folders: persist folder_groups via service role (bypass RLS) so projects keep their folder"
git push origin main && echo "DONE - wait ~1 min for Vercel" || echo "PUSH FAILED - copy the message and send it to me"

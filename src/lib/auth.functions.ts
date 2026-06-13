import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GENERIC_ERR = "حدث خطأ، يرجى المحاولة مرة أخرى";
const FORBIDDEN_ERR = "غير مصرّح";

// Resolve a username (or email) to an email so users can sign in by username.
// Security: always returns an email — for unknown usernames returns a deterministic
// non-existent synthetic email so attackers cannot enumerate accounts.
export const resolveLoginIdentifier = createServerFn({ method: "POST" })
  .inputValidator((d: { identifier: string }) =>
    z.object({ identifier: z.string().min(1).max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const id = data.identifier.trim();
    if (id.includes("@")) return { email: id };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("username", id)
      .maybeSingle();
    if (row?.email) return { email: row.email };
    // Synthetic non-existent email — login will fail with generic invalid credentials.
    const safe = id.toLowerCase().replace(/[^a-z0-9._-]/g, "");
    return { email: `${safe || "user"}@invalid.local` };
  });

// Current user profile + role + permissions
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profile }, { data: roles }, { data: perms }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("user_permissions").select("perm_key, granted").eq("user_id", userId),
    ]);
    const roleList = (roles ?? []).map((r) => r.role as string);
    const permMap: Record<string, boolean> = {};
    for (const p of perms ?? []) permMap[p.perm_key] = !!p.granted;
    return {
      profile,
      roles: roleList,
      isAdmin: roleList.includes("admin"),
      perms: permMap,
    };
  });

// Admin-only: list all users
export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdminRow) throw new Error("صلاحية الأدمن مطلوبة");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: perms } = await supabaseAdmin
      .from("user_permissions")
      .select("user_id, perm_key, granted");
    return {
      users: (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
        perms: (perms ?? [])
          .filter((x) => x.user_id === p.id)
          .reduce<Record<string, boolean>>((acc, x) => {
            acc[x.perm_key] = !!x.granted;
            return acc;
          }, {}),
      })),
    };
  });

// Admin-only: create a user with email + password + optional username + role + perms
export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    email: string;
    password: string;
    display_name: string;
    username?: string;
    role?: "admin" | "employee" | "client";
    perms?: Record<string, boolean>;
  }) =>
    z.object({
      email: z.string().email().max(255),
      password: z.string().min(6).max(72),
      display_name: z.string().min(1).max(120),
      username: z.string().min(1).max(60).regex(/^[a-zA-Z0-9._-]+$/).optional(),
      role: z.enum(["admin", "employee", "client"]).optional(),
      perms: z.record(z.string().max(80), z.boolean()).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdminRow) throw new Error("صلاحية الأدمن مطلوبة");

    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        display_name: data.display_name,
        username: data.username,
      },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "تعذّر إنشاء المستخدم");
    }
    const newId = created.data.user.id;
    // upsert profile (trigger creates it; we update fields)
    await supabaseAdmin.from("profiles").upsert({
      id: newId,
      display_name: data.display_name,
      email: data.email,
      username: data.username ?? null,
      active: true,
    });
    const role = data.role ?? "employee";
    await supabaseAdmin.from("user_roles").insert({ user_id: newId, role });
    if (data.perms) {
      const rows = Object.entries(data.perms).map(([k, v]) => ({
        user_id: newId,
        perm_key: k,
        granted: !!v,
      }));
      if (rows.length) await supabaseAdmin.from("user_permissions").upsert(rows);
    }
    return { id: newId };
  });

// Admin-only: replace a user's permission set
export const adminSetPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; perms: Record<string, boolean> }) =>
    z.object({
      user_id: z.string().uuid(),
      perms: z.record(z.string().max(80), z.boolean()),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdminRow) throw new Error("صلاحية الأدمن مطلوبة");
    await supabaseAdmin.from("user_permissions").delete().eq("user_id", data.user_id);
    const rows = Object.entries(data.perms).map(([k, v]) => ({
      user_id: data.user_id,
      perm_key: k,
      granted: !!v,
    }));
    if (rows.length) await supabaseAdmin.from("user_permissions").insert(rows);
    return { ok: true };
  });

// Admin-only: toggle active flag
export const adminSetActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; active: boolean }) =>
    z.object({ user_id: z.string().uuid(), active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdminRow) throw new Error("صلاحية الأدمن مطلوبة");
    await supabaseAdmin.from("profiles").update({ active: data.active }).eq("id", data.user_id);
    return { ok: true };
  });

// First-time bootstrap: if there are zero admins, sign-up creates an admin.
// Used by the public /auth page when admin chooses "إنشاء حساب الأدمن الأول".
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string; display_name: string; username?: string }) =>
    z.object({
      email: z.string().email().max(255),
      password: z.string().min(6).max(72),
      display_name: z.string().min(1).max(120),
      username: z.string().min(1).max(60).regex(/^[a-zA-Z0-9._-]+$/).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("الأدمن موجود مسبقاً");
    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.display_name, username: data.username },
    });
    if (created.error || !created.data.user) throw new Error(created.error?.message ?? "خطأ");
    const id = created.data.user.id;
    await supabaseAdmin.from("profiles").upsert({
      id,
      display_name: data.display_name,
      email: data.email,
      username: data.username ?? null,
      active: true,
    });
    await supabaseAdmin.from("user_roles").insert({ user_id: id, role: "admin" });
    return { ok: true };
  });
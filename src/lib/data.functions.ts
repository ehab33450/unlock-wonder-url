import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* ============ FOLDER GROUPS ============ */
export const listFolderGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("folder_groups").select("*").order("sort_order").order("created_at");
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const upsertFolderGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; name: string; sort_order?: number }) =>
    z.object({ id: z.string().uuid().optional(), name: z.string().min(1).max(120), sort_order: z.number().int().optional() }).parse(d))
  .handler(async ({ data, context }) => {
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
  });

/* ============ PROJECTS ============ */
export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("projects").select("*").order("created_at", { ascending: false });
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    name: string; group_id?: string | null; description?: string;
    start_date?: string | null; end_date?: string | null; status?: string;
    members?: string[];
  }) => z.object({
    name: z.string().min(1).max(200),
    group_id: z.string().uuid().nullable().optional(),
    description: z.string().max(5000).optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    status: z.string().max(40).optional(),
    members: z.array(z.string().uuid()).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { members, ...row } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: proj, error } = await supabaseAdmin
      .from("projects")
      .insert({ ...row, created_by: context.userId })
      .select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    // creator becomes a member; plus any extras
    const memberRows = [
      { project_id: proj.id, user_id: context.userId, role: "owner" },
      ...(members ?? []).filter((u) => u !== context.userId).map((u) => ({ project_id: proj.id, user_id: u, role: "member" })),
    ];
    await supabaseAdmin.from("project_members").upsert(memberRows, { onConflict: "project_id,user_id" });
    return proj;
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200).optional(),
    group_id: z.string().uuid().nullable().optional(),
    description: z.string().max(5000).nullable().optional(),
    status: z.string().max(40).optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin
      .from("projects").update(patch).eq("id", id).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ PROJECT MEMBERS ============ */
export const listProjectMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("project_members").select("*");
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const addProjectMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { project_id: string; user_id: string; role?: string }) =>
    z.object({ project_id: z.string().uuid(), user_id: z.string().uuid(), role: z.string().max(40).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("project_members").upsert(data, { onConflict: "project_id,user_id" });
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

export const removeProjectMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { project_id: string; user_id: string }) =>
    z.object({ project_id: z.string().uuid(), user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("project_members").delete()
      .eq("project_id", data.project_id).eq("user_id", data.user_id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ SUBFOLDERS ============ */
export const listSubfolders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { project_id: string }) => z.object({ project_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin
      .from("subfolders").select("*").eq("project_id", data.project_id).order("created_at");
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res ?? [];
  });

export const createSubfolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { project_id: string; name: string }) =>
    z.object({ project_id: z.string().uuid(), name: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin
      .from("subfolders").insert({ ...data, created_by: context.userId }).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteSubfolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("subfolders").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ PROJECT FILES ============ */
export const listProjectFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { project_id: string }) => z.object({ project_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin
      .from("project_files").select("*").eq("project_id", data.project_id).order("created_at", { ascending: false });
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res ?? [];
  });

export const upsertProjectFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    project_id: z.string().uuid(),
    subfolder_id: z.string().uuid().nullable().optional(),
    name: z.string().min(1).max(255),
    kind: z.string().max(40).optional(),
    content: z.string().max(1_000_000).nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const row = { ...data, created_by: context.userId };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin
      .from("project_files").upsert(row).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteProjectFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("project_files").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ TASKS ============ */
export const listTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tasks").select("*").order("created_at", { ascending: false });
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const upsertTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    project_id: z.string().uuid().nullable().optional(),
    parent_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1).max(300),
    description: z.string().max(5000).nullable().optional(),
    status: z.string().max(40).optional(),
    priority: z.string().max(40).optional(),
    assignee_id: z.string().uuid().nullable().optional(),
    start_date: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const row = { ...data, created_by: data.id ? undefined : context.userId };
    const { data: res, error } = await context.supabase.from("tasks").upsert(row).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ NOTES ============ */
export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notes").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false });
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const upsertNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    title: z.string().max(200).nullable().optional(),
    content: z.string().max(50_000).optional(),
    pinned: z.boolean().optional(),
    color: z.string().max(40).nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const row = { ...data, user_id: context.userId, content: data.content ?? "" };
    const { data: res, error } = await context.supabase.from("notes").upsert(row).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notes").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ CHAT ============ */
export const listChatChannels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("chat_channels").select("*").order("created_at");
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const createChatChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; kind?: string; project_id?: string | null }) =>
    z.object({ name: z.string().min(1).max(120), kind: z.string().max(40).optional(), project_id: z.string().uuid().nullable().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase
      .from("chat_channels").insert({ ...data, created_by: context.userId }).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { channel_id: string }) => z.object({ channel_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase
      .from("chat_messages").select("*").eq("channel_id", data.channel_id).order("created_at");
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res ?? [];
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { channel_id: string; body: string; hidden_from_client?: boolean }) =>
    z.object({ channel_id: z.string().uuid(), body: z.string().min(1).max(5000), hidden_from_client: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase
      .from("chat_messages").insert({ ...data, sender_id: context.userId }).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

/* ============ CALENDAR ============ */
export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("calendar_events").select("*").order("starts_at");
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(5000).nullable().optional(),
    starts_at: z.string(),
    ends_at: z.string().nullable().optional(),
    location: z.string().max(200).nullable().optional(),
    meeting_url: z.string().max(500).nullable().optional(),
    project_id: z.string().uuid().nullable().optional(),
    visibility: z.enum(["public","private"]).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const row = { ...data, created_by: context.userId };
    const { data: res, error } = await context.supabase.from("calendar_events").upsert(row).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("calendar_events").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ FINANCE ============ */
export const listFinance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("finance_entries").select("*").order("occurred_on", { ascending: false });
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const upsertFinance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    kind: z.enum(["income","expense"]),
    amount: z.number(),
    currency: z.string().max(8).optional(),
    category: z.string().max(80).nullable().optional(),
    note: z.string().max(1000).nullable().optional(),
    occurred_on: z.string().optional(),
    project_id: z.string().uuid().nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const row = { ...data, created_by: context.userId };
    const { data: res, error } = await context.supabase.from("finance_entries").upsert(row).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

export const deleteFinance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("finance_entries").delete().eq("id", data.id);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });

/* ============ COMPANY SETTINGS ============ */
export const getCompanySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("company_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data;
  });

export const updateCompanySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    name: z.string().min(1).max(200).optional(),
    logo_url: z.string().max(500).nullable().optional(),
    primary_color: z.string().max(20).nullable().optional(),
    contact_email: z.string().max(200).nullable().optional(),
    contact_phone: z.string().max(40).nullable().optional(),
    address: z.string().max(500).nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase
      .from("company_settings").update(data).eq("id", 1).select().single();
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return res;
  });

/* ============ ACTIVITY LOG ============ */
export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return data ?? [];
  });

export const logActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    action: z.string().min(1).max(120),
    entity_type: z.string().max(80).nullable().optional(),
    entity_id: z.string().uuid().nullable().optional(),
    meta: z.record(z.string(), z.any()).nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("activity_log").insert({ ...data, user_id: context.userId });
    if (error) throw (console.error("[data.fn]", error), new Error("حدث خطأ، يرجى المحاولة مرة أخرى"));
    return { ok: true };
  });
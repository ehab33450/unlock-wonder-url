import { useState, Fragment } from "react";
import { Plus, Trash2, ChevronDown, ChevronLeft, GripVertical, Upload, X, MessageSquare, Send } from "lucide-react";

/* =========================================================================
   FlexSheet — a fully flexible, Excel-like table with groups (sections).
   - Free rows & columns; per-column type + options
   - Add/delete/rename columns, change type any time
   - Groups (colored sections): add/rename/recolor/collapse/delete
   - Add a row (task) globally or inside a group
   - File/document column (upload image or any file, preview & download)
   - Dropdown options each with its own color (colored status chips)
   ========================================================================= */

export type FlexColType =
  | "text"
  | "number"
  | "date"
  | "time"
  | "daterange"
  | "select"
  | "checkbox"
  | "file"
  | "people"
  | "tags"
  | "link"
  | "phone"
  | "email"
  | "location"
  | "rating"
  | "timer"
  | "vote";

export type FlexOption = { label: string; color: string };

export type FlexColumn = {
  id: string;
  name: string;
  type: FlexColType;
  options?: FlexOption[];
};

export type FlexGroup = { id: string; name: string; color: string };

export type FlexRow = Record<string, string | boolean | undefined>;

export type FlexSheetData = {
  columns: FlexColumn[];
  rows: FlexRow[];
  groups?: FlexGroup[];
};

export const FLEX_TYPE_OPTIONS: { type: FlexColType; label: string; icon: string }[] = [
  { type: "text", label: "نص", icon: "🔤" },
  { type: "number", label: "رقم", icon: "🔢" },
  { type: "date", label: "تاريخ", icon: "📅" },
  { type: "time", label: "وقت", icon: "⏰" },
  { type: "daterange", label: "مدة (من/إلى)", icon: "⏳" },
  { type: "select", label: "قائمة منسدلة", icon: "🔽" },
  { type: "file", label: "مستند / ملف", icon: "📎" },
  { type: "checkbox", label: "مربع اختيار", icon: "☑️" },
  { type: "people", label: "الأشخاص", icon: "👥" },
  { type: "tags", label: "وسوم", icon: "🏷️" },
  { type: "link", label: "رابط", icon: "🔗" },
  { type: "phone", label: "رقم تواصل", icon: "📱" },
  { type: "email", label: "بريد إلكتروني", icon: "✉️" },
  { type: "location", label: "الموقع", icon: "📍" },
  { type: "rating", label: "تقييم", icon: "⭐" },
  { type: "timer", label: "متابعة وقت", icon: "⏱️" },
  { type: "vote", label: "تصويت", icon: "✅" },
];

const GROUP_COLORS = ["#0ea5a4", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"];
const OPTION_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"];

const uid = () => Math.random().toString(36).slice(2, 9);

const fileToDataUrl = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(f);
  });

export function emptyFlexSheet(): FlexSheetData {
  return {
    columns: [
      { id: uid(), name: "العمود 1", type: "text" },
      { id: uid(), name: "العمود 2", type: "text" },
      { id: uid(), name: "العمود 3", type: "text" },
    ],
    rows: [],
    groups: [],
  };
}

export default function FlexSheet({
  data,
  onChange,
  editable = true,
  users = [],
  currentUser = "",
}: {
  data: FlexSheetData;
  onChange: (next: FlexSheetData) => void;
  editable?: boolean;
  users?: string[];
  currentUser?: string;
}) {
  const cols = data?.columns ?? [];
  const rows = data?.rows ?? [];
  const groups = data?.groups ?? [];
  const [typeMenu, setTypeMenu] = useState<string | null>(null);
  const [optsEditor, setOptsEditor] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [peoplePicker, setPeoplePicker] = useState<string | null>(null);
  const [chatRow, setChatRow] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");

  const apply = (patch: Partial<FlexSheetData>) =>
    onChange({ columns: cols, rows, groups, ...patch });

  const addColumn = () =>
    apply({ columns: [...cols, { id: uid(), name: `عمود ${cols.length + 1}`, type: "text" }] });
  const removeColumn = (id: string) =>
    apply({
      columns: cols.filter((c) => c.id !== id),
      rows: rows.map((r) => { const n = { ...r }; delete n[id]; return n; }),
    });
  const renameColumn = (id: string, name: string) =>
    apply({ columns: cols.map((c) => (c.id === id ? { ...c, name } : c)) });
  const setColType = (id: string, type: FlexColType) =>
    apply({ columns: cols.map((c) => (c.id === id ? { ...c, type } : c)) });
  const setColOptions = (id: string, options: FlexOption[]) =>
    apply({ columns: cols.map((c) => (c.id === id ? { ...c, options } : c)) });

  const addRow = (groupId?: string) =>
    apply({ rows: [...rows, { __id: uid(), ...(groupId ? { __group: groupId } : {}) }] });
  const removeRow = (rid: string) => apply({ rows: rows.filter((r) => r.__id !== rid) });
  const setCell = (rid: string, colId: string, val: string | boolean) =>
    apply({ rows: rows.map((r) => (r.__id === rid ? { ...r, [colId]: val } : r)) });

  const addGroup = () =>
    apply({
      groups: [
        ...groups,
        { id: uid(), name: `مجموعة ${groups.length + 1}`, color: GROUP_COLORS[groups.length % GROUP_COLORS.length] },
      ],
    });
  const renameGroup = (id: string, name: string) =>
    apply({ groups: groups.map((g) => (g.id === id ? { ...g, name } : g)) });
  const recolorGroup = (id: string) =>
    apply({
      groups: groups.map((g) =>
        g.id === id ? { ...g, color: GROUP_COLORS[(GROUP_COLORS.indexOf(g.color) + 1) % GROUP_COLORS.length] } : g,
      ),
    });
  const removeGroup = (id: string) =>
    apply({
      groups: groups.filter((g) => g.id !== id),
      rows: rows.map((r) => (r.__group === id ? { ...r, __group: undefined } : r)),
    });

  const assignedPeople = (row: FlexRow): string[] => {
    const set = new Set<string>();
    cols.filter((c) => c.type === "people").forEach((c) => {
      String(row[c.id] ?? "").split(",").map((x) => x.trim()).filter(Boolean).forEach((p) => set.add(p));
    });
    return [...set];
  };
  const canChat = (row: FlexRow) => { const a = assignedPeople(row); return !currentUser || a.length === 0 || a.includes(currentUser); };
  const getChat = (row: FlexRow): { a: string; t: string; ts: number }[] => { try { return JSON.parse(String(row.__chat ?? "[]")); } catch { return []; } };
  const sendChat = (rid: string) => {
    const text = chatInput.trim(); if (!text) return;
    const row = rows.find((r) => r.__id === rid); if (!row) return;
    const msgs = [...getChat(row), { a: currentUser || "أنا", t: text, ts: Date.now() }];
    apply({ rows: rows.map((r) => (r.__id === rid ? { ...r, __chat: JSON.stringify(msgs) } : r)) });
    setChatInput("");
  };

  const inputCls = "w-full h-9 px-2 text-sm text-right bg-transparent focus:outline-none focus:bg-teal-50/40 rounded";

  const renderCell = (col: FlexColumn, row: FlexRow) => {
    const rid = row.__id as string;
    const raw = row[col.id];
    if (col.type === "people") {
      const picked = String(raw ?? "").split(",").map((x) => x.trim()).filter(Boolean);
      const key = `${rid}::${col.id}`;
      return (
        <div className="relative">
          <button disabled={!editable} onClick={() => setPeoplePicker(peoplePicker === key ? null : key)} className="w-full min-h-9 px-2 py-1 text-xs flex flex-wrap gap-1 items-center justify-end">
            {picked.length ? picked.map((pp) => (<span key={pp} className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{pp}</span>)) : <span className="text-slate-300">اختر…</span>}
          </button>
          {editable && peoplePicker === key && (
            <div className="absolute z-30 top-full right-0 mt-1 w-48 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg p-1">
              {users.length === 0 && <div className="text-xs text-slate-400 p-2 text-center">لا يوجد مستخدمون</div>}
              {users.map((u) => { const on = picked.includes(u); return (
                <label key={u} className="flex items-center justify-end gap-2 text-sm px-2 py-1 hover:bg-slate-50 rounded cursor-pointer">
                  <span>{u}</span>
                  <input type="checkbox" checked={on} onChange={() => setCell(rid, col.id, (on ? picked.filter((x) => x !== u) : [...picked, u]).join(", "))} />
                </label>); })}
              <button onClick={() => setPeoplePicker(null)} className="mt-1 w-full h-7 rounded bg-teal-600 text-white text-xs">تم</button>
            </div>
          )}
        </div>
      );
    }
    if (!editable) {
      if (col.type === "checkbox" || col.type === "vote") return <span className="px-2">{raw ? "✓" : ""}</span>;
      if (col.type === "select") {
        const o = (col.options ?? []).find((x) => x.label === raw);
        return raw ? <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: (o?.color ?? "#64748b") + "22", color: o?.color ?? "#334155" }}>{String(raw)}</span> : null;
      }
      return <span className="px-2 text-sm">{String(raw ?? "")}</span>;
    }
    switch (col.type) {
      case "number":
        return <input type="number" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
      case "date":
        return <input type="date" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
      case "time":
        return <input type="time" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
      case "checkbox":
      case "vote":
        return (
          <div className="flex items-center justify-center h-9">
            <input type="checkbox" checked={!!raw} onChange={(e) => setCell(rid, col.id, e.target.checked)} />
          </div>
        );
      case "daterange": {
        const [from, to] = String(raw ?? "").split("|");
        const set = (f: string, t: string) => setCell(rid, col.id, `${f}|${t}`);
        return (
          <div className="flex items-center gap-1">
            <input type="date" value={from ?? ""} onChange={(e) => set(e.target.value, to ?? "")} className={inputCls} />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={to ?? ""} onChange={(e) => set(from ?? "", e.target.value)} className={inputCls} />
          </div>
        );
      }
      case "link":
        return <input type="url" placeholder="https://" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
      case "phone":
        return <input type="tel" placeholder="+9665…" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
      case "email":
        return <input type="email" placeholder="name@mail.com" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
      case "file": {
        const [nm, du] = String(raw ?? "").split("|");
        return (
          <div className="flex items-center justify-center gap-1 h-9 px-1">
            <label className="cursor-pointer text-teal-600 hover:text-teal-700" title="رفع ملف">
              <Upload className="w-4 h-4" />
              <input type="file" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const d = await fileToDataUrl(f);
                setCell(rid, col.id, `${f.name}|${d}`);
                e.target.value = "";
              }} />
            </label>
            {du ? (du.startsWith("data:image") ? (
              <a href={du} target="_blank" rel="noreferrer"><img src={du} alt={nm} className="h-7 w-7 object-cover rounded border border-slate-200" /></a>
            ) : (
              <a href={du} download={nm} className="text-xs text-slate-600 underline max-w-[80px] truncate">{nm || "ملف"}</a>
            )) : null}
            {du && <button onClick={() => setCell(rid, col.id, "")} className="text-slate-300 hover:text-red-500" title="إزالة"><X className="w-3 h-3" /></button>}
          </div>
        );
      }
      case "rating": {
        const n = Number(raw ?? 0);
        return (
          <div className="flex items-center justify-center gap-0.5 h-9" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setCell(rid, col.id, String(star === n ? 0 : star))} className={`text-base leading-none ${star <= n ? "text-amber-400" : "text-slate-300"}`}>★</button>
            ))}
          </div>
        );
      }
      case "timer":
        return <input type="number" min={0} placeholder="دقائق" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
      case "select": {
        const o = (col.options ?? []).find((x) => x.label === raw);
        return (
          <select value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)}
            className={inputCls + " appearance-none font-semibold rounded"}
            style={raw ? { background: (o?.color ?? "#64748b") + "22", color: o?.color ?? "#334155" } : undefined}>
            <option value="">—</option>
            {(col.options ?? []).map((op) => (<option key={op.label} value={op.label}>{op.label}</option>))}
          </select>
        );
      }
      default:
        return <input type="text" value={(raw as string) ?? ""} onChange={(e) => setCell(rid, col.id, e.target.value)} className={inputCls} />;
    }
  };

  const renderRow = (row: FlexRow) => (
    <tr key={row.__id as string} className="hover:bg-slate-50/60">
      <td className="border-b border-l border-slate-200 text-center align-middle w-10">
        {canChat(row) && (
          <button onClick={() => { setChatRow(row.__id as string); setChatInput(""); }}
            className="relative h-8 w-8 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 flex items-center justify-center mx-auto" title="محادثة المهمة">
            <MessageSquare className="w-4 h-4" />
            {getChat(row).length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-teal-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">{getChat(row).length}</span>}
          </button>
        )}
      </td>
      <td className="border-b border-l border-slate-200 text-center align-middle">
        {editable ? (
          <button onClick={() => removeRow(row.__id as string)} className="h-8 w-8 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center mx-auto" title="حذف الصف">
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </td>
      {cols.map((col) => (
        <td key={col.id} className="border-b border-l border-slate-200 align-middle">{renderCell(col, row)}</td>
      ))}
      {editable && <td className="border-b border-slate-200" />}
    </tr>
  );

  const colSpanAll = cols.length + (editable ? 3 : 2);
  const ungrouped = rows.filter((r) => !r.__group || !groups.some((g) => g.id === r.__group));

  const headerRow = (
    <tr className="bg-slate-50">
      <th className="w-10 border-b border-l border-slate-200" title="محادثة">💬</th>
      <th className="w-10 border-b border-l border-slate-200" />
      {cols.map((col) => (
        <th key={col.id} className="min-w-[150px] border-b border-l border-slate-200 p-1 align-top relative">
          <div className="flex items-center gap-1">
            <input value={col.name} disabled={!editable} onChange={(e) => renameColumn(col.id, e.target.value)} className="flex-1 h-8 px-2 text-sm font-bold text-right bg-transparent focus:outline-none focus:bg-white rounded" />
            {editable && (
              <>
                <button onClick={() => { setTypeMenu(typeMenu === col.id ? null : col.id); setOptsEditor(null); }} className="shrink-0 h-7 px-1.5 rounded text-[11px] text-slate-500 hover:bg-slate-200 flex items-center gap-0.5" title="نوع العمود">
                  <span>{FLEX_TYPE_OPTIONS.find((o) => o.type === col.type)?.icon}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button onClick={() => removeColumn(col.id)} className="shrink-0 h-7 w-7 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" title="حذف العمود">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          {typeMenu === col.id && (
            <div className="absolute z-20 top-full right-1 mt-1 w-44 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden max-h-72 overflow-y-auto">
              {FLEX_TYPE_OPTIONS.map((o) => (
                <button key={o.type} onClick={() => { setColType(col.id, o.type); setTypeMenu(null); if (o.type === "select") setOptsEditor(col.id); }} className={`w-full flex items-center justify-end gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${col.type === o.type ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-700"}`}>
                  <span>{o.label}</span><span>{o.icon}</span>
                </button>
              ))}
              {col.type === "select" && (
                <button onClick={() => { setOptsEditor(col.id); setTypeMenu(null); }} className="w-full text-center px-3 py-2 text-xs text-teal-700 border-t border-slate-100 hover:bg-slate-50">تعديل خيارات القائمة وألوانها</button>
              )}
            </div>
          )}
          {optsEditor === col.id && (
            <div className="absolute z-20 top-full right-1 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg p-2 text-right">
              <div className="text-xs text-slate-500 mb-2">خيارات القائمة (لكل خيار لون):</div>
              {(col.options ?? []).map((op, i) => (
                <div key={i} className="flex items-center gap-1 mb-1">
                  <input type="color" value={op.color} onChange={(e) => { const next = [...(col.options ?? [])]; next[i] = { ...op, color: e.target.value }; setColOptions(col.id, next); }} className="h-7 w-8 p-0 border-0 bg-transparent cursor-pointer" />
                  <input value={op.label} onChange={(e) => { const next = [...(col.options ?? [])]; next[i] = { ...op, label: e.target.value }; setColOptions(col.id, next); }} className="flex-1 h-8 px-2 text-sm text-right border border-slate-200 rounded focus:outline-none focus:border-teal-400" />
                  <button onClick={() => setColOptions(col.id, (col.options ?? []).filter((_, k) => k !== i))} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => setColOptions(col.id, [...(col.options ?? []), { label: `خيار ${(col.options?.length ?? 0) + 1}`, color: OPTION_COLORS[(col.options?.length ?? 0) % OPTION_COLORS.length] }])} className="w-full mt-1 h-8 rounded border border-dashed border-slate-300 text-xs text-slate-600 hover:border-teal-400 hover:text-teal-600 flex items-center justify-center gap-1">
                <Plus className="w-3.5 h-3.5" /> إضافة خيار
              </button>
              <button onClick={() => setOptsEditor(null)} className="mt-2 w-full h-8 rounded bg-teal-600 text-white text-xs font-bold">تم</button>
            </div>
          )}
        </th>
      ))}
      {editable && (
        <th className="w-10 border-b border-slate-200 p-1">
          <button onClick={addColumn} className="h-8 w-8 rounded text-teal-600 hover:bg-teal-50 flex items-center justify-center" title="إضافة عمود">
            <Plus className="w-4 h-4" />
          </button>
        </th>
      )}
    </tr>
  );

  return (
    <div dir="rtl" className="w-full">
      {editable && (
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => addRow()} className="h-9 px-4 rounded-md bg-[color:var(--eyenak-teal)] text-white text-sm font-semibold flex items-center gap-1 hover:opacity-90">
            <Plus className="w-4 h-4" /> إضافة مهمة
          </button>
          <button onClick={addGroup} className="h-9 px-4 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold flex items-center gap-1 hover:bg-slate-100">
            <Plus className="w-4 h-4" /> إضافة مجموعة
          </button>
        </div>
      )}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>{headerRow}</thead>
          <tbody>
            {ungrouped.map((r) => renderRow(r))}
            {groups.map((g) => {
              const gRows = rows.filter((r) => r.__group === g.id);
              const isCollapsed = collapsed[g.id];
              return (
                <Fragment key={g.id}>
                  <tr style={{ background: g.color + "1a" }}>
                    <td colSpan={colSpanAll} className="border-b border-slate-200 p-1.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))} className="text-slate-500">
                          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: g.color }} />
                        <input value={g.name} disabled={!editable} onChange={(e) => renameGroup(g.id, e.target.value)} className="font-bold text-sm bg-transparent focus:outline-none focus:bg-white/60 rounded px-1" style={{ color: g.color }} />
                        <span className="text-xs text-slate-400">({gRows.length})</span>
                        {editable && (
                          <div className="flex items-center gap-1 mr-auto">
                            <button onClick={() => recolorGroup(g.id)} className="text-xs text-slate-400 hover:text-slate-700" title="تغيير اللون">🎨</button>
                            <button onClick={() => removeGroup(g.id)} className="text-slate-400 hover:text-red-500" title="حذف المجموعة"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {!isCollapsed && gRows.map((r) => renderRow(r))}
                  {!isCollapsed && editable && (
                    <tr>
                      <td colSpan={colSpanAll} className="border-b border-slate-200 p-1">
                        <button onClick={() => addRow(g.id)} className="h-8 px-3 text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> إضافة مهمة لهذه المجموعة
                        </button>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {editable && (
        <button onClick={() => addRow()} className="mt-2 h-9 px-4 rounded-md border border-dashed border-slate-300 text-slate-600 text-sm hover:border-teal-400 hover:text-teal-600 flex items-center gap-1">
          <Plus className="w-4 h-4" /> إضافة مهمة
        </button>
      )}

      {chatRow && (() => {
        const row = rows.find((r) => r.__id === chatRow);
        if (!row) return null;
        const msgs = getChat(row);
        return (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4" onClick={() => setChatRow(null)}>
            <div dir="rtl" className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col" style={{ maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <button onClick={() => setChatRow(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                <h3 className="text-sm font-bold text-slate-700">💬 محادثة المهمة</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
                {msgs.length === 0 && <div className="text-center text-xs text-slate-400 py-8">لا توجد رسائل بعد.</div>}
                {msgs.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.a === (currentUser || "أنا") ? "items-start" : "items-end"}`}>
                    <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm ${m.a === (currentUser || "أنا") ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-700"}`}>{m.t}</div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{m.a} · {new Date(m.ts).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-200 flex items-center gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendChat(chatRow); }} placeholder="اكتب رسالة…" className="flex-1 h-10 px-3 border border-slate-200 rounded-lg text-right text-sm focus:outline-none focus:border-teal-400" />
                <button onClick={() => sendChat(chatRow)} className="h-10 w-10 rounded-lg bg-teal-600 text-white flex items-center justify-center"><Send className="w-4 h-4" /></button>
              </div>
              <div className="px-3 pb-2 text-[10px] text-slate-400 text-center">تظهر هذه المحادثة فقط للأشخاص المكلّفين بالمهمة.</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

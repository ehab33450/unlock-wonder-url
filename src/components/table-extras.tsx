import { useEffect, useState } from "react";
import { MessageSquare, X, Plus } from "lucide-react";

/* ============================================================
   Flexible columns + per-row internal chat — reusable for any
   table in the platform. State persists in localStorage and is
   shared across components via a module-level pub/sub.
============================================================ */

export type ColType =
  | "text" | "number" | "date" | "link" | "phone" | "email"
  | "rating" | "tags" | "location" | "timer" | "people" | "vote";

export type CustomCol = { id: string; name: string; type: ColType };
export type ChatMsg = { id: string; author: string; text: string; ts: number };
export type RowChat = { allowed: string[]; msgs: ChatMsg[] };

type Store = {
  cols: Record<string, CustomCol[]>;                       // tableId -> cols
  cells: Record<string, Record<string, string>>;           // tableId -> "rowId::colId" -> value
  chats: Record<string, Record<string, RowChat>>;          // tableId -> rowId -> chat
};

const STORAGE_KEY = "eyenak.tableExtras.v1";
const EMPTY: Store = { cols: {}, cells: {}, chats: {} };

function load(): Store {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw);
    return { cols: p.cols ?? {}, cells: p.cells ?? {}, chats: p.chats ?? {} };
  } catch { return EMPTY; }
}

let store: Store = load();
const listeners = new Set<() => void>();
function notify() {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* quota */ }
  }
  listeners.forEach((l) => l());
}

export const COL_TYPE_OPTIONS: { type: ColType; label: string; icon: string }[] = [
  { type: "people",   label: "الأشخاص",       icon: "👥" },
  { type: "text",     label: "نص",            icon: "T"  },
  { type: "date",     label: "التاريخ",       icon: "📅" },
  { type: "number",   label: "رقم",           icon: "#"  },
  { type: "tags",     label: "وسوم",          icon: "🏷️" },
  { type: "link",     label: "الرابط",        icon: "🔗" },
  { type: "phone",    label: "رقم التواصل",   icon: "📱" },
  { type: "email",    label: "بريد إلكتروني", icon: "✉️" },
  { type: "location", label: "الموقع",        icon: "📍" },
  { type: "rating",   label: "التقييم",       icon: "⭐" },
  { type: "timer",    label: "متابعة الوقت",  icon: "⏱️" },
  { type: "vote",     label: "التصويت",       icon: "✅" },
];

export function useTableExtras(tableId: string) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  const cols: CustomCol[] = store.cols[tableId] ?? [];

  const addCol = (type: ColType, name: string, insertAt?: number) => {
    if (!name.trim()) return;
    const arr = [...(store.cols[tableId] ?? [])];
    const at = insertAt ?? arr.length;
    arr.splice(Math.max(0, Math.min(at, arr.length)), 0, {
      id: `c${Date.now()}${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      type,
    });
    store = { ...store, cols: { ...store.cols, [tableId]: arr } };
    notify();
  };

  const removeCol = (colId: string) => {
    const arr = (store.cols[tableId] ?? []).filter((c) => c.id !== colId);
    store = { ...store, cols: { ...store.cols, [tableId]: arr } };
    notify();
  };

  const getCell = (rowId: string, colId: string) =>
    store.cells[tableId]?.[`${rowId}::${colId}`] ?? "";

  const setCell = (rowId: string, colId: string, value: string) => {
    const tCells = { ...(store.cells[tableId] ?? {}) };
    tCells[`${rowId}::${colId}`] = value;
    store = { ...store, cells: { ...store.cells, [tableId]: tCells } };
    notify();
  };

  const getChat = (rowId: string): RowChat =>
    store.chats[tableId]?.[rowId] ?? { allowed: [], msgs: [] };

  const updateChat = (rowId: string, updater: (cur: RowChat) => RowChat) => {
    const tChats = { ...(store.chats[tableId] ?? {}) };
    tChats[rowId] = updater(tChats[rowId] ?? { allowed: [], msgs: [] });
    store = { ...store, chats: { ...store.chats, [tableId]: tChats } };
    notify();
  };

  return { cols, addCol, removeCol, getCell, setCell, getChat, updateChat };
}

/* ============================================================
   Components
============================================================ */

function ColMenu({
  onPick, onClose, x, y,
}: {
  onPick: (t: ColType) => void;
  onClose: () => void;
  x: number; y: number;
}) {
  return (
    <div className="fixed inset-0 z-[90]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}>
      <div
        className="absolute bg-white rounded-lg shadow-2xl border border-slate-200 p-2 grid grid-cols-2 gap-1 min-w-[260px]"
        style={{
          left: Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 800) - 280),
          top: Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 600) - 340),
        }}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="col-span-2 px-2 py-1 text-[11px] font-bold text-slate-500 border-b border-slate-100 mb-1">
          إضافة عمود
        </div>
        {COL_TYPE_OPTIONS.map((o) => (
          <button
            key={o.type}
            onClick={() => onPick(o.type)}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded hover:bg-slate-100 text-xs text-slate-700"
          >
            <span className="text-base w-5 text-center">{o.icon}</span>
            <span className="font-medium">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExtraColHeaders({
  tableId, isAdmin, thClass = "px-2 py-2 text-right font-semibold whitespace-nowrap",
}: { tableId: string; isAdmin: boolean; thClass?: string }) {
  const x = useTableExtras(tableId);
  const [menu, setMenu] = useState<{ x: number; y: number; insertAt: number } | null>(null);

  const pickType = (t: ColType) => {
    const def = COL_TYPE_OPTIONS.find((o) => o.type === t)?.label ?? "عمود";
    const name = window.prompt("اسم العمود الجديد:", def);
    if (!name) { setMenu(null); return; }
    x.addCol(t, name, menu?.insertAt);
    setMenu(null);
  };

  return (
    <>
      {x.cols.map((c, idx) => (
        <th
          key={c.id}
          className={`${thClass} group`}
          onContextMenu={(e) => { if (!isAdmin) return; e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, insertAt: idx + 1 }); }}
        >
          <span className="inline-flex items-center gap-1">
            <span>{COL_TYPE_OPTIONS.find((o) => o.type === c.type)?.icon}</span>
            <span>{c.name}</span>
            {isAdmin && (
              <button
                onClick={() => { if (window.confirm("حذف هذا العمود؟")) x.removeCol(c.id); }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] mr-1"
                title="حذف العمود"
              >✕</button>
            )}
          </span>
        </th>
      ))}
      {isAdmin && (
        <th
          className={`${thClass} text-center text-slate-400 hover:text-emerald-600 cursor-pointer`}
          title="إضافة عمود (انقر أو زر الفأرة الأيمن)"
          onClick={(e) => setMenu({ x: e.clientX, y: e.clientY, insertAt: x.cols.length })}
          onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, insertAt: x.cols.length }); }}
        >
          <Plus className="w-3.5 h-3.5 inline" />
        </th>
      )}
      {menu && <ColMenu x={menu.x} y={menu.y} onPick={pickType} onClose={() => setMenu(null)} />}
    </>
  );
}

export function ExtraCells({
  tableId, rowId, canEdit, employees, tdClass = "px-2 py-1 min-w-[110px]",
}: {
  tableId: string;
  rowId: string;
  canEdit: boolean;
  employees: string[];
  tdClass?: string;
}) {
  const x = useTableExtras(tableId);
  const baseCls = "w-full px-2 py-1 text-right text-xs rounded bg-transparent focus:outline-none focus:bg-emerald-50";

  return (
    <>
      {x.cols.map((c) => {
        const val = x.getCell(rowId, c.id);
        const setVal = (v: string) => x.setCell(rowId, c.id, v);
        return (
          <td key={c.id} className={tdClass}>
            {c.type === "text"     && <input value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "number"   && <input type="number" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "date"     && <input type="date" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "link"     && <input type="url" placeholder="https://" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />}
            {c.type === "phone"    && <input type="tel" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />}
            {c.type === "email"    && <input type="email" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />}
            {c.type === "location" && <input value={val} placeholder="📍 الموقع" disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "tags"     && <input value={val} placeholder="وسم، وسم" disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "timer"    && <input value={val} placeholder="0h 0m" disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "people"   && (
              <select value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls}>
                <option value="">—</option>
                {employees.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
            {c.type === "rating"   && (
              <div className="flex items-center gap-0.5 justify-end">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" disabled={!canEdit} onClick={() => setVal(String(n))}
                    className={`text-sm leading-none ${Number(val) >= n ? "text-amber-400" : "text-slate-300"} disabled:opacity-60`}>★</button>
                ))}
              </div>
            )}
            {c.type === "vote"     && (
              <label className="flex items-center justify-end gap-1 text-xs text-slate-600">
                <input type="checkbox" checked={val === "1"} disabled={!canEdit} onChange={(e) => setVal(e.target.checked ? "1" : "")} />
                <span>{val === "1" ? "موافق" : "—"}</span>
              </label>
            )}
          </td>
        );
      })}
      {/* spacer cell aligning with "+" header when admin */}
      <td className="p-0" />
    </>
  );
}

export function RowChatButton({
  tableId, rowId, rowLabel, currentUser, isAdmin, employees,
}: {
  tableId: string;
  rowId: string;
  rowLabel: string;
  currentUser: string;
  isAdmin: boolean;
  employees: string[];
}) {
  const x = useTableExtras(tableId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pickOpen, setPickOpen] = useState(false);
  const chat = x.getChat(rowId);
  const canSee = isAdmin || chat.allowed.includes(currentUser);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    x.updateChat(rowId, (cur) => ({
      allowed: cur.allowed,
      msgs: [...cur.msgs, { id: `${Date.now()}`, author: currentUser, text, ts: Date.now() }],
    }));
    setDraft("");
  };

  if (!canSee) return <span className="text-slate-300 text-xs" title="لا تملك صلاحية">—</span>;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500"
        title="محادثة خاصة بهذا الصف"
      >
        <MessageSquare className="w-4 h-4" />
        {chat.msgs.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center">
            {chat.msgs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[85] bg-black/40 flex" onClick={() => { setOpen(false); setPickOpen(false); }}>
          <div className="ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-l from-slate-50 to-white">
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
              <div className="text-right">
                <div className="text-xs text-slate-500">محادثة خاصة</div>
                <div className="text-sm font-bold text-slate-800 truncate max-w-[260px]">{rowLabel}</div>
              </div>
            </div>

            {isAdmin && (
              <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                <button onClick={() => setPickOpen((v) => !v)} className="w-full text-right text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="text-emerald-600">{pickOpen ? "إخفاء ▲" : "إدارة ▼"}</span>
                  <span>الأعضاء المسموح لهم ({chat.allowed.length})</span>
                </button>
                {pickOpen && (
                  <div className="mt-2 max-h-32 overflow-y-auto bg-white border border-slate-200 rounded p-2 space-y-1">
                    {employees.length === 0 && <div className="text-[11px] text-slate-400 text-center">لا يوجد موظفون</div>}
                    {employees.map((n) => {
                      const checked = chat.allowed.includes(n);
                      return (
                        <label key={n} className="flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              x.updateChat(rowId, (cur) => ({
                                ...cur,
                                allowed: e.target.checked
                                  ? Array.from(new Set([...cur.allowed, n]))
                                  : cur.allowed.filter((u) => u !== n),
                              }))
                            }
                          />
                          <span className="flex-1 text-right">{n}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
              {chat.msgs.length === 0 && (
                <div className="text-center text-xs text-slate-400 mt-8">لا توجد رسائل بعد.</div>
              )}
              {chat.msgs.map((m) => {
                const mine = m.author === currentUser;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-sm ${mine ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
                      {!mine && <div className="text-[10px] font-bold text-emerald-700 mb-0.5">{m.author}</div>}
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <div className={`text-[9px] mt-1 ${mine ? "text-white/70" : "text-slate-400"} text-left`} dir="ltr">
                        {new Date(m.ts).toLocaleString("ar-EG", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 p-3 bg-white">
              <div className="flex items-center gap-2">
                <button onClick={send} className="h-9 px-4 bg-emerald-600 hover:opacity-90 text-white rounded-full text-xs font-semibold">إرسال</button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="اكتب رسالة..."
                  className="flex-1 h-9 px-3 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 text-center">
                🔒 محادثة خاصة — يراها فقط الأدمن والأعضاء المسموح لهم
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
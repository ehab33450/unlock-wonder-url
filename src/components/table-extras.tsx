import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, X, Plus, Upload, FileText, Undo2, Settings2, Trash2, MoreVertical, ArrowUp, ArrowDown, EyeOff, Eye } from "lucide-react";

/* ============================================================
   Flexible columns + per-row internal chat — reusable for any
   table in the platform. State persists in localStorage and is
   shared across components via a module-level pub/sub.
============================================================ */

export type ColType =
  | "text" | "number" | "date" | "link" | "phone" | "email"
  | "rating" | "tags" | "location" | "timer" | "people" | "vote"
  | "daterange"   // مؤقت زمني (تاريخ من/إلى مع عرض الأيام المتبقية)
  | "select"      // قائمة منسدلة مخصصة قابلة للتعديل والتلوين
  | "file";       // رفع مستند

export type SelectOption = { id: string; label: string; color: string };
export type CustomCol = {
  id: string;
  name: string;
  type: ColType;
  options?: SelectOption[]; // for type === "select"
};
export type ChatMsg = { id: string; author: string; text: string; ts: number };
export type RowChat = { allowed: string[]; msgs: ChatMsg[] };

type Store = {
  cols: Record<string, CustomCol[]>;                       // tableId -> cols
  cells: Record<string, Record<string, string>>;           // tableId -> "rowId::colId" -> value
  chats: Record<string, Record<string, RowChat>>;          // tableId -> rowId -> chat
};

const STORAGE_KEY = "eyenak.tableExtras.v1";
const EMPTY: Store = { cols: {}, cells: {}, chats: {} };

/* ---------- Built-in header rename store ---------- */
const HEADER_KEY = "eyenak.headerLabels.v1";
type HeaderStore = Record<string, Record<string, string>>;
function loadHeaders(): HeaderStore {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(HEADER_KEY) || "{}"); } catch { return {}; }
}
let headerStore: HeaderStore = loadHeaders();
const headerListeners = new Set<() => void>();
function notifyHeaders() {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(HEADER_KEY, JSON.stringify(headerStore)); } catch {}
  }
  headerListeners.forEach((l) => l());
}

/* ---------- Hidden built-in columns store ---------- */
const HIDDEN_KEY = "eyenak.hiddenCols.v1";
type HiddenStore = Record<string, string[]>; // tableId -> [headerKey,...]
function loadHidden(): HiddenStore {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(HIDDEN_KEY) || "{}"); } catch { return {}; }
}
let hiddenStore: HiddenStore = loadHidden();
const hiddenListeners = new Set<() => void>();
function notifyHidden() {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(HIDDEN_KEY, JSON.stringify(hiddenStore)); } catch {}
  }
  hiddenListeners.forEach((l) => l());
}
export function useHiddenCols(tableId: string) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    hiddenListeners.add(l);
    return () => { hiddenListeners.delete(l); };
  }, []);
  const list = hiddenStore[tableId] ?? [];
  const hide = (key: string) => {
    const cur = new Set(hiddenStore[tableId] ?? []);
    cur.add(key);
    hiddenStore = { ...hiddenStore, [tableId]: Array.from(cur) };
    notifyHidden();
  };
  const show = (key: string) => {
    const cur = (hiddenStore[tableId] ?? []).filter((k) => k !== key);
    hiddenStore = { ...hiddenStore, [tableId]: cur };
    notifyHidden();
  };
  const restoreAll = () => {
    hiddenStore = { ...hiddenStore, [tableId]: [] };
    notifyHidden();
  };
  return { hidden: list, hide, show, restoreAll };
}

/** Shows a small floating chip that lets admin un-hide columns of a table. Place near the table title. */
export function HiddenColsRestore({ tableId, isAdmin }: { tableId: string; isAdmin: boolean }) {
  const { hidden, show, restoreAll } = useHiddenCols(tableId);
  if (!isAdmin || hidden.length === 0) return null;
  return (
    <div className="inline-flex items-center gap-1 flex-wrap text-[11px] bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
      <Eye className="w-3 h-3 text-amber-700" />
      <span className="text-amber-700 font-semibold">أعمدة مخفية:</span>
      {hidden.map((k) => {
        const label = headerStore[tableId]?.[k] ?? k;
        return (
          <button
            key={k}
            onClick={() => show(k)}
            className="px-1.5 py-0.5 rounded bg-white border border-amber-300 text-amber-800 hover:bg-amber-100"
            title="إظهار العمود"
          >{label} ↩</button>
        );
      })}
      <button onClick={restoreAll} className="text-amber-700 underline hover:text-amber-900 mr-1">إظهار الكل</button>
    </div>
  );
}

export function EditableHeaderLabel({
  tableId, headerKey, defaultLabel, isAdmin,
}: { tableId: string; headerKey: string; defaultLabel: string; isAdmin: boolean }) {
  const [, setTick] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    headerListeners.add(l);
    const h = () => setTick((t) => t + 1);
    hiddenListeners.add(h);
    return () => { headerListeners.delete(l); hiddenListeners.delete(h); };
  }, []);
  const label = headerStore[tableId]?.[headerKey] ?? defaultLabel;
  const hiddenList = hiddenStore[tableId] ?? [];
  const isHidden = hiddenList.includes(headerKey);

  // Tag the parent <th> and the matching cell in every body row, then
  // toggle visibility via inline style to mimic an Excel-style column hide.
  useLayoutEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const th = node.closest("th") as HTMLTableCellElement | null;
    if (!th) return;
    const table = th.closest("table") as HTMLTableElement | null;
    if (!table) return;
    const idx = th.cellIndex;
    th.dataset.thKey = headerKey;
    th.style.display = isHidden ? "none" : "";
    const rows = table.tBodies[0]?.rows ?? [];
    for (let r = 0; r < rows.length; r++) {
      const cell = rows[r].cells[idx];
      if (cell) {
        cell.dataset.tdKey = headerKey;
        cell.style.display = isHidden ? "none" : "";
      }
    }
  });

  const rename = () => {
    const next = window.prompt("اسم العمود الجديد:", label);
    if (next == null) return;
    const t = { ...(headerStore[tableId] ?? {}) };
    if (next.trim() === "" || next.trim() === defaultLabel) delete t[headerKey];
    else t[headerKey] = next.trim();
    headerStore = { ...headerStore, [tableId]: t };
    notifyHeaders();
  };
  const hide = () => {
    const cur = new Set(hiddenList);
    cur.add(headerKey);
    hiddenStore = { ...hiddenStore, [tableId]: Array.from(cur) };
    notifyHidden();
  };
  return (
    <span ref={wrapRef} className="inline-flex items-center gap-1 group/hdr">
      <span
        className={isAdmin ? "cursor-pointer hover:text-emerald-600" : ""}
        title={isAdmin ? "انقر مرتين لإعادة التسمية" : undefined}
        onDoubleClick={(e) => { if (!isAdmin) return; e.preventDefault(); rename(); }}
        onContextMenu={(e) => { if (!isAdmin) return; e.preventDefault(); rename(); }}
      >{label}</span>
      {isAdmin && (
        <button
          onClick={hide}
          title="إخفاء هذا العمود (يمكنك إظهاره لاحقاً من أعلى الجدول)"
          className="opacity-0 group-hover/hdr:opacity-100 text-slate-400 hover:text-red-600 transition"
        ><EyeOff className="w-3 h-3" /></button>
      )}
    </span>
  );
}

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

/* ---- Undo stack (in-memory) for removed columns + their cells ---- */
type RemovedCol = { col: CustomCol; index: number; cells: Record<string, string>; ts: number };
const removedColsByTable: Record<string, RemovedCol[]> = {};
const undoListeners = new Set<() => void>();
function notifyUndo() { undoListeners.forEach((l) => l()); }

export const COL_TYPE_OPTIONS: { type: ColType; label: string; icon: string }[] = [
  { type: "people",    label: "الأشخاص",         icon: "👥" },
  { type: "text",      label: "نص",              icon: "T"  },
  { type: "date",      label: "التاريخ",         icon: "📅" },
  { type: "daterange", label: "مؤقت زمني (من/إلى)", icon: "⏳" },
  { type: "number",    label: "رقم",             icon: "#"  },
  { type: "select",    label: "قائمة منسدلة",    icon: "▾"  },
  { type: "tags",      label: "وسوم",            icon: "🏷️" },
  { type: "link",      label: "الرابط",          icon: "🔗" },
  { type: "phone",     label: "رقم التواصل",     icon: "📱" },
  { type: "email",     label: "بريد إلكتروني",   icon: "✉️" },
  { type: "location",  label: "الموقع",          icon: "📍" },
  { type: "rating",    label: "التقييم",         icon: "⭐" },
  { type: "timer",     label: "متابعة الوقت",    icon: "⏱️" },
  { type: "vote",      label: "التصويت",         icon: "✅" },
  { type: "file",      label: "رفع مستند",       icon: "📎" },
];

const DEFAULT_SELECT_OPTIONS: SelectOption[] = [
  { id: "o1", label: "جديد",        color: "#3b82f6" },
  { id: "o2", label: "قيد التنفيذ", color: "#f59e0b" },
  { id: "o3", label: "مكتمل",       color: "#10b981" },
];

export function useTableExtras(tableId: string) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    const u = () => setTick((t) => t + 1);
    undoListeners.add(u);
    return () => { listeners.delete(l); undoListeners.delete(u); };
  }, []);

  const cols: CustomCol[] = store.cols[tableId] ?? [];

  const addCol = (type: ColType, name: string, insertAt?: number) => {
    if (!name.trim()) return;
    const arr = [...(store.cols[tableId] ?? [])];
    const at = insertAt ?? arr.length;
    const newCol: CustomCol = {
      id: `c${Date.now()}${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      type,
    };
    if (type === "select") newCol.options = DEFAULT_SELECT_OPTIONS.map((o) => ({ ...o }));
    arr.splice(Math.max(0, Math.min(at, arr.length)), 0, newCol);
    store = { ...store, cols: { ...store.cols, [tableId]: arr } };
    notify();
  };

  const updateCol = (colId: string, patch: Partial<CustomCol>) => {
    const arr = (store.cols[tableId] ?? []).map((c) =>
      c.id === colId ? { ...c, ...patch } : c
    );
    store = { ...store, cols: { ...store.cols, [tableId]: arr } };
    notify();
  };

  const removeCol = (colId: string) => {
    const arr = store.cols[tableId] ?? [];
    const idx = arr.findIndex((c) => c.id === colId);
    if (idx === -1) return;
    const col = arr[idx];
    // snapshot cells for undo
    const cellsAll = store.cells[tableId] ?? {};
    const snap: Record<string, string> = {};
    for (const k of Object.keys(cellsAll)) if (k.endsWith(`::${colId}`)) snap[k] = cellsAll[k];
    // push undo
    (removedColsByTable[tableId] ||= []).push({ col, index: idx, cells: snap, ts: Date.now() });
    // remove from cells
    const newCells: Record<string, string> = {};
    for (const k of Object.keys(cellsAll)) if (!k.endsWith(`::${colId}`)) newCells[k] = cellsAll[k];
    const newArr = arr.filter((c) => c.id !== colId);
    store = {
      ...store,
      cols: { ...store.cols, [tableId]: newArr },
      cells: { ...store.cells, [tableId]: newCells },
    };
    notify(); notifyUndo();
  };

  const undoRemove = () => {
    const stack = removedColsByTable[tableId];
    if (!stack || !stack.length) return;
    const last = stack.pop()!;
    const arr = [...(store.cols[tableId] ?? [])];
    arr.splice(Math.min(last.index, arr.length), 0, last.col);
    const cellsAll = { ...(store.cells[tableId] ?? {}), ...last.cells };
    store = {
      ...store,
      cols: { ...store.cols, [tableId]: arr },
      cells: { ...store.cells, [tableId]: cellsAll },
    };
    notify(); notifyUndo();
  };

  const hasUndo = (removedColsByTable[tableId]?.length ?? 0) > 0;

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

  return { cols, addCol, updateCol, removeCol, undoRemove, hasUndo, getCell, setCell, getChat, updateChat };
}

/* ============================================================
   Column type picker menu
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
        className="absolute bg-white rounded-lg shadow-2xl border border-slate-200 p-2 grid grid-cols-2 gap-1 min-w-[300px] max-h-[80vh] overflow-auto"
        style={{
          left: Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 800) - 320),
          top: Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 600) - 420),
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

/* ============================================================
   Select-column option editor
============================================================ */

const PALETTE = ["#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#10b981","#14b8a6","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#d946ef","#ec4899","#64748b"];

function SelectOptionsEditor({
  col, onChange, onClose,
}: { col: CustomCol; onChange: (opts: SelectOption[]) => void; onClose: () => void }) {
  const [opts, setOpts] = useState<SelectOption[]>(col.options ?? []);
  const save = (next: SelectOption[]) => { setOpts(next); onChange(next); };
  return (
    <div className="fixed inset-0 z-[95] bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[95vw] p-4" dir="rtl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          <div className="text-sm font-bold text-slate-800">خيارات «{col.name}»</div>
        </div>
        <div className="space-y-2 max-h-[50vh] overflow-auto">
          {opts.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = opts.filter((_, k) => k !== i);
                  save(next);
                }}
                className="p-1.5 rounded hover:bg-red-50 text-red-500"
                title="حذف"
              ><Trash2 className="w-3.5 h-3.5" /></button>
              <input
                value={o.label}
                onChange={(e) => {
                  const next = [...opts]; next[i] = { ...o, label: e.target.value }; save(next);
                }}
                className="flex-1 h-8 px-2 border border-slate-200 rounded text-xs"
                placeholder="اسم الخيار"
              />
              <div className="flex flex-wrap gap-0.5 justify-end">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => { const next = [...opts]; next[i] = { ...o, color: c }; save(next); }}
                    className={`w-4 h-4 rounded-full border ${o.color === c ? "ring-2 ring-offset-1 ring-slate-700" : "border-white"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => save([...opts, { id: `o${Date.now()}`, label: "خيار جديد", color: PALETTE[opts.length % PALETTE.length] }])}
          className="mt-3 w-full h-8 rounded border border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
        >
          + إضافة خيار
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Date-range editor (مؤقت زمني)
============================================================ */

function parseRange(v: string): { from: string; to: string } {
  if (!v) return { from: "", to: "" };
  const [from, to] = v.split("|");
  return { from: from || "", to: to || "" };
}
function joinRange(from: string, to: string) {
  if (!from && !to) return "";
  return `${from}|${to}`;
}
function daysLeft(toIso: string) {
  if (!toIso) return null;
  const t = new Date(toIso + "T23:59:59").getTime();
  const d = Math.ceil((t - Date.now()) / 86_400_000);
  return d;
}

function DateRangeCell({
  value, disabled, onChange,
}: { value: string; disabled: boolean; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { from, to } = parseRange(value);
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);
  useEffect(() => { setF(from); setT(to); }, [value]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const left = daysLeft(to);
  const labelText = from || to
    ? `${from || "—"}  ←  ${to || "—"}`
    : "اختر فترة";
  const tip = to
    ? (left !== null && left >= 0 ? `متبقي ${left} يوم لانتهاء المهلة` : `انتهت المهلة قبل ${Math.abs(left ?? 0)} يوم`)
    : "لم يتم تحديد تاريخ الانتهاء";

  return (
    <div ref={wrap} className="relative inline-block w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        title={tip}
        className={`w-full text-right text-[11px] px-2 py-1 rounded border ${
          to && left !== null && left < 0 ? "border-red-300 bg-red-50 text-red-700"
          : to && left !== null && left <= 3 ? "border-amber-300 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-white text-slate-700"
        } hover:bg-slate-50 disabled:opacity-60`}
      >
        {labelText}
        {to && left !== null && (
          <span className="block text-[9px] mt-0.5 opacity-80">
            {left >= 0 ? `باقي ${left} يوم` : `متأخر ${Math.abs(left)} يوم`}
          </span>
        )}
      </button>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 right-0 bg-white rounded-lg border border-slate-200 shadow-xl p-3 w-64" dir="rtl">
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">من</div>
              <input type="date" value={f} onChange={(e) => setF(e.target.value)}
                className="w-full h-8 border border-slate-200 rounded px-2 text-xs" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">إلى</div>
              <input type="date" value={t} onChange={(e) => setT(e.target.value)}
                className="w-full h-8 border border-slate-200 rounded px-2 text-xs" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { onChange(joinRange(f, t)); setOpen(false); }}
              className="flex-1 h-8 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >تأكيد</button>
            <button
              onClick={() => { setF(""); setT(""); onChange(""); setOpen(false); }}
              className="h-8 px-3 rounded border border-slate-200 text-xs"
            >مسح</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   File-upload cell
============================================================ */

function FileCell({
  value, disabled, onChange,
}: { value: string; disabled: boolean; onChange: (v: string) => void }) {
  // value format: "filename|dataUrl"
  const [name, dataUrl] = value ? value.split("|::|") : ["", ""];
  const id = useMemo(() => `f${Math.random().toString(36).slice(2)}`, []);
  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(`${f.name}|::|${reader.result as string}`);
    reader.readAsDataURL(f);
  };
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {name ? (
        <a href={dataUrl} download={name} className="text-[11px] text-emerald-700 hover:underline truncate max-w-[140px] flex items-center gap-1">
          <FileText className="w-3 h-3" />{name}
        </a>
      ) : (
        <span className="text-[10px] text-slate-400">لا يوجد</span>
      )}
      {!disabled && (
        <>
          <input id={id} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          <label htmlFor={id} className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-500" title="رفع ملف">
            <Upload className="w-3.5 h-3.5" />
          </label>
          {name && (
            <button onClick={() => onChange("")} className="p-1 rounded hover:bg-red-50 text-red-400" title="حذف">
              <X className="w-3 h-3" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   Headers + cells
============================================================ */

export function ExtraColHeaders({
  tableId, isAdmin, thClass = "px-2 py-2 text-right font-semibold whitespace-nowrap",
}: { tableId: string; isAdmin: boolean; thClass?: string }) {
  const x = useTableExtras(tableId);
  const [menu, setMenu] = useState<{ x: number; y: number; insertAt: number } | null>(null);
  const [editCol, setEditCol] = useState<CustomCol | null>(null);

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
            <span
              className={isAdmin ? "cursor-pointer hover:text-emerald-600" : ""}
              title={isAdmin ? "انقر مرتين لإعادة التسمية" : undefined}
              onDoubleClick={(e) => {
                if (!isAdmin) return;
                e.preventDefault();
                const next = window.prompt("اسم العمود:", c.name);
                if (next && next.trim()) x.updateCol(c.id, { name: next.trim() });
              }}
            >{c.name}</span>
            {isAdmin && c.type === "select" && (
              <button onClick={() => setEditCol(c)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-emerald-600" title="تعديل الخيارات">
                <Settings2 className="w-3 h-3" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => x.removeCol(c.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] mr-1"
                title="حذف العمود (مع إمكانية التراجع)"
              >✕</button>
            )}
          </span>
        </th>
      ))}
      {isAdmin && (
        <th
          className={`${thClass} text-center text-slate-400 hover:text-emerald-600 cursor-pointer`}
          title="إضافة عمود"
          onClick={(e) => setMenu({ x: e.clientX, y: e.clientY, insertAt: x.cols.length })}
          onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, insertAt: x.cols.length }); }}
        >
          <span className="inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            {x.hasUndo && (
              <button
                onClick={(e) => { e.stopPropagation(); x.undoRemove(); }}
                className="text-[10px] text-amber-600 hover:text-amber-800 flex items-center gap-0.5"
                title="تراجع عن آخر حذف"
              ><Undo2 className="w-3 h-3" />تراجع</button>
            )}
          </span>
        </th>
      )}
      {menu && <ColMenu x={menu.x} y={menu.y} onPick={pickType} onClose={() => setMenu(null)} />}
      {editCol && (
        <SelectOptionsEditor
          col={editCol}
          onChange={(opts) => x.updateCol(editCol.id, { options: opts })}
          onClose={() => setEditCol(null)}
        />
      )}
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
            {c.type === "text"      && <input value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "number"    && <input type="number" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "date"      && <input type="date" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "daterange" && <DateRangeCell value={val} disabled={!canEdit} onChange={setVal} />}
            {c.type === "link"      && <input type="url" placeholder="https://" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />}
            {c.type === "phone"     && <input type="tel" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />}
            {c.type === "email"     && <input type="email" value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />}
            {c.type === "location"  && <input value={val} placeholder="📍 الموقع" disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "tags"      && <input value={val} placeholder="وسم، وسم" disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "timer"     && <input value={val} placeholder="0h 0m" disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls} />}
            {c.type === "file"      && <FileCell value={val} disabled={!canEdit} onChange={setVal} />}
            {c.type === "people"    && (
              <select value={val} disabled={!canEdit} onChange={(e) => setVal(e.target.value)} className={baseCls}>
                <option value="">—</option>
                {employees.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
            {c.type === "select"    && (() => {
              const opts = c.options ?? [];
              const cur = opts.find((o) => o.id === val);
              return (
                <select
                  value={val}
                  disabled={!canEdit}
                  onChange={(e) => setVal(e.target.value)}
                  className={`${baseCls} font-semibold`}
                  style={cur ? { background: cur.color + "22", color: cur.color } : undefined}
                >
                  <option value="">—</option>
                  {opts.map((o) => <option key={o.id} value={o.id} style={{ color: o.color }}>{o.label}</option>)}
                </select>
              );
            })()}
            {c.type === "rating"    && (
              <div className="flex items-center gap-0.5 justify-end">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" disabled={!canEdit} onClick={() => setVal(String(n))}
                    className={`text-sm leading-none ${Number(val) >= n ? "text-amber-400" : "text-slate-300"} disabled:opacity-60`}>★</button>
                ))}
              </div>
            )}
            {c.type === "vote"      && (
              <label className="flex items-center justify-end gap-1 text-xs text-slate-600">
                <input type="checkbox" checked={val === "1"} disabled={!canEdit} onChange={(e) => setVal(e.target.checked ? "1" : "")} />
                <span>{val === "1" ? "موافق" : "—"}</span>
              </label>
            )}
          </td>
        );
      })}
      <td className="p-0" />
    </>
  );
}

/* ============================================================
   Row chat (private per-row conversation)
============================================================ */

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
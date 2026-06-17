import { useState } from "react";
import { Plus, Trash2, ChevronDown, GripVertical } from "lucide-react";

/* =========================================================================
   FlexSheet — a fully flexible, Excel-like table.
   - Free rows & columns
   - Per-column type (text / number / date / time / select / checkbox)
   - Add / delete / rename columns, change a column's type at any time
   - Per-column dropdown options (for the "select" type)
   - Controlled component: pass `data` and `onChange`
   ========================================================================= */

export type FlexColType =
  | "text"
  | "number"
  | "date"
  | "time"
  | "daterange"
  | "select"
  | "checkbox"
  | "people"
  | "tags"
  | "link"
  | "phone"
  | "email"
  | "location"
  | "rating"
  | "timer"
  | "vote";

export type FlexColumn = {
  id: string;
  name: string;
  type: FlexColType;
  options?: string[];
};

export type FlexRow = Record<string, string | boolean>;

export type FlexSheetData = {
  columns: FlexColumn[];
  rows: FlexRow[];
};

export const FLEX_TYPE_OPTIONS: { type: FlexColType; label: string; icon: string }[] = [
  { type: "text", label: "نص", icon: "🔤" },
  { type: "number", label: "رقم", icon: "🔢" },
  { type: "date", label: "تاريخ", icon: "📅" },
  { type: "time", label: "وقت", icon: "⏰" },
  { type: "daterange", label: "مدة (من/إلى)", icon: "⏳" },
  { type: "select", label: "قائمة منسدلة", icon: "🔽" },
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

const uid = () => Math.random().toString(36).slice(2, 9);

export function emptyFlexSheet(): FlexSheetData {
  return {
    columns: [
      { id: uid(), name: "العمود 1", type: "text" },
      { id: uid(), name: "العمود 2", type: "text" },
      { id: uid(), name: "العمود 3", type: "text" },
    ],
    rows: [{}, {}, {}],
  };
}

export default function FlexSheet({
  data,
  onChange,
  editable = true,
}: {
  data: FlexSheetData;
  onChange: (next: FlexSheetData) => void;
  editable?: boolean;
}) {
  const cols = data?.columns ?? [];
  const rows = data?.rows ?? [];
  const [typeMenu, setTypeMenu] = useState<string | null>(null);
  const [optsEditor, setOptsEditor] = useState<string | null>(null);

  const apply = (patch: Partial<FlexSheetData>) =>
    onChange({ columns: cols, rows, ...patch });

  const addColumn = () =>
    apply({ columns: [...cols, { id: uid(), name: `عمود ${cols.length + 1}`, type: "text" }] });

  const removeColumn = (id: string) =>
    apply({
      columns: cols.filter((c) => c.id !== id),
      rows: rows.map((r) => {
        const n = { ...r };
        delete n[id];
        return n;
      }),
    });

  const renameColumn = (id: string, name: string) =>
    apply({ columns: cols.map((c) => (c.id === id ? { ...c, name } : c)) });

  const setColType = (id: string, type: FlexColType) =>
    apply({ columns: cols.map((c) => (c.id === id ? { ...c, type } : c)) });

  const setColOptions = (id: string, options: string[]) =>
    apply({ columns: cols.map((c) => (c.id === id ? { ...c, options } : c)) });

  const addRow = () => apply({ rows: [...rows, {}] });
  const removeRow = (i: number) => apply({ rows: rows.filter((_, k) => k !== i) });
  const setCell = (i: number, colId: string, val: string | boolean) =>
    apply({ rows: rows.map((r, k) => (k === i ? { ...r, [colId]: val } : r)) });

  const inputCls =
    "w-full h-9 px-2 text-sm text-right bg-transparent focus:outline-none focus:bg-teal-50/40 rounded";

  const renderCell = (col: FlexColumn, rowIndex: number) => {
    const raw = rows[rowIndex]?.[col.id];
    if (!editable) {
      if (col.type === "checkbox") return raw ? "✓" : "";
      return <span className="px-2 text-sm">{String(raw ?? "")}</span>;
    }
    switch (col.type) {
      case "number":
        return (
          <input
            type="number"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
      case "time":
        return (
          <input
            type="time"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
      case "checkbox":
      case "vote":
        return (
          <div className="flex items-center justify-center h-9">
            <input
              type="checkbox"
              checked={!!raw}
              onChange={(e) => setCell(rowIndex, col.id, e.target.checked)}
            />
          </div>
        );
      case "daterange": {
        const [from, to] = String(raw ?? "").split("|");
        const set = (f: string, t: string) => setCell(rowIndex, col.id, `${f}|${t}`);
        return (
          <div className="flex items-center gap-1">
            <input type="date" value={from ?? ""} onChange={(e) => set(e.target.value, to ?? "")} className={inputCls} />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={to ?? ""} onChange={(e) => set(from ?? "", e.target.value)} className={inputCls} />
          </div>
        );
      }
      case "link":
        return (
          <input
            type="url"
            placeholder="https://"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            placeholder="+9665…"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
      case "email":
        return (
          <input
            type="email"
            placeholder="name@mail.com"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
      case "rating": {
        const n = Number(raw ?? 0);
        return (
          <div className="flex items-center justify-center gap-0.5 h-9" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setCell(rowIndex, col.id, String(star === n ? 0 : star))}
                className={`text-base leading-none ${star <= n ? "text-amber-400" : "text-slate-300"}`}
              >
                ★
              </button>
            ))}
          </div>
        );
      }
      case "timer":
        return (
          <input
            type="number"
            min={0}
            placeholder="دقائق"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
      case "select":
        return (
          <select
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls + " appearance-none"}
          >
            <option value="">—</option>
            {(col.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={(raw as string) ?? ""}
            onChange={(e) => setCell(rowIndex, col.id, e.target.value)}
            className={inputCls}
          />
        );
    }
  };

  return (
    <div dir="rtl" className="w-full">
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-10 border-b border-l border-slate-200" />
              {cols.map((col) => (
                <th
                  key={col.id}
                  className="min-w-[150px] border-b border-l border-slate-200 p-1 align-top relative"
                >
                  <div className="flex items-center gap-1">
                    <input
                      value={col.name}
                      disabled={!editable}
                      onChange={(e) => renameColumn(col.id, e.target.value)}
                      className="flex-1 h-8 px-2 text-sm font-bold text-right bg-transparent focus:outline-none focus:bg-white rounded"
                    />
                    {editable && (
                      <>
                        <button
                          onClick={() => setTypeMenu(typeMenu === col.id ? null : col.id)}
                          className="shrink-0 h-7 px-1.5 rounded text-[11px] text-slate-500 hover:bg-slate-200 flex items-center gap-0.5"
                          title="نوع العمود"
                        >
                          <span>{FLEX_TYPE_OPTIONS.find((o) => o.type === col.type)?.icon}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeColumn(col.id)}
                          className="shrink-0 h-7 w-7 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                          title="حذف العمود"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                  {typeMenu === col.id && (
                    <div className="absolute z-20 top-full right-1 mt-1 w-44 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
                      {FLEX_TYPE_OPTIONS.map((o) => (
                        <button
                          key={o.type}
                          onClick={() => {
                            setColType(col.id, o.type);
                            setTypeMenu(null);
                            if (o.type === "select") setOptsEditor(col.id);
                          }}
                          className={`w-full flex items-center justify-end gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${
                            col.type === o.type ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-700"
                          }`}
                        >
                          <span>{o.label}</span>
                          <span>{o.icon}</span>
                        </button>
                      ))}
                      {col.type === "select" && (
                        <button
                          onClick={() => {
                            setOptsEditor(col.id);
                            setTypeMenu(null);
                          }}
                          className="w-full text-center px-3 py-2 text-xs text-teal-700 border-t border-slate-100 hover:bg-slate-50"
                        >
                          تعديل خيارات القائمة
                        </button>
                      )}
                    </div>
                  )}
                  {optsEditor === col.id && (
                    <div className="absolute z-20 top-full right-1 mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg p-2">
                      <div className="text-xs text-slate-500 mb-1 text-right">
                        خيارات القائمة (سطر لكل خيار):
                      </div>
                      <textarea
                        defaultValue={(col.options ?? []).join("\n")}
                        onBlur={(e) =>
                          setColOptions(
                            col.id,
                            e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                        rows={4}
                        className="w-full text-sm border border-slate-200 rounded p-1 text-right focus:outline-none focus:border-teal-400"
                      />
                      <button
                        onClick={() => setOptsEditor(null)}
                        className="mt-1 w-full h-8 rounded bg-teal-600 text-white text-xs font-bold"
                      >
                        تم
                      </button>
                    </div>
                  )}
                </th>
              ))}
              {editable && (
                <th className="w-10 border-b border-slate-200 p-1">
                  <button
                    onClick={addColumn}
                    className="h-8 w-8 rounded text-teal-600 hover:bg-teal-50 flex items-center justify-center"
                    title="إضافة عمود"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((_, i) => (
              <tr key={i} className="hover:bg-slate-50/60">
                <td className="border-b border-l border-slate-200 text-center align-middle">
                  {editable ? (
                    <button
                      onClick={() => removeRow(i)}
                      className="h-8 w-8 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center mx-auto"
                      title="حذف الصف"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">{i + 1}</span>
                  )}
                </td>
                {cols.map((col) => (
                  <td key={col.id} className="border-b border-l border-slate-200 align-middle">
                    {renderCell(col, i)}
                  </td>
                ))}
                {editable && <td className="border-b border-slate-200" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editable && (
        <button
          onClick={addRow}
          className="mt-2 h-9 px-4 rounded-md border border-dashed border-slate-300 text-slate-600 text-sm hover:border-teal-400 hover:text-teal-600 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> إضافة صف
        </button>
      )}
    </div>
  );
}

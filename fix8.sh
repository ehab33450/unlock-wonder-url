#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
git fetch origin main -q
git checkout -B main origin/main -q
python3 - <<'PYEOF'
p = "src/routes/index.tsx"
s = open(p, encoding="utf-8").read()

# A) remove the separate top "Project members" section
old_a = '''        ) : (
          <>
            {/* Project members */}
            <div className="px-6 py-3 bg-white border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                {canEditAll && (
                  <button
                    onClick={() => setMembersOpen((v) => !v)}
                    className="h-7 px-2.5 rounded-md border border-[color:var(--eyenak-teal)]/40 text-[11px] text-[color:var(--eyenak-teal)] hover:bg-teal-50 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة عضو
                  </button>
                )}
                <h3 className="text-sm font-bold text-slate-700 text-right flex items-center gap-1">
                  <Users className="w-4 h-4 text-[color:var(--eyenak-teal)]" /> أعضاء المشروع ({(members ?? []).length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-1 justify-end" dir="rtl">
                {(members ?? []).length === 0 && <span className="text-sm text-slate-400">لا يوجد أعضاء بعد</span>}
                {(members ?? []).map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color:var(--eyenak-teal)]/10 text-[color:var(--eyenak-teal)] text-[11px] font-semibold border border-[color:var(--eyenak-teal)]/30">
                    <span>{m}</span>
                    {canEditAll && m !== "الأدمن" && onRemoveMember && (
                      <button onClick={() => onRemoveMember(m)} className="text-[color:var(--eyenak-teal)]/70 hover:text-red-600" title="إزالة">×</button>
                    )}
                  </span>
                ))}
              </div>
              {membersOpen && canEditAll && (
                <div className="mt-2 flex flex-wrap gap-1 justify-end border-t border-slate-100 pt-2" dir="rtl">
                  {employees.filter((e) => !(members ?? []).includes(e)).map((e) => (
                    <button key={e} onClick={() => onAddMember?.(e)} className="text-[11px] px-2 py-1 rounded border border-slate-200 hover:bg-slate-100">+ {e}</button>
                  ))}
                  {employees.filter((e) => !(members ?? []).includes(e)).length === 0 && (
                    <span className="text-xs text-slate-400">تمت إضافة جميع الموظفين.</span>
                  )}
                </div>
              )}
            </div>
            {/* Contract bar */}'''
new_a = '''        ) : (
          <>
            {/* Contract bar */}'''

# B) replace assignee InfoCell with the members management cell
old_b = '''                <InfoCell
                  label="الموظف المُكلَّف"
                  value={data.contract.assignee || "—"}
                  editable={canEditAll}
                  onSave={(v) =>
                    onUpdate((c) => ({ ...c, contract: { ...c.contract, assignee: v } }))
                  }
                />'''
new_b = '''                <div className="bg-slate-50 rounded border border-slate-200 p-3 text-right">
                  <div className="flex items-center justify-between mb-1">
                    {canEditAll && (
                      <button
                        type="button"
                        onClick={() => setMembersOpen((v) => !v)}
                        className="h-6 px-2 rounded border border-[color:var(--eyenak-teal)]/40 text-[10px] text-[color:var(--eyenak-teal)] hover:bg-teal-50 flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> إضافة عضو
                      </button>
                    )}
                    <div className="text-xs text-slate-500">الموظف المُكلَّف / الأعضاء ({(members ?? []).length})</div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end" dir="rtl">
                    {(members ?? []).length === 0 && <span className="text-sm text-slate-400">—</span>}
                    {(members ?? []).map((m) => (
                      <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color:var(--eyenak-teal)]/10 text-[color:var(--eyenak-teal)] text-[11px] font-semibold border border-[color:var(--eyenak-teal)]/30">
                        <span>{m}</span>
                        {canEditAll && m !== "الأدمن" && onRemoveMember && (
                          <button type="button" onClick={() => onRemoveMember(m)} className="text-[color:var(--eyenak-teal)]/70 hover:text-red-600" title="إزالة">×</button>
                        )}
                      </span>
                    ))}
                  </div>
                  {membersOpen && canEditAll && (
                    <div className="mt-2 flex flex-wrap gap-1 justify-end border-t border-slate-100 pt-2" dir="rtl">
                      {employees.filter((e) => !(members ?? []).includes(e)).map((e) => (
                        <button type="button" key={e} onClick={() => onAddMember?.(e)} className="text-[11px] px-2 py-1 rounded border border-slate-200 hover:bg-slate-100">+ {e}</button>
                      ))}
                      {employees.filter((e) => !(members ?? []).includes(e)).length === 0 && (
                        <span className="text-xs text-slate-400">تمت إضافة الجميع.</span>
                      )}
                    </div>
                  )}
                </div>'''

for i, (o, n) in enumerate([(old_a, new_a), (old_b, new_b)], 1):
    if o not in s:
        raise SystemExit("ERROR: edit %d not found - aborting" % i)
    s = s.replace(o, n, 1)
open(p, "w", encoding="utf-8").write(s)
print("ALL PATCHED OK")
PYEOF
git add src/routes/index.tsx
git commit -q -m "move project members management into the assignee box"
git push origin main && echo "DONE - wait ~1 min for Vercel" || echo "PUSH FAILED - copy the message and send it to me"

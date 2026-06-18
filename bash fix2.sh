#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
git fetch origin main -q
git checkout -B main origin/main -q
python3 - <<'PYEOF'
p = "src/routes/index.tsx"
s = open(p, encoding="utf-8").read()

# ---- Fix 1: assignee field -> dropdown of real users ----
old1 = '''                    <input
                      list="np-assignees"
                      value={npAssignee}
                      onChange={(e) => setNpAssignee(e.target.value)}
                      placeholder="اسم الموظف"
                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                    <datalist id="np-assignees">
                      {employees.map((e) => (
                        <option key={e.id} value={e.name} />
                      ))}
                    </datalist>'''
new1 = '''                    <select
                      value={npAssignee}
                      onChange={(e) => setNpAssignee(e.target.value)}
                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] bg-white"
                    >
                      <option value="">— اختر الموظف —</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.name}>{e.name}</option>
                      ))}
                    </select>
                    {employees.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1 text-right">لا يوجد مستخدمون — أضِفهم من لوحة المستخدمين أولاً.</p>
                    )}'''

# ---- Fix 2: Excel template buttons only before a sheet is chosen ----
old2 = '''                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">ابدأ بـ:</span>
                    <button onClick={() => onUpdateFlexSheet(emptyFlexSheet())} className="h-8 px-3 rounded-md border border-slate-200 text-xs hover:bg-slate-50">جدول فارغ</button>
                    <button onClick={() => onUpdateFlexSheet(tasksTemplate())} className="h-8 px-3 rounded-md border border-[color:var(--eyenak-teal)]/40 text-xs text-[color:var(--eyenak-teal)] hover:bg-teal-50">قالب المهام</button>
                    <button onClick={() => onUpdateFlexSheet(financeTemplate())} className="h-8 px-3 rounded-md border border-amber-300 text-xs text-amber-600 hover:bg-amber-50">قالب المالية</button>
                  </div>'''
new2 = '''                  {!(flexSheet && (flexSheet.columns?.length ?? 0) > 0) ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500">ابدأ بـ:</span>
                      <button onClick={() => onUpdateFlexSheet(emptyFlexSheet())} className="h-8 px-3 rounded-md border border-slate-200 text-xs hover:bg-slate-50">جدول فارغ</button>
                      <button onClick={() => onUpdateFlexSheet(tasksTemplate())} className="h-8 px-3 rounded-md border border-[color:var(--eyenak-teal)]/40 text-xs text-[color:var(--eyenak-teal)] hover:bg-teal-50">قالب المهام</button>
                      <button onClick={() => onUpdateFlexSheet(financeTemplate())} className="h-8 px-3 rounded-md border border-amber-300 text-xs text-amber-600 hover:bg-amber-50">قالب المالية</button>
                    </div>
                  ) : <span />}'''

# ---- Fix 3: ensure folder group exists before saving project ----
old3 = '''        const group_id = npFolder ? (groupIdByName.current.get(npFolder) ?? null) : null;
        const proj = await _createProject({ data: { name, group_id, description: npDesc, start_date: npStart || null, end_date: npEnd || null, members: npMembers } });'''
new3 = '''        let group_id: string | null = null;
        if (npFolder) {
          if (!groupIdByName.current.has(npFolder)) {
            const g = await _upsertGroup({ data: { name: npFolder } });
            groupIdByName.current.set(npFolder, (g as any).id);
          }
          group_id = groupIdByName.current.get(npFolder) ?? null;
        }
        const proj = await _createProject({ data: { name, group_id, description: npDesc, start_date: npStart || null, end_date: npEnd || null, members: npMembers } });'''

for i, (o, n) in enumerate([(old1, new1), (old2, new2), (old3, new3)], 1):
    if o not in s:
        raise SystemExit("ERROR: edit %d pattern not found - aborting" % i)
    s = s.replace(o, n, 1)

open(p, "w", encoding="utf-8").write(s)
print("PATCHED OK")
PYEOF
git add src/routes/index.tsx
git commit -q -m "fix: assignee user dropdown + hide excel templates after pick + persist project folder"
git push origin main && echo "DONE - wait ~1 min for Vercel" || echo "PUSH FAILED - copy the message and send it to me"

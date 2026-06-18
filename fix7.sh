#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
git fetch origin main -q
git checkout -B main origin/main -q
python3 - <<'PYEOF'
p = "src/routes/index.tsx"
s = open(p, encoding="utf-8").read()
edits = [
# 1) canView includes members
('''  const canView = isAdmin || isAssignee || !data.contract.assignee;''',
 '''  const canView = isAdmin || isAssignee || (members ?? []).includes(currentUser) || !data.contract.assignee;'''),
# 2) props
('''  flexSheet,
  onUpdateFlexSheet,
}: {
  name: string;
  meta: DMeta | undefined;
  isAdmin: boolean;
  currentUser: string;
  employeeCanEdit?: boolean;
  onClose: () => void;''',
 '''  flexSheet,
  onUpdateFlexSheet,
  members,
  onAddMember,
  onRemoveMember,
}: {
  name: string;
  meta: DMeta | undefined;
  isAdmin: boolean;
  currentUser: string;
  employeeCanEdit?: boolean;
  members?: string[];
  onAddMember?: (name: string) => void;
  onRemoveMember?: (name: string) => void;
  onClose: () => void;'''),
# 3) state
('''  const [servicesOpen, setServicesOpen] = useState(false);''',
 '''  const [servicesOpen, setServicesOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);'''),
# 4) members section UI
('''        ) : (
          <>
            {/* Contract bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-200">''',
 '''        ) : (
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
            {/* Contract bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-200">'''),
# 5) invocation props
('''          onClose={() => setDetailProject(null)}
          onOpenChat={() => {
            setChatProject(detailProject);
            setChatViewOpen(true);
          }}''',
 '''          members={chatMembers[detailProject] ?? []}
          onAddMember={(n) => addChatMember(detailProject!, n)}
          onRemoveMember={(n) => removeChatMember(detailProject!, n)}
          onClose={() => setDetailProject(null)}
          onOpenChat={() => {
            setChatProject(detailProject);
            setChatViewOpen(true);
          }}'''),
]
for i, (o, n) in enumerate(edits, 1):
    if o not in s:
        raise SystemExit("ERROR: edit %d not found - aborting" % i)
    s = s.replace(o, n, 1)
open(p, "w", encoding="utf-8").write(s)
print("ALL PATCHED OK")
PYEOF
git add src/routes/index.tsx
git commit -q -m "project members: add/remove inside project page + members can view chat & files"
git push origin main && echo "DONE - wait ~1 min for Vercel" || echo "PUSH FAILED - copy the message and send it to me"

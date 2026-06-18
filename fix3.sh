#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
git fetch origin main -q
git checkout -B main origin/main -q
python3 - <<'PYEOF'
def patch(path, edits):
    s = open(path, encoding="utf-8").read()
    for i, (o, n) in enumerate(edits, 1):
        if o not in s:
            raise SystemExit("ERROR in %s: edit %d not found - aborting (no changes written)" % (path, i))
        s = s.replace(o, n, 1)
    open(path, "w", encoding="utf-8").write(s)
    print("PATCHED", path)

flex = "src/components/FlexSheet.tsx"
patch(flex, [
(
'''import { Plus, Trash2, ChevronDown, ChevronLeft, GripVertical, Upload, X, MessageSquare, Send } from "lucide-react";''',
'''import { Plus, Trash2, ChevronDown, ChevronLeft, GripVertical, Upload, X, MessageSquare, Send, Eye, EyeOff } from "lucide-react";'''
),
(
'''  users = [],
  currentUser = "",
}: {
  data: FlexSheetData;
  onChange: (next: FlexSheetData) => void;
  editable?: boolean;
  users?: string[];
  currentUser?: string;
}) {''',
'''  users = [],
  currentUser = "",
  canManage = false,
}: {
  data: FlexSheetData;
  onChange: (next: FlexSheetData) => void;
  editable?: boolean;
  users?: string[];
  currentUser?: string;
  canManage?: boolean;
}) {'''
),
(
'''  const canChat = (row: FlexRow) => { const a = assignedPeople(row); return !currentUser || a.length === 0 || a.includes(currentUser); };''',
'''  const canChat = (row: FlexRow) => { if (canManage) return true; const a = assignedPeople(row); return !currentUser || a.length === 0 || a.includes(currentUser); };
  const toggleHidden = (rid: string) => apply({ rows: rows.map((r) => (r.__id === rid ? { ...r, __hidden: !r.__hidden } : r)) });'''
),
(
'''  const renderRow = (row: FlexRow) => (
    <tr key={row.__id as string} className="hover:bg-slate-50/60">
      <td className="border-b border-l border-slate-200 text-center align-middle w-10">
        {canChat(row) && (''',
'''  const renderRow = (row: FlexRow) => (
    <tr key={row.__id as string} className={`hover:bg-slate-50/60 ${row.__hidden && canManage ? "opacity-50" : ""}`}>
      <td className="border-b border-l border-slate-200 text-center align-middle w-10">
        {canChat(row) && ('''
),
(
'''      <td className="border-b border-l border-slate-200 text-center align-middle">
        {editable ? (
          <button onClick={() => removeRow(row.__id as string)} className="h-8 w-8 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center mx-auto" title="حذف الصف">
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </td>''',
'''      <td className="border-b border-l border-slate-200 text-center align-middle">
        <div className="flex items-center justify-center gap-0.5">
          {canManage && (
            <button onClick={() => toggleHidden(row.__id as string)} className="h-8 w-7 rounded text-slate-300 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center" title={row.__hidden ? "إظهار المهمة للأعضاء" : "إخفاء المهمة عن بقية الأعضاء"}>
              {row.__hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
          {editable && (
            <button onClick={() => removeRow(row.__id as string)} className="h-8 w-7 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" title="حذف الصف">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>'''
),
(
'''  const colSpanAll = cols.length + (editable ? 3 : 2);
  const ungrouped = rows.filter((r) => !r.__group || !groups.some((g) => g.id === r.__group));''',
'''  const colSpanAll = cols.length + (editable ? 3 : 2);
  const visibleRows = canManage ? rows : rows.filter((r) => !r.__hidden);
  const ungrouped = visibleRows.filter((r) => !r.__group || !groups.some((g) => g.id === r.__group));'''
),
(
'''              const gRows = rows.filter((r) => r.__group === g.id);''',
'''              const gRows = visibleRows.filter((r) => r.__group === g.id);'''
),
])

idx = "src/routes/index.tsx"
patch(idx, [
(
'''        const proj = await _createProject({ data: { name, group_id, description: npDesc, start_date: npStart || null, end_date: npEnd || null, members: npMembers } });''',
'''        const uuidMembers = npMembers.filter((m) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(m));
        const proj = await _createProject({ data: { name, group_id, description: npDesc, start_date: npStart || null, end_date: npEnd || null, members: uuidMembers } });'''
),
(
'''                      <button
                        onClick={() => {
                          const name = newEmp.name.trim();
                          let username = newEmp.username.trim();
                          let password = newEmp.password.trim();
                          if (!name) {
                            setAddEmpMsg({ type: "err", text: "الاسم الكامل مطلوب" });
                            return;
                          }
                          // توليد تلقائي إذا تُرك فارغاً
                          if (!username) username = "u" + Math.random().toString(36).slice(2, 7);
                          if (!password) password = Math.random().toString(36).slice(2, 8);
                          if (employees.some((e) => e.username === username)) {
                            setAddEmpMsg({ type: "err", text: "اسم المستخدم موجود مسبقاً، اختر اسماً آخر" });
                            return;
                          }
                          const created: Employee = {
                            id: `u${Date.now()}`,
                            name,
                            email: newEmp.email.trim(),
                            username,
                            password,
                            role: newEmp.role.trim() || "موظف",
                            active: true,
                            perms: { ...newEmpPerms },
                          };
                          setEmployees((arr) => [...arr, created]);
                          setNewEmp({ name: "", email: "", username: "", password: "", role: "موظف" });
                          setNewEmpPerms(defaultEmpPerms());
                          setAddEmpMsg({ type: "ok", text: `تم إنشاء حساب ${name} — افتح رابط الدخول لمشاركته` });
                          setLinkEmp(created);
                        }}
                        className="mt-4 w-full h-10 rounded bg-[color:var(--eyenak-teal)] text-white text-sm hover:opacity-90"
                      >
                        + إضافة الموظف وتفعيل حسابه
                      </button>''',
'''                      <button
                        onClick={async () => {
                          const name = newEmp.name.trim();
                          const email = newEmp.email.trim();
                          let username = newEmp.username.trim();
                          let password = newEmp.password.trim();
                          if (!name) {
                            setAddEmpMsg({ type: "err", text: "الاسم الكامل مطلوب" });
                            return;
                          }
                          if (!email) {
                            setAddEmpMsg({ type: "err", text: "البريد الإلكتروني مطلوب لإنشاء حساب حقيقي يدخل به الموظف" });
                            return;
                          }
                          // توليد تلقائي إذا تُرك فارغاً
                          if (!username) username = "u" + Math.random().toString(36).slice(2, 7);
                          if (!password) password = Math.random().toString(36).slice(2, 8);
                          if (employees.some((e) => e.username === username)) {
                            setAddEmpMsg({ type: "err", text: "اسم المستخدم موجود مسبقاً، اختر اسماً آخر" });
                            return;
                          }
                          try {
                            // إنشاء حساب حقيقي في الباك-إند (Supabase) بمعرّف UUID فعلي
                            await createUserFn({ data: {
                              email, password, display_name: name, username,
                              role: "employee", perms: { ...newEmpPerms },
                            } });
                            await refreshAdminUsers();
                            setNewEmp({ name: "", email: "", username: "", password: "", role: "موظف" });
                            setNewEmpPerms(defaultEmpPerms());
                            setAddEmpMsg({ type: "ok", text: `تم إنشاء حساب ${name} بنجاح — بيانات الدخول: ${email} / ${password}` });
                          } catch (e: any) {
                            setAddEmpMsg({ type: "err", text: e?.message || "تعذّر إنشاء الحساب، تحقق من البيانات" });
                          }
                        }}
                        className="mt-4 w-full h-10 rounded bg-[color:var(--eyenak-teal)] text-white text-sm hover:opacity-90"
                      >
                        + إضافة الموظف وتفعيل حسابه
                      </button>'''
),
(
'''                  <FlexSheet data={flexSheet} onChange={(next) => onUpdateFlexSheet(next)} editable={canEditAll} users={employees} currentUser={currentUser} />''',
'''                  <FlexSheet data={flexSheet} onChange={(next) => onUpdateFlexSheet(next)} editable={canEditAll} users={employees} currentUser={currentUser} canManage={isAdmin || isAssignee} />'''
),
])
print("ALL PATCHED OK")
PYEOF
git add src/components/FlexSheet.tsx src/routes/index.tsx
git commit -q -m "real users + folder fix + task hiding + task chat visibility"
git push origin main && echo "DONE - wait ~1 min for Vercel" || echo "PUSH FAILED - copy the message and send it to me"

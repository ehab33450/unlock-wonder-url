import { useState } from "react";
import {
  X, Search, Plus, Mail, Users as UsersIcon, Building2, ClipboardList,
  CreditCard, BarChart3, Shield, Activity, Server, Coffee, Pencil,
  Trash2, KeyRound, ToggleLeft, ToggleRight, ShieldCheck, MoreVertical,
} from "lucide-react";

export type AdminEmployee = {
  id: string; name: string; email: string; username: string;
  password: string; role: string; active: boolean;
  phone?: string; jobTitle?: string;
  perms: Record<string, boolean>;
};

type RoleRow = {
  id: string; name: string; isDefault: boolean; system?: boolean;
  perms?: Record<string, boolean>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  employees: AdminEmployee[];
  setEmployees: React.Dispatch<React.SetStateAction<any>>;
  perms: { key: string; label: string; group: string }[];
  defaultPerms: () => Record<string, boolean>;
  // Optional remote handlers — when provided, AdminPanel persists to backend
  onCreateUser?: (input: {
    email: string; password: string; display_name: string;
    username?: string; role: "admin" | "employee" | "client";
    perms: Record<string, boolean>;
  }) => Promise<void>;
  onUpdatePerms?: (userId: string, perms: Record<string, boolean>) => Promise<void>;
  onToggleActive?: (userId: string, active: boolean) => Promise<void>;
  loading?: boolean;
};

const SIDEBAR = [
  { id: "company",  label: "الشركة",              icon: Building2 },
  { id: "users",    label: "المستخدمين",          icon: UsersIcon },
  { id: "requests", label: "طلبات اشراف المشاريع", icon: ClipboardList },
  { id: "plans",    label: "خططي",                icon: CreditCard },
  { id: "stats",    label: "الإحصائيات",          icon: BarChart3 },
  { id: "roles",    label: "إدارة الصلاحيات",     icon: Shield },
  { id: "perf",     label: "الأداء",              icon: Activity },
  { id: "smtp",     label: "SMTP",                icon: Server },
  { id: "drinks",   label: "المشروبات",           icon: Coffee },
] as const;

type SectionId = typeof SIDEBAR[number]["id"];

export function AdminPanel({
  open, onClose, employees, setEmployees, perms, defaultPerms,
  onCreateUser, onUpdatePerms, onToggleActive, loading,
}: Props) {
  const [section, setSection] = useState<SectionId>("users");
  const [userTab, setUserTab] = useState<"users" | "invites" | "clients">("users");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<AdminEmployee | null>(null);
  const [permsEmp, setPermsEmp] = useState<AdminEmployee | null>(null);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [editRolePerms, setEditRolePerms] = useState<RoleRow | null>(null);

  const [roles, setRoles] = useState<RoleRow[]>([
    { id: "r1", name: "Admin", isDefault: true, system: true },
    { id: "r2", name: "Employee", isDefault: true, system: true },
    { id: "r3", name: "عميل", isDefault: false },
    { id: "r4", name: "مدير حساب العميل", isDefault: false },
    { id: "r5", name: "مندوب مبيعات", isDefault: false },
    { id: "r6", name: "محاسب", isDefault: false },
  ]);

  if (!open) return null;

  const filtered = employees.filter((e) =>
    !search.trim() || e.name.includes(search) || e.email.includes(search)
  );

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-stretch justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 rounded-none md:rounded-xl shadow-2xl w-full max-w-7xl h-full md:h-[92vh] flex overflow-hidden"
      >
        {/* Sidebar */}
        <aside className="w-56 bg-[color:var(--eyenak-dark)] text-white flex flex-col">
          <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
            <span className="font-bold text-sm">إعدادات المشرف</span>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {SIDEBAR.map((it) => {
              const Icon = it.icon;
              const active = section === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setSection(it.id)}
                  className={`w-full flex items-center justify-end gap-3 px-4 py-2.5 text-sm transition border-r-2 ${
                    active
                      ? "bg-white text-[color:var(--eyenak-dark)] border-[color:var(--eyenak-teal)] font-bold"
                      : "text-white/80 hover:bg-white/5 border-transparent"
                  }`}
                >
                  <span>{it.label}</span>
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {section === "users" && (
            <UsersSection
              employees={filtered}
              setEmployees={setEmployees}
              search={search} setSearch={setSearch}
              userTab={userTab} setUserTab={setUserTab}
              onAdd={() => setAddOpen(true)}
              onEdit={(e: AdminEmployee) => setEditEmp(e)}
              onPerms={(e: AdminEmployee) => setPermsEmp(e)}
              total={employees.length}
              onToggleActive={onToggleActive}
              loading={loading}
            />
          )}
          {section === "roles" && (
            <RolesSection
              roles={roles}
              setRoles={setRoles}
              onAdd={() => setAddRoleOpen(true)}
              onEditPerms={(r) => setEditRolePerms(r)}
            />
          )}
          {section === "company" && (
            <PlaceholderSection title="بيانات الشركة" subtitle="اسم الشركة، الشعار، العنوان، السجل التجاري." />
          )}
          {section === "requests" && (
            <PlaceholderSection title="طلبات اشراف المشاريع" subtitle="لا توجد طلبات حالياً." />
          )}
          {section === "plans" && (
            <PlaceholderSection title="خططي والاشتراك" subtitle="الخطة الحالية: المجانية — يمكنك الترقية لاحقاً." />
          )}
          {section === "stats" && (
            <PlaceholderSection title="الإحصائيات" subtitle="ملخص الأداء الشهري للموظفين والمشاريع." />
          )}
          {section === "perf" && (
            <PlaceholderSection title="الأداء" subtitle="تقييم أداء الموظفين والمؤشرات الرئيسية." />
          )}
          {section === "smtp" && (
            <SmtpSection />
          )}
          {section === "drinks" && (
            <PlaceholderSection title="المشروبات" subtitle="إدارة قائمة مشروبات الاجتماعات والضيافة." />
          )}
        </main>
      </div>

      {addOpen && (
        <AddUserModal
          onClose={() => setAddOpen(false)}
          onCreate={async (emp) => {
            if (onCreateUser) {
              const roleMap: Record<string, "admin" | "employee" | "client"> = {
                Admin: "admin", admin: "admin",
                Employee: "employee", موظف: "employee",
                عميل: "client", client: "client",
              };
              await onCreateUser({
                email: emp.email,
                password: emp.password,
                display_name: emp.name,
                username: emp.username || undefined,
                role: roleMap[emp.role] ?? "employee",
                perms: emp.perms,
              });
            } else {
              setEmployees((arr: AdminEmployee[]) => [...arr, emp]);
            }
            setAddOpen(false);
          }}
          defaultPerms={defaultPerms}
        />
      )}
      {editEmp && (
        <EditUserModal
          emp={editEmp}
          onClose={() => setEditEmp(null)}
          onSave={(u) => {
            setEmployees((arr: AdminEmployee[]) => arr.map((x) => (x.id === u.id ? u : x)));
            setEditEmp(null);
          }}
          onDelete={(id) => {
            setEmployees((arr: AdminEmployee[]) => arr.filter((x) => x.id !== id));
            setEditEmp(null);
          }}
        />
      )}
      {permsEmp && (
        <PermsModal
          emp={permsEmp}
          perms={perms}
          onClose={() => setPermsEmp(null)}
          onSave={async (u) => {
            if (onUpdatePerms) {
              await onUpdatePerms(u.id, u.perms);
            } else {
              setEmployees((arr: AdminEmployee[]) => arr.map((x) => (x.id === u.id ? u : x)));
            }
            setPermsEmp(null);
          }}
        />
      )}
      {addRoleOpen && (
        <AddRoleModal
          perms={perms}
          onClose={() => setAddRoleOpen(false)}
          onCreate={(role) => {
            setRoles((rs) => [...rs, role]);
            setAddRoleOpen(false);
          }}
        />
      )}
      {editRolePerms && (
        <RolePermsModal
          role={editRolePerms}
          perms={perms}
          onClose={() => setEditRolePerms(null)}
          onSave={(r) => {
            setRoles((rs) => rs.map((x) => (x.id === r.id ? r : x)));
            setEditRolePerms(null);
          }}
        />
      )}
    </div>
  );
}

/* ============== Users Section ============== */
function UsersSection({
  employees, setEmployees, search, setSearch, userTab, setUserTab,
  onAdd, onEdit, onPerms, total, onToggleActive, loading,
}: any) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onAdd}
            className="h-10 px-4 rounded-lg bg-[color:var(--eyenak-teal)] text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> إضافة مستخدم
          </button>
          <button className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 text-sm flex items-center gap-2 hover:bg-slate-50">
            <Mail className="w-4 h-4" /> دعوة مستخدم
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-800">قائمة المستخدمين</h2>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-6 text-sm">
          {[
            { id: "users", label: "المستخدمين", count: total, icon: UsersIcon },
            { id: "invites", label: "الدعوات المعلقة", count: 0, icon: Mail },
            { id: "clients", label: "العملاء", count: 2, icon: UsersIcon },
          ].map((tab) => {
            const Icon = tab.icon as any;
            const active = userTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setUserTab(tab.id)}
                className={`flex items-center gap-2 py-2 border-b-2 transition ${
                  active ? "border-[color:var(--eyenak-teal)] text-[color:var(--eyenak-teal)] font-bold" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>{tab.label} / {tab.count}</span>
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث"
            className="w-full h-10 pr-9 pl-3 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right">الإسم</th>
              <th className="px-4 py-3 text-right">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right">الصلاحية</th>
              <th className="px-4 py-3 text-right">رقم الجوال</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-right">الصلاحيات</th>
              <th className="px-4 py-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp: AdminEmployee) => (
              <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold text-slate-800">{emp.name}</td>
                <td className="px-4 py-3 text-slate-600">{emp.email || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{emp.role}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{emp.phone || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      onToggleActive
                        ? onToggleActive(emp.id, !emp.active)
                        : setEmployees((arr: AdminEmployee[]) => arr.map((x) => x.id === emp.id ? { ...x, active: !x.active } : x))
                    }
                    className="flex items-center gap-1 text-xs"
                  >
                    {emp.active ? (
                      <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-700">نشط</span></>
                    ) : (
                      <><ToggleLeft className="w-5 h-5 text-slate-400" /><span className="text-slate-500">موقوف</span></>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <button onClick={() => onPerms(emp)} title="إدارة الصلاحيات" className="p-1 rounded hover:bg-emerald-50"><ShieldCheck className="w-4 h-4" /></button>
                    <button title="نسخ" className="p-1 rounded hover:bg-emerald-50"><ClipboardList className="w-4 h-4" /></button>
                    <button title="إعادة تعيين" className="p-1 rounded hover:bg-emerald-50"><KeyRound className="w-4 h-4" /></button>
                    <button title="نسخ بطاقة" className="p-1 rounded hover:bg-emerald-50"><CreditCard className="w-4 h-4" /></button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(emp)} title="تعديل" className="p-1.5 rounded hover:bg-slate-100"><Pencil className="w-4 h-4 text-slate-600" /></button>
                    <button title="المزيد" className="p-1.5 rounded hover:bg-slate-100"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">{loading ? "جارٍ التحميل…" : "لا توجد نتائج"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============== Roles Section ============== */
function RolesSection({ roles, setRoles, onAdd, onEditPerms }: {
  roles: RoleRow[];
  setRoles: React.Dispatch<React.SetStateAction<RoleRow[]>>;
  onAdd: () => void;
  onEditPerms: (r: RoleRow) => void;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onAdd}
            className="h-10 px-4 rounded-lg bg-[color:var(--eyenak-teal)] text-white text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> إضافة أدوار
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-800">الأدوار والصلاحيات</h2>
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right">الدور</th>
              <th className="px-4 py-3 text-right">افتراضي</th>
              <th className="px-4 py-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.isDefault ? "نعم" : "لا"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditPerms(r)}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {r.system ? "معاينة الصلاحيات" : "تحديث الصلاحيات"}
                    </button>
                    {!r.system && (
                      <>
                        <button className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5" /> تحديث اسم الدور
                        </button>
                        <button
                          onClick={() => setRoles((rs) => rs.filter((x) => x.id !== r.id))}
                          className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف الدور
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlaceholderSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-2 text-right">{title}</h2>
      <p className="text-sm text-slate-500 text-right mb-6">{subtitle}</p>
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
        قسم {title} — جاهز للتخصيص.
      </div>
    </div>
  );
}

function SmtpSection() {
  const [form, setForm] = useState({ host: "", port: "587", user: "", pass: "", from: "" });
  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4 text-right">إعدادات SMTP</h2>
      <div className="space-y-3">
        {[
          { k: "host", l: "خادم SMTP" },
          { k: "port", l: "المنفذ" },
          { k: "user", l: "اسم المستخدم" },
          { k: "pass", l: "كلمة المرور" },
          { k: "from", l: "بريد المرسل" },
        ].map((f) => (
          <div key={f.k}>
            <label className="text-xs text-slate-600 block mb-1 text-right">{f.l}</label>
            <input
              value={(form as any)[f.k]}
              onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
              type={f.k === "pass" ? "password" : "text"}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-right"
            />
          </div>
        ))}
        <button className="h-10 px-5 rounded-lg bg-[color:var(--eyenak-teal)] text-white text-sm font-semibold">
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

/* ============== Add User Modal ============== */
function AddUserModal({ onClose, onCreate, defaultPerms }: {
  onClose: () => void; onCreate: (e: AdminEmployee) => void; defaultPerms: () => Record<string, boolean>;
}) {
  const [f, setF] = useState({
    kind: "موظف", role: "Employee", name: "", jobTitle: "",
    email: "", phone: "", password: "", confirm: "",
  });
  const [err, setErr] = useState("");
  return (
    <div dir="rtl" className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">إضافة مستخدم جديد</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right">
          <Field label="الخاصية">
            <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className="ad-input">
              <option>موظف</option><option>عميل</option><option>مدير حساب العميل</option>
            </select>
          </Field>
          <Field label="الصلاحية">
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className="ad-input">
              <option>Admin</option><option>Employee</option><option>عميل</option>
              <option>مدير حساب العميل</option><option>مندوب مبيعات</option><option>محاسب</option>
            </select>
          </Field>
          <Field label="الإسم">
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="ad-input" />
          </Field>
          <Field label="المسمى الوظيفي">
            <input value={f.jobTitle} onChange={(e) => setF({ ...f, jobTitle: e.target.value })} className="ad-input" />
          </Field>
          <Field label="البريد الإلكتروني">
            <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="ad-input" />
          </Field>
          <Field label="رقم الجوال">
            <div className="flex gap-2">
              <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="ad-input flex-1" />
              <span className="h-10 px-3 inline-flex items-center border border-slate-300 rounded-lg text-sm text-slate-600">+966</span>
            </div>
          </Field>
          <Field label="كلمة المرور الجديدة">
            <input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="ad-input" />
          </Field>
          <Field label="تأكيد كلمة المرور">
            <input type="password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} className="ad-input" />
          </Field>
        </div>
        {err && <div className="mt-3 text-xs text-red-600 text-right">{err}</div>}
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={() => {
              if (!f.name.trim()) return setErr("الاسم مطلوب");
              if (!f.email.trim()) return setErr("البريد مطلوب");
              if (f.password !== f.confirm) return setErr("كلمتا المرور غير متطابقتين");
              onCreate({
                id: `u${Date.now()}`, name: f.name.trim(), email: f.email.trim(),
                username: f.email.split("@")[0] || `u${Date.now()}`,
                password: f.password || Math.random().toString(36).slice(2, 8),
                role: f.role, active: true, phone: f.phone, jobTitle: f.jobTitle,
                perms: defaultPerms(),
              });
            }}
            className="h-11 px-10 rounded-lg bg-[color:var(--eyenak-teal)] text-white font-semibold hover:opacity-90"
          >
            أضف الآن
          </button>
        </div>
      </div>
      <style>{`.ad-input{width:100%;height:40px;padding:0 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;text-align:right;background:#fff;}.ad-input:focus{outline:none;border-color:var(--eyenak-teal);}`}</style>
    </div>
  );
}

function EditUserModal({ emp, onClose, onSave, onDelete }: {
  emp: AdminEmployee; onClose: () => void; onSave: (e: AdminEmployee) => void; onDelete: (id: string) => void;
}) {
  const [u, setU] = useState(emp);
  return (
    <div dir="rtl" className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">تعديل بيانات المستخدم</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-right">
          <Field label="الاسم"><input className="ad-input" value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} /></Field>
          <Field label="الصلاحية"><input className="ad-input" value={u.role} onChange={(e) => setU({ ...u, role: e.target.value })} /></Field>
          <Field label="البريد"><input className="ad-input" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} /></Field>
          <Field label="الجوال"><input className="ad-input" value={u.phone || ""} onChange={(e) => setU({ ...u, phone: e.target.value })} /></Field>
          <Field label="المسمى الوظيفي"><input className="ad-input" value={u.jobTitle || ""} onChange={(e) => setU({ ...u, jobTitle: e.target.value })} /></Field>
          <Field label="كلمة المرور"><input className="ad-input" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => onDelete(u.id)} className="px-4 h-10 rounded-lg border border-red-200 text-red-600 text-sm flex items-center gap-1.5 hover:bg-red-50">
            <Trash2 className="w-4 h-4" /> حذف
          </button>
          <button onClick={() => onSave(u)} className="h-10 px-6 rounded-lg bg-[color:var(--eyenak-teal)] text-white text-sm font-semibold">حفظ التغييرات</button>
        </div>
        <style>{`.ad-input{width:100%;height:40px;padding:0 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;text-align:right;background:#fff;}`}</style>
      </div>
    </div>
  );
}

function PermsModal({ emp, perms, onClose, onSave }: {
  emp: AdminEmployee; perms: { key: string; label: string; group: string }[]; onClose: () => void; onSave: (e: AdminEmployee) => void;
}) {
  const [u, setU] = useState(emp);
  return (
    <div dir="rtl" className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">صلاحيات: {emp.name}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <PermsTabs
          perms={perms}
          value={u.perms}
          onChange={(next) => setU({ ...u, perms: next })}
        />
        <div className="mt-5 flex justify-end">
          <button onClick={() => onSave(u)} className="h-10 px-6 rounded-lg bg-[color:var(--eyenak-teal)] text-white text-sm font-semibold">حفظ</button>
        </div>
      </div>
    </div>
  );
}

/* ============== Tabbed Permissions UI (shared) ============== */
function PermsTabs({ perms, value, onChange }: {
  perms: { key: string; label: string; group: string; desc?: string }[];
  value: Record<string, boolean>;
  onChange: (v: Record<string, boolean>) => void;
}) {
  const groups = Array.from(new Set(perms.map((p) => p.group)));
  const [tab, setTab] = useState<string>(groups[0] ?? "");
  const list = perms.filter((p) => p.group === tab);
  const allChecked = list.length > 0 && list.every((p) => !!value[p.key]);
  const toggleAll = (on: boolean) => {
    const next = { ...value };
    for (const p of list) next[p.key] = on;
    onChange(next);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-4 overflow-x-auto">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setTab(g)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition ${
              tab === g
                ? "border-[color:var(--eyenak-teal)] text-[color:var(--eyenak-teal)] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <label className="flex items-center justify-end gap-2 text-xs mb-3 cursor-pointer">
        <span className="font-semibold">تحديد الكل</span>
        <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {list.map((p) => (
          <label key={p.key} className="border border-slate-200 rounded-lg p-3 text-right cursor-pointer hover:border-[color:var(--eyenak-teal)] transition">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-semibold text-sm text-slate-800">{p.label}</span>
              <input
                type="checkbox"
                checked={!!value[p.key]}
                onChange={(e) => onChange({ ...value, [p.key]: e.target.checked })}
                className="mt-1"
              />
            </div>
            {p.desc && <div className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</div>}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ============== Add Role Modal ============== */
function AddRoleModal({ perms, onClose, onCreate }: {
  perms: { key: string; label: string; group: string; desc?: string }[];
  onClose: () => void;
  onCreate: (r: RoleRow) => void;
}) {
  const [name, setName] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const empty = perms.reduce((a, p) => ({ ...a, [p.key]: false }), {} as Record<string, boolean>);
  const [rp, setRp] = useState<Record<string, boolean>>(empty);
  return (
    <div dir="rtl" className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">إضافة دور</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        {step === 1 ? (
          <>
            <label className="text-xs text-slate-600 block mb-1 text-right">الاسم</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-right mb-4"
            />
            <button
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-lg bg-[color:var(--eyenak-teal)] disabled:bg-slate-200 disabled:text-slate-500 text-white font-semibold"
            >
              التالي — تحديد الصلاحيات
            </button>
          </>
        ) : (
          <>
            <div className="text-sm text-slate-600 mb-3 text-right">الدور: <span className="font-bold text-slate-800">{name}</span></div>
            <PermsTabs perms={perms} value={rp} onChange={setRp} />
            <div className="mt-5 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="h-10 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm">رجوع</button>
              <button
                onClick={() => onCreate({ id: `r${Date.now()}`, name: name.trim(), isDefault: false, perms: rp })}
                className="h-10 px-6 rounded-lg bg-[color:var(--eyenak-teal)] text-white text-sm font-semibold"
              >
                إضافة
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============== Role Permissions Modal (edit/preview) ============== */
function RolePermsModal({ role, perms, onClose, onSave }: {
  role: RoleRow;
  perms: { key: string; label: string; group: string; desc?: string }[];
  onClose: () => void;
  onSave: (r: RoleRow) => void;
}) {
  const empty = perms.reduce((a, p) => ({ ...a, [p.key]: false }), {} as Record<string, boolean>);
  const [rp, setRp] = useState<Record<string, boolean>>({ ...empty, ...(role.perms || {}) });
  const readOnly = !!role.system;
  return (
    <div dir="rtl" className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {readOnly ? "معاينة صلاحيات: " : "صلاحيات الدور: "}{role.name}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <PermsTabs perms={perms} value={rp} onChange={(v) => !readOnly && setRp(v)} />
        {!readOnly && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => onSave({ ...role, perms: rp })}
              className="h-10 px-6 rounded-lg bg-[color:var(--eyenak-teal)] text-white text-sm font-semibold"
            >
              حفظ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-600 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
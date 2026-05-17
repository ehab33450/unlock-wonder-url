import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  FileText,
  Pin,
  MessageSquare,
  Video,
  User,
  HelpCircle,
  CheckSquare,
  MoreHorizontal,
  Search,
  RefreshCw,
  Bell,
  Globe,
  ChevronDown,
  Maximize2,
  Printer,
  Pencil,
  Home,
  Star,
  Users,
  MoreVertical,
  Plus,
  PieChart,
  ClipboardList,
  Clock,
  Activity,
  MapPin,
  FileCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const sidebarItems = [
  { icon: Calendar, label: "التقويم" },
  { icon: FileText, label: "الملفات" },
  { icon: Pin, label: "قائمة المذكرات" },
  { icon: MessageSquare, label: "المحادثة" },
  { icon: Video, label: "الاجتماعات" },
  { icon: User, label: "مستخدم" },
  { icon: HelpCircle, label: "الإرشادات" },
  { icon: CheckSquare, label: "الحجز" },
  { icon: MoreHorizontal, label: "المزيد" },
];

const topTabs = [
  { icon: Home, label: "لوحة التحكم", active: true },
  { icon: FileCheck, label: "جديد المهام", badge: 16 },
  { icon: FileText, label: "المقالات" },
  { icon: Star, label: "المفضلة" },
  { icon: ClipboardList, label: "المهام الجديدة" },
  { icon: ClipboardList, label: "المهام المعلقة" },
  { icon: ClipboardList, label: "المهام المنتهية" },
  { icon: Clock, label: "المؤقتات النشطة" },
  { icon: Activity, label: "النشاط" },
  { icon: MapPin, label: "تقرير التتبع" },
];

const projects = [
  "المدير التنفيذي",
  "عملاء أ.أروى الجعدي",
  "المبيعات",
  "ايهاب تطوير",
];

function Index() {
  const completed = 7266;
  const inProgress = 95;
  const pending = 82;
  const total = 11383;
  const completedPct = 63;

  // Donut math
  const r = 70;
  const c = 2 * Math.PI * r;
  const segGreen = (completed / total) * c;
  const segOrange = (inProgress / total) * c;
  const segPink = (pending / total) * c;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-[Cairo]">
      {/* Top header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        {/* Right: logo */}
        <div className="flex items-center gap-2" dir="ltr">
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold tracking-tight text-[color:var(--eyenak-dark)]">
              EYE
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-[color:var(--eyenak-teal)]">
              NAK
            </span>
          </div>
        </div>

        {/* Left: user controls */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded hover:bg-slate-100 text-slate-600">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-slate-100 text-slate-600">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-slate-100 text-slate-600">
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 text-sm">
            <Globe className="w-4 h-4" />
            <span>AR</span>
          </button>
          <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-slate-800">ايهاب فاتح</div>
              <div className="text-xs text-slate-500">مطور</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[color:var(--eyenak-teal)] text-white flex items-center justify-center font-bold ring-2 ring-white shadow">
              EA
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left icon rail */}
        <aside className="w-20 bg-white border-l border-slate-200 min-h-[calc(100vh-3.5rem)] flex flex-col items-center py-4 gap-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-16 py-3 flex flex-col items-center gap-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div />
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <Pencil className="w-4 h-4" />
                <span>تخصيص لوحة التحكم</span>
              </button>
              <h1 className="text-xl font-bold text-slate-800">لوحة التحكم</h1>
            </div>
          </div>

          {/* Tabs row */}
          <div className="flex items-center justify-end gap-2 flex-wrap mb-4">
            {topTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.label}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition ${
                    t.active
                      ? "bg-[color:var(--eyenak-dark)] text-white border-transparent"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>{t.label}</span>
                  <Icon className="w-4 h-4" />
                  {t.badge !== undefined && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Card */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50">
                <span>جميع المشاريع</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-700">حالة المهام</h2>
                <PieChart className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-6">
              <button className="p-2 rounded border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Printer className="w-4 h-4" />
              </button>
            </div>

            {/* Donut chart */}
            <div className="flex justify-center mb-6">
              <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                <circle cx="100" cy="100" r={r} fill="none" stroke="#e5e7eb" strokeWidth="28" />
                {/* green completed */}
                <circle
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="var(--eyenak-green)"
                  strokeWidth="28"
                  strokeDasharray={`${segGreen} ${c - segGreen}`}
                  strokeDashoffset="0"
                />
                {/* orange in-progress */}
                <circle
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="var(--eyenak-orange)"
                  strokeWidth="28"
                  strokeDasharray={`${segOrange} ${c - segOrange}`}
                  strokeDashoffset={`${-segGreen}`}
                />
                {/* pink pending */}
                <circle
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="var(--eyenak-pink)"
                  strokeWidth="28"
                  strokeDasharray={`${segPink} ${c - segPink}`}
                  strokeDashoffset={`${-(segGreen + segOrange)}`}
                />
              </svg>
            </div>

            {/* Total row */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-right">
                <div className="text-sm text-slate-500">إجمالي المهام</div>
                <div className="text-3xl font-bold text-slate-800">
                  {total.toLocaleString("ar-EG")}
                </div>
              </div>
              <div className="flex-1 mx-6">
                <div className="text-xs text-[color:var(--eyenak-green)] mb-1 text-center font-semibold">
                  {completedPct}% مكتملة
                </div>
                <div className="h-2 rounded-full bg-[color:var(--eyenak-green-light)] overflow-hidden">
                  <div
                    className="h-full bg-[color:var(--eyenak-green)] rounded-full"
                    style={{ width: `${completedPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
              <Stat color="var(--eyenak-green)" value={completed} label="مكتملة" />
              <Stat color="var(--eyenak-orange)" value={inProgress} label="جارية" />
              <Stat color="var(--eyenak-pink)" value={pending} label="معلقة" />
            </div>
          </section>
        </main>

        {/* Right projects panel */}
        <aside className="w-72 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] flex flex-col">
          {/* Top toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
            <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                <Users className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                <Star className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                <CheckSquare className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Create button */}
          <button className="m-3 flex items-center justify-between px-3 py-2.5 border border-dashed border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50">
            <Plus className="w-4 h-4" />
            <span>إنشاء مشروع / مهمة</span>
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-4 px-4 text-sm border-b border-slate-200">
            <button className="py-2 text-slate-500">أنا فقط</button>
            <button className="py-2 text-slate-500">المشترك بها</button>
            <button className="py-2 text-[color:var(--eyenak-dark)] font-semibold border-b-2 border-[color:var(--eyenak-teal)]">
              الجميع
            </button>
          </div>

          {/* Projects list */}
          <div className="flex-1 overflow-auto">
            {projects.map((p) => (
              <button
                key={p}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b border-slate-100 text-sm text-slate-700"
              >
                <ChevronDown className="w-4 h-4 text-slate-400" />
                <span>{p}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400 py-3 border-t border-slate-100">
            © 2026 EYENAK
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="h-1 rounded-full mb-2" style={{ backgroundColor: color }} />
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

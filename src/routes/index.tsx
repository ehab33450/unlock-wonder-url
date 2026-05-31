import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
  Folder,
  FileText as FileIcon,
  ChevronLeft,
  List,
  FolderPlus,
  FilePlus2,
  LayoutTemplate,
  X,
  CalendarDays,
  AlignRight,
  ChevronRight,
  Upload,
  Megaphone,
  Trash2,
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

type Project = { name: string; children: string[] };
const projects: Project[] = [
  { name: "المدير التنفيذي", children: ["أ. أروى الجعدي - المدير المسؤول"] },
  {
    name: "عملاء أ.أروى الجعدي",
    children: ["ايهاب فاتح", "محمد علي", "سارة أحمد"],
  },
  {
    name: "المبيعات",
    children: ["صفقات جديدة", "صفقات قيد التفاوض", "صفقات مغلقة"],
  },
  { name: "ايهاب تطوير", children: ["شركة hc", "مشروع عنان الفضاء"] },
];

const employeeTasks: Record<string, string[]> = {
  "ايهاب فاتح": ["تطوير الواجهة", "مراجعة الكود", "اجتماع العميل"],
  "محمد علي": ["تصميم الشعار", "تجهيز العرض"],
  "سارة أحمد": ["كتابة المحتوى", "تحليل البيانات"],
};

function Index() {
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({
    "المدير التنفيذي": true,
    "عملاء أ.أروى الجعدي": true,
    "المبيعات": true,
    "ايهاب تطوير": true,
  });
  const [openEmployees, setOpenEmployees] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [npFolder, setNpFolder] = useState("");
  const [npName, setNpName] = useState("");
  const [npStep, setNpStep] = useState<1 | 2>(1);
  const [npDesc, setNpDesc] = useState("");
  const [npStart, setNpStart] = useState("");
  const [npEnd, setNpEnd] = useState("");
  const [npMembers, setNpMembers] = useState<string[]>([]);
  const [npMemberInput, setNpMemberInput] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersTab, setMembersTab] = useState<"all" | "teams" | "clients">("all");
  const [memberSearch, setMemberSearch] = useState("");

  // Project folders/files store
  type SubFolder = { name: string; createdAt: string; files: string[] };
  type ProjectData = { folders: SubFolder[]; files: string[] };
  const [projectData, setProjectData] = useState<Record<string, ProjectData>>({});
  const [folderViewProject, setFolderViewProject] = useState<string | null>(null);
  const [currentSubfolder, setCurrentSubfolder] = useState<string | null>(null);
  const [newSubfolderOpen, setNewSubfolderOpen] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCreateProject = () => {
    const name = npName.trim();
    if (!name) return;
    setProjectData((d) => ({
      ...d,
      [name]: d[name] ?? { folders: [], files: [] },
    }));
    closeNewProject();
    setFolderViewProject(name);
    setCurrentSubfolder(null);
  };

  const addSubfolder = () => {
    const name = newSubfolderName.trim();
    if (!name || !folderViewProject) return;
    setProjectData((d) => {
      const cur = d[folderViewProject] ?? { folders: [], files: [] };
      if (cur.folders.some((f) => f.name === name)) return d;
      return {
        ...d,
        [folderViewProject]: {
          ...cur,
          folders: [...cur.folders, { name, createdAt: todayLabel, files: [] }],
        },
      };
    });
    setNewSubfolderName("");
    setNewSubfolderOpen(false);
  };

  const handleUploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).map((f) => f.name);
    if (!folderViewProject || files.length === 0) return;
    setProjectData((d) => {
      const cur = d[folderViewProject] ?? { folders: [], files: [] };
      if (currentSubfolder) {
        return {
          ...d,
          [folderViewProject]: {
            ...cur,
            folders: cur.folders.map((f) =>
              f.name === currentSubfolder
                ? { ...f, files: [...f.files, ...files] }
                : f,
            ),
          },
        };
      }
      return {
        ...d,
        [folderViewProject]: { ...cur, files: [...cur.files, ...files] },
      };
    });
    e.target.value = "";
  };

  const removeSubfolder = (name: string) => {
    if (!folderViewProject) return;
    setProjectData((d) => ({
      ...d,
      [folderViewProject]: {
        ...d[folderViewProject],
        folders: d[folderViewProject].folders.filter((f) => f.name !== name),
      },
    }));
  };

  const currentProject = folderViewProject ? projectData[folderViewProject] : null;
  const currentFiles = currentProject
    ? currentSubfolder
      ? currentProject.folders.find((f) => f.name === currentSubfolder)?.files ?? []
      : currentProject.files
    : [];

  const closeNewProject = () => {
    setNewProjectOpen(false);
    setNpStep(1);
    setNpFolder("");
    setNpName("");
    setNpDesc("");
    setNpStart("");
    setNpEnd("");
    setNpMembers([]);
    setNpMemberInput("");
  };
  const toggle = (name: string) =>
    setOpenProjects((s) => ({ ...s, [name]: !s[name] }));
  const toggleEmp = (name: string) =>
    setOpenEmployees((s) => ({ ...s, [name]: !s[name] }));

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
              <button
                onClick={() => setMembersOpen(true)}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
              >
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
          <div className="relative m-3">
            <button
              onClick={() => setCreateOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-dashed border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء مشروع / مهمة</span>
            </button>
            {createOpen && (
              <div className="absolute z-20 mt-1 right-0 left-0 bg-[color:var(--eyenak-dark)] text-white rounded-md shadow-lg overflow-hidden border border-white/10">
                {[
                  { icon: List, label: "مشروع جديد" },
                  { icon: Folder, label: "مجلد جديد" },
                  { icon: FilePlus2, label: "إنشاء مهمة" },
                  { icon: LayoutTemplate, label: "اختيار قالب" },
                ].map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.label}
                      onClick={() => {
                        setCreateOpen(false);
                        if (o.label === "مشروع جديد") setNewProjectOpen(true);
                      }}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-white/10"
                    >
                      <Icon className="w-4 h-4 text-white/80" />
                      <span>{o.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 px-4 text-sm border-b border-slate-200">
            <button className="py-2 text-slate-500">أنا فقط</button>
            <button className="py-2 text-slate-500">المشترك بها</button>
            <button className="py-2 text-[color:var(--eyenak-dark)] font-semibold border-b-2 border-[color:var(--eyenak-teal)]">
              الجميع
            </button>
          </div>

          {/* Projects list */}
          <div className="flex-1 overflow-auto bg-[color:var(--eyenak-dark)] text-white">
            {projects.map((p) => {
              const open = openProjects[p.name];
              return (
                <div key={p.name} className="border-b border-white/5">
                  <button
                    onClick={() => toggle(p.name)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-sm"
                  >
                    {open ? (
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-white/60" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.name}</span>
                      <Folder className="w-4 h-4 text-white/70" />
                    </div>
                  </button>
                  {open &&
                    p.children.map((c) => (
                      <div key={c}>
                        <button
                          onClick={() => employeeTasks[c] && toggleEmp(c)}
                          className="w-full flex items-center justify-between pr-8 pl-4 py-2.5 hover:bg-white/5 text-sm text-white/85"
                        >
                          {employeeTasks[c] ? (
                            openEmployees[c] ? (
                              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                            ) : (
                              <ChevronLeft className="w-3.5 h-3.5 text-white/40" />
                            )
                          ) : (
                            <span className="w-3.5" />
                          )}
                          <div className="flex items-center gap-2">
                            <span>{c}</span>
                            <FileIcon className="w-4 h-4 text-white/60" />
                          </div>
                        </button>
                        {openEmployees[c] &&
                          employeeTasks[c]?.map((t) => (
                            <div
                              key={t}
                              className="flex items-center justify-end gap-2 pr-12 pl-4 py-2 text-xs text-white/70 hover:bg-white/5"
                            >
                              <span>{t}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--eyenak-teal)]" />
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400 py-3 border-t border-slate-100">
            © 2026 EYENAK
          </div>
        </aside>
      </div>

      {newProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24 px-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={closeNewProject}
                className="text-slate-500 hover:text-slate-700"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-800">
                إنشاء مشروع {npStep === 2 && <span className="text-slate-400 font-normal">- التفاصيل</span>}
              </h3>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`h-1.5 w-16 rounded-full ${npStep >= 1 ? "bg-[color:var(--eyenak-teal)]" : "bg-slate-200"}`} />
              <div className={`h-1.5 w-16 rounded-full ${npStep >= 2 ? "bg-[color:var(--eyenak-teal)]" : "bg-slate-200"}`} />
            </div>

            {npStep === 1 && (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-2 text-right">حدد المجلد</label>
                  <div className="relative">
                    <input
                      value={npFolder}
                      onChange={(e) => setNpFolder(e.target.value)}
                      className="w-full h-11 border border-slate-300 rounded px-3 pl-10 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                    <Folder className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-slate-600 mb-2 text-right">الإسم</label>
                  <input
                    value={npName}
                    onChange={(e) => setNpName(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                  />
                </div>

                <button
                  disabled={!npName.trim()}
                  onClick={() => setNpStep(2)}
                  className="w-full h-11 bg-[color:var(--eyenak-teal)] disabled:bg-slate-200 disabled:text-slate-500 hover:opacity-90 text-white rounded text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            )}

            {npStep === 2 && (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-slate-600 mb-2 text-right">الوصف</label>
                  <div className="relative">
                    <textarea
                      value={npDesc}
                      onChange={(e) => setNpDesc(e.target.value)}
                      rows={3}
                      className="w-full border border-slate-300 rounded px-3 py-2 pl-10 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] resize-none"
                    />
                    <AlignRight className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2 text-right">تاريخ النهاية</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={npEnd}
                        onChange={(e) => setNpEnd(e.target.value)}
                        className="w-full h-11 border border-slate-300 rounded px-3 pl-10 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                      />
                      <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2 text-right">تاريخ البداية</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={npStart}
                        onChange={(e) => setNpStart(e.target.value)}
                        className="w-full h-11 border border-slate-300 rounded px-3 pl-10 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                      />
                      <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-slate-600 mb-2 text-right">الأعضاء</label>
                  <div className="relative mb-2">
                    <input
                      value={npMemberInput}
                      onChange={(e) => setNpMemberInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && npMemberInput.trim()) {
                          e.preventDefault();
                          setNpMembers((m) => [...m, npMemberInput.trim()]);
                          setNpMemberInput("");
                        }
                      }}
                      placeholder="اكتب اسم العضو واضغط Enter"
                      className="w-full h-11 border border-slate-300 rounded px-3 pl-10 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {npMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {npMembers.map((m, i) => (
                        <span
                          key={`${m}-${i}`}
                          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs rounded-full px-3 py-1"
                        >
                          <button
                            onClick={() => setNpMembers((arr) => arr.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-slate-700"
                            aria-label="حذف"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span>{m}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNpStep(1)}
                    className="flex-1 h-11 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>رجوع</span>
                  </button>
                  <button
                    onClick={closeNewProject}
                    className="flex-1 h-11 bg-[color:var(--eyenak-teal)] hover:opacity-90 text-white rounded text-sm font-semibold"
                  >
                    إنشاء المشروع
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {membersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-6 overflow-y-auto"
          onClick={() => setMembersOpen(false)}
        >
          <div
            className="bg-white rounded-md shadow-xl w-full max-w-5xl mt-10"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <button
                onClick={() => setMembersOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">أعضاء</h2>
                <User className="w-5 h-5 text-slate-600" />
              </div>
            </div>

            {/* Search */}
            <div className="px-6 py-3 flex justify-start">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="البحث بالإسم"
                  className="w-full h-10 pr-9 pl-3 border border-slate-200 rounded text-sm focus:outline-none focus:border-[color:var(--eyenak-teal)] text-right"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-end gap-8 px-6 border-b border-slate-200">
              {[
                { id: "all" as const, label: "الجميع يسير التميز للخدمات التجارية", count: 10, icon: User },
                { id: "teams" as const, label: "الفرق", count: 1, icon: Users },
                { id: "clients" as const, label: "العملاء", count: 2, icon: User },
              ].map((t) => {
                const Icon = t.icon;
                const active = membersTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setMembersTab(t.id)}
                    className={`flex items-center gap-2 py-3 -mb-px border-b-2 text-sm transition ${
                      active
                        ? "border-[color:var(--eyenak-teal)] text-[color:var(--eyenak-teal)]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="text-xs">/ {t.count}</span>
                    <span>{t.label}</span>
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6 min-h-[300px]">
              {membersTab === "all" && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "أحمد الأحمدي", role: "مدير تنفيذي", email: "aahmadi@yaseersa.com", phone: "+966-557723348", last: "24 May, 2026  7:49 pm" },
                    { name: "أروى أحمد", role: "مديرة حساب العملاء", email: "arwa48545@gmail.com", phone: "+966-533999707", last: "25 May, 2026  8:59 pm" },
                    { name: "بدر عبدالله العامري", role: "مدير حساب عمي", email: "badr@yaseersa.com", phone: "+966-500000001", last: "25 May, 2026  8:24 pm" },
                    { name: "ايهاب فاتح", role: "مطور", email: "ehab@yaseersa.com", phone: "+966-500000002", last: "31 May, 2026  11:10 am" },
                    { name: "أروى الجعدي", role: "مديرة حسابات العملاء", email: "arwa.j@yaseersa.com", phone: "+966-500000003", last: "25 May, 2026  9:54 pm" },
                  ]
                    .filter((m) => m.name.includes(memberSearch.trim()) || memberSearch.trim() === "")
                    .map((m) => (
                      <div key={m.name} className="border border-slate-200 rounded-lg p-4 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 ring-2 ring-[color:var(--eyenak-green)] flex items-center justify-center text-slate-500 mb-2">
                          <User className="w-10 h-10" />
                        </div>
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <div className="text-xs text-[color:var(--eyenak-dark)] mb-3">{m.role}</div>
                        <div className="text-xs space-y-2 text-right">
                          <div className="flex justify-between"><span className="text-slate-500">{m.last}</span><span className="text-slate-600">آخر تسجيل دخول</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">{m.email}</span><span className="text-slate-600">البريد الإلكتروني</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">{m.phone}</span><span className="text-slate-600">رقم الجوال</span></div>
                        </div>
                        <button className="mt-3 w-full border border-slate-200 rounded py-1.5 text-xs text-slate-400">Teams</button>
                      </div>
                    ))}
                  <button className="border border-slate-200 rounded-lg p-4 bg-slate-100 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200">
                    <div className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm">إضافة مستخدم جديد</span>
                  </button>
                </div>
              )}

              {membersTab === "teams" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 ring-2 ring-[color:var(--eyenak-green)] flex items-center justify-center text-[color:var(--eyenak-dark)] mb-2">
                      <Users className="w-10 h-10" />
                    </div>
                    <div className="font-bold text-slate-800">العمليات التشغيلية</div>
                    <div className="text-xs text-[color:var(--eyenak-dark)]">المالك: أحمد الأحمدي</div>
                    <div className="text-xs text-slate-500 mt-1">2 أعضاء</div>
                    <button className="mt-3 w-full border border-slate-300 rounded py-1.5 text-xs text-slate-500">اضافة المزيد</button>
                  </div>
                  <button className="border border-slate-200 rounded-lg p-4 bg-slate-100 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200">
                    <div className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm">إنشاء مجموعة جديدة</span>
                  </button>
                </div>
              )}

              {membersTab === "clients" && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "شيخه", by: "شيخه محسن", email: "shiakha24@gmail.com" },
                    { name: "أحمد A", by: "أحمد الأحمدي", email: "a.s.l_7@hotmail.com" },
                  ].map((c) => (
                    <div key={c.name} className="border border-slate-200 rounded-lg p-4 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 ring-2 ring-[color:var(--eyenak-green)] flex items-center justify-center text-slate-500 mb-2">
                        <User className="w-10 h-10" />
                      </div>
                      <div className="font-bold text-slate-800 mb-3">{c.name}</div>
                      <div className="text-xs space-y-2 text-right border-t border-slate-100 pt-2">
                        <div className="flex justify-between"><span className="text-slate-500">نشط</span><span className="text-slate-600">الحالة</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">{c.by}</span><span className="text-slate-600">الإضافة بواسطة</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">{c.email}</span><span className="text-slate-600">البريد الإلكتروني</span></div>
                      </div>
                    </div>
                  ))}
                  <button className="border border-slate-200 rounded-lg p-4 bg-slate-100 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200">
                    <div className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm">إضافة عميل جديد</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

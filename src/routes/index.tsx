import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  type FileItem = { id: string; name: string; content: string; kind: "text" | "word" | "excel" };
  type SubFolder = { name: string; createdAt: string; files: FileItem[]; locked?: boolean };
  type ProjectData = { folders: SubFolder[]; files: FileItem[] };
  const [projectData, setProjectData] = useState<Record<string, ProjectData>>({});
  const [folderViewProject, setFolderViewProject] = useState<string | null>(null);
  const [currentSubfolder, setCurrentSubfolder] = useState<string | null>(null);
  const [newSubfolderOpen, setNewSubfolderOpen] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [editingFile, setEditingFile] = useState<{ id: string; name: string; content: string; kind: FileItem["kind"] } | null>(null);
  const [newFileMenuOpen, setNewFileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filesViewOpen, setFilesViewOpen] = useState(false);

  // Roles & permissions
  const DEFAULT_FOLDERS = [
    "اليوزرات",
    "التقارير",
    "المستندات",
    "الخطابات والوثائق المصدقة",
    "عقود وبيانات الموظفين",
  ];
  const [isAdmin, setIsAdmin] = useState(true);
  const [employeePerms, setEmployeePerms] = useState({ add: true, delete: false });
  const [permsOpen, setPermsOpen] = useState(false);
  const canAdd = isAdmin || employeePerms.add;
  const canDelete = isAdmin || employeePerms.delete;

  // Current logged-in user (for non-admin filtering)
  const currentUser = "ايهاب فاتح";

  // Contract info + Tasks per project
  type Payment = { id: string; amount: string; date: string; paid: boolean };
  type ContractInfo = {
    startDate: string;
    endDate: string;
    value: string;
    payments: Payment[];
    responsibleName: string;
    responsiblePhone: string;
    assignee: string;
  };
  type TaskStatus = "جديد" | "جاري العمل" | "تم" | "معلق";
  type Priority = "لاشيء" | "منخفض" | "متوسط" | "عالي";
  type TaskRow = {
    id: string;
    name: string;
    platform: string;
    beneficiary: string;
    documentNo: string;
    startDate: string;
    endDate: string;
    doneDate: string;
    status: TaskStatus;
    priority: Priority;
    attachmentName?: string;
    attachmentData?: string;
  };
  type ProjectMeta = { contract: ContractInfo; tasks: TaskRow[] };
  const [projectMeta, setProjectMeta] = useState<Record<string, ProjectMeta>>({});

  // New-project contract form fields
  const [npValue, setNpValue] = useState("");
  const [npRespName, setNpRespName] = useState("");
  const [npRespPhone, setNpRespPhone] = useState("");
  const [npAssignee, setNpAssignee] = useState("");
  const [npPayments, setNpPayments] = useState<Payment[]>([]);

  // Project detail overlay
  const [detailProject, setDetailProject] = useState<string | null>(null);
  const taskFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Calendar
  type CalEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    color: string;
    location?: string;
    members?: string;
    clients?: string;
    description?: string;
    allowInvite?: boolean;
  };
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState<"services" | "all" | "today" | "pending" | "book">("all");
  const [calView, setCalView] = useState<"month" | "week" | "day" | "list">("month");
  const [calCursor, setCalCursor] = useState(() => new Date());
  const [calSelected, setCalSelected] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<Record<string, CalEvent[]>>({});
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const toIsoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const [evTitle, setEvTitle] = useState("");
  const [evStart, setEvStart] = useState("");
  const [evEnd, setEvEnd] = useState("");
  const [evAllDay, setEvAllDay] = useState(true);
  const [evLocation, setEvLocation] = useState("");
  const [evMembers, setEvMembers] = useState("");
  const [evClients, setEvClients] = useState("");
  const [evColor, setEvColor] = useState("#0ea5e9");
  const [evDesc, setEvDesc] = useState("");
  const [evAllowInvite, setEvAllowInvite] = useState(false);
  const eventColors = [
    "#a855f7", "#818cf8", "#3b82f6", "#16a34a", "#22c55e",
    "#eab308", "#f97316", "#f472b6", "#dc2626", "#0ea5e9",
  ];
  const openEventForm = (d: Date) => {
    const iso = toIsoDate(d);
    setCalSelected(d);
    setEvTitle("");
    setEvStart(iso);
    setEvEnd(iso);
    setEvAllDay(true);
    setEvLocation("");
    setEvMembers("");
    setEvClients("");
    setEvColor("#0ea5e9");
    setEvDesc("");
    setEvAllowInvite(false);
    setEventFormOpen(true);
  };
  const saveEvent = () => {
    if (!evTitle.trim()) return;
    const ev: CalEvent = {
      id: String(Date.now()),
      title: evTitle.trim(),
      start: evStart,
      end: evEnd,
      allDay: evAllDay,
      color: evColor,
      location: evLocation,
      members: evMembers,
      clients: evClients,
      description: evDesc,
      allowInvite: evAllowInvite,
    };
    setEvents((e) => ({ ...e, [evStart]: [...(e[evStart] ?? []), ev] }));
    setEventFormOpen(false);
  };
  const monthLabel = calCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dayLabel = calSelected.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const buildMonthGrid = (cursor: Date) => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDay = first.getDay(); // 0 Sun
    const start = new Date(first);
    start.setDate(1 - startDay);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  const monthGrid = buildMonthGrid(calCursor);
  const miniGrid = buildMonthGrid(calCursor);
  const shiftMonth = (delta: number) =>
    setCalCursor(new Date(calCursor.getFullYear(), calCursor.getMonth() + delta, 1));
  const shiftDay = (delta: number) => {
    const d = new Date(calSelected);
    d.setDate(d.getDate() + delta);
    setCalSelected(d);
    setCalCursor(d);
  };

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCreateProject = () => {
    const name = npName.trim();
    if (!name) return;
    setProjectData((d) => {
      if (d[name]) return d;
      const emptyFile: FileItem = {
        id: `${Date.now()}`,
        name: "ملف جديد.txt",
        content: "",
        kind: "text",
      };
      const defaultFolders: SubFolder[] = DEFAULT_FOLDERS.map((fn) => ({
        name: fn,
        createdAt: todayLabel,
        files: [],
        locked: true,
      }));
      return { ...d, [name]: { folders: defaultFolders, files: [emptyFile] } };
    });
    setProjectMeta((m) => {
      if (m[name]) return m;
      return {
        ...m,
        [name]: {
          contract: {
            startDate: npStart,
            endDate: npEnd,
            value: npValue,
            payments: npPayments,
            responsibleName: npRespName,
            responsiblePhone: npRespPhone,
            assignee: npAssignee || (npMembers[0] ?? ""),
          },
          tasks: [],
        },
      };
    });
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
    const fileList = Array.from(e.target.files ?? []);
    if (!folderViewProject || fileList.length === 0) return;
    Promise.all(
      fileList.map(
        (f) =>
          new Promise<FileItem>((resolve) => {
            const reader = new FileReader();
            const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
            const kind: FileItem["kind"] =
              ext === "doc" || ext === "docx" ? "word" :
              ext === "xls" || ext === "xlsx" || ext === "csv" ? "excel" : "text";
            reader.onload = () =>
              resolve({
                id: `${Date.now()}-${Math.random()}`,
                name: f.name,
                content: typeof reader.result === "string" ? reader.result : "",
                kind,
              });
            reader.onerror = () =>
              resolve({ id: `${Date.now()}-${Math.random()}`, name: f.name, content: "", kind });
            reader.readAsText(f);
          }),
      ),
    ).then((items) => {
      setProjectData((d) => {
        const cur = d[folderViewProject] ?? { folders: [], files: [] };
        if (currentSubfolder) {
          return {
            ...d,
            [folderViewProject]: {
              ...cur,
              folders: cur.folders.map((f) =>
                f.name === currentSubfolder ? { ...f, files: [...f.files, ...items] } : f,
              ),
            },
          };
        }
        return {
          ...d,
          [folderViewProject]: { ...cur, files: [...cur.files, ...items] },
        };
      });
    });
    e.target.value = "";
  };

  const addBlankFile = (kind: FileItem["kind"]) => {
    if (!folderViewProject) return;
    const ext = kind === "word" ? "docx" : kind === "excel" ? "xlsx" : "txt";
    const label = kind === "word" ? "مستند Word" : kind === "excel" ? "جدول Excel" : "ملف نصي";
    const item: FileItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: `${label}.${ext}`,
      content: "",
      kind,
    };
    setProjectData((d) => {
      const cur = d[folderViewProject] ?? { folders: [], files: [] };
      if (currentSubfolder) {
        return {
          ...d,
          [folderViewProject]: {
            ...cur,
            folders: cur.folders.map((f) =>
              f.name === currentSubfolder ? { ...f, files: [...f.files, item] } : f,
            ),
          },
        };
      }
      return {
        ...d,
        [folderViewProject]: { ...cur, files: [...cur.files, item] },
      };
    });
    setNewFileMenuOpen(false);
    setEditingFile(item);
  };

  const saveEditingFile = () => {
    if (!editingFile || !folderViewProject) return;
    setProjectData((d) => {
      const cur = d[folderViewProject];
      if (!cur) return d;
      const mapFiles = (arr: FileItem[]) =>
        arr.map((f) =>
          f.id === editingFile.id
            ? { ...f, name: editingFile.name, content: editingFile.content }
            : f,
        );
      if (currentSubfolder) {
        return {
          ...d,
          [folderViewProject]: {
            ...cur,
            folders: cur.folders.map((f) =>
              f.name === currentSubfolder ? { ...f, files: mapFiles(f.files) } : f,
            ),
          },
        };
      }
      return { ...d, [folderViewProject]: { ...cur, files: mapFiles(cur.files) } };
    });
    setEditingFile(null);
  };

  const removeFile = (id: string) => {
    if (!folderViewProject) return;
    setProjectData((d) => {
      const cur = d[folderViewProject];
      if (!cur) return d;
      const filterFiles = (arr: FileItem[]) => arr.filter((f) => f.id !== id);
      if (currentSubfolder) {
        return {
          ...d,
          [folderViewProject]: {
            ...cur,
            folders: cur.folders.map((f) =>
              f.name === currentSubfolder ? { ...f, files: filterFiles(f.files) } : f,
            ),
          },
        };
      }
      return { ...d, [folderViewProject]: { ...cur, files: filterFiles(cur.files) } };
    });
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
    setNpValue("");
    setNpRespName("");
    setNpRespPhone("");
    setNpAssignee("");
    setNpPayments([]);
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
                onClick={() => {
                  if (item.label === "التقويم") setCalendarOpen(true);
                  if (item.label === "الحجز") setBookingOpen(true);
                  if (item.label === "الملفات") setFilesViewOpen(true);
                }}
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
                          onClick={() => {
                            if (employeeTasks[c]) {
                              toggleEmp(c);
                            } else {
                              setDetailProject(c);
                            }
                          }}
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

                {/* Contract info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2 text-right">قيمة العقد (ر.س)</label>
                    <input
                      type="number"
                      value={npValue}
                      onChange={(e) => setNpValue(e.target.value)}
                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2 text-right">الموظف المُكلَّف</label>
                    <input
                      list="np-assignees"
                      value={npAssignee}
                      onChange={(e) => setNpAssignee(e.target.value)}
                      placeholder="اسم الموظف"
                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                    <datalist id="np-assignees">
                      {Object.keys(employeeTasks).map((n) => (
                        <option key={n} value={n} />
                      ))}
                      <option value="ايهاب فاتح" />
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2 text-right">المسؤول من الشركة</label>
                    <input
                      value={npRespName}
                      onChange={(e) => setNpRespName(e.target.value)}
                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2 text-right">رقم جوال المسؤول</label>
                    <input
                      type="tel"
                      value={npRespPhone}
                      onChange={(e) => setNpRespPhone(e.target.value)}
                      placeholder="+9665..."
                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                  </div>
                </div>

                {/* Payments */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNpPayments((p) => [
                          ...p,
                          { id: `${Date.now()}-${p.length}`, amount: "", date: "", paid: false },
                        ])
                      }
                      className="text-xs text-[color:var(--eyenak-teal)] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة دفعة</span>
                    </button>
                    <label className="block text-sm text-slate-600 text-right">الدفعات</label>
                  </div>
                  {npPayments.length === 0 ? (
                    <div className="text-xs text-slate-400 text-right">لا توجد دفعات</div>
                  ) : (
                    <div className="space-y-2">
                      {npPayments.map((p, i) => (
                        <div key={p.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
                          <button
                            type="button"
                            onClick={() =>
                              setNpPayments((arr) => arr.filter((_, idx) => idx !== i))
                            }
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <label className="inline-flex items-center gap-1 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={p.paid}
                              onChange={(e) =>
                                setNpPayments((arr) =>
                                  arr.map((x, idx) =>
                                    idx === i ? { ...x, paid: e.target.checked } : x,
                                  ),
                                )
                              }
                            />
                            <span>مدفوعة</span>
                          </label>
                          <input
                            type="date"
                            value={p.date}
                            onChange={(e) =>
                              setNpPayments((arr) =>
                                arr.map((x, idx) =>
                                  idx === i ? { ...x, date: e.target.value } : x,
                                ),
                              )
                            }
                            className="h-9 border border-slate-300 rounded px-2 text-xs text-right"
                          />
                          <input
                            type="number"
                            value={p.amount}
                            placeholder="المبلغ"
                            onChange={(e) =>
                              setNpPayments((arr) =>
                                arr.map((x, idx) =>
                                  idx === i ? { ...x, amount: e.target.value } : x,
                                ),
                              )
                            }
                            className="h-9 border border-slate-300 rounded px-2 text-xs text-right"
                          />
                        </div>
                      ))}
                    </div>
                  )}
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
                    onClick={handleCreateProject}
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

      {folderViewProject && currentProject && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => {
            setFolderViewProject(null);
            setCurrentSubfolder(null);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUploadFiles}
          />
          <div
            className="bg-slate-50 rounded-md shadow-xl w-full max-w-6xl mt-6 min-h-[600px]"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 rounded-t-md">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setFolderViewProject(null);
                    setCurrentSubfolder(null);
                  }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
                {currentSubfolder && (
                  <button
                    onClick={() => setCurrentSubfolder(null)}
                    className="text-[color:var(--eyenak-teal)] hover:underline text-xs"
                  >
                    رجوع للمجلد
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">المشروع:</span>
                <span className="font-bold text-slate-800">{folderViewProject}</span>
                {currentSubfolder && (
                  <>
                    <ChevronLeft className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-800">{currentSubfolder}</span>
                  </>
                )}
              </div>
            </div>

            {/* Folders section */}
            <div className="px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 bg-slate-100 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-200 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>رفع الملفات</span>
                  </button>
                  {!currentSubfolder && (
                    <button
                      onClick={() => canAdd && setNewSubfolderOpen(true)}
                      disabled={!canAdd}
                      className="h-9 px-4 border border-slate-300 rounded text-sm text-slate-500 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={canAdd ? "" : "لا تملك صلاحية إضافة المجلدات"}
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>مجلد جديد</span>
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => canAdd && setNewFileMenuOpen((v) => !v)}
                      disabled={!canAdd}
                      className="h-9 px-4 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={canAdd ? "" : "لا تملك صلاحية إضافة الملفات"}
                    >
                      <FilePlus2 className="w-4 h-4" />
                      <span>ملف جديد</span>
                    </button>
                    {newFileMenuOpen && (
                      <div className="absolute z-10 mt-1 right-0 w-44 bg-white border border-slate-200 rounded shadow-lg py-1 text-right">
                        <button onClick={() => addBlankFile("text")} className="block w-full px-3 py-2 text-sm hover:bg-slate-50">ملف نصي</button>
                        <button onClick={() => addBlankFile("word")} className="block w-full px-3 py-2 text-sm hover:bg-slate-50">مستند Word</button>
                        <button onClick={() => addBlankFile("excel")} className="block w-full px-3 py-2 text-sm hover:bg-slate-50">جدول Excel</button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setPermsOpen((v) => !v)}
                      className="h-9 px-3 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <span>{isAdmin ? "مدير" : "موظف"}</span>
                    </button>
                    {permsOpen && (
                      <div className="absolute z-20 mt-1 right-0 w-64 bg-white border border-slate-200 rounded shadow-lg p-3 text-right text-xs space-y-2">
                        <div className="font-bold text-slate-700">الصلاحيات</div>
                        <label className="flex items-center justify-end gap-2 cursor-pointer">
                          <span>تشغيل وضع المدير</span>
                          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                        </label>
                        <div className="border-t border-slate-200 pt-2">
                          <div className="text-slate-500 mb-1">صلاحيات الموظف:</div>
                          <label className="flex items-center justify-end gap-2 cursor-pointer">
                            <span>إضافة ملفات/مجلدات</span>
                            <input type="checkbox" checked={employeePerms.add} onChange={(e) => setEmployeePerms((p) => ({ ...p, add: e.target.checked }))} />
                          </label>
                          <label className="flex items-center justify-end gap-2 cursor-pointer mt-1">
                            <span>حذف ملفات/مجلدات</span>
                            <input type="checkbox" checked={employeePerms.delete} onChange={(e) => setEmployeePerms((p) => ({ ...p, delete: e.target.checked }))} />
                          </label>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">المجلدات الأساسية الخمسة لا يمكن حذفها إلا من قبل المدير.</div>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-700">المجلد</h3>
              </div>

              {!currentSubfolder && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {currentProject.folders.length === 0 ? (
                    <div className="col-span-2 text-center py-10 text-slate-400 text-sm">
                      لا توجد مجلدات بعد
                    </div>
                  ) : (
                    currentProject.folders.map((f) => (
                      <div
                        key={f.name}
                        className="bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-between px-4 py-3"
                      >
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentSubfolder(f.name)}
                          className="flex items-center gap-3 flex-1 justify-end text-right"
                        >
                          <div>
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-1 justify-end">
                              {f.locked && <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">أساسي</span>}
                              <span>{f.name}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              تاريخ الإنشاء: {f.createdAt}
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center text-amber-500">
                            <Folder className="w-6 h-6" />
                          </div>
                        </button>
                        {(f.locked ? isAdmin : canDelete) && (
                          <button
                            onClick={() => removeSubfolder(f.name)}
                            className="text-slate-300 hover:text-red-500 ml-2"
                            aria-label="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Files section */}
              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-700 text-right mb-2">الملفات</h3>
                <div className="border-t border-slate-200" />
                {currentFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Megaphone className="w-16 h-16 mb-3 text-slate-300" />
                    <div className="text-sm">لا يوجد نتائج.</div>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 bg-white rounded mt-3">
                    {currentFiles.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          {canDelete && (
                            <button
                              onClick={() => removeFile(f.id)}
                              className="text-slate-300 hover:text-red-500"
                              aria-label="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <span className="text-xs text-slate-400">{todayLabel}</span>
                        </div>
                        <button
                          onClick={() => setEditingFile({ id: f.id, name: f.name, content: f.content, kind: f.kind })}
                          className="flex items-center gap-2 text-sm text-slate-700 hover:text-[color:var(--eyenak-teal)]"
                        >
                          <span>{f.name}</span>
                          <FileIcon
                            className={`w-4 h-4 ${
                              f.kind === "word"
                                ? "text-blue-500"
                                : f.kind === "excel"
                                ? "text-green-600"
                                : "text-slate-400"
                            }`}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {newSubfolderOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setNewSubfolderOpen(false)}
        >
          <div
            className="bg-white rounded-md shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setNewSubfolderOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-800">مجلد جديد</h3>
            </div>
            <label className="block text-sm text-slate-600 mb-2 text-right">اسم المجلد</label>
            <input
              value={newSubfolderName}
              onChange={(e) => setNewSubfolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubfolder()}
              autoFocus
              className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] mb-4"
            />
            <button
              onClick={addSubfolder}
              disabled={!newSubfolderName.trim()}
              className="w-full h-11 bg-[color:var(--eyenak-teal)] disabled:bg-slate-200 disabled:text-slate-500 hover:opacity-90 text-white rounded text-sm font-semibold"
            >
              إنشاء
            </button>
          </div>
        </div>
      )}

      {filesViewOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[55] bg-slate-100 flex overflow-hidden"
        >
          {/* Main content area */}
          <div className="flex-1 overflow-auto p-6">
            {/* Top action bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilesViewOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <button className="h-9 px-4 bg-slate-200 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-300 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>رفع الملفات</span>
                </button>
                <button className="h-9 px-4 border border-slate-300 rounded text-sm text-slate-500 hover:bg-slate-50 flex items-center gap-2 bg-white">
                  <FolderPlus className="w-4 h-4" />
                  <span>مجلد جديد</span>
                </button>
              </div>
              <h3 className="text-sm font-bold text-slate-700">المجلد</h3>
            </div>

            {/* Folders grid or empty state */}
            {Object.keys(projectData).length === 0 ? (
              <div className="bg-white rounded-md py-16 flex flex-col items-center justify-center text-slate-400 text-sm">
                <Megaphone className="w-16 h-16 mb-3 text-slate-300" />
                <span>لا يوجد نتائج.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {Object.entries(projectData).map(([projName, pd]) => {
                  const totalFiles =
                    pd.files.length +
                    pd.folders.reduce((n, sf) => n + sf.files.length, 0);
                  return (
                    <button
                      key={projName}
                      onClick={() => {
                        setFolderViewProject(projName);
                        setCurrentSubfolder(null);
                        setFilesViewOpen(false);
                      }}
                      className="bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-between px-4 py-3 hover:shadow-md transition text-right"
                    >
                      <div className="text-[10px] text-slate-400">
                        {pd.folders.length} مجلد · {totalFiles} ملف
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{projName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            مجلد المهمة
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center text-amber-500">
                          <Folder className="w-6 h-6" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Files section */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-700 text-right mb-2">الملفات</h3>
              <div className="border-t border-slate-200 mb-3" />
              {(() => {
                const looseFiles = Object.entries(projectData).flatMap(([pn, pd]) =>
                  pd.files.map((f) => ({ ...f, proj: pn })),
                );
                if (looseFiles.length === 0) {
                  return (
                    <div className="bg-white rounded-md py-16 flex flex-col items-center justify-center text-slate-400 text-sm">
                      <Megaphone className="w-16 h-16 mb-3 text-slate-300" />
                      <span>لا يوجد نتائج.</span>
                    </div>
                  );
                }
                return (
                  <ul className="divide-y divide-slate-100 bg-white rounded-md">
                    {looseFiles.map((f) => (
                      <li
                        key={`${f.proj}-${f.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                      >
                        <span className="text-xs text-slate-400">{f.proj}</span>
                        <button
                          onClick={() => {
                            setFolderViewProject(f.proj);
                            setCurrentSubfolder(null);
                            setEditingFile({
                              id: f.id,
                              name: f.name,
                              content: f.content,
                              kind: f.kind,
                            });
                            setFilesViewOpen(false);
                          }}
                          className="flex items-center gap-2 text-sm text-slate-700 hover:text-[color:var(--eyenak-teal)]"
                        >
                          <span>{f.name}</span>
                          <FileIcon
                            className={`w-4 h-4 ${
                              f.kind === "word"
                                ? "text-blue-500"
                                : f.kind === "excel"
                                ? "text-green-600"
                                : "text-slate-400"
                            }`}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>

          {/* Right rail */}
          <aside className="w-72 bg-[#0b1e3a] text-white flex flex-col">
            <nav className="p-3 space-y-1 text-sm">
              {[
                { icon: FileIcon, label: "ملفاتي", active: true },
                { icon: Users, label: "تمت مشاركتها معي" },
                { icon: Star, label: "المفضلة" },
                { icon: Trash2, label: "المهملات" },
              ].map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={it.label}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                      it.active
                        ? "bg-white text-[#0b1e3a] font-semibold"
                        : "hover:bg-white/10 text-white/90"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{it.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="px-4 py-3 border-t border-white/10 mt-2">
              <div className="flex items-center gap-2 text-xs text-white/80 mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>تم عرضها مؤخرًا</span>
              </div>
              <div className="text-xs text-white/70 space-y-2">
                {Object.entries(projectData).slice(0, 5).flatMap(([pn, pd]) =>
                  [...pd.files, ...pd.folders.flatMap((sf) => sf.files)]
                    .slice(0, 3)
                    .map((f) => (
                      <div
                        key={`${pn}-${f.id}`}
                        className="flex items-center gap-2 truncate"
                      >
                        <FileIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </div>
                    )),
                )}
              </div>
            </div>
            <div className="mt-auto p-4 border-t border-white/10 text-xs text-white/70">
              <div className="mb-2 text-right">1654.09MB من 302 GB مستخدم</div>
              <div className="h-1 bg-white/15 rounded">
                <div className="h-1 bg-white rounded" style={{ width: "1%" }} />
              </div>
              <div className="mt-4 text-center text-[10px] text-white/40">
                © 2026 EYENAK
              </div>
            </div>
          </aside>
        </div>
      )}

      {editingFile && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setEditingFile(null)}
        >
          <div
            className="bg-white rounded-md shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingFile(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={saveEditingFile}
                  className="h-9 px-4 bg-[color:var(--eyenak-teal)] text-white rounded text-sm font-semibold hover:opacity-90"
                >
                  حفظ
                </button>
              </div>
              <input
                value={editingFile.name}
                onChange={(e) => setEditingFile({ ...editingFile, name: e.target.value })}
                className="text-right text-base font-bold text-slate-800 border-b border-transparent focus:border-slate-300 focus:outline-none px-2 py-1"
              />
            </div>
            <div className="p-4 overflow-auto flex-1">
              {editingFile.kind === "excel" ? (
                <ExcelEditor
                  content={editingFile.content}
                  onChange={(content) => setEditingFile({ ...editingFile, content })}
                />
              ) : (
                <textarea
                  value={editingFile.content}
                  onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                  placeholder={editingFile.kind === "word" ? "ابدأ الكتابة هنا..." : "أدخل النص..."}
                  className={`w-full h-[60vh] border border-slate-200 rounded p-4 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] resize-none ${
                    editingFile.kind === "word" ? "font-serif text-base leading-7" : "font-mono text-sm"
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {calendarOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 bg-black/40 flex items-stretch"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="ml-auto w-full max-w-[1400px] bg-slate-50 h-full flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main calendar */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button className="h-9 px-3 rounded bg-yellow-400 text-slate-800 text-sm font-semibold">التقويم الخاص</button>
                  <button className="h-9 px-3 rounded bg-slate-200 text-slate-700 text-sm">الدعوات المعلقة</button>
                  <button
                    onClick={() => { const t = new Date(); setCalCursor(t); setCalSelected(t); }}
                    className="h-9 px-3 rounded bg-sky-100 text-sky-700 text-sm font-semibold"
                  >اليوم</button>
                  <button
                    onClick={() => calView === "day" ? shiftDay(-1) : shiftMonth(-1)}
                    className="h-9 w-9 rounded bg-sky-500 text-white flex items-center justify-center"
                  ><ChevronLeft className="w-4 h-4" /></button>
                  <button
                    onClick={() => calView === "day" ? shiftDay(1) : shiftMonth(1)}
                    className="h-9 w-9 rounded bg-sky-500 text-white flex items-center justify-center"
                  ><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="text-lg font-semibold text-slate-700">
                  {calView === "day" ? dayLabel : monthLabel}
                </div>
                <div className="flex items-center gap-1">
                  {([
                    ["list", "القائمة"],
                    ["day", "اليوم"],
                    ["week", "الأسبوع"],
                    ["month", "الشهر"],
                  ] as const).map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setCalView(v)}
                      className={`h-9 px-3 rounded text-sm font-medium ${calView === v ? "bg-sky-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                    >{label}</button>
                  ))}
                  <button onClick={() => setCalendarOpen(false)} className="h-9 w-9 ml-2 rounded hover:bg-slate-100 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4" dir="ltr">
                {calView === "month" && (
                  <div className="bg-white border border-slate-200 rounded">
                    <div className="grid grid-cols-7 border-b border-slate-200">
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                        <div key={d} className="px-3 py-2 text-xs font-semibold text-slate-600 border-r last:border-r-0 border-slate-200">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {monthGrid.map((d, i) => {
                        const inMonth = d.getMonth() === calCursor.getMonth();
                        const isToday = toIsoDate(d) === toIsoDate(new Date());
                        const evs = events[toIsoDate(d)] ?? [];
                        return (
                          <button
                            key={i}
                            onClick={() => openEventForm(d)}
                            className={`h-28 text-left p-2 border-r border-b last:border-r-0 border-slate-200 hover:bg-sky-50 transition ${inMonth ? "" : "text-slate-300"} ${isToday ? "bg-amber-50" : ""}`}
                          >
                            <div className="text-xs font-medium">{d.getDate()}</div>
                            <div className="mt-1 space-y-1">
                              {evs.slice(0,3).map((e) => (
                                <div key={e.id} className="text-[10px] text-white px-1 py-0.5 rounded truncate" style={{ backgroundColor: e.color }}>{e.title}</div>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {calView === "day" && (
                  <div className="bg-white border border-slate-200 rounded">
                    <div className="px-4 py-2 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">
                      {calSelected.toLocaleDateString("en-US", { weekday: "long" })}
                    </div>
                    <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-200 bg-amber-50 cursor-pointer" onClick={() => openEventForm(calSelected)}>all-day</div>
                    {Array.from({ length: 14 }, (_, i) => i + 6).map((h) => (
                      <div key={h} onClick={() => openEventForm(calSelected)} className="flex border-b border-slate-100 hover:bg-sky-50 cursor-pointer">
                        <div className="w-16 px-2 py-3 text-xs text-slate-500 text-right border-r border-slate-200">{h <= 12 ? h : h - 12}{h < 12 ? "am" : "pm"}</div>
                        <div className="flex-1 min-h-[40px]" />
                      </div>
                    ))}
                  </div>
                )}

                {calView === "week" && (
                  <div className="bg-white border border-slate-200 rounded p-8 text-center text-slate-500 text-sm">عرض الأسبوع</div>
                )}
                {calView === "list" && (
                  <div className="bg-white border border-slate-200 rounded p-8 text-center text-slate-500 text-sm">لا توجد مناسبات</div>
                )}
              </div>
            </div>

            {/* Mini sidebar */}
            <div className="w-72 bg-slate-800 text-white p-4 overflow-auto" dir="ltr">
              <div className="flex items-center justify-between mb-3 text-sm">
                <button onClick={() => shiftMonth(-1)} className="h-7 w-7 rounded hover:bg-slate-700 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{calCursor.toLocaleDateString("en-US", { month: "short" })}</span>
                  <span className="font-semibold">{calCursor.getFullYear()}</span>
                </div>
                <button onClick={() => shiftMonth(1)} className="h-7 w-7 rounded hover:bg-slate-700 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-7 text-[10px] text-slate-400 mb-1">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d} className="text-center py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {miniGrid.map((d, i) => {
                  const inMonth = d.getMonth() === calCursor.getMonth();
                  const isSel = toIsoDate(d) === toIsoDate(calSelected);
                  return (
                    <button
                      key={i}
                      onClick={() => { setCalSelected(d); setCalView("day"); }}
                      className={`h-7 rounded text-center ${isSel ? "bg-sky-500 text-white" : inMonth ? "hover:bg-slate-700" : "text-slate-500"}`}
                    >{d.getDate()}</button>
                  );
                })}
              </div>
              <h3 className="mt-6 mb-3 text-sm font-semibold">الأحداث القادمة</h3>
              <div className="text-center text-slate-400 text-sm py-6">
                <div className="text-3xl mb-2">🗓️</div>
                لا يوجد مناسبات!
              </div>
            </div>
          </div>

          {eventFormOpen && (
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-start justify-center pt-10" onClick={() => setEventFormOpen(false)}>
              <div dir="rtl" className="bg-white w-full max-w-5xl rounded shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <h2 className="text-base font-semibold text-slate-800">إضافة مناسبة جديدة</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEventFormOpen(false)} className="h-9 px-4 rounded bg-slate-100 text-slate-700 text-sm">إلغاء</button>
                    <button onClick={saveEvent} className="h-9 px-4 rounded bg-yellow-400 text-slate-800 text-sm font-semibold">حفظ</button>
                  </div>
                </div>
                <div className="p-5 space-y-4 max-h-[80vh] overflow-auto">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1 text-right">العنوان</label>
                    <input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} className="w-full h-10 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-sky-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1 text-right">تاريخ البدء</label>
                      <input type="date" value={evStart} onChange={(e) => setEvStart(e.target.value)} className="w-full h-10 border border-slate-300 rounded px-3 text-right" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1 text-right">تاريخ الانتهاء</label>
                      <div className="flex items-center gap-3">
                        <input type="date" value={evEnd} onChange={(e) => setEvEnd(e.target.value)} className="flex-1 h-10 border border-slate-300 rounded px-3 text-right" />
                        <label className="flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
                          <input type="checkbox" checked={evAllDay} onChange={(e) => setEvAllDay(e.target.checked)} className="accent-yellow-500" />
                          طوال اليوم
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1 text-right">موقعك</label>
                      <input value={evLocation} onChange={(e) => setEvLocation(e.target.value)} className="w-full h-10 border border-slate-300 rounded px-3 text-right" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1 text-right">المنطقة الزمنية</label>
                      <select className="w-full h-10 border border-slate-300 rounded px-3 text-right bg-white">
                        <option>(GMT+03:00) Riyadh</option>
                        <option>(GMT+07:00) Jakarta</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1 text-right">أعضاء الفريق</label>
                      <input value={evMembers} onChange={(e) => setEvMembers(e.target.value)} className="w-full h-10 border border-slate-300 rounded px-3 text-right" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1 text-right">العملاء</label>
                      <input value={evClients} onChange={(e) => setEvClients(e.target.value)} className="w-full h-10 border border-slate-300 rounded px-3 text-right" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {eventColors.map((c) => (
                        <button key={c} onClick={() => setEvColor(c)} className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: c }}>
                          {evColor === c && <span className="text-white text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" checked={evAllowInvite} onChange={(e) => setEvAllowInvite(e.target.checked)} />
                      السماح لأعضاء الفريق دعوة الآخرين
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1 text-right">إضافة وصف</label>
                    <textarea value={evDesc} onChange={(e) => setEvDesc(e.target.value)} rows={4} className="w-full border border-slate-300 rounded px-3 py-2 text-right" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {bookingOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 bg-slate-100 overflow-auto"
        >
          <div className="flex min-h-full">
            {/* Right rail */}
            <aside className="w-24 bg-[#0b1e3a] text-white flex flex-col items-center py-4 gap-1 sticky top-0 self-start max-h-screen overflow-y-auto">
              {[
                { id: "services", label: "خدمات", Icon: LayoutTemplate },
                { id: "all", label: "جميع الحجوزات", Icon: ClipboardList },
                { id: "today", label: "حجز اليوم", Icon: CalendarDays },
                { id: "pending", label: "الحجز في انتظار", Icon: Clock },
                { id: "book", label: "خدمة الكتاب", Icon: FileText },
              ].map((t) => {
                const active = bookingTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setBookingTab(t.id as typeof bookingTab)}
                    className={`w-20 py-3 rounded-lg flex flex-col items-center gap-1 text-[11px] transition ${
                      active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <t.Icon className="w-5 h-5" />
                    <span className="text-center leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </aside>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setBookingOpen(false)}
                  className="h-9 w-9 rounded hover:bg-slate-200 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-800">
                  {bookingTab === "services" && "خدمات"}
                  {bookingTab === "all" && "جميع الحجوزات"}
                  {bookingTab === "today" && "حجز اليوم"}
                  {bookingTab === "pending" && "الحجز في انتظار"}
                  {bookingTab === "book" && "خدمة الكتاب"}
                </h2>
              </div>

              {/* Top summary row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 min-h-[260px] flex flex-col">
                  <div className="text-sm font-semibold text-slate-700 mb-3">ملخص الحجوزات</div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border-[14px] border-slate-200" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 min-h-[260px] flex flex-col">
                  <div className="text-sm font-semibold text-slate-700 mb-3">آخر الحجوزات</div>
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    لم يتم العثور على أي حجوزات
                  </div>
                  <button className="text-xs text-sky-600 hover:underline text-center">
                    عرض الكل
                  </button>
                </div>
              </div>

              {/* Two tables */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "حجز اليوم", empty: "لا يوجد حجوزات اليوم", cols: ["اسم", "معرف الحجز", "خدمات", "تأكيد في", "حالة", "الإجراءات"] },
                  { title: "الحجز في انتظار", empty: "لا توجد حجوزات معلقة", cols: ["اسم", "معرف الحجز", "خدمات", "حالة", "الإجراءات"] },
                ].map((tbl) => (
                  <div key={tbl.title} className="bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between p-3 border-b border-slate-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs">0</span>
                      <h3 className="text-sm font-semibold text-slate-700">{tbl.title}</h3>
                    </div>
                    <div className="grid bg-slate-100 text-xs text-slate-600 font-medium" style={{ gridTemplateColumns: `repeat(${tbl.cols.length}, minmax(0, 1fr))` }}>
                      {tbl.cols.map((c) => (
                        <div key={c} className="px-3 py-2 text-right">{c}</div>
                      ))}
                    </div>
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                      <CalendarDays className="w-12 h-12 mb-3 text-slate-300" />
                      <div className="text-sm">{tbl.empty}</div>
                    </div>
                    <div className="p-3 border-t border-slate-200 text-center">
                      <button className="text-xs text-sky-600 hover:underline">عرض الكل</button>
                    </div>
                  </div>
                ))}
              </div>
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

function ExcelEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  const parse = (txt: string): string[][] => {
    if (!txt.trim()) return Array.from({ length: 8 }, () => Array(5).fill(""));
    return txt.split("\n").map((row) => row.split("\t"));
  };
  const rows = parse(content);
  const cols = Math.max(5, ...rows.map((r) => r.length));
  const normalized = rows.map((r) => {
    const copy = [...r];
    while (copy.length < cols) copy.push("");
    return copy;
  });
  const setCell = (ri: number, ci: number, val: string) => {
    const next = normalized.map((r) => [...r]);
    next[ri][ci] = val;
    onChange(next.map((r) => r.join("\t")).join("\n"));
  };
  const addRow = () => onChange([...normalized.map((r) => r.join("\t")), Array(cols).fill("").join("\t")].join("\n"));
  const addCol = () => onChange(normalized.map((r) => [...r, ""].join("\t")).join("\n"));
  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-end">
        <button onClick={addRow} className="h-8 px-3 text-xs border border-slate-300 rounded hover:bg-slate-50">+ صف</button>
        <button onClick={addCol} className="h-8 px-3 text-xs border border-slate-300 rounded hover:bg-slate-50">+ عمود</button>
      </div>
      <div className="overflow-auto border border-slate-200 rounded">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {normalized.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-slate-200 p-0">
                    <input
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      className="w-full px-2 py-1.5 text-right focus:outline-none focus:bg-emerald-50"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

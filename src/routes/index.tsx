import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/ai-assistant.functions";
import guideDashboardImg from "@/assets/guide-dashboard.png";
import guideProjectsImg from "@/assets/guide-projects.png";
import guideFinanceImg from "@/assets/guide-finance.png";
import guideMeetingsImg from "@/assets/guide-meetings.png";
import guideUsersImg from "@/assets/guide-users.png";
import guideAssistantImg from "@/assets/guide-assistant.png";
import { ExtraColHeaders, ExtraCells, RowChatButton, EditableHeaderLabel, RowActions, HiddenColsRestore } from "@/components/table-extras";
import { AdminPanel } from "@/components/admin-panel";
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
  Send,
  Eye,
  AlarmClock,
  BellRing,
  StickyNote,
  Bot,
  Copy,
  Link as LinkIcon,
  Wallet,
  Receipt,
  PlayCircle,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "يسير Dashboard — Manage Projects, Tasks & Files" },
      { name: "description", content: "يسير control panel for managing projects, employees, contracts, tasks, calendar, files, and team collaboration." },
      { property: "og:title", content: "يسير Dashboard — Manage Projects, Tasks & Files" },
      { property: "og:description", content: "يسير control panel for managing projects, employees, contracts, tasks, calendar, files, and team collaboration." },
      { property: "og:url", content: "https://unlock-wonder-url.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://unlock-wonder-url.lovable.app/" }],
  }),
});

const sidebarItems = [
  { icon: Calendar, label: "التقويم", en: "Calendar", color: "#0ea5e9" },
  { icon: FileText, label: "الملفات", en: "Files", color: "#8b5cf6" },
  { icon: Pin, label: "قائمة المذكرات", en: "Notes", color: "#f59e0b" },
  { icon: MessageSquare, label: "المحادثة", en: "Chat", color: "#10b981" },
  { icon: Video, label: "الاجتماعات", en: "Meetings", color: "#ef4444" },
  { icon: Wallet, label: "المالية", en: "Finance", color: "#16a34a" },
  { icon: User, label: "مستخدم", en: "Users", color: "#6366f1" },
  { icon: HelpCircle, label: "الإرشادات", en: "Guides", color: "#14b8a6" },
  { icon: CheckSquare, label: "الحجز", en: "Booking", color: "#ec4899" },
  { icon: MoreHorizontal, label: "المزيد", en: "More", color: "#64748b" },
];

const topTabs = [
  { icon: Home, label: "لوحة التحكم", en: "Dashboard", active: true },
  { icon: FileCheck, label: "جديد المهام", en: "New Tasks", badge: 16 },
  { icon: FileText, label: "المقالات", en: "Articles" },
  { icon: Star, label: "المفضلة", en: "Favorites" },
  { icon: ClipboardList, label: "المهام الجديدة", en: "New" },
  { icon: ClipboardList, label: "المهام المعلقة", en: "Pending" },
  { icon: ClipboardList, label: "المهام المنتهية", en: "Completed" },
  { icon: Clock, label: "المؤقتات النشطة", en: "Active Timers" },
  { icon: Activity, label: "النشاط", en: "Activity" },
  { icon: MapPin, label: "تقرير التتبع", en: "Tracking" },
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
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const isEn = lang === "en";
  const t = (ar: string, en: string) => (isEn ? en : ar);
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({
    "المدير التنفيذي": true,
    "عملاء أ.أروى الجعدي": true,
    "المبيعات": true,
    "ايهاب تطوير": true,
  });
  const [openEmployees, setOpenEmployees] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [tasksMenuOpen, setTasksMenuOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  // Quick-create extras: folder, task, templates
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskProject, setNewTaskProject] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskEnd, setNewTaskEnd] = useState("");
  const [templatesOpen, setTemplatesOpen] = useState(false);
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
  // Mapping of project -> folder/company group it belongs to (for sidebar grouping)
  const [projectFolders, setProjectFolders] = useState<Record<string, string>>({});

  // Roles & permissions
  const DEFAULT_FOLDERS = [
    "اليوزرات",
    "التقارير",
    "المستندات",
    "الخطابات والوثائق المصدقة",
    "عقود وبيانات الموظفين",
  ];
  const [isAdmin, setIsAdmin] = useState(true);
  const [permsOpen, setPermsOpen] = useState(false);

  // ====== نظام الصلاحيات الكامل ======
  type PermKey =
    | "files_view" | "files_add" | "files_edit" | "files_delete"
    | "projects_view" | "projects_create" | "projects_edit"
    | "tasks_edit"
    | "services_view" | "services_manage"
    | "bookings_view" | "bookings_manage"
    | "notes_view" | "notes_manage"
    | "chat_view" | "chat_send"
    | "calendar_view" | "calendar_edit"
    | "members_view";
  const PERMS: { key: PermKey; label: string; group: string }[] = [
    { key: "files_view",      label: "عرض الملفات",         group: "الملفات" },
    { key: "files_add",       label: "إضافة ملفات/مجلدات",  group: "الملفات" },
    { key: "files_edit",      label: "تعديل الملفات",        group: "الملفات" },
    { key: "files_delete",    label: "حذف الملفات",          group: "الملفات" },
    { key: "projects_view",   label: "عرض المشاريع",         group: "المشاريع" },
    { key: "projects_create", label: "إنشاء مشروع",          group: "المشاريع" },
    { key: "projects_edit",   label: "تعديل المشاريع",       group: "المشاريع" },
    { key: "tasks_edit",      label: "تعديل المهام",         group: "المهام" },
    { key: "services_view",   label: "عرض خدمات الكتاب",     group: "الخدمات" },
    { key: "services_manage", label: "إدارة خدمات الكتاب",   group: "الخدمات" },
    { key: "bookings_view",   label: "عرض الحجوزات",         group: "الحجز" },
    { key: "bookings_manage", label: "إدارة الحجوزات",       group: "الحجز" },
    { key: "notes_view",      label: "عرض المذكرات",         group: "المذكرات" },
    { key: "notes_manage",    label: "إدارة المذكرات",       group: "المذكرات" },
    { key: "chat_view",       label: "عرض المحادثة",         group: "المحادثة" },
    { key: "chat_send",       label: "إرسال رسائل",          group: "المحادثة" },
    { key: "calendar_view",   label: "عرض التقويم",          group: "التقويم" },
    { key: "calendar_edit",   label: "تعديل التقويم",        group: "التقويم" },
    { key: "members_view",    label: "عرض الأعضاء",          group: "الأعضاء" },
  ];
  const defaultEmpPerms = (): Record<PermKey, boolean> => {
    const o = {} as Record<PermKey, boolean>;
    for (const p of PERMS) o[p.key] = false;
    // افتراضي: يستطيع رؤية مهامه وملفاته ومحادثاته
    o.files_view = true;
    o.projects_view = true;
    o.chat_view = true;
    o.calendar_view = true;
    return o;
  };

  type Employee = {
    id: string; name: string; email: string;
    username: string; password: string; role: string;
    active: boolean;
    perms: Record<PermKey, boolean>;
  };
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "u1", name: "ايهاب فاتح", email: "ehab@example.com",
      username: "ehab", password: "1234", role: "موظف",
      active: true, perms: defaultEmpPerms(),
    },
  ]);
  const [currentUser, setCurrentUser] = useState<string>("ايهاب فاتح");
  const currentEmployee = useMemo(
    () => employees.find((e) => e.name === currentUser) ?? null,
    [employees, currentUser]
  );
  const hasPerm = (k: PermKey) =>
    isAdmin ? true : !!currentEmployee?.perms?.[k];
  const canAdd = hasPerm("files_add");
  const canDelete = hasPerm("files_delete");
  const employeeCanEdit = hasPerm("tasks_edit");

  // فورم إضافة موظف (في خانة الأعضاء)
  const [newEmp, setNewEmp] = useState({
    name: "", email: "", username: "", password: "", role: "موظف",
  });
  const [newEmpPerms, setNewEmpPerms] = useState<Record<PermKey, boolean>>(defaultEmpPerms());

  // شاشة تسجيل الدخول
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  // واجهة عامة
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [allProjectsOpen, setAllProjectsOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);

  // رسالة تأكيد إضافة الموظف + نافذة رابط الدخول
  const [addEmpMsg, setAddEmpMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [linkEmp, setLinkEmp] = useState<Employee | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const buildLoginLink = (emp: Employee) => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin + window.location.pathname;
    return `${base}?u=${encodeURIComponent(emp.username)}&p=${encodeURIComponent(emp.password)}`;
  };

  // الدخول التلقائي من رابط URL ?u=&p=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const u = sp.get("u");
    const p = sp.get("p");
    if (!u || !p) return;
    const emp = employees.find((e) => e.username === u && e.password === p && e.active);
    if (emp) {
      setCurrentUser(emp.name);
      setIsAdmin(false);
      // نظف الرابط
      const url = new URL(window.location.href);
      url.searchParams.delete("u");
      url.searchParams.delete("p");
      window.history.replaceState({}, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // المساعد الذكي
  type AIMsg = { role: "user" | "assistant"; content: string };
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMsg[]>([
    { role: "assistant", content: "أهلاً! أنا مساعدك داخل المنصة. اسألني عن المهام، الأولويات، أو كيفية استخدام أي ميزة." },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const callAssistant = useServerFn(askAssistant);

  // Contract info + Tasks per project
  type Payment = {
    id: string;
    amount: string;
    date: string;
    paid: boolean;
    receiptName?: string;
    receiptData?: string;
  };
  type ContractInfo = {
    startDate: string;
    endDate: string;
    value: string;
    payments: Payment[];
    responsibleName: string;
    responsiblePhone: string;
    assignee: string;
  };
  type TaskStatus = "جديد" | "جاري العمل" | "تم الانجاز" | "معلق" | "ملغي";
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
    progress: number;
    attachmentName?: string;
    attachmentData?: string;
  };
  type ProjectMeta = { contract: ContractInfo; tasks: TaskRow[] };
  const [projectMeta, setProjectMeta] = useState<Record<string, ProjectMeta>>({});

  // ============ المالية ============
  const [financeOpen, setFinanceOpen] = useState(false);

  // ============ الإرشادات ============
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [guideVideos, setGuideVideos] = useState<Record<string, string>>({});
  const [guideImages, setGuideImages] = useState<Record<string, string>>({});
  const [activeGuide, setActiveGuide] = useState<string>("dashboard");

  // New-project contract form fields
  const [npValue, setNpValue] = useState("");
  const [npRespName, setNpRespName] = useState("");
  const [npRespPhone, setNpRespPhone] = useState("");
  const [npAssignee, setNpAssignee] = useState("");
  const [npPayments, setNpPayments] = useState<Payment[]>([]);

  // Project detail overlay
  const [detailProject, setDetailProject] = useState<string | null>(null);
  const taskFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ============ Per-task internal chat (private to admin + selected members) ============
  type TaskChatMsg = { id: string; author: string; text: string; ts: number };
  type TaskChat = { allowed: string[]; msgs: TaskChatMsg[] };
  const [taskChats, setTaskChats] = useState<Record<string, TaskChat>>({});

  // ============ Flexible task columns (right-click to add) ============
  type CustomColType =
    | "text" | "number" | "date" | "link" | "phone" | "email"
    | "rating" | "tags" | "location" | "timer" | "people" | "vote"
    | "daterange" | "select" | "file";
  type CustomColOption = { id: string; label: string; color: string };
  type CustomCol = { id: string; name: string; type: CustomColType; options?: CustomColOption[] };
  // Keyed by project name
  const [customCols, setCustomCols] = useState<Record<string, CustomCol[]>>({});
  // Keyed by `${taskId}::${colId}`
  const [customCells, setCustomCells] = useState<Record<string, string>>({});

  // Notifications: derive from tasks' end dates
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState<Record<string, true>>({});
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // ============ Seed sample data so every window opens with content ============
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    const today = new Date();
    const iso = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().slice(0, 10);
    };
    const todayLbl = today.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    // All child projects from the sidebar
    const allChildren: { folder: string; name: string }[] = [];
    for (const p of projects) for (const c of p.children) allChildren.push({ folder: p.name, name: c });

    // Extra employees
    setEmployees((prev) => {
      if (prev.length > 1) return prev;
      const mk = (id: string, name: string, email: string, username: string, role: string, full = false): Employee => ({
        id, name, email, username, password: "1234", role, active: true,
        perms: (() => {
          const p = defaultEmpPerms();
          if (full) { for (const k of Object.keys(p) as PermKey[]) p[k] = true; }
          return p;
        })(),
      });
      return [
        ...prev,
        mk("u2", "محمد علي", "mohamed@example.com", "mohamed", "مصمم", true),
        mk("u3", "سارة أحمد", "sara@example.com", "sara", "محرر محتوى"),
        mk("u4", "أ. أروى الجعدي", "arwa@example.com", "arwa", "مديرة حسابات", true),
      ];
    });

    // projectFolders mapping
    setProjectFolders((f) => {
      const next = { ...f };
      for (const { folder, name } of allChildren) if (!next[name]) next[name] = folder;
      return next;
    });

    const assignees = ["ايهاب فاتح", "محمد علي", "سارة أحمد", "أ. أروى الجعدي"];
    const platforms = ["نظام أبشر", "منصة اعتماد", "بوابة العميل", "البريد المؤسسي"];
    const statuses: TaskStatus[] = ["جديد", "جاري العمل", "تم الانجاز", "معلق"];
    const priorities: Priority[] = ["متوسط", "عالي", "منخفض"];

    setProjectMeta((m) => {
      const next = { ...m };
      allChildren.forEach(({ name }, idx) => {
        if (next[name]) return;
        const assignee = assignees[idx % assignees.length];
        next[name] = {
          contract: {
            startDate: iso(-30 - idx),
            endDate: iso(30 + idx * 5),
            value: String(15000 + idx * 5000),
            payments: [
              { id: `p1-${idx}`, amount: String(5000 + idx * 1000), date: iso(-15), paid: true },
              { id: `p2-${idx}`, amount: String(5000 + idx * 1000), date: iso(15), paid: false },
              { id: `p3-${idx}`, amount: String(5000 + idx * 1000), date: iso(45), paid: false },
            ],
            responsibleName: `مسؤول ${name}`,
            responsiblePhone: `+9665${(1000000 + idx * 11111).toString().slice(0, 7)}`,
            assignee,
          },
          tasks: [
            {
              id: `t1-${idx}`,
              name: "إعداد المتطلبات الأولية",
              platform: platforms[idx % platforms.length],
              beneficiary: name,
              documentNo: `DOC-${1000 + idx}`,
              startDate: iso(-10),
              endDate: iso(2),
              doneDate: "",
              status: statuses[1],
              priority: priorities[1],
              progress: 60,
            },
            {
              id: `t2-${idx}`,
              name: "تنفيذ المرحلة الأولى",
              platform: platforms[(idx + 1) % platforms.length],
              beneficiary: name,
              documentNo: `DOC-${2000 + idx}`,
              startDate: iso(-5),
              endDate: iso(10),
              doneDate: "",
              status: statuses[0],
              priority: priorities[0],
              progress: 20,
            },
            {
              id: `t3-${idx}`,
              name: "تسليم ومراجعة",
              platform: platforms[(idx + 2) % platforms.length],
              beneficiary: name,
              documentNo: `DOC-${3000 + idx}`,
              startDate: iso(-20),
              endDate: iso(-2),
              doneDate: iso(-2),
              status: statuses[2],
              priority: priorities[2],
              progress: 100,
            },
          ],
        };
      });
      return next;
    });

    setProjectData((d) => {
      const next = { ...d };
      allChildren.forEach(({ name }) => {
        if (next[name]) return;
        const defaultFolders: SubFolder[] = DEFAULT_FOLDERS.map((fn) => ({
          name: fn,
          createdAt: todayLbl,
          files: [
            { id: `${name}-${fn}-f1`, name: "ملاحظات.txt", content: `ملاحظات ${fn} لمشروع ${name}`, kind: "text" as const },
          ],
          locked: true,
        }));
        next[name] = {
          folders: [
            ...defaultFolders,
            {
              name: "المرفقات الإضافية",
              createdAt: todayLbl,
              files: [
                { id: `${name}-extra-1`, name: "ملخص المشروع.txt", content: `هذا ملخص لمشروع ${name}.`, kind: "text" as const },
                { id: `${name}-extra-2`, name: "جدول الميزانية.csv", content: "البند,القيمة\nتصميم,5000\nتنفيذ,8000\nمتابعة,2000", kind: "excel" as const },
              ],
            },
          ],
          files: [
            { id: `${name}-root-1`, name: "العقد.docx", content: `عقد المشروع: ${name}\nالمدة: 60 يوم`, kind: "word" as const },
          ],
        };
      });
      return next;
    });

    setChats((c) => {
      const next = { ...c };
      allChildren.forEach(({ name }, idx) => {
        if (next[name] && next[name].length) return;
        const assignee = assignees[idx % assignees.length];
        next[name] = [
          {
            id: `${name}-m1`,
            sender: "الأدمن",
            role: "admin",
            text: `مرحبًا، تم فتح مشروع "${name}". يرجى البدء بالمرحلة الأولى.`,
            visibility: "all",
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          },
          {
            id: `${name}-m2`,
            sender: assignee,
            role: "employee",
            text: "تم استلام المتطلبات وسأبدأ التنفيذ اليوم.",
            visibility: "all",
            createdAt: Date.now() - 1000 * 60 * 60 * 20,
          },
          {
            id: `${name}-m3`,
            sender: "الأدمن",
            role: "admin",
            text: "ملاحظة داخلية: تابع الجدول الزمني بدقة.",
            visibility: "admin-employee",
            createdAt: Date.now() - 1000 * 60 * 60 * 5,
          },
          {
            id: `${name}-m4`,
            sender: `مسؤول ${name}`,
            role: "client",
            text: "شكرًا، بانتظار التحديثات.",
            visibility: "all",
            createdAt: Date.now() - 1000 * 60 * 30,
          },
        ];
      });
      return next;
    });

    // Seed calendar events around today
    setEvents((e) => {
      const next = { ...e };
      const palette = ["#0ea5e9", "#22c55e", "#f97316", "#a855f7", "#dc2626"];
      const sample = [
        { offset: 0, title: "اجتماع فريق العمل اليومي", loc: "غرفة الاجتماعات A" },
        { offset: 0, title: "مكالمة متابعة مع العميل", loc: "Zoom" },
        { offset: 1, title: "تسليم المرحلة الأولى - شركة hc", loc: "المكتب الرئيسي" },
        { offset: 2, title: "ورشة عمل: تطوير الواجهة", loc: "قاعة التدريب" },
        { offset: 3, title: "مراجعة عقود الموظفين", loc: "المكتب" },
        { offset: 5, title: "عرض تقديمي لمشروع عنان الفضاء", loc: "Microsoft Teams" },
        { offset: 7, title: "اجتماع المدير التنفيذي", loc: "المكتب التنفيذي" },
      ];
      sample.forEach((s, i) => {
        const date = iso(s.offset);
        const ev: CalEvent = {
          id: `seed-ev-${i}`,
          title: s.title,
          start: date,
          end: date,
          allDay: true,
          color: palette[i % palette.length],
          location: s.loc,
          members: assignees.slice(0, 2).join(", "),
          clients: allChildren[i % allChildren.length]?.name ?? "",
          description: "حدث تجريبي للتأكد من جاهزية التقويم.",
          allowInvite: true,
        };
        next[date] = [...(next[date] ?? []), ev];
      });
      return next;
    });
  }, []);

  type Notif = {
    id: string;
    project: string;
    taskName: string;
    assignee: string;
    endDate: string;
    level: "7d" | "24h" | "late";
    msLeft: number;
  };
  const notifications = useMemo<Notif[]>(() => {
    const out: Notif[] = [];
    for (const [project, meta] of Object.entries(projectMeta)) {
      for (const t of meta.tasks) {
        if (!t.endDate || t.status === "تم الانجاز") continue;
        const end = new Date(t.endDate).getTime();
        if (Number.isNaN(end)) continue;
        const diff = end - nowTs;
        const day = 86400000;
        let level: Notif["level"] | null = null;
        if (diff < 0) level = "late";
        else if (diff <= day) level = "24h";
        else if (diff <= 7 * day) level = "7d";
        if (!level) continue;
        const assignee = meta.contract.assignee || "";
        if (!isAdmin && assignee !== currentUser) continue;
        const id = `${project}::${t.id}::${level}`;
        if (dismissedNotifs[id]) continue;
        out.push({ id, project, taskName: t.name || "(بدون اسم)", assignee, endDate: t.endDate, level, msLeft: diff });
      }
    }
    return out.sort((a, b) => a.msLeft - b.msLeft);
  }, [projectMeta, nowTs, isAdmin, currentUser, dismissedNotifs]);

  // ============ Internal Chat (Admin / Employee / Client) ============
  type ChatRole = "admin" | "employee" | "client";
  type ChatVisibility = "all" | "admin-employee" | "admin-client";
  type ChatMessage = {
    id: string;
    sender: string;
    role: ChatRole;
    text: string;
    visibility: ChatVisibility;
    createdAt: number;
  };
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [chatViewOpen, setChatViewOpen] = useState(false);
  const [chatProject, setChatProject] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatVisibility, setChatVisibility] = useState<ChatVisibility>("all");
  const [chatRoleView, setChatRoleView] = useState<ChatRole>(isAdmin ? "admin" : "employee");
  useEffect(() => {
    setChatRoleView(isAdmin ? "admin" : "employee");
  }, [isAdmin]);
  // Group members per project (مجموعة المحادثة)
  const [chatMembers, setChatMembers] = useState<Record<string, string[]>>({});
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  // Auto-seed members for each project: الأدمن + الموظف المُكلَّف + العميل
  useEffect(() => {
    setChatMembers((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const p of Object.keys(projectMeta)) {
        if (!next[p]) {
          const assignee = projectMeta[p].contract.assignee || "";
          const client = projectMeta[p].contract.responsibleName || "";
          const seed = ["الأدمن", assignee, client].filter(Boolean);
          next[p] = Array.from(new Set(seed));
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [projectMeta]);
  const isMemberOfProject = (project: string) => {
    if (isAdmin) return true;
    return (chatMembers[project] ?? []).includes(currentUser);
  };
  const addChatMember = (project: string, name: string) => {
    const n = name.trim();
    if (!n) return;
    setChatMembers((m) => ({
      ...m,
      [project]: Array.from(new Set([...(m[project] ?? []), n])),
    }));
  };
  const removeChatMember = (project: string, name: string) => {
    // لا تسمح بإزالة الأدمن
    if (name === "الأدمن") return;
    setChatMembers((m) => ({
      ...m,
      [project]: (m[project] ?? []).filter((x) => x !== name),
    }));
  };
  const visibilityLabel = (v: ChatVisibility) =>
    v === "all" ? "للجميع" : v === "admin-employee" ? "الأدمن + الموظف" : "الأدمن + العميل";
  const canSeeMessage = (m: ChatMessage, role: ChatRole) => {
    if (m.visibility === "all") return true;
    if (m.visibility === "admin-employee") return role === "admin" || role === "employee";
    if (m.visibility === "admin-client") return role === "admin" || role === "client";
    return false;
  };
  const sendChatMessage = () => {
    if (!chatProject || !chatInput.trim()) return;
    const role: ChatRole = chatRoleView;
    const sender =
      role === "admin"
        ? "الأدمن"
        : role === "client"
        ? projectMeta[chatProject]?.contract.responsibleName || "العميل"
        : currentUser;
    // Constrain visibility based on role
    let vis = chatVisibility;
    if (role === "employee" && vis === "admin-client") vis = "admin-employee";
    if (role === "client" && vis === "admin-employee") vis = "admin-client";
    const msg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      sender,
      role,
      text: chatInput.trim(),
      visibility: vis,
      createdAt: Date.now(),
    };
    setChats((c) => ({ ...c, [chatProject]: [...(c[chatProject] ?? []), msg] }));
    setChatInput("");
  };

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
  // Sticky notes / reminders
  type StickyNoteItem = {
    id: string;
    text: string;
    color: string;
    author: string;
    target: string;
    reminder: string | null;
    createdAt: number;
    triggered?: boolean;
  };
  const [notesViewOpen, setNotesViewOpen] = useState(false);
  const [notes, setNotes] = useState<StickyNoteItem[]>([
    {
      id: "n1",
      text: "مراجعة عقد العميل قبل اجتماع الغد",
      color: "#fde68a",
      author: "الأدمن",
      target: "ايهاب فاتح",
      reminder: null,
      createdAt: Date.now(),
    },
    {
      id: "n2",
      text: "تذكير: تسليم تقرير المهام الأسبوعي",
      color: "#bae6fd",
      author: "الأدمن",
      target: "الجميع",
      reminder: null,
      createdAt: Date.now(),
    },
  ]);
  const [noteText, setNoteText] = useState("");
  const [noteColor, setNoteColor] = useState("#fde68a");
  const [noteTarget, setNoteTarget] = useState("الجميع");
  const [noteReminder, setNoteReminder] = useState("");
  const [firedReminder, setFiredReminder] = useState<StickyNoteItem | null>(null);
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setNotes((prev) => {
        let changed = false;
        const next = prev.map((n) => {
          if (n.reminder && !n.triggered && new Date(n.reminder).getTime() <= now) {
            changed = true;
            setFiredReminder(n);
            return { ...n, triggered: true };
          }
          return n;
        });
        return changed ? next : prev;
      });
    }, 15000);
    return () => clearInterval(t);
  }, []);
  const [bookingTab, setBookingTab] = useState<"services" | "all" | "today" | "pending" | "book">("all");
  // Booking services
  type BookingService = {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string | null;
    active: boolean;
  };
  const [services, setServices] = useState<BookingService[]>([]);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);

  // ============ الاجتماعات ============
  type Meeting = {
    id: string;
    title: string;
    date: string; // ISO datetime-local
    organizer: string;
    attendees: string[];
    location: string;
    notes: string;
    channels: { inApp: boolean; email: boolean; whatsapp: boolean };
    createdAt: number;
  };
  const [meetingsOpen, setMeetingsOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    organizer: "",
    attendees: "",
    location: "",
    notes: "",
    notifyInApp: true,
    notifyEmail: false,
    notifyWhatsapp: false,
    phone: "",
    email: "",
  });
  const [meetingNotifs, setMeetingNotifs] = useState<{
    id: string; title: string; date: string; organizer: string; target: string;
  }[]>([]);
  const [meetingMsg, setMeetingMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const submitMeeting = () => {
    const t = meetingForm.title.trim();
    if (!t) { setMeetingMsg({ type: "err", text: "أدخل عنوان الاجتماع" }); return; }
    if (!meetingForm.date) { setMeetingMsg({ type: "err", text: "حدد التاريخ والوقت" }); return; }
    const att = meetingForm.attendees.split(",").map((s) => s.trim()).filter(Boolean);
    const m: Meeting = {
      id: `mt-${Date.now()}`,
      title: t,
      date: meetingForm.date,
      organizer: meetingForm.organizer.trim() || (isAdmin ? "الأدمن" : currentUser),
      attendees: att,
      location: meetingForm.location.trim(),
      notes: meetingForm.notes.trim(),
      channels: {
        inApp: meetingForm.notifyInApp,
        email: meetingForm.notifyEmail,
        whatsapp: meetingForm.notifyWhatsapp,
      },
      createdAt: Date.now(),
    };
    setMeetings((prev) => [m, ...prev]);
    if (m.channels.inApp) {
      const targets = att.length > 0 ? att : [currentUser];
      setMeetingNotifs((prev) => [
        ...targets.map((tg) => ({
          id: `${m.id}-${tg}`,
          title: m.title,
          date: m.date,
          organizer: m.organizer,
          target: tg,
        })),
        ...prev,
      ]);
    }
    setMeetingMsg({ type: "ok", text: "تم إنشاء الاجتماع وإرسال الإشعارات" });
    setMeetingForm({
      title: "", date: "", organizer: "", attendees: "", location: "", notes: "",
      notifyInApp: true, notifyEmail: false, notifyWhatsapp: false, phone: "", email: "",
    });
    setTimeout(() => setMeetingMsg(null), 2500);
  };
  const meetingShareLinks = (m: Meeting) => {
    const when = new Date(m.date).toLocaleString("ar-EG");
    const body = `دعوة لاجتماع: ${m.title}%0Aالتاريخ: ${when}%0Aالمنظم: ${m.organizer}${m.location ? `%0Aالمكان: ${m.location}` : ""}${m.notes ? `%0Aملاحظات: ${m.notes}` : ""}`;
    return {
      wa: `https://wa.me/?text=${body}`,
      mail: `mailto:?subject=${encodeURIComponent("دعوة اجتماع: " + m.title)}&body=${body.replace(/%0A/g, "%0D%0A")}`,
    };
  };
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcImage, setSvcImage] = useState<string | null>(null);
  const [svcActive, setSvcActive] = useState(true);
  const [svcSearch, setSvcSearch] = useState("");
  const openServiceForm = (id?: string) => {
    if (id) {
      const s = services.find((x) => x.id === id);
      if (!s) return;
      setEditingServiceId(id);
      setSvcName(s.name);
      setSvcDesc(s.description);
      setSvcPrice(s.price);
      setSvcImage(s.image);
      setSvcActive(s.active);
    } else {
      setEditingServiceId(null);
      setSvcName("");
      setSvcDesc("");
      setSvcPrice("");
      setSvcImage(null);
      setSvcActive(true);
    }
    setServiceFormOpen(true);
  };
  const saveService = () => {
    if (!svcName.trim()) return;
    const payload: BookingService = {
      id: editingServiceId ?? `svc_${Date.now()}`,
      name: svcName.trim(),
      description: svcDesc.trim(),
      price: svcPrice.trim(),
      image: svcImage,
      active: svcActive,
    };
    setServices((prev) =>
      editingServiceId
        ? prev.map((s) => (s.id === editingServiceId ? payload : s))
        : [payload, ...prev],
    );
    setServiceFormOpen(false);
  };
  const onServiceImagePick = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSvcImage(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };
  // Bookings
  type Booking = {
    id: string;
    code: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    serviceIds: string[];
    basePrice: number;
    vat: number;
    discount: number;
    total: number;
    status: "pending" | "today";
    createdAt: number;
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bkSelected, setBkSelected] = useState<string[]>([]);
  const [bkName, setBkName] = useState("");
  const [bkPhone, setBkPhone] = useState("");
  const [bkEmail, setBkEmail] = useState("");
  const [bkBase, setBkBase] = useState("");
  const [bkVat, setBkVat] = useState("");
  const [bkDiscount, setBkDiscount] = useState("");
  const bkComputedBase = useMemo(() => {
    if (bkBase.trim()) return Number(bkBase) || 0;
    return bkSelected.reduce((sum, id) => {
      const s = services.find((x) => x.id === id);
      return sum + (s?.price ? Number(s.price) || 0 : 0);
    }, 0);
  }, [bkBase, bkSelected, services]);
  const bkTotal = useMemo(
    () => Math.max(0, bkComputedBase + (Number(bkVat) || 0) - (Number(bkDiscount) || 0)),
    [bkComputedBase, bkVat, bkDiscount],
  );
  const resetBookingForm = () => {
    setBkSelected([]);
    setBkName("");
    setBkPhone("");
    setBkEmail("");
    setBkBase("");
    setBkVat("");
    setBkDiscount("");
  };
  const confirmBooking = () => {
    if (!bkName.trim() || !bkEmail.trim() || bkSelected.length === 0) return;
    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      code: `#${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: bkName.trim(),
      customerPhone: bkPhone.trim(),
      customerEmail: bkEmail.trim(),
      serviceIds: [...bkSelected],
      basePrice: bkComputedBase,
      vat: Number(bkVat) || 0,
      discount: Number(bkDiscount) || 0,
      total: bkTotal,
      status: "pending",
      createdAt: Date.now(),
    };
    setBookings((p) => [newBooking, ...p]);
    resetBookingForm();
    setBookingTab("pending");
  };
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
    setChats((c) => (c[name] ? c : { ...c, [name]: [] }));
    if (npFolder) setProjectFolders((f) => ({ ...f, [name]: npFolder }));
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

  // Live stats derived from real tasks across all projects (filtered by role)
  const visibleTasks = useMemo(() => {
    const list: (TaskRow & { project: string; assignee: string })[] = [];
    for (const [proj, meta] of Object.entries(projectMeta)) {
      if (!isAdmin && meta.contract.assignee !== currentUser) continue;
      for (const t of meta.tasks) {
        list.push({ ...t, project: proj, assignee: meta.contract.assignee });
      }
    }
    return list;
  }, [projectMeta, isAdmin, currentUser]);
  const completed = visibleTasks.filter((t) => t.status === "تم الانجاز").length;
  const inProgress = visibleTasks.filter((t) => t.status === "جاري العمل").length;
  const pending = visibleTasks.filter((t) => t.status === "معلق").length;
  const newCount = visibleTasks.filter((t) => t.status === "جديد").length;
  const total = visibleTasks.length || 1;
  const completedPct = Math.round((completed / total) * 100);

  // Donut math
  const r = 70;
  const c = 2 * Math.PI * r;
  const segGreen = (completed / total) * c;
  const segOrange = (inProgress / total) * c;
  const segPink = (pending / total) * c;

  // Dashboard tabs
  type DashTab =
    | "لوحة التحكم"
    | "جديد المهام"
    | "المقالات"
    | "المفضلة"
    | "المهام الجديدة"
    | "المهام المعلقة"
    | "المهام المنتهية"
    | "المؤقتات النشطة"
    | "النشاط"
    | "تقرير التتبع";
  const [activeTab, setActiveTab] = useState<DashTab>("لوحة التحكم");
  const [favorites, setFavorites] = useState<Record<string, true>>({});
  const toggleFav = (id: string) =>
    setFavorites((f) => {
      const n = { ...f };
      if (n[id]) delete n[id];
      else n[id] = true;
      return n;
    });
  const tabFilteredTasks = useMemo(() => {
    switch (activeTab) {
      case "جديد المهام":
      case "المهام الجديدة":
        return visibleTasks.filter((t) => t.status === "جديد");
      case "المهام المعلقة":
        return visibleTasks.filter((t) => t.status === "معلق");
      case "المهام المنتهية":
        return visibleTasks.filter((t) => t.status === "تم الانجاز");
      case "المؤقتات النشطة":
        return visibleTasks.filter((t) => t.status === "جاري العمل");
      case "المفضلة":
        return visibleTasks.filter((t) => favorites[t.id]);
      default:
        return visibleTasks;
    }
  }, [activeTab, visibleTasks, favorites]);

  // ============ Task scope filter (mine / shared / all) ============
  type TaskScope = "mine" | "shared" | "all";
  const [taskScope, setTaskScope] = useState<TaskScope>("all");
  const scopedTasks = useMemo(() => {
    return tabFilteredTasks.filter((t) => {
      const members = chatMembers[t.project] ?? [];
      if (taskScope === "mine") return t.assignee === currentUser;
      if (taskScope === "shared")
        return t.assignee !== currentUser && members.includes(currentUser);
      return true;
    });
  }, [tabFilteredTasks, taskScope, chatMembers, currentUser]);

  // ============ Dashboard widgets center ============
  type WidgetKey =
    | "notes"
    | "pendingTasks"
    | "newTasks"
    | "articles"
    | "calendar"
    | "tasksStatus"
    | "projectStatus"
    | "projectPlan"
    | "topPerformer"
    | "projectTimeline"
    | "upcomingMeetings"
    | "latestUpdates"
    | "latestPosts";
  const ALL_WIDGETS: { key: WidgetKey; label: string; desc: string }[] = [
    { key: "tasksStatus", label: "حالة المهام", desc: "إجمالي المهام وتوزيع الحالات" },
    { key: "projectStatus", label: "حالة المشروع", desc: "نسب التقدم لكل مشروع" },
    { key: "notes", label: "قائمة المذكرات", desc: "آخر المذكرات الملصقة" },
    { key: "pendingTasks", label: "المهام المعلقة", desc: "أحدث المهام المعلقة" },
    { key: "newTasks", label: "المهام الجديدة", desc: "أحدث المهام الجديدة" },
    { key: "articles", label: "المقالات", desc: "روابط ومقالات مرجعية" },
    { key: "calendar", label: "التقويم", desc: "تقويم مصغر للشهر الحالي" },
    { key: "projectPlan", label: "مخطط المشروع", desc: "ملخص الأيام المتأخرة والدفعات" },
    { key: "topPerformer", label: "أفضل أداء", desc: "أعلى موظف من حيث الإنجاز" },
    { key: "projectTimeline", label: "الفترة الزمنية للمشروع", desc: "بداية ونهاية الفترة" },
    { key: "upcomingMeetings", label: "الاجتماعات القادمة", desc: "أقرب اجتماعاتك" },
    { key: "latestUpdates", label: "التحديثات الأخيرة", desc: "آخر التحديثات على المنصة" },
    { key: "latestPosts", label: "المنشورات الأخيرة", desc: "آخر المنشورات داخل الفريق" },
  ];
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<Record<string, boolean>>({
    notes: true,
    pendingTasks: true,
    newTasks: true,
    upcomingMeetings: true,
  });
  const toggleWidget = (k: WidgetKey) =>
    setEnabledWidgets((w) => ({ ...w, [k]: !w[k] }));

  const myMeetingNotifs = useMemo(
    () => meetingNotifs.filter((n) => isAdmin || n.target === currentUser),
    [meetingNotifs, isAdmin, currentUser]
  );

  // إغلاق كل اللوحات المنبثقة قبل فتح أخرى أو عند الضغط في فراغ
  const closeAllPanels = () => {
    setCalendarOpen(false);
    setBookingOpen(false);
    setFilesViewOpen(false);
    setChatViewOpen(false);
    setNotesViewOpen(false);
    setMeetingsOpen(false);
    setMembersOpen(false);
    setFinanceOpen(false);
    setGuidesOpen(false);
    setNotifOpen(false);
    setCreateOpen(false);
    setTasksMenuOpen(false);
    setNewFileMenuOpen(false);
    setPermsOpen(false);
    setWidgetsOpen(false);
    setNewProjectOpen(false);
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
    setAllProjectsOpen(false);
  };

  return (
    <div dir={isEn ? "ltr" : "rtl"} className="min-h-screen bg-slate-50 text-slate-800 font-[Cairo]">
      {/* Top header */}
      <header className="h-14 bg-gradient-to-l from-white via-white to-slate-50 border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
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
          <button aria-label="بحث" className="p-2 rounded hover:bg-slate-100 text-slate-600">
            <Search className="w-5 h-5" />
          </button>
          <button aria-label="تحديث" className="p-2 rounded hover:bg-slate-100 text-slate-600">
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="الإشعارات"
              className="relative p-2 rounded hover:bg-slate-100 text-slate-600"
            >
              <Bell className="w-5 h-5" />
              {(notifications.length + myMeetingNotifs.length) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications.length + myMeetingNotifs.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute left-0 mt-2 w-96 max-h-[70vh] overflow-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50" dir="rtl">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-800">الإشعارات</span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    إغلاق
                  </button>
                </div>
                {notifications.length === 0 && myMeetingNotifs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">لا توجد إشعارات</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {myMeetingNotifs.map((n) => (
                      <li key={n.id} className="px-3 py-2 hover:bg-slate-50 bg-emerald-50/40">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">دعوة اجتماع</span>
                              <span className="text-xs text-slate-500">{new Date(n.date).toLocaleString("ar-EG")}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-800 truncate">{n.title}</div>
                            <div className="text-xs text-slate-500 truncate">المنظم: {n.organizer}</div>
                            <button
                              onClick={() => { setMeetingsOpen(true); setNotifOpen(false); }}
                              className="mt-1 text-xs text-[color:var(--eyenak-teal)] hover:underline"
                            >فتح الاجتماعات</button>
                          </div>
                          <button
                            onClick={() => setMeetingNotifs((d) => d.filter((x) => x.id !== n.id))}
                            className="text-xs text-slate-400 hover:text-slate-600"
                            title="تجاهل"
                          >✕</button>
                        </div>
                      </li>
                    ))}
                    {notifications.map((n) => {
                      const badge =
                        n.level === "late"
                          ? { txt: "متأخرة", cls: "bg-red-100 text-red-700" }
                          : n.level === "24h"
                            ? { txt: "أقل من 24 ساعة", cls: "bg-orange-100 text-orange-700" }
                            : { txt: "خلال 7 أيام", cls: "bg-amber-100 text-amber-700" };
                      return (
                        <li key={n.id} className="px-3 py-2 hover:bg-slate-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.cls}`}>
                                  {badge.txt}
                                </span>
                                <span className="text-xs text-slate-500">{n.endDate}</span>
                              </div>
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {n.taskName}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                المشروع: {n.project}
                                {n.assignee ? ` • المسؤول: ${n.assignee}` : ""}
                              </div>
                              <button
                                onClick={() => {
                                  setDetailProject(n.project);
                                  setNotifOpen(false);
                                }}
                                className="mt-1 text-xs text-[color:var(--eyenak-teal)] hover:underline"
                              >
                                فتح المشروع
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                setDismissedNotifs((d) => ({ ...d, [n.id]: true }))
                              }
                              className="text-xs text-slate-400 hover:text-slate-600"
                              title="تجاهل"
                            >
                              ✕
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
            aria-label={t("تغيير اللغة", "Change language")}
            title={t("تغيير اللغة", "Change language")}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 text-sm font-bold"
          >
            <Globe className="w-4 h-4" />
            <span>{isEn ? "EN" : "AR"}</span>
          </button>
          <div className="relative">
            <button
              onClick={() => { const v = !userMenuOpen; closeAllPanels(); setUserMenuOpen(v); }}
              className="flex items-center gap-2 pr-2 border-r border-slate-200 hover:bg-slate-50 rounded-l-lg pl-2 py-1 transition"
            >
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-slate-800">{t(currentUser, "Ehab Fateh")}</div>
                <div className="text-xs text-slate-500">{isAdmin ? t("مدير", "Admin") : t("مطور", "Developer")}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[color:var(--eyenak-teal)] to-[color:var(--eyenak-dark)] text-white flex items-center justify-center font-bold ring-2 ring-white shadow">
                {currentUser.charAt(0)}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {userMenuOpen && (
              <div dir={isEn ? "ltr" : "rtl"} className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                {[
                  { label: "بياناتي", icon: "👤", onClick: () => setAccountOpen(true) },
                  { label: "مقالاتي", icon: "📝", onClick: () => { setActiveTab("المقالات" as any); } },
                  { label: "المشاريع المؤرشفة", icon: "📦", onClick: () => setAllProjectsOpen(true) },
                  { label: "إعدادات المشرف", icon: "⚙️", onClick: () => setAdminPanelOpen(true), admin: true },
                  { label: "الدعم والمساعدة", icon: "💬", onClick: () => setGuidesOpen(true) },
                ].map((it) => (
                  (!it.admin || isAdmin) && (
                    <button
                      key={it.label}
                      onClick={() => { setUserMenuOpen(false); it.onClick(); }}
                      className="w-full text-right px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <span className="text-[color:var(--eyenak-teal)] w-5 text-center">{it.icon}</span>
                      <span className="flex-1 text-right">{it.label}</span>
                    </button>
                  )
                ))}
                <div className="border-t border-slate-100" />
                <button
                  onClick={() => { setUserMenuOpen(false); setIsAdmin(false); setCurrentUser(t("ايهاب فاتح","Ehab Fateh")); setLoginOpen(true); }}
                  className="w-full text-right px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                >
                  <span className="w-5 text-center">↩</span>
                  <span className="flex-1 text-right">{t("تسجيل الخروج", "Logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left icon rail */}
        <aside className="w-20 bg-white border-l border-slate-200 min-h-[calc(100vh-3.5rem)] flex flex-col items-center py-4 gap-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.label === "التقويم" && calendarOpen) ||
              (item.label === "الملفات" && filesViewOpen) ||
              (item.label === "المحادثة" && chatViewOpen) ||
              (item.label === "الحجز" && bookingOpen) ||
              (item.label === "الاجتماعات" && meetingsOpen) ||
              (item.label === "المالية" && financeOpen) ||
              (item.label === "الإرشادات" && guidesOpen) ||
              (item.label === "قائمة المذكرات" && notesViewOpen);
            return (
              <button
                key={item.label}
                onClick={() => {
                  closeAllPanels();
                  if (item.label === "التقويم") setCalendarOpen(true);
                  if (item.label === "الحجز") setBookingOpen(true);
                  if (item.label === "الملفات") setFilesViewOpen(true);
                  if (item.label === "المحادثة") setChatViewOpen(true);
                  if (item.label === "قائمة المذكرات") setNotesViewOpen(true);
                  if (item.label === "الاجتماعات") setMeetingsOpen(true);
                  if (item.label === "مستخدم") setMembersOpen(true);
                  if (item.label === "المالية") setFinanceOpen(true);
                  if (item.label === "الإرشادات") setGuidesOpen(true);
                  if (item.label === "المزيد") setMoreMenuOpen(true);
                }}
                className={`group w-16 py-2.5 flex flex-col items-center gap-1 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                style={
                  isActive
                    ? { background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }
                    : undefined
                }
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                    isActive ? "bg-white/20" : "group-hover:scale-110"
                  }`}
                  style={!isActive ? { color: item.color, backgroundColor: `${item.color}15` } : undefined}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-semibold">{isEn ? item.en : item.label}</span>
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
              <button
                onClick={() => setWidgetsOpen(true)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <Pencil className="w-4 h-4" />
                <span>تخصيص لوحة التحكم</span>
              </button>
              <h1 className="text-xl font-bold text-slate-800">لوحة التحكم - يسير Project Management</h1>
            </div>
          </div>

          {/* Tabs row */}
          <div className="flex items-center justify-end gap-2 flex-wrap mb-4">
            {[
              { icon: Home, label: "لوحة التحكم" as DashTab },
              { icon: FileCheck, label: "جديد المهام" as DashTab, badge: newCount },
              { icon: FileText, label: "المقالات" as DashTab },
              { icon: Star, label: "المفضلة" as DashTab, badge: Object.keys(favorites).length },
              { icon: ClipboardList, label: "المهام الجديدة" as DashTab, badge: newCount },
              { icon: ClipboardList, label: "المهام المعلقة" as DashTab, badge: pending },
              { icon: ClipboardList, label: "المهام المنتهية" as DashTab, badge: completed },
              { icon: Clock, label: "المؤقتات النشطة" as DashTab, badge: inProgress },
              { icon: Activity, label: "النشاط" as DashTab },
              { icon: MapPin, label: "تقرير التتبع" as DashTab },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.label;
              return (
                <button
                  key={t.label}
                  onClick={() => setActiveTab(t.label)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition ${
                    active
                      ? "bg-[color:var(--eyenak-dark)] text-white border-transparent"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>{t.label}</span>
                  <Icon className="w-4 h-4" />
                  {t.badge !== undefined && t.badge > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Card */}
          {activeTab === "لوحة التحكم" && (
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <button
                  onClick={() => setAllProjectsOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 bg-white"
                >
                  <span>{projectFilter ?? "جميع المشاريع"}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {allProjectsOpen && (
                  <div className="absolute right-0 mt-1 w-64 max-h-72 overflow-auto bg-white border border-slate-200 rounded-lg shadow-xl z-40" dir="rtl">
                    <button
                      onClick={() => { setProjectFilter(null); setAllProjectsOpen(false); }}
                      className="w-full text-right px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 font-semibold text-[color:var(--eyenak-teal)]"
                    >جميع المشاريع</button>
                    {projects.flatMap((p) => p.children).map((proj) => (
                      <button
                        key={proj}
                        onClick={() => { setProjectFilter(proj); setAllProjectsOpen(false); }}
                        className="w-full text-right px-3 py-2 text-sm hover:bg-slate-50 text-slate-700 border-b border-slate-50"
                      >{proj}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-700">حالة المهام</h2>
                <PieChart className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => document.documentElement.requestFullscreen?.()}
                title="ملء الشاشة"
                className="p-2 rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.print()}
                title="طباعة"
                className="p-2 rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
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
          )}

          {/* Selected widgets grid */}
          {activeTab === "لوحة التحكم" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {ALL_WIDGETS.filter((w) => enabledWidgets[w.key]).map((w) => (
                <div
                  key={w.key}
                  className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 relative group"
                >
                  <button
                    onClick={() => toggleWidget(w.key)}
                    title="إزالة من اللوحة"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">{w.desc}</span>
                    <h3 className="font-bold text-slate-700 text-sm">{w.label}</h3>
                  </div>
                  <div className="text-sm text-slate-600">
                    {w.key === "tasksStatus" && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><div className="text-lg font-bold text-emerald-600">{completed}</div><div className="text-[10px] text-slate-500">مكتملة</div></div>
                        <div><div className="text-lg font-bold text-orange-500">{inProgress}</div><div className="text-[10px] text-slate-500">جارية</div></div>
                        <div><div className="text-lg font-bold text-pink-500">{pending}</div><div className="text-[10px] text-slate-500">معلقة</div></div>
                      </div>
                    )}
                    {w.key === "projectStatus" && (
                      <ul className="space-y-1.5 text-xs">
                        {Object.entries(projectMeta).slice(0, 4).map(([p, meta]) => {
                          const done = meta.tasks.filter((t) => t.status === "تم الانجاز").length;
                          const pct = meta.tasks.length ? Math.round((done / meta.tasks.length) * 100) : 0;
                          return (
                            <li key={p}>
                              <div className="flex justify-between mb-0.5"><span className="text-slate-500">{pct}%</span><span className="truncate">{p}</span></div>
                              <div className="h-1.5 bg-slate-100 rounded"><div className="h-full bg-emerald-500 rounded" style={{ width: `${pct}%` }} /></div>
                            </li>
                          );
                        })}
                        {Object.keys(projectMeta).length === 0 && <li className="text-slate-400">لا توجد مشاريع</li>}
                      </ul>
                    )}
                    {w.key === "notes" && (
                      <div className="space-y-2">
                        {notes.slice(0, 3).map((n) => (
                          <div key={n.id} className="text-xs p-2 rounded" style={{ background: n.color }}>{n.text}</div>
                        ))}
                        {notes.length === 0 && <div className="text-slate-400 text-xs">لا توجد مذكرات</div>}
                      </div>
                    )}
                    {w.key === "pendingTasks" && (
                      <ul className="space-y-1.5 text-xs">
                        {visibleTasks.filter((t) => t.status === "معلق").slice(0, 4).map((t) => (
                          <li key={t.id} className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-400">{t.assignee}</span><span className="truncate font-medium">{t.name}</span></li>
                        ))}
                      </ul>
                    )}
                    {w.key === "newTasks" && (
                      <ul className="space-y-1.5 text-xs">
                        {visibleTasks.filter((t) => t.status === "جديد").slice(0, 4).map((t) => (
                          <li key={t.id} className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-400">{t.assignee}</span><span className="truncate font-medium">{t.name}</span></li>
                        ))}
                      </ul>
                    )}
                    {w.key === "articles" && (
                      <ul className="space-y-1 text-xs list-disc pr-4">
                        <li>دليل إدارة المهام</li>
                        <li>أفضل ممارسات العقود</li>
                        <li>استخدام التقويم</li>
                      </ul>
                    )}
                    {w.key === "calendar" && (
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500">
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                          <div key={d} className={`py-1 rounded ${d === new Date().getDate() ? "bg-pink-500 text-white" : "hover:bg-slate-100"}`}>{d}</div>
                        ))}
                      </div>
                    )}
                    {w.key === "projectPlan" && (
                      <div className="text-xs text-slate-600">
                        <div className="font-bold text-slate-800 mb-1">{Object.keys(projectMeta)[0] ?? "—"}</div>
                        <div className="text-slate-500">{Object.keys(projectMeta).length} مشاريع نشطة</div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                          <div className="border-l border-slate-100"><div className="text-emerald-600 font-bold">{completed}</div><div className="text-[10px]">منتهية</div></div>
                          <div><div className="text-pink-500 font-bold">{pending}</div><div className="text-[10px]">معلقة</div></div>
                        </div>
                      </div>
                    )}
                    {w.key === "topPerformer" && (
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-[color:var(--eyenak-teal)] text-white flex items-center justify-center font-bold">{(currentUser || "؟").slice(0,2)}</div>
                        <div className="mt-2 font-bold text-slate-800">{currentUser}</div>
                        <div className="text-[10px] text-emerald-600">95% مكتمل</div>
                      </div>
                    )}
                    {w.key === "projectTimeline" && (
                      <div className="flex items-center gap-1 text-xs">
                        <div className="flex-1 h-6 rounded bg-pink-300" />
                        <div className="flex-1 h-6 rounded bg-emerald-400" />
                      </div>
                    )}
                    {w.key === "upcomingMeetings" && (
                      <ul className="space-y-2 text-xs">
                        {meetings.length === 0 && <li className="text-slate-400 text-center">لا توجد اجتماعات</li>}
                        {meetings.slice(0, 3).map((m) => (
                          <li key={m.id} className="border border-slate-100 rounded p-2">
                            <div className="text-slate-400">{new Date(m.date).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</div>
                            <div className="font-semibold">{m.title}</div>
                          </li>
                        ))}
                        <li><button onClick={() => setMeetingsOpen(true)} className="text-[10px] text-[color:var(--eyenak-teal)] hover:underline">+ اجتماع جديد</button></li>
                      </ul>
                    )}
                    {w.key === "latestUpdates" && (
                      <ul className="space-y-1.5 text-xs">
                        <li className="border-b border-slate-100 pb-1">تم تحديث النظام — منذ يوم</li>
                        <li>إضافة واجهات جديدة — منذ يومين</li>
                      </ul>
                    )}
                    {w.key === "latestPosts" && (
                      <div className="text-xs text-slate-600 leading-relaxed">آخر التهاني من فريق العمل بمناسبة الإنجازات الأخيرة.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab !== "لوحة التحكم" && (
            <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500">
                  {activeTab === "النشاط"
                    ? "آخر التحديثات على المهام"
                    : activeTab === "تقرير التتبع"
                    ? "ملخص التتبع حسب المشروع"
                    : activeTab === "المقالات"
                    ? "مقالات ومراجع داخلية"
                    : `${scopedTasks.length} عنصر`}
                </span>
                <h2 className="font-bold text-slate-700">{activeTab}</h2>
              </div>

              {/* Scope filter: mine / shared / all */}
              {activeTab !== "النشاط" && activeTab !== "تقرير التتبع" && activeTab !== "المقالات" && (
                <div className="flex items-center justify-end gap-1 mb-3">
                  {([
                    { k: "mine" as TaskScope, label: "أنا فقط", icon: User },
                    { k: "shared" as TaskScope, label: "بها", icon: Users },
                    { k: "all" as TaskScope, label: "الجميع", icon: List },
                  ]).map((o) => {
                    const Icon = o.icon;
                    const a = taskScope === o.k;
                    return (
                      <button
                        key={o.k}
                        onClick={() => setTaskScope(o.k)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border ${a ? "bg-[color:var(--eyenak-dark)] text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                      >
                        <span>{o.label}</span>
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === "المقالات" ? (
                <div className="space-y-3">
                  {[
                    { t: "دليل إدارة المهام في يسير", d: "كيف تنظم فريقك وتوزع المهام بكفاءة." },
                    { t: "أفضل ممارسات متابعة العقود", d: "نصائح لمتابعة الدفعات والمواعيد." },
                    { t: "استخدام التقويم والاجتماعات", d: "جدولة الأحداث ودعوة الأعضاء." },
                    { t: "صلاحيات الأدمن والموظف", d: "فهم نظام الأدوار والمحادثات." },
                  ].map((a, i) => (
                    <div key={i} className="p-3 border border-slate-200 rounded-md hover:bg-slate-50">
                      <div className="font-semibold text-slate-800">{a.t}</div>
                      <div className="text-sm text-slate-500 mt-1">{a.d}</div>
                    </div>
                  ))}
                </div>
              ) : activeTab === "النشاط" ? (
                <ul className="divide-y divide-slate-100">
                  {visibleTasks.slice(0, 10).map((t, i) => (
                    <li key={i} className="py-2.5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{t.endDate || "—"}</span>
                      <div className="text-sm text-slate-700">
                        <span className="font-medium">{t.assignee || "—"}</span>
                        <span className="text-slate-400 mx-2">·</span>
                        <span>{t.name}</span>
                        <span className="text-slate-400 mx-2">·</span>
                        <span className="text-slate-500">{t.project}</span>
                      </div>
                    </li>
                  ))}
                  {visibleTasks.length === 0 && (
                    <li className="py-6 text-center text-slate-400 text-sm">لا يوجد نشاط بعد</li>
                  )}
                </ul>
              ) : activeTab === "تقرير التتبع" ? (
                <div className="space-y-2">
                  {Object.entries(projectMeta).map(([proj, meta]) => {
                    const ts = meta.tasks;
                    const done = ts.filter((t) => t.status === "تم الانجاز").length;
                    const pct = ts.length ? Math.round((done / ts.length) * 100) : 0;
                    return (
                      <div key={proj} className="p-3 border border-slate-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">{done}/{ts.length} مكتملة · {meta.contract.assignee}</span>
                          <span className="font-semibold text-slate-800">{proj}</span>
                        </div>
                        <div className="h-2 rounded bg-slate-100 overflow-hidden">
                          <div className="h-full bg-[color:var(--eyenak-teal)]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-200">
                        <th className="text-center py-2 px-2 font-medium w-10">💬</th>
                        <th className="text-right py-2 px-2 font-medium"><EditableHeaderLabel tableId="dashboard.tasks" headerKey="fav" defaultLabel="المفضلة" isAdmin={isAdmin} /></th>
                        <th className="text-right py-2 px-2 font-medium"><EditableHeaderLabel tableId="dashboard.tasks" headerKey="status" defaultLabel="الحالة" isAdmin={isAdmin} /></th>
                        <th className="text-right py-2 px-2 font-medium"><EditableHeaderLabel tableId="dashboard.tasks" headerKey="assignee" defaultLabel="المنفذ" isAdmin={isAdmin} /></th>
                        <th className="text-right py-2 px-2 font-medium"><EditableHeaderLabel tableId="dashboard.tasks" headerKey="end" defaultLabel="تاريخ الانتهاء" isAdmin={isAdmin} /></th>
                        <th className="text-right py-2 px-2 font-medium"><EditableHeaderLabel tableId="dashboard.tasks" headerKey="project" defaultLabel="المشروع" isAdmin={isAdmin} /></th>
                        <th className="text-right py-2 px-2 font-medium"><EditableHeaderLabel tableId="dashboard.tasks" headerKey="task" defaultLabel="المهمة" isAdmin={isAdmin} /></th>
                        <ExtraColHeaders tableId="dashboard.tasks" isAdmin={isAdmin} thClass="text-right py-2 px-2 font-medium whitespace-nowrap" />
                      </tr>
                    </thead>
                    <tbody>
                      {scopedTasks.map((t) => (
                        <tr key={`${t.project}-${t.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-2 text-center">
                            <RowChatButton tableId="dashboard.tasks" rowId={`${t.project}-${t.id}`} rowLabel={t.name} currentUser={currentUser} isAdmin={isAdmin} employees={employees.map((e) => e.name)} />
                          </td>
                          <td className="py-2 px-2">
                            <button onClick={() => toggleFav(t.id)}>
                              <Star className={`w-4 h-4 ${favorites[t.id] ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                            </button>
                          </td>
                          <td className="py-2 px-2">{t.status}</td>
                          <td className="py-2 px-2">{t.assignee || "—"}</td>
                          <td className="py-2 px-2">{t.endDate || "—"}</td>
                          <td className="py-2 px-2 text-slate-600">{t.project}</td>
                          <td className="py-2 px-2 font-medium text-slate-800">{t.name}</td>
                          <ExtraCells tableId="dashboard.tasks" rowId={`${t.project}-${t.id}`} canEdit={isAdmin || employeeCanEdit} employees={employees.map((e) => e.name)} tdClass="py-2 px-2 min-w-[110px]" />
                        </tr>
                      ))}
                      {scopedTasks.length === 0 && (
                        <tr>
                          <td colSpan={20} className="py-6 text-center text-slate-400">لا توجد عناصر</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Right projects panel */}
        <aside className="w-72 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] flex flex-col">
          {/* Top toolbar */}
          <div className="relative flex items-center justify-between px-3 py-2 border-b border-slate-200">
            <button
              onClick={() => setTasksMenuOpen((v) => !v)}
              className={`p-1.5 rounded hover:bg-slate-100 ${tasksMenuOpen ? "bg-slate-100 text-slate-700" : "text-slate-500"}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {tasksMenuOpen && (
              <div className="absolute z-30 top-full right-3 mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
                {([
                  { icon: ClipboardList, label: "المهام الجديدة" as DashTab },
                  { icon: ClipboardList, label: "المهام المعلقة" as DashTab },
                  { icon: ClipboardList, label: "المهام المنتهية" as DashTab },
                  { icon: FileText, label: "المقالات" as DashTab },
                  { icon: Clock, label: "المؤقتات النشطة" as DashTab },
                  { icon: Activity, label: "النشاط" as DashTab },
                ]).map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.label}
                      onClick={() => { setActiveTab(o.label); setTasksMenuOpen(false); }}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{o.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMembersOpen(true)}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("المفضلة")}
                title="المفضلة"
                className={`p-1.5 rounded hover:bg-slate-100 ${activeTab === "المفضلة" ? "bg-slate-100 text-slate-700" : "text-slate-500"}`}
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("جديد المهام")}
                title="جديد المهام"
                className={`p-1.5 rounded hover:bg-slate-100 ${activeTab === "جديد المهام" ? "bg-slate-100 text-slate-700" : "text-slate-500"}`}
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("لوحة التحكم")}
                title="لوحة التحكم"
                className={`p-1.5 rounded hover:bg-slate-100 ${activeTab === "لوحة التحكم" ? "bg-slate-100 text-slate-700" : "text-slate-500"}`}
              >
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
                        else if (o.label === "مجلد جديد") { setNewFolderName(""); setNewFolderOpen(true); }
                        else if (o.label === "إنشاء مهمة") {
                          const first = Object.keys(projectMeta)[0] ?? "";
                          setNewTaskProject(first);
                          setNewTaskName("");
                          setNewTaskEnd("");
                          setNewTaskOpen(true);
                        }
                        else if (o.label === "اختيار قالب") setTemplatesOpen(true);
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
            <button className="py-2 text-slate-500">بها</button>
            <button className="py-2 text-[color:var(--eyenak-dark)] font-semibold border-b-2 border-[color:var(--eyenak-teal)]">
              الجميع
            </button>
          </div>

          {/* Projects list */}
          <div className="flex-1 overflow-auto bg-[color:var(--eyenak-dark)] text-white">
            {(() => {
              // Merge static projects with dynamically-created projects (grouped by their folder)
              const dynamicByFolder: Record<string, string[]> = {};
              for (const [pname, folder] of Object.entries(projectFolders)) {
                (dynamicByFolder[folder] ||= []).push(pname);
              }
              const merged = projects.map((p) => ({
                ...p,
                children: [...p.children, ...(dynamicByFolder[p.name] ?? [])],
              }));
              // Extra folders not in static list
              for (const [folder, list] of Object.entries(dynamicByFolder)) {
                if (!projects.some((p) => p.name === folder)) {
                  merged.push({ name: folder, children: list });
                }
              }
              // User-created empty folders
              for (const f of customFolders) {
                if (!merged.some((m) => m.name === f)) merged.push({ name: f, children: [] });
              }
              // Projects with no folder mapping
              const orphans = Object.keys(projectMeta).filter(
                (p) => !projectFolders[p],
              );
              if (orphans.length > 0) {
                merged.push({ name: "مشاريع أخرى", children: orphans });
              }
              return merged;
            })().map((p) => {
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
                            } else if (projectMeta[c]) {
                              setDetailProject(c);
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
                            {projectMeta[c] && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChatProject(c);
                                    setChatViewOpen(true);
                                  }}
                                  className="text-white/50 hover:text-white"
                                  aria-label="فتح المحادثة"
                                  title="فتح المحادثة"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFolderViewProject(c);
                                    setCurrentSubfolder(null);
                                  }}
                                  className="text-white/50 hover:text-white"
                                  aria-label="فتح الملفات"
                                  title="فتح الملفات"
                                >
                                  <Folder className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
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
            © 2026 يسير
          </div>
        </aside>
      </div>

      {/* New Folder modal */}
      {newFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setNewFolderOpen(false)}>
          <div dir="rtl" className="bg-white rounded-md shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setNewFolderOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              <h3 className="text-base font-bold text-slate-800">مجلد جديد</h3>
            </div>
            <label className="block text-sm text-slate-600 mb-2 text-right">اسم المجلد</label>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
              placeholder="مثال: مشاريع 2026"
              className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] mb-4"
            />
            <button
              disabled={!newFolderName.trim()}
              onClick={() => {
                const n = newFolderName.trim();
                if (!n) return;
                setCustomFolders((arr) => (arr.includes(n) ? arr : [...arr, n]));
                setOpenProjects((o) => ({ ...o, [n]: true }));
                setNewFolderOpen(false);
              }}
              className="w-full h-11 bg-[color:var(--eyenak-teal)] disabled:bg-slate-200 disabled:text-slate-500 hover:opacity-90 text-white rounded text-sm font-semibold"
            >إنشاء</button>
          </div>
        </div>
      )}

      {/* New Task modal */}
      {newTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setNewTaskOpen(false)}>
          <div dir="rtl" className="bg-white rounded-md shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setNewTaskOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              <h3 className="text-base font-bold text-slate-800">إنشاء مهمة</h3>
            </div>
            {Object.keys(projectMeta).length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-6">لا توجد مشاريع. أنشئ مشروعاً أولاً.</div>
            ) : (
              <>
                <label className="block text-sm text-slate-600 mb-2 text-right">المشروع</label>
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] mb-3 bg-white"
                >
                  {Object.keys(projectMeta).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <label className="block text-sm text-slate-600 mb-2 text-right">اسم المهمة</label>
                <input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  autoFocus
                  className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] mb-3"
                />
                <label className="block text-sm text-slate-600 mb-2 text-right">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={newTaskEnd}
                  onChange={(e) => setNewTaskEnd(e.target.value)}
                  className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)] mb-4"
                />
                <button
                  disabled={!newTaskProject || !newTaskName.trim()}
                  onClick={() => {
                    const proj = newTaskProject;
                    const name = newTaskName.trim();
                    if (!proj || !name) return;
                    const today = new Date().toISOString().slice(0, 10);
                    const newRow: TaskRow = {
                      id: `${Date.now()}`,
                      name,
                      platform: "",
                      beneficiary: "",
                      documentNo: "",
                      startDate: today,
                      endDate: newTaskEnd || today,
                      doneDate: "",
                      status: "جديد",
                      priority: "لاشيء",
                      progress: 0,
                    };
                    setProjectMeta((m) => {
                      const cur = m[proj];
                      if (!cur) return m;
                      return { ...m, [proj]: { ...cur, tasks: [...cur.tasks, newRow] } };
                    });
                    setNewTaskOpen(false);
                  }}
                  className="w-full h-11 bg-[color:var(--eyenak-teal)] disabled:bg-slate-200 disabled:text-slate-500 hover:opacity-90 text-white rounded text-sm font-semibold"
                >إضافة</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Templates modal */}
      {templatesOpen && (() => {
        const TEMPLATES = [
          { name: "مشروع تسويق رقمي", desc: "حملة تسويقية شاملة عبر القنوات الرقمية", folder: "المبيعات" },
          { name: "تطوير موقع إلكتروني", desc: "تصميم وتطوير موقع ويب احترافي", folder: "ايهاب تطوير" },
          { name: "إدارة عميل جديد", desc: "متابعة عقد ومتطلبات عميل جديد", folder: "عملاء أ.أروى الجعدي" },
          { name: "تقرير شهري", desc: "إعداد التقرير الشهري للأداء", folder: "المدير التنفيذي" },
        ];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setTemplatesOpen(false)}>
            <div dir="rtl" className="bg-white rounded-md shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setTemplatesOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                <h3 className="text-base font-bold text-slate-800">اختيار قالب</h3>
              </div>
              <p className="text-xs text-slate-500 text-right mb-4">اختر قالباً جاهزاً لإنشاء مشروع بسرعة.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => {
                      setNpFolder(tpl.folder);
                      setNpName(tpl.name);
                      setNpDesc(tpl.desc);
                      setNpStep(1);
                      setTemplatesOpen(false);
                      setNewProjectOpen(true);
                    }}
                    className="text-right border border-slate-200 rounded-lg p-4 hover:border-[color:var(--eyenak-teal)] hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <LayoutTemplate className="w-4 h-4 text-[color:var(--eyenak-teal)]" />
                      <div className="font-bold text-slate-800 text-sm">{tpl.name}</div>
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</div>
                    <div className="text-[10px] text-slate-400 mt-2">المجلد: {tpl.folder}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {newProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 pb-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-md shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto my-auto">
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
                <div className="space-y-6">
                  {/* شريط الحالة + تسجيل خروج */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2">
                      {!isAdmin && (
                        <button
                          onClick={() => { setIsAdmin(true); setCurrentUser("ايهاب فاتح"); }}
                          className="px-3 py-1.5 rounded bg-[color:var(--eyenak-dark)] text-white text-xs"
                        >
                          العودة كمدير
                        </button>
                      )}
                      <button
                        onClick={() => setLoginOpen(true)}
                        className="px-3 py-1.5 rounded border border-slate-300 text-xs text-slate-700 hover:bg-white"
                      >
                        تسجيل دخول كموظف
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">الحساب الحالي</div>
                      <div className="font-bold text-slate-800">
                        {isAdmin ? "المدير" : currentUser}
                      </div>
                    </div>
                  </div>

                  {/* فورم إضافة موظف — للمدير فقط */}
                  {isAdmin && (
                    <div className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-slate-500">سيتم إنشاء حساب يدخل به الموظف للمنصة</div>
                        <h3 className="font-bold text-slate-800">إضافة موظف جديد</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-right">
                        <input
                          value={newEmp.name}
                          onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                          placeholder="الاسم الكامل"
                          className="h-10 border border-slate-300 rounded px-3 text-sm"
                        />
                        <input
                          value={newEmp.role}
                          onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                          placeholder="المسمى الوظيفي"
                          className="h-10 border border-slate-300 rounded px-3 text-sm"
                        />
                        <input
                          value={newEmp.email}
                          onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                          placeholder="البريد الإلكتروني"
                          type="email"
                          className="h-10 border border-slate-300 rounded px-3 text-sm"
                        />
                        <input
                          value={newEmp.username}
                          onChange={(e) => setNewEmp({ ...newEmp, username: e.target.value })}
                          placeholder="اسم المستخدم (يوزر الدخول)"
                          className="h-10 border border-slate-300 rounded px-3 text-sm"
                        />
                        <input
                          value={newEmp.password}
                          onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                          placeholder="كلمة المرور"
                          className="h-10 border border-slate-300 rounded px-3 text-sm col-span-2"
                        />
                      </div>

                      {/* الصلاحيات */}
                      <div className="mt-4">
                        <div className="text-sm font-bold text-slate-700 mb-2 text-right">الصلاحيات الممنوحة</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {PERMS.map((p) => (
                            <label key={p.key} className="flex items-center justify-end gap-2 text-xs cursor-pointer">
                              <span className="text-slate-700">{p.label}</span>
                              <input
                                type="checkbox"
                                checked={newEmpPerms[p.key]}
                                onChange={(e) =>
                                  setNewEmpPerms((o) => ({ ...o, [p.key]: e.target.checked }))
                                }
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
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
                      </button>
                      {addEmpMsg && (
                        <div
                          className={`mt-2 text-xs text-right px-3 py-2 rounded ${
                            addEmpMsg.type === "ok"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {addEmpMsg.text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* قائمة الموظفين */}
                  <div className="grid grid-cols-2 gap-4">
                    {employees
                      .filter((m) => m.name.includes(memberSearch.trim()) || memberSearch.trim() === "")
                      .map((emp) => (
                        <div key={emp.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-1">
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() =>
                                      setEmployees((arr) =>
                                        arr.map((x) => (x.id === emp.id ? { ...x, active: !x.active } : x))
                                      )
                                    }
                                    className={`text-[10px] px-2 py-1 rounded border ${
                                      emp.active
                                        ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                        : "border-slate-300 text-slate-500 bg-slate-50"
                                    }`}
                                  >
                                    {emp.active ? "مفعل" : "موقوف"}
                                  </button>
                                  <button
                                    onClick={() => setEmployees((arr) => arr.filter((x) => x.id !== emp.id))}
                                    className="text-slate-300 hover:text-red-500"
                                    aria-label="حذف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-800">{emp.name}</div>
                              <div className="text-xs text-[color:var(--eyenak-dark)]">{emp.role}</div>
                            </div>
                          </div>
                          <div className="text-xs space-y-1 text-right border-t border-slate-100 pt-2">
                            <div className="flex justify-between"><span className="text-slate-500">{emp.email || "—"}</span><span className="text-slate-600">البريد</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-mono">{emp.username}</span><span className="text-slate-600">اسم المستخدم</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 font-mono">{emp.password}</span><span className="text-slate-600">الرمز</span></div>
                          </div>

                          {/* صلاحيات قابلة للتعديل من المدير */}
                          {isAdmin && (
                            <details className="mt-3 border border-slate-200 rounded">
                              <summary className="cursor-pointer px-3 py-2 text-xs text-slate-700 bg-slate-50 rounded text-right">
                                ⚙️ تعديل الصلاحيات ({Object.values(emp.perms).filter(Boolean).length}/{PERMS.length})
                              </summary>
                              <div className="p-3 grid grid-cols-1 gap-1.5 text-right max-h-60 overflow-y-auto">
                                {PERMS.map((p) => (
                                  <label key={p.key} className="flex items-center justify-end gap-2 text-[11px] cursor-pointer">
                                    <span className="text-slate-600">{p.label}</span>
                                    <input
                                      type="checkbox"
                                      checked={!!emp.perms[p.key]}
                                      onChange={(e) =>
                                        setEmployees((arr) =>
                                          arr.map((x) =>
                                            x.id === emp.id
                                              ? { ...x, perms: { ...x.perms, [p.key]: e.target.checked } }
                                              : x
                                          )
                                        )
                                      }
                                    />
                                  </label>
                                ))}
                              </div>
                            </details>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => {
                                setCurrentUser(emp.name);
                                setIsAdmin(false);
                                setMembersOpen(false);
                              }}
                              className="mt-3 w-full border border-slate-200 rounded py-2 text-xs text-slate-600 hover:bg-slate-50"
                            >
                              معاينة كهذا الموظف
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => { setLinkEmp(emp); setLinkCopied(false); }}
                              className="mt-2 w-full rounded py-2 text-xs bg-[color:var(--eyenak-teal)]/10 text-[color:var(--eyenak-teal)] hover:bg-[color:var(--eyenak-teal)]/20 flex items-center justify-center gap-1.5"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              رابط الدخول للموظف
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
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
                      <span>{isAdmin ? "مدير" : `موظف: ${currentUser}`}</span>
                    </button>
                    {permsOpen && (
                      <div className="absolute z-20 mt-1 right-0 w-80 bg-white border border-slate-200 rounded shadow-lg p-3 text-right text-xs space-y-2 max-h-[70vh] overflow-y-auto">
                        <div className="font-bold text-slate-700">الحساب الحالي</div>
                        <div className="text-slate-600">
                          {isAdmin ? "وضع المدير (كامل الصلاحيات)" : `موظف: ${currentUser}`}
                        </div>
                        <button
                          onClick={() => { setPermsOpen(false); setMembersOpen(true); }}
                          className="w-full h-8 bg-[color:var(--eyenak-teal)] text-white rounded text-xs"
                        >
                          إدارة المستخدمين والصلاحيات
                        </button>
                        {!isAdmin ? (
                          <button
                            onClick={() => { setIsAdmin(true); setPermsOpen(false); }}
                            className="w-full h-8 border border-slate-300 rounded text-xs hover:bg-slate-50"
                          >
                            العودة كمدير
                          </button>
                        ) : (
                          <button
                            onClick={() => { setPermsOpen(false); setLoginOpen(true); }}
                            className="w-full h-8 border border-slate-300 rounded text-xs hover:bg-slate-50"
                          >
                            تسجيل الدخول كموظف
                          </button>
                        )}
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
          className="fixed top-14 left-0 right-20 bottom-0 z-40 bg-slate-100 flex overflow-hidden shadow-2xl rounded-tl-2xl"
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
                © 2026 يسير
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
          className="fixed top-14 left-0 right-20 bottom-0 z-40 flex items-stretch"
        >
          <div
            className="w-full bg-slate-50 h-full flex shadow-2xl rounded-tl-2xl overflow-hidden"
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
          className="fixed top-14 left-0 right-20 bottom-0 z-40 bg-slate-100 overflow-auto shadow-2xl rounded-tl-2xl"
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

              {bookingTab === "services" ? (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBookingTab("book")}
                        className="h-9 px-4 rounded bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700"
                      >
                        خدمة الكتاب
                      </button>
                      <button
                        onClick={() => openServiceForm()}
                        className="h-9 px-4 rounded bg-gradient-to-r from-sky-500 to-indigo-500 hover:shadow-md transition text-white text-sm font-semibold flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> أضف الخدمة
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={svcSearch}
                        onChange={(e) => setSvcSearch(e.target.value)}
                        placeholder="البحث"
                        className="h-9 pr-8 pl-3 w-64 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div className="ms-auto">
                      <h3 className="text-base font-bold text-slate-800">خدمات</h3>
                      <p className="text-xs text-slate-500">إدارة خدمات الحجز الخاصة بك</p>
                    </div>
                  </div>
                  {(() => {
                    const filtered = services.filter((s) =>
                      !svcSearch.trim() || s.name.includes(svcSearch.trim()) || s.description.includes(svcSearch.trim()),
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <CalendarDays className="w-10 h-10 text-slate-300" />
                          </div>
                          <div className="text-sm">لم يتم العثور على الخدمة</div>
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((s) => (
                          <div
                            key={s.id}
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                          >
                            <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                              {s.image ? (
                                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                              ) : (
                                <FileIcon className="w-10 h-10 text-slate-300" />
                              )}
                            </div>
                            <div className="p-3 flex-1 flex flex-col">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-slate-800">{s.name}</h4>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {s.active ? "نشطة" : "موقوفة"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">
                                {s.description || "—"}
                              </p>
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                                <div className="text-sm font-bold text-sky-600">
                                  {s.price ? `${s.price} ر.س` : "—"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openServiceForm(s.id)}
                                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                                    aria-label="تعديل"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setServices((p) => p.filter((x) => x.id !== s.id))}
                                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                                    aria-label="حذف"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
              bookingTab === "book" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Right column: customer + pricing */}
                  <div className="space-y-4 order-2 lg:order-1">
                    <div className="bg-white rounded-lg border border-slate-200 p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-4">تفاصيل العميل</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            الاسم <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={bkName}
                            onChange={(e) => setBkName(e.target.value)}
                            maxLength={100}
                            placeholder="ادخل الاسم"
                            className="w-full h-10 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            رقم الهاتف المحمول (اختياري)
                          </label>
                          <div className="flex gap-2">
                            <span className="h-10 px-3 inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-50 text-sm text-slate-700">
                              <span>🇸🇦</span>
                              <span>+966</span>
                            </span>
                            <input
                              type="tel"
                              value={bkPhone}
                              onChange={(e) => setBkPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 12))}
                              placeholder="5XXXXXXXX"
                              className="flex-1 h-10 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            البريد الالكتروني <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={bkEmail}
                            onChange={(e) => setBkEmail(e.target.value)}
                            maxLength={255}
                            placeholder="ادخل البريد الالكتروني"
                            className="w-full h-10 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-5">
                      <h3 className="text-sm font-bold text-slate-700 mb-4">تفاصيل التسعير (اختياري)</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block text-center">السعر الأساسي</label>
                          <input
                            type="number"
                            value={bkBase}
                            onChange={(e) => setBkBase(e.target.value)}
                            placeholder={String(bkComputedBase || 0)}
                            className="w-full h-10 px-3 rounded border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block text-center">VAT</label>
                          <input
                            type="number"
                            value={bkVat}
                            onChange={(e) => setBkVat(e.target.value)}
                            placeholder="0"
                            className="w-full h-10 px-3 rounded border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block text-center">الخصم</label>
                          <input
                            type="number"
                            value={bkDiscount}
                            onChange={(e) => setBkDiscount(e.target.value)}
                            placeholder="0"
                            className="w-full h-10 px-3 rounded border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-3 rounded bg-slate-50 flex items-center justify-between border border-slate-100">
                        <span className="text-2xl font-bold text-sky-600">{bkTotal}</span>
                        <span className="text-sm font-semibold text-slate-700">مجموع المستحق الدفع</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={confirmBooking}
                        disabled={!bkName.trim() || !bkEmail.trim() || bkSelected.length === 0}
                        className="h-10 px-6 rounded bg-[#0b1e3a] hover:bg-[#13294b] text-white text-sm font-bold disabled:opacity-40"
                      >
                        تأكيد
                      </button>
                      <button
                        onClick={resetBookingForm}
                        className="h-10 px-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>

                  {/* Left column: select services */}
                  <div className="order-1 lg:order-2">
                    <div className="bg-white rounded-lg border border-slate-200 p-4 min-h-[420px]">
                      <h3 className="text-sm font-bold text-slate-700 mb-3">
                        حدد الخدمات <span className="text-red-500">*</span>
                      </h3>
                      {services.filter((s) => s.active).length === 0 ? (
                        <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-slate-400">
                          <LayoutTemplate className="w-12 h-12 mb-2 text-slate-300" />
                          <div className="text-sm">لا توجد خدمات متاحة</div>
                          <button
                            onClick={() => setBookingTab("services")}
                            className="mt-3 text-xs text-sky-600 hover:underline"
                          >
                            أضف خدمة الآن
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {services
                            .filter((s) => s.active)
                            .map((s) => {
                              const sel = bkSelected.includes(s.id);
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() =>
                                    setBkSelected((prev) =>
                                      sel ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                                    )
                                  }
                                  className={`relative text-right rounded-lg border-2 overflow-hidden transition ${
                                    sel
                                      ? "border-sky-500 ring-2 ring-sky-200"
                                      : "border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  {sel && (
                                    <span className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs">
                                      ✓
                                    </span>
                                  )}
                                  <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                                    {s.image ? (
                                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <FileIcon className="w-8 h-8 text-slate-300" />
                                    )}
                                  </div>
                                  <div className="p-2 bg-white">
                                    <div className="text-xs font-bold text-slate-800 truncate">{s.name}</div>
                                    <div className="text-xs text-sky-600 font-semibold">
                                      {s.price ? `${s.price}.00` : "—"}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
              <>
              {/* Top summary row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 min-h-[260px] flex flex-col">
                  <div className="text-sm font-semibold text-slate-700 mb-3">ملخص الحجوزات</div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-sky-600">{bookings.length}</div>
                      <div className="text-xs text-slate-500 mt-1">إجمالي الحجوزات</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 min-h-[260px] flex flex-col">
                  <div className="text-sm font-semibold text-slate-700 mb-3">آخر الحجوزات</div>
                  {bookings.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                      لم يتم العثور على أي حجوزات
                    </div>
                  ) : (
                    <ul className="flex-1 space-y-1.5 overflow-auto">
                      {bookings.slice(0, 5).map((b) => (
                        <li key={b.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-slate-50">
                          <span className="font-bold text-sky-600">{b.total} ر.س</span>
                          <span className="text-slate-700">{b.customerName}</span>
                          <span className="text-slate-400">{b.code}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => setBookingTab("all")} className="text-xs text-sky-600 hover:underline text-center mt-2">
                    عرض الكل
                  </button>
                </div>
              </div>

              {/* Two tables */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "today" as const, title: "حجز اليوم", empty: "لا يوجد حجوزات اليوم", cols: ["اسم", "معرف الحجز", "خدمات", "حالة", "الإجراءات"] },
                  { key: "pending" as const, title: "الحجز في انتظار", empty: "لا توجد حجوزات معلقة", cols: ["اسم", "معرف الحجز", "خدمات", "حالة", "الإجراءات"] },
                ].map((tbl) => {
                  const rows = bookings.filter((b) =>
                    bookingTab === "all" ? b.status === tbl.key : b.status === bookingTab && tbl.key === bookingTab,
                  );
                  return (
                  <div key={tbl.title} className="bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between p-3 border-b border-slate-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs">{rows.length}</span>
                      <h3 className="text-sm font-semibold text-slate-700">{tbl.title}</h3>
                    </div>
                    <div className="grid bg-slate-100 text-xs text-slate-600 font-medium" style={{ gridTemplateColumns: `repeat(${tbl.cols.length}, minmax(0, 1fr))` }}>
                      {tbl.cols.map((c) => (
                        <div key={c} className="px-3 py-2 text-right">{c}</div>
                      ))}
                    </div>
                    {rows.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <CalendarDays className="w-12 h-12 mb-3 text-slate-300" />
                        <div className="text-sm">{tbl.empty}</div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {rows.map((b) => (
                          <li
                            key={b.id}
                            className="grid text-xs text-slate-700"
                            style={{ gridTemplateColumns: `repeat(${tbl.cols.length}, minmax(0, 1fr))` }}
                          >
                            <div className="px-3 py-2.5 font-semibold">{b.customerName}</div>
                            <div className="px-3 py-2.5 text-slate-500">{b.code}</div>
                            <div className="px-3 py-2.5 text-slate-600 truncate">
                              {b.serviceIds
                                .map((id) => services.find((s) => s.id === id)?.name)
                                .filter(Boolean)
                                .join("، ")}
                            </div>
                            <div className="px-3 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === "today"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {b.status === "today" ? "اليوم" : "معلق"}
                              </span>
                            </div>
                            <div className="px-3 py-2.5 flex items-center gap-1">
                              {b.status === "pending" && (
                                <button
                                  onClick={() =>
                                    setBookings((p) =>
                                      p.map((x) => (x.id === b.id ? { ...x, status: "today" } : x)),
                                    )
                                  }
                                  className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100"
                                >
                                  تأكيد
                                </button>
                              )}
                              <button
                                onClick={() => setBookings((p) => p.filter((x) => x.id !== b.id))}
                                className="p-1 rounded hover:bg-red-50 text-red-500"
                                aria-label="حذف"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="p-3 border-t border-slate-200 text-center">
                      <button
                        onClick={() => setBookingTab(tbl.key)}
                        className="text-xs text-sky-600 hover:underline"
                      >
                        عرض الكل
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
              </>
              )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit service modal */}
      {serviceFormOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[70] bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setServiceFormOpen(false)}
        >
          <div
            className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-5xl mt-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 rounded-t-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={saveService}
                  disabled={!svcName.trim()}
                  className="h-9 px-5 rounded bg-[#0b1e3a] hover:bg-[#13294b] text-white text-sm font-semibold disabled:opacity-40"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setServiceFormOpen(false)}
                  className="h-9 px-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
                >
                  إلغاء
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingServiceId ? "تعديل الخدمة" : "أضف الخدمة"}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {/* Right column: form fields */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 order-2 lg:order-1">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">اسم الخدمة</label>
                  <input
                    type="text"
                    value={svcName}
                    onChange={(e) => setSvcName(e.target.value)}
                    placeholder="اسم الخدمة"
                    className="w-full h-10 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">الوصف</label>
                  <textarea
                    value={svcDesc}
                    onChange={(e) => setSvcDesc(e.target.value)}
                    placeholder="الوصف"
                    rows={5}
                    className="w-full p-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">السعر (اختياري)</label>
                  <input
                    type="number"
                    value={svcPrice}
                    onChange={(e) => setSvcPrice(e.target.value)}
                    placeholder="السعر (اختياري)"
                    className="w-full h-10 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSvcActive((v) => !v)}
                    className={`relative w-12 h-6 rounded-full transition ${
                      svcActive ? "bg-amber-400" : "bg-slate-300"
                    }`}
                    aria-pressed={svcActive}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        svcActive ? "right-0.5" : "right-[1.625rem]"
                      }`}
                    />
                  </button>
                  <label className="text-xs font-semibold text-slate-600">حالة</label>
                </div>
              </div>

              {/* Left column: image upload + preview */}
              <div className="space-y-4 order-1 lg:order-2">
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">صورة الخدمة</label>
                  <label className="block border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/30 transition">
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => onServiceImagePick(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    {svcImage ? (
                      <img src={svcImage} alt="معاينة" className="max-h-32 mx-auto rounded" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <div className="text-sm text-slate-600">انقر لتحميل الصورة</div>
                        <div className="text-xs text-slate-400 mt-1">PNG, JPG</div>
                      </>
                    )}
                  </label>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">معاينة</label>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                      {svcImage ? (
                        <img src={svcImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <div className="font-bold text-slate-800 text-sm">
                        {svcName || "Service Name"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {svcDesc || "Service description will appear here"}
                      </div>
                      {svcPrice && (
                        <div className="text-sm font-bold text-sky-600 mt-2">{svcPrice} ر.س</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailProject && (
        <ProjectDetailOverlay
          name={detailProject}
          meta={projectMeta[detailProject]}
          isAdmin={isAdmin}
          currentUser={currentUser}
          employeeCanEdit={employeeCanEdit}
          employees={employees.map((e) => e.name)}
          taskChats={taskChats}
          onUpdateTaskChat={(taskId, updater) =>
            setTaskChats((prev) => {
              const cur = prev[taskId] ?? { allowed: [], msgs: [] };
              return { ...prev, [taskId]: updater(cur) };
            })
          }
          customCols={customCols[detailProject] ?? []}
          onUpdateCustomCols={(updater) =>
            setCustomCols((prev) => ({
              ...prev,
              [detailProject!]: updater(prev[detailProject!] ?? []),
            }))
          }
          customCells={customCells}
          onSetCustomCell={(taskId, colId, val) =>
            setCustomCells((prev) => ({ ...prev, [`${taskId}::${colId}`]: val }))
          }
          onClose={() => setDetailProject(null)}
          onOpenChat={() => {
            setChatProject(detailProject);
            setChatViewOpen(true);
          }}
          onOpenFiles={() => {
            setFolderViewProject(detailProject);
            setCurrentSubfolder(null);
            setDetailProject(null);
          }}
          onUpdate={(updater) =>
            setProjectMeta((m) => {
              const cur =
                m[detailProject!] ?? {
                  contract: {
                    startDate: "",
                    endDate: "",
                    value: "",
                    payments: [],
                    responsibleName: "",
                    responsiblePhone: "",
                    assignee: "",
                  },
                  tasks: [],
                };
              return { ...m, [detailProject!]: updater(cur) };
            })
          }
        />
      )}

      {chatViewOpen && (
        <div dir="rtl" className="fixed top-14 left-0 right-20 bottom-0 z-40 bg-slate-50 flex overflow-hidden shadow-2xl rounded-tl-2xl">
          {/* Right list: companies / projects */}
          <aside className="w-72 bg-white border-l border-slate-200 flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200">
              <button
                onClick={() => setChatViewOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <MessageSquare className="w-4 h-4 text-[color:var(--eyenak-teal)]" />
                <span>محادثات المشاريع</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {(() => {
                const projectNames = Object.keys(projectMeta);
                if (projectNames.length === 0) {
                  return (
                    <div className="text-xs text-slate-400 text-center py-8">
                      لا توجد مشاريع بعد. أنشئ مشروعاً جديداً لبدء المحادثة.
                    </div>
                  );
                }
                // Group by company (responsibleName)
                const groups: Record<string, string[]> = {};
                for (const p of projectNames) {
                  const company = projectMeta[p].contract.responsibleName || "غير محدد";
                  // عرض المشاريع التي يكون المستخدم عضواً فيها فقط (الأدمن يرى الكل)
                  if (!isMemberOfProject(p)) continue;
                  (groups[company] ||= []).push(p);
                }
                const entries = Object.entries(groups);
                if (entries.length === 0) {
                  return (
                    <div className="text-xs text-slate-400 text-center py-8">
                      لا توجد مشاريع مكلَّفة لك.
                    </div>
                  );
                }
                return entries.map(([company, list]) => (
                  <div key={company} className="mb-3">
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{company}</span>
                    </div>
                    <ul className="space-y-1">
                      {list.map((p) => {
                        const last = chats[p]?.[chats[p].length - 1];
                        const active = chatProject === p;
                        return (
                          <li key={p}>
                            <button
                              onClick={() => setChatProject(p)}
                              className={`w-full text-right px-3 py-2 rounded-md text-sm transition ${
                                active
                                  ? "bg-[color:var(--eyenak-teal)] text-white"
                                  : "hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <div className="font-semibold truncate">{p}</div>
                              <div className={`text-[11px] truncate ${active ? "text-white/80" : "text-slate-400"}`}>
                                {last ? `${last.sender}: ${last.text}` : "لا توجد رسائل"}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })()}
            </div>
          </aside>

          {/* Chat thread */}
          <section className="flex-1 flex flex-col">
            {!chatProject ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="w-16 h-16 mb-3 text-slate-300" />
                <span className="text-sm">اختر مشروعاً لبدء المحادثة</span>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-2 text-xs">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">عرض كـ:</span>
                    <select
                      value={chatRoleView}
                      onChange={(e) => setChatRoleView(e.target.value as ChatRole)}
                      className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                      disabled={!isAdmin}
                    >
                      <option value="admin">أدمن</option>
                      <option value="employee">موظف</option>
                      <option value="client">عميل</option>
                    </select>
                    {isAdmin && (
                      <button
                        onClick={() => setMembersModalOpen(true)}
                        className="ml-2 inline-flex items-center gap-1 border border-slate-200 rounded px-2 py-1 text-xs bg-white hover:bg-slate-50"
                        title="إدارة أعضاء المجموعة"
                      >
                        <Users className="w-3 h-3 text-[color:var(--eyenak-teal)]" />
                        <span>الأعضاء ({(chatMembers[chatProject] ?? []).length})</span>
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">{chatProject}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[420px]">
                      المجموعة: {(chatMembers[chatProject] ?? []).join(" · ") || "—"}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {(chats[chatProject] ?? []).filter((m) => canSeeMessage(m, chatRoleView)).length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-10">لا توجد رسائل مرئية لك بعد.</div>
                  ) : (
                    (chats[chatProject] ?? [])
                      .filter((m) => canSeeMessage(m, chatRoleView))
                      .map((m) => {
                        const mine = m.role === chatRoleView;
                        return (
                          <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                              mine ? "bg-[color:var(--eyenak-teal)] text-white" : "bg-white border border-slate-200 text-slate-800"
                            }`}>
                              <div className={`text-[10px] mb-1 flex items-center gap-2 ${mine ? "text-white/80" : "text-slate-400"}`}>
                                <span className="font-bold">{m.sender}</span>
                                <span>·</span>
                                <span>{m.role === "admin" ? "أدمن" : m.role === "employee" ? "موظف" : "عميل"}</span>
                                <span>·</span>
                                <span>{visibilityLabel(m.visibility)}</span>
                              </div>
                              <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                              <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-slate-400"}`}>
                                {new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Composer */}
                <div className="border-t border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
                    <span>إظهار الرسالة لـ:</span>
                    <select
                      value={chatVisibility}
                      onChange={(e) => setChatVisibility(e.target.value as ChatVisibility)}
                      className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                    >
                      <option value="all">الجميع (أدمن + موظف + عميل)</option>
                      {chatRoleView !== "client" && (
                        <option value="admin-employee">الأدمن + الموظف فقط</option>
                      )}
                      {chatRoleView !== "employee" && (
                        <option value="admin-client">الأدمن + العميل فقط</option>
                      )}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim()}
                      className="h-10 px-4 rounded-md bg-[color:var(--eyenak-teal)] text-white flex items-center gap-2 disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال</span>
                    </button>
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder="اكتب رسالة..."
                      className="flex-1 h-10 px-3 border border-slate-200 rounded-md text-sm text-right bg-white"
                    />
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Members management modal */}
      {membersModalOpen && chatProject && isAdmin && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setMembersModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-[color:var(--eyenak-teal)]" />
                أعضاء مجموعة: {chatProject}
              </h3>
              <button
                onClick={() => setMembersModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {(chatMembers[chatProject] ?? []).map((m) => (
                <li
                  key={m}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{m}</span>
                  {m !== "الأدمن" && (
                    <button
                      onClick={() => removeChatMember(chatProject, m)}
                      className="text-rose-500 hover:text-rose-700 text-xs"
                    >
                      إزالة
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 pt-4">
              <div className="text-xs text-slate-500 mb-2">إضافة من الموظفين:</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {employees
                  .filter((e) => !(chatMembers[chatProject] ?? []).includes(e.name))
                  .map((e) => (
                    <button
                      key={e.id}
                      onClick={() => addChatMember(chatProject, e.name)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-100"
                    >
                      + {e.name}
                    </button>
                  ))}
                {employees.filter((e) => !(chatMembers[chatProject] ?? []).includes(e.name)).length === 0 && (
                  <span className="text-xs text-slate-400">تمت إضافة جميع الموظفين.</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mb-2">أو أدخل اسماً يدوياً:</div>
              <div className="flex items-center gap-2">
                <input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="اسم العضو"
                  className="flex-1 h-9 px-3 border border-slate-200 rounded text-sm text-right"
                />
                <button
                  onClick={() => {
                    addChatMember(chatProject, newMemberName);
                    setNewMemberName("");
                  }}
                  disabled={!newMemberName.trim()}
                  className="h-9 px-3 rounded bg-[color:var(--eyenak-teal)] text-white text-sm disabled:opacity-40"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Notes / Reminders overlay */}
      {notesViewOpen && (
        <div
          dir="rtl"
          className="fixed top-14 left-0 right-20 bottom-0 z-40 overflow-hidden shadow-2xl rounded-tl-2xl"
          style={{
            background:
              "radial-gradient(circle at 20% 10%, #fef3c7 0%, transparent 40%), radial-gradient(circle at 80% 90%, #fce7f3 0%, transparent 40%), linear-gradient(135deg, #fffbeb, #fef9c3)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur border-b border-amber-200">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                <StickyNote className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-800">قائمة المذكرات</h2>
                <p className="text-xs text-slate-500">ملاحظات سريعة ومنبهات للموظف أو الأدمن أو أي شخص</p>
              </div>
            </div>
            <button
              onClick={() => setNotesViewOpen(false)}
              className="p-2 rounded-lg hover:bg-white/80 text-slate-500"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex h-[calc(100%-65px)]">
            {/* Compose panel */}
            <aside className="w-80 bg-white/60 backdrop-blur border-l border-amber-200 p-4 overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" /> إضافة مذكرة جديدة
              </h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="اكتب مذكرة أو تذكير..."
                rows={4}
                className="w-full p-3 rounded-lg border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              />
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">اللون</label>
                <div className="flex gap-2">
                  {["#fde68a", "#bae6fd", "#bbf7d0", "#fbcfe8", "#ddd6fe", "#fecaca"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNoteColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        noteColor === c ? "border-slate-800 scale-110" : "border-white"
                      } shadow`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">للموجَّه إلى</label>
                <select
                  value={noteTarget}
                  onChange={(e) => setNoteTarget(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-amber-200 bg-white text-sm"
                >
                  <option>الجميع</option>
                  <option>الأدمن</option>
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <AlarmClock className="w-3.5 h-3.5 text-amber-600" /> منبه (اختياري)
                </label>
                <input
                  type="datetime-local"
                  value={noteReminder}
                  onChange={(e) => setNoteReminder(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-amber-200 bg-white text-sm"
                />
              </div>
              <button
                onClick={() => {
                  if (!noteText.trim()) return;
                  setNotes((prev) => [
                    {
                      id: `n_${Date.now()}`,
                      text: noteText.trim(),
                      color: noteColor,
                      author: currentUser,
                      target: noteTarget,
                      reminder: noteReminder ? new Date(noteReminder).toISOString() : null,
                      createdAt: Date.now(),
                    },
                    ...prev,
                  ]);
                  setNoteText("");
                  setNoteReminder("");
                }}
                disabled={!noteText.trim()}
                className="mt-4 w-full h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Pin className="w-4 h-4" /> تعليق المذكرة
              </button>
            </aside>

            {/* Notes board */}
            <div className="flex-1 p-6 overflow-y-auto">
              {notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <StickyNote className="w-16 h-16 mb-3 opacity-40" />
                  <p className="text-sm">لا توجد مذكرات بعد — أضف أول مذكرة من اليمين</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {notes.map((n, i) => {
                    const rotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];
                    const rot = rotations[i % rotations.length];
                    const hasReminder = !!n.reminder;
                    const reminderDate = hasReminder ? new Date(n.reminder!) : null;
                    const isPast = reminderDate ? reminderDate.getTime() <= Date.now() : false;
                    return (
                      <div
                        key={n.id}
                        className={`relative ${rot} hover:rotate-0 hover:scale-105 transition-transform duration-200 rounded-md shadow-lg p-4 pt-7 min-h-[180px] flex flex-col`}
                        style={{
                          backgroundColor: n.color,
                          boxShadow: "0 10px 20px -8px rgba(0,0,0,0.25), 0 4px 6px -2px rgba(0,0,0,0.1)",
                        }}
                      >
                        {/* Pin */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 ring-2 ring-red-700 shadow-md flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-200" />
                        </div>
                        {/* Delete */}
                        <button
                          onClick={() => setNotes((p) => p.filter((x) => x.id !== n.id))}
                          className="absolute top-1.5 right-1.5 p-1 rounded text-slate-600/60 hover:text-red-600 hover:bg-white/40"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-sm text-slate-800 leading-relaxed flex-1 whitespace-pre-wrap font-medium">
                          {n.text}
                        </p>
                        <div className="mt-3 pt-2 border-t border-black/10 text-[10px] text-slate-700 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">↪ {n.target}</span>
                            <span className="opacity-70">{n.author}</span>
                          </div>
                          {hasReminder && (
                            <div
                              className={`flex items-center gap-1 font-semibold ${
                                isPast ? "text-red-700" : "text-slate-700"
                              }`}
                            >
                              {isPast ? <BellRing className="w-3 h-3 animate-pulse" /> : <AlarmClock className="w-3 h-3" />}
                              <span>
                                {reminderDate!.toLocaleString("ar", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminder fired notification */}
      {firedReminder && (
        <div
          dir="rtl"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] bg-white rounded-xl shadow-2xl border border-amber-300 p-4 w-96 flex items-start gap-3 animate-in"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 animate-pulse" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-800 mb-1">حان وقت التذكير!</div>
            <p className="text-xs text-slate-600 line-clamp-3">{firedReminder.text}</p>
            <div className="text-[10px] text-slate-500 mt-1">↪ {firedReminder.target}</div>
          </div>
          <button
            onClick={() => setFiredReminder(null)}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ====== شاشة تسجيل دخول الموظف ====== */}
      {loginOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLoginOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            dir="rtl"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-[color:var(--eyenak-teal)] text-white flex items-center justify-center mb-2">
                <User className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">تسجيل دخول الموظف</h2>
              <p className="text-xs text-slate-500">أدخل اسم المستخدم وكلمة المرور التي زوّدك بها المدير</p>
            </div>
            <div className="space-y-3 text-right">
              <input
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full h-11 border border-slate-300 rounded px-3 text-sm focus:outline-none focus:border-[color:var(--eyenak-teal)]"
              />
              <input
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                type="password"
                placeholder="كلمة المرور"
                className="w-full h-11 border border-slate-300 rounded px-3 text-sm focus:outline-none focus:border-[color:var(--eyenak-teal)]"
              />
              {loginErr && <div className="text-xs text-red-600 text-right">{loginErr}</div>}
              <button
                onClick={() => {
                  const emp = employees.find(
                    (e) => e.username === loginUser.trim() && e.password === loginPass
                  );
                  if (!emp) { setLoginErr("بيانات الدخول غير صحيحة"); return; }
                  if (!emp.active) { setLoginErr("الحساب موقوف"); return; }
                  setCurrentUser(emp.name);
                  setIsAdmin(false);
                  setLoginErr("");
                  setLoginUser("");
                  setLoginPass("");
                  setLoginOpen(false);
                }}
                className="w-full h-11 rounded bg-[color:var(--eyenak-teal)] text-white text-sm font-bold hover:opacity-90"
              >
                دخول
              </button>
              <button
                onClick={() => setLoginOpen(false)}
                className="w-full h-9 rounded border border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-2 text-[11px] text-slate-400">أو</span></div>
              </div>
              <button
                onClick={() => {
                  // تسجيل دخول جوجل: يتطلب تفعيل Lovable Cloud لتوصيله فعلياً
                  setLoginErr("لتفعيل تسجيل الدخول بجوجل، يلزم تفعيل Lovable Cloud من الإعدادات.");
                }}
                className="w-full h-11 rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41.2 35.8 44 30.4 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
                متابعة باستخدام Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة رابط دخول الموظف للمشاركة */}
      {linkEmp && (
        <div
          className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLinkEmp(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setLinkEmp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-800">رابط دخول الموظف</h2>
            </div>
            <div className="text-sm text-slate-600 mb-3 text-right">
              شارك الرابط التالي مع <b>{linkEmp.name}</b> ليدخل مباشرة دون كتابة كلمة المرور، أو زوّده بـ
              اسم المستخدم والرمز يدوياً.
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-3 text-xs text-right space-y-1">
              <div className="flex justify-between"><span className="font-mono text-slate-700">{linkEmp.username}</span><span className="text-slate-500">اسم المستخدم</span></div>
              <div className="flex justify-between"><span className="font-mono text-slate-700">{linkEmp.password}</span><span className="text-slate-500">كلمة المرور</span></div>
            </div>
            <div className="bg-slate-900 text-slate-100 rounded p-3 text-[11px] font-mono break-all text-left mb-3 max-h-28 overflow-y-auto">
              {buildLoginLink(linkEmp)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const link = buildLoginLink(linkEmp);
                  navigator.clipboard?.writeText(link);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 1800);
                }}
                className="h-10 rounded bg-[color:var(--eyenak-teal)] text-white text-sm flex items-center justify-center gap-2 hover:opacity-90"
              >
                <Copy className="w-4 h-4" />
                {linkCopied ? "تم النسخ ✓" : "نسخ الرابط"}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `مرحباً ${linkEmp.name}، هذا رابط دخولك إلى منصة يسير:\n${buildLoginLink(linkEmp)}\nاسم المستخدم: ${linkEmp.username}\nالرمز: ${linkEmp.password}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded border border-emerald-500 text-emerald-600 text-sm flex items-center justify-center gap-2 hover:bg-emerald-50"
              >
                <Send className="w-4 h-4" />
                مشاركة عبر واتساب
              </a>
              {linkEmp.email && (
                <a
                  href={`mailto:${linkEmp.email}?subject=${encodeURIComponent("بيانات دخولك إلى منصة يسير")}&body=${encodeURIComponent(
                    `مرحباً ${linkEmp.name}،\n\nرابط الدخول المباشر:\n${buildLoginLink(linkEmp)}\n\nاسم المستخدم: ${linkEmp.username}\nالرمز: ${linkEmp.password}`
                  )}`}
                  className="col-span-2 h-10 rounded border border-slate-300 text-slate-700 text-sm flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  <Send className="w-4 h-4" />
                  إرسال إلى البريد ({linkEmp.email})
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* المساعد الذكي — زر عائم + لوحة محادثة */}
      <button
        onClick={() => setAiOpen((v) => !v)}
        aria-label="المساعد الذكي"
        className="fixed bottom-5 left-5 z-[55] w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-[color:var(--eyenak-teal)] to-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Bot className="w-7 h-7" />
      </button>

      {/* مركز الأدوات — Widgets Center */}
      {meetingsOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={() => setMeetingsOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[88vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <button onClick={() => setMeetingsOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Video className="w-5 h-5 text-red-500" /> الاجتماعات</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-5 overflow-auto">
              {/* Create form */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">+ اجتماع جديد</h3>
                <input value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="عنوان الاجتماع" className="w-full h-10 border border-slate-300 rounded px-3 text-sm" />
                <input type="datetime-local" value={meetingForm.date} onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })} className="w-full h-10 border border-slate-300 rounded px-3 text-sm" />
                <select value={meetingForm.organizer} onChange={(e) => setMeetingForm({ ...meetingForm, organizer: e.target.value })} className="w-full h-10 border border-slate-300 rounded px-3 text-sm">
                  <option value="">المنظم (اختر)</option>
                  <option value="الأدمن">الأدمن</option>
                  {employees.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
                <input value={meetingForm.attendees} onChange={(e) => setMeetingForm({ ...meetingForm, attendees: e.target.value })} placeholder="المدعوون (موظفين/عملاء — مفصولين بفاصلة)" className="w-full h-10 border border-slate-300 rounded px-3 text-sm" list="meeting-attendees" />
                <datalist id="meeting-attendees">
                  {employees.map((e) => <option key={e.id} value={e.name} />)}
                </datalist>
                <input value={meetingForm.location} onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} placeholder="المكان أو رابط الاجتماع" className="w-full h-10 border border-slate-300 rounded px-3 text-sm" />
                <textarea value={meetingForm.notes} onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })} placeholder="ملاحظات / جدول الأعمال" className="w-full h-20 border border-slate-300 rounded px-3 py-2 text-sm resize-none" />
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">طريقة الإشعار</div>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={meetingForm.notifyInApp} onChange={(e) => setMeetingForm({ ...meetingForm, notifyInApp: e.target.checked })} /> داخل المنصة (واجهة المستخدم)</label>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={meetingForm.notifyEmail} onChange={(e) => setMeetingForm({ ...meetingForm, notifyEmail: e.target.checked })} /> بريد إلكتروني</label>
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={meetingForm.notifyWhatsapp} onChange={(e) => setMeetingForm({ ...meetingForm, notifyWhatsapp: e.target.checked })} /> واتساب</label>
                  {meetingForm.notifyEmail && (
                    <input value={meetingForm.email} onChange={(e) => setMeetingForm({ ...meetingForm, email: e.target.value })} placeholder="بريد المستلم (اختياري)" className="w-full h-9 border border-slate-300 rounded px-3 text-xs" />
                  )}
                  {meetingForm.notifyWhatsapp && (
                    <input value={meetingForm.phone} onChange={(e) => setMeetingForm({ ...meetingForm, phone: e.target.value })} placeholder="رقم واتساب (مع رمز الدولة)" className="w-full h-9 border border-slate-300 rounded px-3 text-xs" />
                  )}
                </div>
                {meetingMsg && (
                  <div className={`text-xs ${meetingMsg.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{meetingMsg.text}</div>
                )}
                <button onClick={submitMeeting} className="w-full h-10 rounded bg-[color:var(--eyenak-teal)] text-white text-sm font-bold hover:opacity-90">إنشاء وإرسال</button>
              </div>

              {/* List */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-800 text-sm mb-3">الاجتماعات القادمة ({meetings.length})</h3>
                {meetings.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8">لا توجد اجتماعات بعد</div>
                ) : (
                  <ul className="space-y-3 max-h-[55vh] overflow-auto">
                    {meetings.map((m) => {
                      const links = meetingShareLinks(m);
                      const waUrl = meetingForm.phone
                        ? links.wa.replace("wa.me/?", `wa.me/${meetingForm.phone.replace(/\D/g, "")}?`)
                        : links.wa;
                      const mailUrl = meetingForm.email
                        ? links.mail.replace("mailto:?", `mailto:${meetingForm.email}?`)
                        : links.mail;
                      return (
                        <li key={m.id} className="border border-slate-100 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-[10px] text-slate-500">{new Date(m.date).toLocaleString("ar-EG")}</span>
                            <span className="font-bold text-slate-800 text-sm">{m.title}</span>
                          </div>
                          <div className="text-xs text-slate-500">المنظم: {m.organizer}</div>
                          {m.location && <div className="text-xs text-slate-500">المكان: {m.location}</div>}
                          {m.attendees.length > 0 && (
                            <div className="text-xs text-slate-500 mt-1">المدعوون: {m.attendees.join("، ")}</div>
                          )}
                          {m.notes && <div className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded">{m.notes}</div>}
                          <div className="flex items-center gap-2 mt-2">
                            {m.channels.whatsapp && (
                              <a href={waUrl} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200">واتساب</a>
                            )}
                            {m.channels.email && (
                              <a href={mailUrl} className="text-[10px] px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">بريد إلكتروني</a>
                            )}
                            {m.channels.inApp && (
                              <span className="text-[10px] px-2 py-1 rounded bg-amber-100 text-amber-700">إشعار داخل المنصة</span>
                            )}
                            <button onClick={() => setMeetings((p) => p.filter((x) => x.id !== m.id))} className="text-[10px] mr-auto text-red-500 hover:underline">حذف</button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {financeOpen && (
        <FinanceModal
          isAdmin={isAdmin}
          currentUser={currentUser}
          employees={employees.map((e) => e.name)}
          projectMeta={projectMeta}
          onClose={() => setFinanceOpen(false)}
          onUpdatePayment={(project, paymentId, patch) => {
            setProjectMeta((m) => {
              const cur = m[project];
              if (!cur) return m;
              return {
                ...m,
                [project]: {
                  ...cur,
                  contract: {
                    ...cur.contract,
                    payments: cur.contract.payments.map((p) =>
                      p.id === paymentId ? { ...p, ...patch } : p,
                    ),
                  },
                },
              };
            });
          }}
          onAddPayment={(project) => {
            setProjectMeta((m) => {
              const cur = m[project];
              if (!cur) return m;
              return {
                ...m,
                [project]: {
                  ...cur,
                  contract: {
                    ...cur.contract,
                    payments: [
                      ...cur.contract.payments,
                      {
                        id: `pay-${Date.now()}`,
                        amount: "",
                        date: new Date().toISOString().slice(0, 10),
                        paid: false,
                      },
                    ],
                  },
                },
              };
            });
          }}
          onRemovePayment={(project, paymentId) => {
            setProjectMeta((m) => {
              const cur = m[project];
              if (!cur) return m;
              return {
                ...m,
                [project]: {
                  ...cur,
                  contract: {
                    ...cur.contract,
                    payments: cur.contract.payments.filter((p) => p.id !== paymentId),
                  },
                },
              };
            });
          }}
        />
      )}

      {guidesOpen && (
        <GuidesModal
          isAdmin={isAdmin}
          active={activeGuide}
          setActive={setActiveGuide}
          videos={guideVideos}
          setVideo={(id, url) => setGuideVideos((v) => ({ ...v, [id]: url }))}
          images={guideImages}
          setImage={(id, url) => setGuideImages((v) => ({ ...v, [id]: url }))}
          onClose={() => setGuidesOpen(false)}
        />
      )}

      {widgetsOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={() => setWidgetsOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <button onClick={() => setWidgetsOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold text-slate-800">مركز الأدوات</h2>
            </div>
            <div className="p-5 overflow-auto">
              <p className="text-xs text-slate-500 mb-4 text-center">اختر الأدوات التي تريد إظهارها على لوحة التحكم</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {ALL_WIDGETS.map((w) => {
                  const on = !!enabledWidgets[w.key];
                  return (
                    <div key={w.key} className={`border rounded-lg p-3 transition ${on ? "border-[color:var(--eyenak-teal)] bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
                      <div className="text-sm font-bold text-slate-800 mb-1">{w.label}</div>
                      <div className="text-[11px] text-slate-500 mb-2 line-clamp-2 min-h-[28px]">{w.desc}</div>
                      <button
                        onClick={() => toggleWidget(w.key)}
                        className={`w-full text-xs py-1.5 rounded ${on ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-[color:var(--eyenak-teal)] text-white hover:opacity-90"}`}
                      >
                        {on ? "إزالة" : "+ إضافة"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {aiOpen && (
        <div
          dir="rtl"
          className="fixed bottom-24 left-5 z-[55] w-[360px] max-w-[92vw] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[color:var(--eyenak-teal)] to-emerald-500 text-white">
            <button onClick={() => setAiOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-bold text-sm">مساعد يسير</div>
                <div className="text-[10px] opacity-90">{isAdmin ? "وضع المدير" : `الموظف: ${currentUser}`}</div>
              </div>
              <Bot className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-slate-200 text-slate-800 rounded-tr-2xl rounded-bl-md"
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-2xl rounded-br-md"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-end">
                <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-500">
                  يفكر…
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const text = aiInput.trim();
              if (!text || aiLoading) return;
              const nextMsgs: AIMsg[] = [...aiMessages, { role: "user", content: text }];
              setAiMessages(nextMsgs);
              setAiInput("");
              setAiLoading(true);
              try {
                const ctx = isAdmin
                  ? `الدور: مدير. عدد الموظفين: ${employees.length}.`
                  : `الدور: موظف باسم ${currentUser}. الصلاحيات المفتوحة: ${
                      currentEmployee
                        ? PERMS.filter((p) => currentEmployee.perms[p.key]).map((p) => p.label).join("، ") || "لا توجد"
                        : "—"
                    }.`;
                const res = await callAssistant({
                  data: {
                    messages: nextMsgs.map((m) => ({ role: m.role, content: m.content })),
                    context: ctx,
                  },
                });
                if (res.ok) {
                  setAiMessages((prev) => [...prev, { role: "assistant", content: res.reply || "…" }]);
                } else {
                  setAiMessages((prev) => [...prev, { role: "assistant", content: `تعذّر الرد: ${res.error}` }]);
                }
              } catch (err) {
                setAiMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: "حصل خطأ بالاتصال، حاول مرة ثانية." },
                ]);
              } finally {
                setAiLoading(false);
              }
            }}
            className="border-t border-slate-200 p-2 bg-white flex items-center gap-2"
          >
            <button
              type="submit"
              disabled={aiLoading || !aiInput.trim()}
              className="w-9 h-9 rounded-full bg-[color:var(--eyenak-teal)] text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="اسأل عن أي شيء داخل المنصة…"
              className="flex-1 h-9 px-3 text-sm border border-slate-300 rounded-full focus:outline-none focus:border-[color:var(--eyenak-teal)]"
            />
          </form>
        </div>
      )}

      {/* قائمة المزيد */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMoreMenuOpen(false)}>
          <div dir="rtl" onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{t("المزيد من الأدوات","More tools")}</h3>
              <button onClick={() => setMoreMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Bot, label: t("المساعد الذكي","AI"), action: () => { setMoreMenuOpen(false); setAiOpen(true); } },
                { icon: Printer, label: t("طباعة","Print"), action: () => { setMoreMenuOpen(false); window.print(); } },
                { icon: Globe, label: t("تبديل اللغة","Language"), action: () => { setLang((l) => l === "ar" ? "en" : "ar"); setMoreMenuOpen(false); } },
                { icon: User, label: t("الأعضاء","Members"), action: () => { setMoreMenuOpen(false); setMembersOpen(true); } },
                { icon: HelpCircle, label: t("الإرشادات","Guides"), action: () => { setMoreMenuOpen(false); setGuidesOpen(true); } },
                { icon: Wallet, label: t("المالية","Finance"), action: () => { setMoreMenuOpen(false); setFinanceOpen(true); } },
              ].map((it) => {
                const I = it.icon;
                return (
                  <button key={it.label} onClick={it.action} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-slate-200 hover:border-[color:var(--eyenak-teal)] hover:bg-teal-50 transition">
                    <I className="w-5 h-5 text-[color:var(--eyenak-teal)]" />
                    <span className="text-xs font-semibold text-slate-700">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* حسابي */}
      {accountOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAccountOpen(false)}>
          <div dir="rtl" onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{t("حسابي","My account")}</h3>
              <button onClick={() => setAccountOpen(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-l from-teal-50 to-white border border-slate-200">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[color:var(--eyenak-teal)] to-[color:var(--eyenak-dark)] text-white flex items-center justify-center font-bold text-xl">{currentUser.charAt(0)}</div>
              <div>
                <div className="font-bold text-slate-800">{currentUser}</div>
                <div className="text-xs text-slate-500">{isAdmin ? t("مدير النظام","Admin") : t("موظف","Employee")}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 border-b border-slate-100"><span className="text-slate-500">{t("البريد الإلكتروني","Email")}</span><span className="text-slate-800">{currentEmployee?.email ?? "ehab@example.com"}</span></div>
              <div className="flex justify-between p-2 border-b border-slate-100"><span className="text-slate-500">{t("اسم المستخدم","Username")}</span><span className="text-slate-800">{currentEmployee?.username ?? "—"}</span></div>
              <div className="flex justify-between p-2 border-b border-slate-100"><span className="text-slate-500">{t("الدور","Role")}</span><span className="text-slate-800">{isAdmin ? "Admin" : "Employee"}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* إعدادات الموقع */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
          <div dir="rtl" onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{t("إعدادات الموقع","Site settings")}</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-700">{t("اللغة","Language")}</span>
                <button onClick={() => setLang((l) => l === "ar" ? "en" : "ar")} className="px-3 py-1 rounded bg-[color:var(--eyenak-teal)] text-white text-xs font-semibold">{isEn ? "English" : "العربية"}</button>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-700">{t("الإشعارات","Notifications")}</span>
                <span className="text-xs text-emerald-600 font-semibold">{t("مفعّلة","Enabled")}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-700">{t("وضع المدير","Admin mode")}</span>
                <button onClick={() => setIsAdmin((v) => !v)} className={`px-3 py-1 rounded text-xs font-semibold ${isAdmin ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>{isAdmin ? "ON" : "OFF"}</button>
              </div>
              <div className="p-3 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 text-center">
                {t("مزيد من الإعدادات قريباً","More settings coming soon")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تذييل الصفحة - حقوق التطوير */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-4 px-4">
        <div className="text-center text-xs text-slate-500">
          <span className="font-semibold text-slate-600">برمجة وتطوير</span>
          <span className="mx-1.5 text-[color:var(--eyenak-teal)] font-bold">ايهاب المزلم</span>
          <span className="opacity-60">© {new Date().getFullYear()} يسير</span>
        </div>
      </footer>

      <AdminPanel
        open={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        employees={employees as any}
        setEmployees={setEmployees as any}
        perms={PERMS as any}
        defaultPerms={defaultEmpPerms as any}
      />

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

type DPayment = {
  id: string;
  amount: string;
  date: string;
  paid: boolean;
  receiptName?: string;
  receiptData?: string;
  paidAmount?: string;          // المبلغ المدفوع من القسط
  periodStart?: string;         // بداية فترة الاستحقاق
  periodEnd?: string;           // نهاية فترة الاستحقاق
  taxInvoiceName?: string;      // الفاتورة الضريبية
  taxInvoiceData?: string;
};
type DContract = {
  startDate: string;
  endDate: string;
  value: string;
  payments: DPayment[];
  responsibleName: string;
  responsiblePhone: string;
  assignee: string;
};
type DStatus = "جديد" | "جاري العمل" | "تم الانجاز" | "معلق" | "ملغي";
type DPriority = "لاشيء" | "منخفض" | "متوسط" | "عالي";
type DTask = {
  id: string;
  name: string;
  platform: string;
  beneficiary: string;
  documentNo: string;
  startDate: string;
  endDate: string;
  doneDate: string;
  status: DStatus;
  priority: DPriority;
  progress: number;
  attachmentName?: string;
  attachmentData?: string;
};
type DMeta = { contract: DContract; tasks: DTask[] };

type DColType =
  | "text" | "number" | "date" | "link" | "phone" | "email"
  | "rating" | "tags" | "location" | "timer" | "people" | "vote"
  | "daterange" | "select" | "file";

const COL_TYPE_OPTIONS: { type: DColType; label: string; icon: string }[] = [
  { type: "people",   label: "الأشخاص",       icon: "👥" },
  { type: "text",     label: "نص",            icon: "T"  },
  { type: "date",     label: "التاريخ",       icon: "📅" },
  { type: "daterange",label: "مؤقت زمني (من/إلى)", icon: "⏳" },
  { type: "number",   label: "رقم",           icon: "#"  },
  { type: "select",   label: "قائمة منسدلة",  icon: "▾"  },
  { type: "tags",     label: "وسوم",          icon: "🏷️" },
  { type: "link",     label: "الرابط",        icon: "🔗" },
  { type: "phone",    label: "رقم التواصل",   icon: "📱" },
  { type: "email",    label: "بريد إلكتروني", icon: "✉️" },
  { type: "location", label: "الموقع",        icon: "📍" },
  { type: "rating",   label: "التقييم",       icon: "⭐" },
  { type: "timer",    label: "متابعة الوقت",  icon: "⏱️" },
  { type: "vote",     label: "التصويت",       icon: "✅" },
  { type: "file",     label: "رفع مستند",     icon: "📎" },
];

function Countdown({ start, end, status }: { start: string; end: string; status: DStatus }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (status === "تم الانجاز") {
    return (
      <div className="w-28">
        <div className="h-2 rounded-full bg-emerald-500" />
        <div className="text-[10px] text-emerald-600 font-bold text-center mt-0.5">مكتملة</div>
      </div>
    );
  }
  if (status === "ملغي") {
    return (
      <div className="w-28">
        <div className="h-2 rounded-full bg-zinc-300" />
        <div className="text-[10px] text-zinc-500 font-bold text-center mt-0.5">ملغية</div>
      </div>
    );
  }
  if (!end) return <span className="text-xs text-slate-400">—</span>;
  const endMs = new Date(end + "T23:59:59").getTime();
  const startMs = start ? new Date(start).getTime() : endMs - 7 * 86_400_000;
  const total = Math.max(1, endMs - startMs);
  const elapsed = Math.max(0, now - startMs);
  const pct = Math.min(100, Math.round((elapsed / total) * 100));
  const diff = endMs - now;
  const overdue = diff <= 0;
  // green -> yellow -> red gradient by percent
  let barColor = "bg-emerald-500";
  if (pct >= 80) barColor = "bg-red-500";
  else if (pct >= 60) barColor = "bg-amber-500";
  else if (pct >= 40) barColor = "bg-yellow-400";
  if (overdue) barColor = "bg-red-600";
  const days = Math.floor(Math.abs(diff) / 86_400_000);
  const label = overdue ? `متأخر ${days}ي` : `باقي ${days}ي`;
  return (
    <div className="w-28" title={label}>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${overdue ? 100 : pct}%` }} />
      </div>
      <div className={`text-[10px] font-bold text-center mt-0.5 ${overdue ? "text-red-600" : pct >= 80 ? "text-red-600" : pct >= 60 ? "text-amber-600" : "text-emerald-700"}`}>
        {label}
      </div>
    </div>
  );
}

function ProjectDetailOverlay({
  name,
  meta,
  isAdmin,
  currentUser,
  employeeCanEdit,
  onClose,
  onUpdate,
  onOpenChat,
  onOpenFiles,
  employees,
  taskChats,
  onUpdateTaskChat,
  customCols,
  onUpdateCustomCols,
  customCells,
  onSetCustomCell,
}: {
  name: string;
  meta: DMeta | undefined;
  isAdmin: boolean;
  currentUser: string;
  employeeCanEdit?: boolean;
  onClose: () => void;
  onUpdate: (updater: (cur: DMeta) => DMeta) => void;
  onOpenChat?: () => void;
  onOpenFiles?: () => void;
  employees: string[];
  taskChats: Record<string, { allowed: string[]; msgs: { id: string; author: string; text: string; ts: number }[] }>;
  onUpdateTaskChat: (
    taskId: string,
    updater: (
      cur: { allowed: string[]; msgs: { id: string; author: string; text: string; ts: number }[] }
    ) => { allowed: string[]; msgs: { id: string; author: string; text: string; ts: number }[] }
  ) => void;
  customCols: { id: string; name: string; type: DColType; options?: { id: string; label: string; color: string }[] }[];
  onUpdateCustomCols: (
    updater: (
      cur: { id: string; name: string; type: DColType; options?: { id: string; label: string; color: string }[] }[]
    ) => { id: string; name: string; type: DColType; options?: { id: string; label: string; color: string }[] }[]
  ) => void;
  customCells: Record<string, string>;
  onSetCustomCell: (taskId: string, colId: string, val: string) => void;
}) {
  const fallback: DMeta = {
    contract: {
      startDate: "",
      endDate: "",
      value: "",
      payments: [],
      responsibleName: "",
      responsiblePhone: "",
      assignee: "",
    },
    tasks: [],
  };
  const data = meta ?? fallback;
  const isAssignee = data.contract.assignee === currentUser;
  const canView = isAdmin || isAssignee || !data.contract.assignee;
  const canEditAll = isAdmin;
  const canEditOwn = isAdmin || (isAssignee && !!employeeCanEdit);

  const addTask = () => {
    onUpdate((cur) => ({
      ...cur,
      tasks: [
        {
          id: `${Date.now()}`,
          name: "مهمة جديدة",
          platform: "",
          beneficiary: "",
          documentNo: "",
          startDate: new Date().toISOString().slice(0, 10),
          endDate: "",
          doneDate: "",
          status: "جديد",
          priority: "لاشيء",
          progress: 0,
        },
        ...cur.tasks,
      ],
    }));
  };
  const updateTask = (id: string, patch: Partial<DTask>) => {
    onUpdate((cur) => ({
      ...cur,
      tasks: cur.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  };
  const removeTask = (id: string) => {
    onUpdate((cur) => ({ ...cur, tasks: cur.tasks.filter((t) => t.id !== id) }));
  };

  const onAttach = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      updateTask(id, {
        attachmentName: file.name,
        attachmentData: typeof reader.result === "string" ? reader.result : "",
      });
    reader.readAsDataURL(file);
  };

  const paidCount = data.contract.payments.filter((p) => p.paid).length;
  const statusColors: Record<DStatus, string> = {
    "جديد": "bg-slate-200 text-slate-700",
    "جاري العمل": "bg-amber-100 text-amber-700",
    "تم الانجاز": "bg-emerald-100 text-emerald-700",
    "معلق": "bg-rose-100 text-rose-700",
    "ملغي": "bg-zinc-200 text-zinc-500 line-through",
  };
  const priorityColors: Record<DPriority, string> = {
    "لاشيء": "bg-slate-100 text-slate-500",
    "منخفض": "bg-sky-100 text-sky-700",
    "متوسط": "bg-amber-100 text-amber-700",
    "عالي": "bg-red-100 text-red-700",
  };

  // Right-click column menu state
  const [colMenu, setColMenu] = useState<{ x: number; y: number; insertAt: number } | null>(null);
  const openColMenu = (e: React.MouseEvent, insertAt: number) => {
    e.preventDefault();
    setColMenu({ x: e.clientX, y: e.clientY, insertAt });
  };
  const addColumn = (type: DColType, insertAt: number) => {
    const name = window.prompt("اسم العمود الجديد:", COL_TYPE_OPTIONS.find((o) => o.type === type)?.label ?? "عمود");
    if (!name) { setColMenu(null); return; }
    const id = `c${Date.now()}`;
    onUpdateCustomCols((cur) => {
      const next = [...cur];
      next.splice(Math.max(0, Math.min(insertAt, next.length)), 0, { id, name, type });
      return next;
    });
    setColMenu(null);
  };
  const removeColumn = (id: string) => {
    if (!window.confirm("حذف هذا العمود؟")) return;
    onUpdateCustomCols((cur) => cur.filter((c) => c.id !== id));
  };

  // Per-task chat panel state
  const [chatTaskId, setChatTaskId] = useState<string | null>(null);
  // Select-column options editor
  const [editingSelectCol, setEditingSelectCol] = useState<string | null>(null);
  const SELECT_PALETTE = ["#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#10b981","#14b8a6","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#d946ef","#ec4899","#64748b"];
  const updateColOptions = (colId: string, opts: { id: string; label: string; color: string }[]) => {
    onUpdateCustomCols((cur) => cur.map((c) => c.id === colId ? { ...c, options: opts } : c));
  };
  const [chatDraft, setChatDraft] = useState("");
  const [memberPickOpen, setMemberPickOpen] = useState(false);
  const activeChat = chatTaskId ? (taskChats[chatTaskId] ?? { allowed: [], msgs: [] }) : null;
  const canSeeChat = (taskId: string) => {
    if (isAdmin) return true;
    const tc = taskChats[taskId];
    return !!tc && tc.allowed.includes(currentUser);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="bg-slate-50 rounded-md shadow-xl w-full max-w-7xl mt-4 min-h-[600px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 rounded-t-md">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="إغلاق">
              <X className="w-5 h-5" />
            </button>
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="h-8 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4 text-[color:var(--eyenak-teal)]" />
                <span>محادثة المشروع</span>
              </button>
            )}
            {onOpenFiles && (
              <button
                onClick={onOpenFiles}
                className="h-8 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-1"
              >
                <Folder className="w-4 h-4 text-amber-500" />
                <span>ملفات المشروع</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">{name}</h2>
            <Folder className="w-5 h-5 text-[color:var(--eyenak-teal)]" />
          </div>
        </div>

        {!canView ? (
          <div className="p-12 text-center text-slate-500">
            لا تملك صلاحية الوصول لهذا المشروع
          </div>
        ) : (
          <>
            {/* Contract bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                {canEditAll && (
                  <SplitContractButton
                    value={data.contract.value}
                    startDate={data.contract.startDate}
                    endDate={data.contract.endDate}
                    onSplit={(payments) =>
                      onUpdate((c) => ({ ...c, contract: { ...c.contract, payments } }))
                    }
                  />
                )}
                <h3 className="text-sm font-bold text-slate-700 text-right">بيانات العقد</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-right">
                <InfoCell
                  label="بداية العقد"
                  value={data.contract.startDate || "—"}
                  editable={canEditAll}
                  type="date"
                  onSave={(v) =>
                    onUpdate((c) => ({ ...c, contract: { ...c.contract, startDate: v } }))
                  }
                />
                <InfoCell
                  label="نهاية العقد"
                  value={data.contract.endDate || "—"}
                  editable={canEditAll}
                  type="date"
                  onSave={(v) =>
                    onUpdate((c) => ({ ...c, contract: { ...c.contract, endDate: v } }))
                  }
                />
                <InfoCell
                  label="قيمة العقد"
                  value={data.contract.value ? `${Number(data.contract.value).toLocaleString()} ر.س` : "—"}
                  editable={canEditAll}
                  type="number"
                  rawValue={data.contract.value}
                  onSave={(v) =>
                    onUpdate((c) => ({ ...c, contract: { ...c.contract, value: v } }))
                  }
                />
                <InfoCell
                  label="الموظف المُكلَّف"
                  value={data.contract.assignee || "—"}
                  editable={canEditAll}
                  onSave={(v) =>
                    onUpdate((c) => ({ ...c, contract: { ...c.contract, assignee: v } }))
                  }
                />
                <InfoCell
                  label="المسؤول من الشركة"
                  value={data.contract.responsibleName || "—"}
                  editable={canEditAll}
                  onSave={(v) =>
                    onUpdate((c) => ({ ...c, contract: { ...c.contract, responsibleName: v } }))
                  }
                />
                <div className="bg-slate-50 rounded border border-slate-200 p-3">
                  <div className="text-xs text-slate-500 mb-1">رقم الجوال</div>
                  {data.contract.responsiblePhone ? (
                    <a
                      href={`tel:${data.contract.responsiblePhone}`}
                      className="text-sm font-semibold text-[color:var(--eyenak-teal)] hover:underline"
                      dir="ltr"
                    >
                      {data.contract.responsiblePhone}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
                <div className="bg-slate-50 rounded border border-slate-200 p-3">
                  <div className="text-xs text-slate-500 mb-1">الدفعات</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {paidCount} / {data.contract.payments.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks table */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                {canEditOwn && (
                  <button
                    onClick={addTask}
                    className="h-9 px-4 bg-[color:var(--eyenak-teal)] hover:opacity-90 text-white rounded text-sm font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مهمة</span>
                  </button>
                )}
                <h3 className="text-base font-bold text-slate-800">المهام ({data.tasks.length})</h3>
              </div>

              <div className="overflow-auto bg-white rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 text-xs">
                    <tr>
                      <th
                        className="px-2 py-2 text-center font-semibold w-10"
                        title="محادثة المهمة الخاصة"
                      >💬</th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="name" defaultLabel="اسم المهمة" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="platform" defaultLabel="المنصة" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="beneficiary" defaultLabel="المستفيد" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="doc" defaultLabel="رقم المستند" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="period" defaultLabel="فترة المهمة" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="count" defaultLabel="العد التنازلي" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="done" defaultLabel="تاريخ الإنجاز" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="status" defaultLabel="الحالة" isAdmin={canEditAll} /></th>
                      <th className="px-2 py-2 text-right font-semibold"><EditableHeaderLabel tableId="project.tasks" headerKey="priority" defaultLabel="الأهمية" isAdmin={canEditAll} /></th>
                      <th
                        className="px-2 py-2 text-right font-semibold"
                        onContextMenu={(e) => canEditAll && openColMenu(e, customCols.length)}
                      ><EditableHeaderLabel tableId="project.tasks" headerKey="attach" defaultLabel="المرفق" isAdmin={canEditAll} /></th>
                      {customCols.map((c, idx) => (
                        <th
                          key={c.id}
                          className="px-2 py-2 text-right font-semibold whitespace-nowrap group"
                          onContextMenu={(e) => canEditAll && openColMenu(e, idx + 1)}
                        >
                          <span className="inline-flex items-center gap-1">
                            <span>{COL_TYPE_OPTIONS.find((o) => o.type === c.type)?.icon}</span>
                            <span>{c.name}</span>
                            {canEditAll && c.type === "select" && (
                              <button
                                onClick={() => setEditingSelectCol(c.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-emerald-600"
                                title="تعديل خيارات القائمة"
                              >⚙</button>
                            )}
                            {canEditAll && (
                              <button
                                onClick={() => removeColumn(c.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] mr-1"
                                title="حذف العمود"
                              >✕</button>
                            )}
                          </span>
                        </th>
                      ))}
                      {canEditAll && (
                        <th
                          className="px-2 py-2 text-center font-semibold text-slate-400 hover:text-[color:var(--eyenak-teal)] cursor-pointer"
                          title="إضافة عمود (أو انقر بزر الفأرة الأيمن على أي عنوان)"
                          onClick={(e) => openColMenu(e, customCols.length)}
                          onContextMenu={(e) => openColMenu(e, customCols.length)}
                        >+</th>
                      )}
                      {canEditOwn && <th className="px-2 py-2"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.tasks.length === 0 ? (
                      <tr>
                        <td colSpan={12 + customCols.length + (canEditAll ? 1 : 0)} className="py-12 text-center text-slate-400">
                          لا توجد مهام بعد. اضغط "إضافة مهمة" للبدء.
                        </td>
                      </tr>
                    ) : (
                      data.tasks.map((t) => (
                        <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-1 py-1 text-center">
                            {canSeeChat(t.id) ? (
                              <button
                                onClick={() => { setChatTaskId(t.id); setChatDraft(""); }}
                                className="relative inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500"
                                title="محادثة خاصة بالمهمة"
                              >
                                <MessageSquare className="w-4 h-4" />
                                {(taskChats[t.id]?.msgs.length ?? 0) > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-[color:var(--eyenak-teal)] text-white text-[9px] rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center">
                                    {taskChats[t.id]!.msgs.length}
                                  </span>
                                )}
                              </button>
                            ) : (
                              <span className="text-slate-300 text-xs" title="لا تملك صلاحية الاطلاع">—</span>
                            )}
                          </td>
                          <td className="px-1 py-1">
                            <input
                              value={t.name}
                              disabled={!canEditOwn}
                              onChange={(e) => updateTask(t.id, { name: e.target.value })}
                              className="w-32 px-2 py-1 text-right text-xs rounded focus:outline-none focus:bg-emerald-50"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              value={t.platform}
                              disabled={!canEditOwn}
                              onChange={(e) => updateTask(t.id, { platform: e.target.value })}
                              className="w-28 px-2 py-1 text-right text-xs rounded focus:outline-none focus:bg-emerald-50"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              value={t.beneficiary}
                              disabled={!canEditOwn}
                              onChange={(e) => updateTask(t.id, { beneficiary: e.target.value })}
                              className="w-28 px-2 py-1 text-right text-xs rounded focus:outline-none focus:bg-emerald-50"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              value={t.documentNo}
                              disabled={!canEditOwn}
                              onChange={(e) => updateTask(t.id, { documentNo: e.target.value })}
                              className="w-24 px-2 py-1 text-right text-xs rounded focus:outline-none focus:bg-emerald-50"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <span>من</span>
                                <input
                                  type="date"
                                  value={t.startDate}
                                  disabled={!canEditOwn}
                                  onChange={(e) => updateTask(t.id, { startDate: e.target.value })}
                                  className="px-1 py-0.5 text-[11px] rounded border border-slate-200 focus:outline-none focus:border-emerald-400"
                                />
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <span>إلى</span>
                                <input
                                  type="date"
                                  value={t.endDate}
                                  disabled={!canEditOwn}
                                  onChange={(e) => updateTask(t.id, { endDate: e.target.value })}
                                  className="px-1 py-0.5 text-[11px] rounded border border-slate-200 focus:outline-none focus:border-emerald-400"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            <Countdown start={t.startDate} end={t.endDate} status={t.status} />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="date"
                              value={t.doneDate}
                              disabled={!canEditOwn}
                              onChange={(e) => updateTask(t.id, { doneDate: e.target.value })}
                              className="px-1 py-1 text-xs rounded focus:outline-none focus:bg-emerald-50"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <select
                              value={t.status}
                              disabled={!canEditOwn}
                              onChange={(e) =>
                                updateTask(t.id, { status: e.target.value as DStatus })
                              }
                              className={`text-xs font-semibold rounded px-2 py-1 focus:outline-none ${statusColors[t.status]}`}
                            >
                              <option value="جديد">جديد</option>
                              <option value="جاري العمل">جاري العمل</option>
                              <option value="تم الانجاز">تم الانجاز</option>
                              <option value="معلق">معلق</option>
                              <option value="ملغي">ملغي</option>
                            </select>
                          </td>
                          <td className="px-1 py-1">
                            <select
                              value={t.priority}
                              disabled={!canEditOwn}
                              onChange={(e) =>
                                updateTask(t.id, { priority: e.target.value as DPriority })
                              }
                              className={`text-xs font-semibold rounded px-2 py-1 focus:outline-none ${priorityColors[t.priority]}`}
                            >
                              <option value="لاشيء">لاشيء</option>
                              <option value="منخفض">منخفض</option>
                              <option value="متوسط">متوسط</option>
                              <option value="عالي">عالي</option>
                            </select>
                          </td>
                          <td className="px-1 py-1">
                            <div className="flex items-center gap-1 justify-end">
                              {t.attachmentName ? (
                                <a
                                  href={t.attachmentData}
                                  download={t.attachmentName}
                                  className="text-xs text-[color:var(--eyenak-teal)] hover:underline truncate max-w-[120px]"
                                  title={t.attachmentName}
                                >
                                  {t.attachmentName}
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                              {canEditOwn && (
                                <>
                                  <input
                                    type="file"
                                    className="hidden"
                                    id={`att-${t.id}`}
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) onAttach(t.id, f);
                                    }}
                                  />
                                  <label
                                    htmlFor={`att-${t.id}`}
                                    className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-500"
                                    title="رفع التقرير النهائي"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                  </label>
                                </>
                              )}
                            </div>
                          </td>
                          {customCols.map((c) => {
                            const key = `${t.id}::${c.id}`;
                            const val = customCells[key] ?? "";
                            const setVal = (v: string) => onSetCustomCell(t.id, c.id, v);
                            const baseCls = "w-full px-2 py-1 text-right text-xs rounded bg-transparent focus:outline-none focus:bg-emerald-50";
                            return (
                              <td key={c.id} className="px-1 py-1 min-w-[110px]">
                                {c.type === "text" && (
                                  <input value={val} disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} />
                                )}
                                {c.type === "number" && (
                                  <input type="number" value={val} disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} />
                                )}
                                {c.type === "date" && (
                                  <input type="date" value={val} disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} />
                                )}
                                {c.type === "link" && (
                                  <input type="url" placeholder="https://" value={val} disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />
                                )}
                                {c.type === "phone" && (
                                  <input type="tel" value={val} disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />
                                )}
                                {c.type === "email" && (
                                  <input type="email" value={val} disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} dir="ltr" />
                                )}
                                {c.type === "location" && (
                                  <input value={val} placeholder="📍 الموقع" disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} />
                                )}
                                {c.type === "tags" && (
                                  <input value={val} placeholder="وسم، وسم" disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} />
                                )}
                                {c.type === "timer" && (
                                  <input value={val} placeholder="0h 0m" disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls} />
                                )}
                                {c.type === "people" && (
                                  <select value={val} disabled={!canEditOwn} onChange={(e) => setVal(e.target.value)} className={baseCls}>
                                    <option value="">—</option>
                                    {employees.map((n) => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                )}
                                {c.type === "rating" && (
                                  <div className="flex items-center gap-0.5 justify-end">
                                    {[1,2,3,4,5].map((n) => (
                                      <button
                                        key={n}
                                        type="button"
                                        disabled={!canEditOwn}
                                        onClick={() => setVal(String(n))}
                                        className={`text-sm leading-none ${Number(val) >= n ? "text-amber-400" : "text-slate-300"} disabled:opacity-60`}
                                      >★</button>
                                    ))}
                                  </div>
                                )}
                                {c.type === "vote" && (
                                  <label className="flex items-center justify-end gap-1 text-xs text-slate-600">
                                    <input type="checkbox" checked={val === "1"} disabled={!canEditOwn} onChange={(e) => setVal(e.target.checked ? "1" : "")} />
                                    <span>{val === "1" ? "موافق" : "—"}</span>
                                  </label>
                                )}
                                {c.type === "file" && (() => {
                                  const [fn, fd] = val ? val.split("|::|") : ["", ""];
                                  const inputId = `pf-${t.id}-${c.id}`;
                                  return (
                                    <div className="flex items-center gap-1 justify-end">
                                      {fn ? (
                                        <a href={fd} download={fn} className="text-[11px] text-emerald-700 hover:underline truncate max-w-[120px]">📎 {fn}</a>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">لا يوجد</span>
                                      )}
                                      {canEditOwn && (
                                        <>
                                          <input id={inputId} type="file" className="hidden" onChange={(e) => {
                                            const f = e.target.files?.[0]; if (!f) return;
                                            const r = new FileReader();
                                            r.onload = () => setVal(`${f.name}|::|${r.result as string}`);
                                            r.readAsDataURL(f);
                                          }} />
                                          <label htmlFor={inputId} className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-500" title="رفع ملف">
                                            <Upload className="w-3.5 h-3.5" />
                                          </label>
                                          {fn && <button onClick={() => setVal("")} className="p-1 text-red-400 hover:bg-red-50 rounded" title="حذف"><X className="w-3 h-3" /></button>}
                                        </>
                                      )}
                                    </div>
                                  );
                                })()}
                                {c.type === "daterange" && (() => {
                                  const [from, to] = val ? val.split("|") : ["", ""];
                                  const setRange = (f: string, tt: string) => setVal(f || tt ? `${f}|${tt}` : "");
                                  const left = to ? Math.ceil((new Date(to + "T23:59:59").getTime() - Date.now()) / 86_400_000) : null;
                                  const tone = left == null ? "border-slate-200" : left < 0 ? "border-red-300 bg-red-50" : left <= 3 ? "border-amber-300 bg-amber-50" : "border-slate-200";
                                  return (
                                    <div className={`flex flex-col gap-0.5 p-1 rounded border ${tone}`} title={left == null ? "" : left >= 0 ? `باقي ${left} يوم` : `متأخر ${Math.abs(left)} يوم`}>
                                      <div className="flex items-center gap-1 text-[10px]"><span>من</span>
                                        <input type="date" value={from} disabled={!canEditOwn} onChange={(e) => setRange(e.target.value, to)} className="text-[11px] flex-1 rounded border border-slate-200 px-1" />
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px]"><span>إلى</span>
                                        <input type="date" value={to} disabled={!canEditOwn} onChange={(e) => setRange(from, e.target.value)} className="text-[11px] flex-1 rounded border border-slate-200 px-1" />
                                      </div>
                                      {left !== null && (
                                        <div className={`text-[9px] text-center font-bold ${left < 0 ? "text-red-600" : left <= 3 ? "text-amber-600" : "text-emerald-700"}`}>
                                          {left >= 0 ? `باقي ${left} يوم` : `متأخر ${Math.abs(left)} يوم`}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                                {c.type === "select" && (() => {
                                  const opts = c.options ?? [];
                                  const cur = opts.find((o) => o.id === val);
                                  return (
                                    <select
                                      value={val}
                                      disabled={!canEditOwn}
                                      onChange={(e) => setVal(e.target.value)}
                                      className={`${baseCls} font-semibold`}
                                      style={cur ? { background: cur.color + "22", color: cur.color } : undefined}
                                    >
                                      <option value="">—</option>
                                      {opts.map((o) => <option key={o.id} value={o.id} style={{ color: o.color }}>{o.label}</option>)}
                                    </select>
                                  );
                                })()}
                              </td>
                            );
                          })}
                          {canEditAll && <td className="px-1 py-1" />}
                          {canEditOwn && (
                            <td className="px-1 py-1">
                              {isAdmin && (
                                <button
                                  onClick={() => removeTask(t.id)}
                                  className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                                  title="حذف المهمة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Column-type context menu */}
        {colMenu && (
          <div className="fixed inset-0 z-[80]" onClick={() => setColMenu(null)} onContextMenu={(e) => { e.preventDefault(); setColMenu(null); }}>
            <div
              className="absolute bg-white rounded-lg shadow-2xl border border-slate-200 p-2 grid grid-cols-2 gap-1 min-w-[260px]"
              style={{ left: Math.min(colMenu.x, window.innerWidth - 280), top: Math.min(colMenu.y, window.innerHeight - 320) }}
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="col-span-2 px-2 py-1 text-[11px] font-bold text-slate-500 border-b border-slate-100 mb-1">إضافة عمود</div>
              {COL_TYPE_OPTIONS.map((o) => (
                <button
                  key={o.type}
                  onClick={() => addColumn(o.type, colMenu.insertAt)}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded hover:bg-slate-100 text-xs text-slate-700"
                >
                  <span className="text-base w-5 text-center">{o.icon}</span>
                  <span className="font-medium">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Select-column options editor */}
        {editingSelectCol && (() => {
          const col = customCols.find((c) => c.id === editingSelectCol);
          if (!col) return null;
          const opts = col.options ?? [];
          const update = (next: { id: string; label: string; color: string }[]) => updateColOptions(col.id, next);
          return (
            <div className="fixed inset-0 z-[95] bg-black/40 flex items-center justify-center" onClick={() => setEditingSelectCol(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[95vw] p-4" dir="rtl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setEditingSelectCol(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
                  <div className="text-sm font-bold text-slate-800">خيارات «{col.name}»</div>
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-auto">
                  {opts.length === 0 && <div className="text-xs text-slate-400 text-center py-4">القائمة فارغة. أضف خياراتك الخاصة (مثل: مهم جدًا، غير مهم...).</div>}
                  {opts.map((o, i) => (
                    <div key={o.id} className="flex items-center gap-2">
                      <button onClick={() => update(opts.filter((_, k) => k !== i))} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="حذف">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <input
                        value={o.label}
                        onChange={(e) => { const n = [...opts]; n[i] = { ...o, label: e.target.value }; update(n); }}
                        className="flex-1 h-8 px-2 border border-slate-200 rounded text-xs text-right"
                        placeholder="اسم الخيار"
                      />
                      <div className="flex flex-wrap gap-0.5 justify-end max-w-[180px]">
                        {SELECT_PALETTE.map((cl) => (
                          <button
                            key={cl}
                            onClick={() => { const n = [...opts]; n[i] = { ...o, color: cl }; update(n); }}
                            className={`w-4 h-4 rounded-full border ${o.color === cl ? "ring-2 ring-offset-1 ring-slate-700" : "border-white"}`}
                            style={{ background: cl }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => update([...opts, { id: `o${Date.now()}${Math.floor(Math.random()*1000)}`, label: "خيار جديد", color: SELECT_PALETTE[opts.length % SELECT_PALETTE.length] }])}
                  className="mt-3 w-full h-8 rounded border border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
                >+ إضافة خيار</button>
              </div>
            </div>
          );
        })()}

        {/* Per-task internal chat panel */}
        {chatTaskId && (() => {
          const task = data.tasks.find((x) => x.id === chatTaskId);
          if (!task) return null;
          const tc = activeChat ?? { allowed: [], msgs: [] };
          return (
            <div className="fixed inset-0 z-[75] bg-black/40 flex" onClick={() => { setChatTaskId(null); setMemberPickOpen(false); }}>
              <div
                className="ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-l from-slate-50 to-white">
                  <button onClick={() => setChatTaskId(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">محادثة خاصة بالمهمة</div>
                    <div className="text-sm font-bold text-slate-800 truncate max-w-[260px]">{task.name}</div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                    <button
                      onClick={() => setMemberPickOpen((v) => !v)}
                      className="w-full text-right text-[11px] text-slate-600 flex items-center justify-between"
                    >
                      <span className="text-[color:var(--eyenak-teal)]">{memberPickOpen ? "إخفاء ▲" : "إدارة ▼"}</span>
                      <span>الأعضاء المسموح لهم ({tc.allowed.length})</span>
                    </button>
                    {memberPickOpen && (
                      <div className="mt-2 max-h-32 overflow-y-auto bg-white border border-slate-200 rounded p-2 space-y-1">
                        {employees.length === 0 && <div className="text-[11px] text-slate-400 text-center">لا يوجد موظفون</div>}
                        {employees.map((n) => {
                          const checked = tc.allowed.includes(n);
                          return (
                            <label key={n} className="flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  onUpdateTaskChat(chatTaskId, (cur) => ({
                                    ...cur,
                                    allowed: e.target.checked
                                      ? Array.from(new Set([...cur.allowed, n]))
                                      : cur.allowed.filter((x) => x !== n),
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
                  {tc.msgs.length === 0 && (
                    <div className="text-center text-xs text-slate-400 mt-8">
                      لا توجد رسائل بعد. {isAdmin ? "ابدأ المحادثة الخاصة بهذه المهمة." : ""}
                    </div>
                  )}
                  {tc.msgs.map((m) => {
                    const mine = m.author === currentUser;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-sm ${mine ? "bg-[color:var(--eyenak-teal)] text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
                          {!mine && <div className="text-[10px] font-bold text-[color:var(--eyenak-teal)] mb-0.5">{m.author}</div>}
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
                    <button
                      onClick={() => {
                        const text = chatDraft.trim();
                        if (!text) return;
                        onUpdateTaskChat(chatTaskId, (cur) => ({
                          allowed: cur.allowed,
                          msgs: [...cur.msgs, { id: `${Date.now()}`, author: currentUser, text, ts: Date.now() }],
                        }));
                        setChatDraft("");
                      }}
                      className="h-9 px-4 bg-[color:var(--eyenak-teal)] hover:opacity-90 text-white rounded-full text-xs font-semibold"
                    >إرسال</button>
                    <input
                      value={chatDraft}
                      onChange={(e) => setChatDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          const text = chatDraft.trim();
                          if (!text) return;
                          onUpdateTaskChat(chatTaskId, (cur) => ({
                            allowed: cur.allowed,
                            msgs: [...cur.msgs, { id: `${Date.now()}`, author: currentUser, text, ts: Date.now() }],
                          }));
                          setChatDraft("");
                        }
                      }}
                      placeholder="اكتب رسالة..."
                      className="flex-1 h-9 px-3 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-[color:var(--eyenak-teal)]"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 text-center">
                    🔒 محادثة خاصة — يراها فقط الأدمن والأعضاء المسموح لهم
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

type GuideTopic = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof HelpCircle;
  color: string;
  steps: { title: string; body: string }[];
  tips?: string[];
  image?: string;
};

const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: "dashboard",
    title: "البداية ولوحة التحكم",
    subtitle: "تعرّف على واجهة المنصة والشريط الجانبي والإشعارات",
    icon: Home,
    color: "#0ea5e9",
    image: guideDashboardImg,
    steps: [
      { title: "1. الشريط الجانبي الأيمن", body: "يحتوي على الاختصارات الرئيسية: التقويم، الملفات، المحادثة، الاجتماعات، المالية، المستخدمين، الإرشادات، الحجز. اضغط على أي أيقونة لفتحها مباشرة." },
      { title: "2. الهيدر العلوي", body: "يحتوي على البحث، الإشعارات (الجرس)، تغيير اللغة عربي/إنجليزي، ومعلومات حسابك." },
      { title: "3. لوحة التحكم", body: "تعرض ملخصًا حيًا للمشاريع، المهام، الاجتماعات القادمة، والإحصائيات. يمكنك تخصيص الأدوات الظاهرة من زر «مركز الأدوات»." },
      { title: "4. الإشعارات", body: "اضغط على أيقونة الجرس لرؤية المهام المقتربة من موعد التسليم، دعوات الاجتماعات، والتنبيهات الأخرى." },
    ],
    tips: ["استخدم زر اللغة (AR/EN) في الأعلى لتبديل واجهة المنصة بالكامل.", "تظهر النقطة الحمراء على الجرس عند وجود إشعارات جديدة."],
  },
  {
    id: "projects",
    title: "إنشاء وإدارة المشاريع",
    subtitle: "كيف تنشئ مشروعًا جديدًا وتربطه بعقد وموظف",
    icon: Folder,
    color: "#8b5cf6",
    image: guideProjectsImg,
    steps: [
      { title: "1. إنشاء مشروع جديد", body: "اضغط على زر «+ مشروع جديد» من الشريط الجانبي للمشاريع. أدخل اسم المشروع، الوصف، تاريخ البداية والنهاية." },
      { title: "2. بيانات العقد", body: "في الخطوة الثانية، أدخل قيمة العقد، اسم المسؤول من الشركة ورقم جواله، واختر الموظف المُكلَّف من القائمة." },
      { title: "3. فتح المشروع", body: "اضغط على أي مشروع من الشريط الجانبي لفتح صفحة تفاصيله: بيانات العقد، جدول المهام، المحادثة، والملفات." },
      { title: "4. تعديل بيانات العقد", body: "للأدمن فقط — اضغط على أي حقل في شريط بيانات العقد لتعديل قيمته مباشرة." },
    ],
  },
  {
    id: "tasks",
    title: "المهام ونسبة الإنجاز",
    subtitle: "إضافة مهام، تحديد الحالة، نسبة الإنجاز، والمرفقات",
    icon: ClipboardList,
    color: "#f59e0b",
    image: guideProjectsImg,
    steps: [
      { title: "1. إضافة مهمة", body: "داخل المشروع، اضغط على زر «إضافة مهمة». ستظهر صف جديد قابل للتعديل في الجدول." },
      { title: "2. تعبئة بيانات المهمة", body: "اكتب اسم المهمة، اسم المنصة، المستفيد، رقم المستند، تاريخ البداية والانتهاء." },
      { title: "3. تحديد الحالة", body: "اختر من القائمة: جديد، جاري العمل، تم، معلق. كل حالة لها لون مميز." },
      { title: "4. نسبة الإنجاز", body: "اختر النسبة (0% إلى 100%) من القائمة المنسدلة. شريط التقدّم يتحدّث تلقائيًا. عند 100% تتحوّل الحالة إلى «تم» تلقائيًا." },
      { title: "5. العد التنازلي", body: "يعرض الوقت المتبقي للموعد النهائي. يتحوّل إلى الأحمر عند آخر 24 ساعة و«متأخر» بعد انتهاء الوقت." },
      { title: "6. رفع المرفق", body: "اضغط على أيقونة الرفع في عمود المرفق لرفع التقرير النهائي للمهمة." },
    ],
    tips: ["استخدم فلتر «أنا فقط / بها / الجميع» لتصفية المهام حسب علاقتك بها.", "الموظف يرى فقط المهام المسندة إليه."],
  },
  {
    id: "finance",
    title: "المالية وأقساط العقود",
    subtitle: "تقسيم العقد إلى أقساط، رفع الإيصالات، ومتابعة الاستحقاق",
    icon: Wallet,
    color: "#16a34a",
    image: guideFinanceImg,
    steps: [
      { title: "1. تقسيم العقد", body: "افتح المشروع واضغط زر «تقسيم العقد إلى أقساط» في شريط بيانات العقد. اختر عدد الأقساط (2/3/4/6/8/12 أو مخصص)." },
      { title: "2. التقسيم التلقائي", body: "يتم توزيع قيمة العقد بالتساوي على عدد الأقساط، وتُحدَّد التواريخ تلقائيًا بين بداية ونهاية العقد." },
      { title: "3. شاشة المالية", body: "افتح «المالية» من الشريط الجانبي لرؤية كل الأقساط في كل المشاريع، مع ملخص (المستحق، المدفوع، الإجمالي، أقرب قسط)." },
      { title: "4. العد التنازلي للأقساط", body: "كل قسط له عدّاد مباشر يعرض الأيام/الساعات المتبقية. القسط المتأخر يظهر باللون الأحمر." },
      { title: "5. رفع الإيصال", body: "اضغط على أيقونة الرفع بجانب الإيصال لإرفاق صورة أو PDF. القسط يصبح «مدفوع» تلقائيًا." },
      { title: "6. الفلاتر", body: "استخدم فلاتر «الكل، المستحقة، المتأخرة، المدفوعة» لتصفية الأقساط." },
    ],
    tips: ["الموظف يرى فقط أقساط المشاريع المسندة إليه.", "تعديل المبالغ والتواريخ متاح للأدمن فقط."],
  },
  {
    id: "meetings",
    title: "الاجتماعات والإشعارات",
    subtitle: "جدولة اجتماع وإرسال دعوات عبر واتساب أو البريد",
    icon: Video,
    color: "#ef4444",
    image: guideMeetingsImg,
    steps: [
      { title: "1. فتح الاجتماعات", body: "اضغط على «الاجتماعات» في الشريط الجانبي لفتح شاشة الاجتماعات." },
      { title: "2. اجتماع جديد", body: "املأ العنوان، التاريخ والوقت، اختر المنظم من قائمة الموظفين، المدعوين، المكان أو رابط الاجتماع، والملاحظات." },
      { title: "3. طرق الإشعار", body: "اختر كيف تصل الدعوة: داخل المنصة (واجهة المستخدم)، البريد الإلكتروني، أو واتساب. يمكنك تفعيل أكثر من قناة." },
      { title: "4. إرسال الدعوة", body: "اضغط «إنشاء وإرسال». ستظهر روابط مباشرة لإرسال الدعوة عبر واتساب/البريد بمحتوى جاهز." },
      { title: "5. متابعة الاجتماعات", body: "تظهر الاجتماعات القادمة في القائمة الجانبية وعلى لوحة التحكم. الجرس يحتوي على دعوات اجتماعاتك." },
    ],
  },
  {
    id: "files",
    title: "الملفات والمجلدات",
    subtitle: "تنظيم ملفات كل مشروع وتعديل المستندات",
    icon: FileText,
    color: "#8b5cf6",
    image: guideDashboardImg,
    steps: [
      { title: "1. فتح ملفات المشروع", body: "من داخل المشروع اضغط «ملفات المشروع» أو افتح «الملفات» من الشريط الجانبي للوصول لكل الملفات." },
      { title: "2. المجلدات الافتراضية", body: "كل مشروع له مجلدات افتراضية جاهزة. يمكنك إضافة مجلدات جديدة بزر «+ مجلد»." },
      { title: "3. رفع ملف جديد", body: "اضغط «+ ملف» داخل أي مجلد لرفع ملف، أو أنشئ مستند Word/Excel جديد قابل للتعديل داخل المنصة." },
      { title: "4. تعديل المستندات", body: "اضغط على أي مستند Word لتعديله بمحرر النصوص، أو على ملف Excel لفتح المحرر الجدولي." },
    ],
  },
  {
    id: "chat",
    title: "المحادثة والتواصل",
    subtitle: "التواصل بين الأدمن والموظفين والعملاء",
    icon: MessageSquare,
    color: "#10b981",
    image: guideDashboardImg,
    steps: [
      { title: "1. محادثة المشروع", body: "كل مشروع له غرفة محادثة خاصة. افتحها من داخل المشروع أو من «المحادثة» في الشريط الجانبي." },
      { title: "2. مستويات الرؤية", body: "الأدمن يمكنه إرسال رسائل عامة (الجميع) أو رسائل داخلية (الأدمن والموظف فقط) لا يراها العميل." },
      { title: "3. الإشعارات", body: "الرسائل الجديدة تظهر إشعارًا في الجرس وتُسلَّط في قائمة المشاريع." },
    ],
  },
  {
    id: "users",
    title: "إدارة المستخدمين والصلاحيات",
    subtitle: "إضافة موظفين وتحديد ما يستطيع كل واحد رؤيته",
    icon: User,
    color: "#6366f1",
    image: guideUsersImg,
    steps: [
      { title: "1. فتح إدارة المستخدمين", body: "اضغط «مستخدم» في الشريط الجانبي. ستفتح شاشة الموظفين والعملاء." },
      { title: "2. إضافة موظف", body: "اضغط «+ موظف جديد». أدخل الاسم، البريد، اسم المستخدم، كلمة السر، والمسمى الوظيفي." },
      { title: "3. تحديد الصلاحيات", body: "في صفحة الموظف، فعّل/عطّل أزرار الصلاحيات (رؤية المشاريع، تعديل المهام، رفع الملفات، رؤية المالية...). الموظف يرى فقط ما تفتحه له." },
      { title: "4. تسليم بيانات الدخول", body: "أعطِ الموظف اسم المستخدم وكلمة السر؛ يدخل المنصة ويرى واجهته المخصصة." },
    ],
    tips: ["لا تشارك صلاحيات الأدمن إلا مع من تثق بهم.", "يمكنك تعطيل حساب الموظف مؤقتًا دون حذفه."],
  },
  {
    id: "assistant",
    title: "المساعد الذكي",
    subtitle: "اسأل المساعد أي سؤال عن المنصة أو مهامك",
    icon: Bot,
    color: "#0ea5e9",
    image: guideAssistantImg,
    steps: [
      { title: "1. فتح المساعد", body: "اضغط على زر الروبوت العائم في أسفل الشاشة لفتح المحادثة مع المساعد الذكي." },
      { title: "2. اسأل بحرية", body: "اكتب أسئلة مثل: «ما المهام الواجب إنجازها قبل نهاية الأسبوع؟»، «ما أفضل أولوية لهذه المهمة؟»، «كيف أرفع إيصال قسط؟»" },
      { title: "3. اقتراحات ذكية", body: "المساعد يستخدم بيانات حسابك (مهامك، صلاحياتك) ليقدّم إجابات دقيقة." },
    ],
  },
];

function GuidesModal({
  isAdmin,
  active,
  setActive,
  videos,
  setVideo,
  images,
  setImage,
  onClose,
}: {
  isAdmin: boolean;
  active: string;
  setActive: (id: string) => void;
  videos: Record<string, string>;
  setVideo: (id: string, url: string) => void;
  images: Record<string, string>;
  setImage: (id: string, url: string) => void;
  onClose: () => void;
}) {
  const topic = GUIDE_TOPICS.find((t) => t.id === active) ?? GUIDE_TOPICS[0];
  const TopicIcon = topic.icon;
  const videoUrl = videos[topic.id] || "";
  const [draftUrl, setDraftUrl] = useState(videoUrl);
  useEffect(() => setDraftUrl(videoUrl), [videoUrl, topic.id]);
  const customImage = images[topic.id] || "";
  const [draftImg, setDraftImg] = useState(customImage);
  useEffect(() => setDraftImg(customImage), [customImage, topic.id]);
  const displayImage = customImage || topic.image;

  const embed = (url: string) => {
    if (!url) return null;
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    return url;
  };
  const embedUrl = embed(videoUrl);
  const isDirectVideo = videoUrl && /\.(mp4|webm|ogg|mov)$/i.test(videoUrl);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-gradient-to-l from-teal-50 to-white">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" /> دليل استخدام المنصة
          </h2>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="border-l border-slate-200 bg-slate-50 overflow-auto py-2">
            {GUIDE_TOPICS.map((g) => {
              const Icon = g.icon;
              const isActive = g.id === active;
              return (
                <button
                  key={g.id}
                  onClick={() => setActive(g.id)}
                  className={`w-full text-right px-4 py-3 flex items-start gap-2.5 transition border-r-4 ${
                    isActive
                      ? "bg-white border-teal-500"
                      : "border-transparent hover:bg-white/60"
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${g.color}18`, color: g.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-xs font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                      {g.title}
                    </span>
                    <span className="block text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                      {g.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Main */}
          <div className="overflow-auto p-6 space-y-5">
            {/* Topic header */}
            <div className="flex items-start gap-3">
              <span
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${topic.color}18`, color: topic.color }}
              >
                <TopicIcon className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{topic.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{topic.subtitle}</p>
              </div>
            </div>

            {/* Video area */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative">
              {isDirectVideo ? (
                <video src={videoUrl} controls className="w-full h-full" />
              ) : embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={topic.title}
                  className="w-full h-full"
                  allow="accelerated-2d-canvas; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2">
                  <PlayCircle className="w-16 h-16 opacity-60" />
                  <p className="text-sm">لم يُضَف فيديو شرح لهذا القسم بعد</p>
                  {isAdmin && (
                    <p className="text-xs text-slate-400">يمكنك إضافة رابط فيديو شرح من الحقل أدناه</p>
                  )}
                </div>
              )}
            </div>

            {/* Admin video URL input */}
            {isAdmin && (
              <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <input
                  value={draftUrl}
                  onChange={(e) => setDraftUrl(e.target.value)}
                  placeholder="رابط فيديو الشرح (YouTube أو ملف .mp4)"
                  className="flex-1 h-9 border border-slate-300 rounded px-3 text-sm"
                  dir="ltr"
                />
                <button
                  onClick={() => setVideo(topic.id, draftUrl.trim())}
                  className="h-9 px-4 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  حفظ الرابط
                </button>
                {videoUrl && (
                  <button
                    onClick={() => { setVideo(topic.id, ""); setDraftUrl(""); }}
                    className="h-9 px-3 rounded border border-slate-300 text-xs text-slate-600 hover:bg-white"
                  >
                    حذف
                  </button>
                )}
              </div>
            )}

            {/* Illustrative screenshot */}
            {displayImage && (
              <figure className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={displayImage}
                  alt={`صورة توضيحية: ${topic.title}`}
                  className="w-full h-auto block"
                  loading="lazy"
                />
                <figcaption className="px-3 py-2 text-[11px] text-slate-500 border-t border-slate-200 bg-white">
                  📸 صورة توضيحية من الموقع — {topic.title}
                </figcaption>
              </figure>
            )}

            {/* Admin image URL input */}
            {isAdmin && (
              <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <input
                  value={draftImg}
                  onChange={(e) => setDraftImg(e.target.value)}
                  placeholder="رابط صورة توضيحية مخصصة (لتجاوز الصورة الافتراضية)"
                  className="flex-1 h-9 border border-slate-300 rounded px-3 text-sm"
                  dir="ltr"
                />
                <button
                  onClick={() => setImage(topic.id, draftImg.trim())}
                  className="h-9 px-4 rounded bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  حفظ الصورة
                </button>
                {customImage && (
                  <button
                    onClick={() => { setImage(topic.id, ""); setDraftImg(""); }}
                    className="h-9 px-3 rounded border border-slate-300 text-xs text-slate-600 hover:bg-white"
                  >
                    استرجاع الافتراضي
                  </button>
                )}
              </div>
            )}

            {/* Steps */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-600" /> الخطوات
              </h4>
              <ol className="space-y-3">
                {topic.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: topic.color, color: "white" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-800">{s.title}</div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">{s.body}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {topic.tips && topic.tips.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                  💡 نصائح سريعة
                </h4>
                <ul className="space-y-1.5">
                  {topic.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-amber-800 leading-relaxed">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                disabled={GUIDE_TOPICS.findIndex((g) => g.id === active) === 0}
                onClick={() => {
                  const i = GUIDE_TOPICS.findIndex((g) => g.id === active);
                  if (i > 0) setActive(GUIDE_TOPICS[i - 1].id);
                }}
                className="text-xs text-slate-500 hover:text-teal-600 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
              <span className="text-[10px] text-slate-400">
                {GUIDE_TOPICS.findIndex((g) => g.id === active) + 1} / {GUIDE_TOPICS.length}
              </span>
              <button
                disabled={GUIDE_TOPICS.findIndex((g) => g.id === active) === GUIDE_TOPICS.length - 1}
                onClick={() => {
                  const i = GUIDE_TOPICS.findIndex((g) => g.id === active);
                  if (i < GUIDE_TOPICS.length - 1) setActive(GUIDE_TOPICS[i + 1].id);
                }}
                className="text-xs text-slate-500 hover:text-teal-600 disabled:opacity-40 flex items-center gap-1"
              >
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitContractButton({
  value,
  startDate,
  endDate,
  onSplit,
}: {
  value: string;
  startDate: string;
  endDate: string;
  onSplit: (payments: DPayment[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<2 | 4 | 8>(4);
  const total = Number(value || 0);
  const apply = () => {
    const n = count;
    const per = total > 0 ? Math.round((total / n) * 100) / 100 : 0;
    const start = startDate ? new Date(startDate).getTime() : Date.now();
    const end = endDate ? new Date(endDate).getTime() : start + n * 30 * 86_400_000;
    const step = (end - start) / n;
    const payments: DPayment[] = Array.from({ length: n }, (_, i) => ({
      id: `pay-${Date.now()}-${i}`,
      amount: String(per),
      // أول قسط من اليوم الأول للعقد، ثم كل قسط في بداية فترته
      date: new Date(start + step * i).toISOString().slice(0, 10),
      periodStart: new Date(start + step * i).toISOString().slice(0, 10),
      periodEnd: new Date(start + step * (i + 1)).toISOString().slice(0, 10),
      paid: false,
    }));
    onSplit(payments);
    setOpen(false);
  };
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 px-3 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200"
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>تقسيم العقد إلى أقساط</span>
      </button>
      {open && (
        <div className="absolute top-10 right-0 z-30 bg-white border border-slate-200 shadow-xl rounded-lg p-4 w-72 space-y-3" dir="rtl">
          <div className="text-xs font-bold text-slate-700">عدد الأقساط (2 / 4 / 8 فقط)</div>
          <div className="flex gap-1.5 flex-wrap">
            {([2, 4, 8] as const).map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`px-3 py-1 rounded text-xs font-bold border ${count === n ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
            {total > 0 ? (
              <>
                <div>إجمالي العقد: <span className="font-bold text-slate-800">{total.toLocaleString()} ر.س</span></div>
                <div>قيمة كل قسط: <span className="font-bold text-emerald-700">{Math.round((total / Math.max(1, count)) * 100) / 100} ر.س</span></div>
              </>
            ) : (
              <span className="text-amber-600">أدخل قيمة العقد أولاً</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={apply} className="flex-1 h-9 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">إنشاء الأقساط</button>
            <button onClick={() => setOpen(false)} className="h-9 px-3 rounded border border-slate-200 text-xs">إلغاء</button>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed">
            سيتم استبدال الأقساط الحالية. يمكنك تعديل التواريخ والمبالغ من شاشة المالية لاحقًا.
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({
  label,
  value,
  editable,
  type = "text",
  rawValue,
  onSave,
}: {
  label: string;
  value: string;
  editable: boolean;
  type?: "text" | "date" | "number";
  rawValue?: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rawValue ?? value);
  useEffect(() => {
    setDraft(rawValue ?? value);
  }, [rawValue, value]);
  return (
    <div className="bg-slate-50 rounded border border-slate-200 p-3">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      {editable && editing ? (
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onSave(draft);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSave(draft);
              setEditing(false);
            }
          }}
          className="w-full h-7 border border-slate-300 rounded px-2 text-sm text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"
        />
      ) : (
        <button
          onClick={() => editable && setEditing(true)}
          className={`w-full text-sm font-semibold text-slate-800 text-right ${editable ? "hover:text-[color:var(--eyenak-teal)]" : "cursor-default"}`}
        >
          {value}
        </button>
      )}
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

function PaymentCountdown({ date, paid }: { date: string; paid: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (paid) return <span className="text-[10px] text-emerald-600 font-bold">مدفوع ✓</span>;
  if (!date) return <span className="text-[10px] text-slate-400">—</span>;
  const diff = new Date(date + "T23:59:59").getTime() - now;
  if (diff <= 0) {
    const overdueDays = Math.ceil(-diff / 86_400_000);
    return <span className="text-[10px] text-red-600 font-bold">متأخر {overdueDays}ي</span>;
  }
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const urgent = days < 3;
  return (
    <span className={`text-[10px] font-bold font-mono ${urgent ? "text-amber-600" : "text-sky-700"}`}>
      باقي {days > 0 ? `${days}ي ${hours}س` : `${hours}س`}
    </span>
  );
}

type FinancePayment = DPayment & { project: string; assignee: string };

function FinanceModal({
  isAdmin,
  currentUser,
  employees,
  projectMeta,
  onClose,
  onUpdatePayment,
  onAddPayment,
  onRemovePayment,
}: {
  isAdmin: boolean;
  currentUser: string;
  employees: string[];
  projectMeta: Record<string, { contract: DContract; tasks: DTask[] }>;
  onClose: () => void;
  onUpdatePayment: (project: string, paymentId: string, patch: Partial<DPayment>) => void;
  onAddPayment: (project: string) => void;
  onRemovePayment: (project: string, paymentId: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "due" | "paid" | "overdue">("all");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const visibleProjects = Object.entries(projectMeta).filter(
    ([, meta]) => isAdmin || meta.contract.assignee === currentUser,
  );

  const allPayments: FinancePayment[] = visibleProjects.flatMap(([project, meta]) =>
    meta.contract.payments.map((p) => ({ ...p, project, assignee: meta.contract.assignee })),
  );
  const now = Date.now();
  const scoped = selectedProject ? allPayments.filter((p) => p.project === selectedProject) : allPayments;
  const filtered = scoped.filter((p) => {
    if (filter === "paid") return p.paid;
    if (filter === "due") return !p.paid;
    if (filter === "overdue") return !p.paid && p.date && new Date(p.date).getTime() < now;
    return true;
  });
  filtered.sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return (a.date || "").localeCompare(b.date || "");
  });

  const totalDue = allPayments.filter((p) => !p.paid).reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalPaid = allPayments.filter((p) => p.paid).reduce((s, p) => s + Number(p.amount || 0), 0);
  const nextDue = allPayments
    .filter((p) => !p.paid && p.date)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const onUploadReceipt = (project: string, paymentId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      onUpdatePayment(project, paymentId, {
        receiptName: file.name,
        receiptData: typeof reader.result === "string" ? reader.result : "",
        paid: true,
      });
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            {selectedProject ? (
              <>
                <button onClick={() => setSelectedProject(null)} className="text-xs text-emerald-700 hover:underline">← كل المشاريع</button>
                <span>• {selectedProject}</span>
              </>
            ) : "المالية وأقساط العقود"}
          </h2>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-[10px] text-slate-500">المستحق</div>
            <div className="text-lg font-bold text-amber-600">{totalDue.toLocaleString()} ر.س</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-[10px] text-slate-500">المدفوع</div>
            <div className="text-lg font-bold text-emerald-600">{totalPaid.toLocaleString()} ر.س</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-[10px] text-slate-500">إجمالي العقود</div>
            <div className="text-lg font-bold text-slate-800">
              {(totalDue + totalPaid).toLocaleString()} ر.س
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-[10px] text-slate-500">أقرب قسط</div>
            {nextDue ? (
              <div className="mt-0.5">
                <PaymentCountdown date={nextDue.date} paid={false} />
                <div className="text-[10px] text-slate-500 truncate">{nextDue.project}</div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">—</div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-5 py-3 border-b border-slate-200">
          {([
            ["all", "الكل"],
            ["due", "المستحقة"],
            ["overdue", "المتأخرة"],
            ["paid", "المدفوعة"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1 rounded text-xs font-bold border ${filter === k ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Projects grid (top level) */}
        {!selectedProject && visibleProjects.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-200 bg-white">
            <div className="text-[11px] font-bold text-slate-500 mb-2">المشاريع — اضغط مشروعًا لعرض أقساطه</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {visibleProjects.map(([proj, meta]) => {
                const pays = meta.contract.payments;
                const due = pays.filter((p) => !p.paid).reduce((s, p) => s + Number(p.amount || 0), 0);
                const paidSum = pays.filter((p) => p.paid).reduce((s, p) => s + Number(p.amount || 0), 0);
                return (
                  <button
                    key={proj}
                    onClick={() => setSelectedProject(proj)}
                    className="text-right rounded-lg border border-slate-200 hover:border-emerald-400 hover:shadow-md transition p-3 bg-gradient-to-bl from-emerald-50/50 to-white"
                  >
                    <div className="text-xs font-bold text-slate-800 truncate">{proj}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{pays.length} قسط • {meta.contract.assignee || "—"}</div>
                    <div className="flex justify-between text-[10px] mt-1.5">
                      <span className="text-emerald-700">مدفوع {paidSum.toLocaleString()}</span>
                      <span className="text-amber-700">مستحق {due.toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-auto flex-1">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              لا توجد أقساط. افتح أي مشروع واستخدم زر "تقسيم العقد إلى أقساط".
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-center font-bold w-10">💬</th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="project" defaultLabel="المشروع" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="assignee" defaultLabel="الموظف" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="amount" defaultLabel="المبلغ" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="paidAmount" defaultLabel="المبلغ المدفوع" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="remaining" defaultLabel="المبلغ المتبقي" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="period" defaultLabel="فترة الاستحقاق" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="date" defaultLabel="تاريخ الاستحقاق" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="count" defaultLabel="العد التنازلي" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="receipt" defaultLabel="الإيصال" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="taxInvoice" defaultLabel="الفاتورة الضريبية" isAdmin={isAdmin} /></th>
                  <th className="px-3 py-2 text-right font-bold"><EditableHeaderLabel tableId="finance.payments" headerKey="status" defaultLabel="الحالة" isAdmin={isAdmin} /></th>
                  <ExtraColHeaders tableId="finance.payments" isAdmin={isAdmin} thClass="px-3 py-2 text-right font-bold whitespace-nowrap" />
                  {isAdmin && <th className="px-3 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={`${p.project}-${p.id}`} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-center">
                      <RowChatButton tableId="finance.payments" rowId={`${p.project}-${p.id}`} rowLabel={`${p.project} — ${p.amount} ر.س`} currentUser={currentUser} isAdmin={isAdmin} employees={employees} />
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{p.project}</td>
                    <td className="px-3 py-2 text-slate-600 text-xs">{p.assignee || "—"}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={p.amount}
                        disabled={!isAdmin}
                        onChange={(e) =>
                          onUpdatePayment(p.project, p.id, { amount: e.target.value })
                        }
                        className="w-24 h-8 border border-slate-200 rounded px-2 text-sm text-right"
                      />
                      <span className="text-[10px] text-slate-500 mr-1">ر.س</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={p.paidAmount ?? (p.paid ? p.amount : "")}
                        disabled={!isAdmin}
                        onChange={(e) => {
                          const v = e.target.value;
                          const amt = Number(p.amount || 0);
                          const paidN = Number(v || 0);
                          onUpdatePayment(p.project, p.id, {
                            paidAmount: v,
                            paid: paidN >= amt && amt > 0,
                          });
                        }}
                        className="w-24 h-8 border border-slate-200 rounded px-2 text-sm text-right"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-slate-500 mr-1">ر.س</span>
                    </td>
                    <td className="px-3 py-2">
                      {(() => {
                        const amt = Number(p.amount || 0);
                        const paidN = Number((p.paidAmount ?? (p.paid ? p.amount : "0")) || 0);
                        const remaining = Math.max(0, amt - paidN);
                        return (
                          <span className={`text-xs font-bold ${remaining === 0 ? "text-emerald-600" : "text-amber-700"}`}>
                            {remaining.toLocaleString()} ر.س
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={p.periodStart ?? ""}
                          disabled={!isAdmin}
                          onChange={(e) => onUpdatePayment(p.project, p.id, { periodStart: e.target.value })}
                          className="h-7 border border-slate-200 rounded px-1 text-[11px]"
                          title="من"
                        />
                        <input
                          type="date"
                          value={p.periodEnd ?? ""}
                          disabled={!isAdmin}
                          onChange={(e) => onUpdatePayment(p.project, p.id, { periodEnd: e.target.value })}
                          className="h-7 border border-slate-200 rounded px-1 text-[11px]"
                          title="إلى"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={p.date}
                        disabled={!isAdmin}
                        onChange={(e) =>
                          onUpdatePayment(p.project, p.id, { date: e.target.value })
                        }
                        className="h-8 border border-slate-200 rounded px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <PaymentCountdown date={p.date} paid={p.paid} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {p.receiptName ? (
                          <a
                            href={p.receiptData}
                            download={p.receiptName}
                            className="text-xs text-emerald-700 hover:underline truncate max-w-[120px] flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3" />
                            {p.receiptName}
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">لا يوجد</span>
                        )}
                        {isAdmin && (
                          <>
                            <input
                              type="file"
                              className="hidden"
                              id={`receipt-${p.project}-${p.id}`}
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) onUploadReceipt(p.project, p.id, f);
                              }}
                            />
                            <label
                              htmlFor={`receipt-${p.project}-${p.id}`}
                              className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-500"
                              title="رفع إيصال"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </label>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {p.taxInvoiceName ? (
                          <a
                            href={p.taxInvoiceData}
                            download={p.taxInvoiceName}
                            className="text-xs text-emerald-700 hover:underline truncate max-w-[120px] flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3" />
                            {p.taxInvoiceName}
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">لا يوجد</span>
                        )}
                        {isAdmin && (
                          <>
                            <input
                              type="file"
                              className="hidden"
                              id={`tax-${p.project}-${p.id}`}
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                const reader = new FileReader();
                                reader.onload = () => onUpdatePayment(p.project, p.id, {
                                  taxInvoiceName: f.name,
                                  taxInvoiceData: typeof reader.result === "string" ? reader.result : "",
                                });
                                reader.readAsDataURL(f);
                              }}
                            />
                            <label
                              htmlFor={`tax-${p.project}-${p.id}`}
                              className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-500"
                              title="رفع فاتورة ضريبية"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </label>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        disabled={!isAdmin}
                        onClick={() => onUpdatePayment(p.project, p.id, { paid: !p.paid })}
                        className={`text-[10px] font-bold px-2 py-1 rounded ${p.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} ${isAdmin ? "hover:opacity-80" : ""}`}
                      >
                        {p.paid ? "مدفوع" : "غير مدفوع"}
                      </button>
                    </td>
                    <ExtraCells tableId="finance.payments" rowId={`${p.project}-${p.id}`} canEdit={isAdmin} employees={employees} tdClass="px-3 py-2 min-w-[120px]" />
                    {isAdmin && (
                      <td className="px-3 py-2">
                        <button
                          onClick={() => onRemovePayment(p.project, p.id)}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                          title="حذف القسط"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isAdmin && (
          <div className="border-t border-slate-200 p-3 flex items-center gap-2 justify-end bg-slate-50">
            <span className="text-xs text-slate-500">إضافة قسط يدوي إلى مشروع:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onAddPayment(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="h-9 border border-slate-300 rounded px-2 text-xs"
            >
              <option value="">— اختر المشروع —</option>
              {visibleProjects.map(([p]) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

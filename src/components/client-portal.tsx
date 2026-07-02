import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getClientPortalData, clientSendChatMessage } from "@/lib/state.functions";
import {
  LogOut, Send, CheckCircle2, Clock, AlertCircle, Circle,
  Calendar, MessageSquare, Bell, RefreshCw, X, Video, MapPin,
  CreditCard, CheckCheck, Hourglass, TrendingUp, ChevronLeft,
  Sparkles, Building2, User,
} from "lucide-react";

type Props = { onSignOut: () => void };

/* ── helpers ─────────────────────────────────────────── */
function fmtDate(d: string) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return d; }
}

function statusColor(s: string): { bg: string; text: string; dot: string } {
  if (s === "تم الانجاز") return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
  if (s === "جاري العمل") return { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    };
  if (s === "معلق")       return { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   };
  if (s === "ملغي")       return { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400"     };
  return                         { bg: "bg-slate-50",   text: "text-slate-600",   dot: "bg-slate-400"   };
}

function statusIcon(s: string) {
  if (s === "تم الانجاز") return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (s === "جاري العمل") return <Clock        className="w-4 h-4 text-blue-500 shrink-0"    />;
  if (s === "معلق")       return <AlertCircle  className="w-4 h-4 text-amber-500 shrink-0"   />;
  if (s === "ملغي")       return <X            className="w-4 h-4 text-red-400 shrink-0"     />;
  return                         <Circle       className="w-4 h-4 text-slate-400 shrink-0"   />;
}

/* ── Progress Ring ───────────────────────────────────── */
function ProgressRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--eyenak-teal,#0d9488)"
        strokeWidth={8} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray .7s ease" }} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   CLIENT PORTAL
══════════════════════════════════════════════════════ */
export function ClientPortal({ onSignOut }: Props) {
  const fetchData   = useServerFn(getClientPortalData);
  const sendMsg     = useServerFn(clientSendChatMessage);

  const [data,         setData]         = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [err,          setErr]          = useState("");
  const [activeProj,   setActiveProj]   = useState<string | null>(null);
  const [tab,          setTab]          = useState<"overview"|"tasks"|"chat"|"payments"|"meetings">("overview");
  const [chatInput,    setChatInput]    = useState("");
  const [sending,      setSending]      = useState(false);
  const [localChats,   setLocalChats]   = useState<Record<string,any[]>>({});
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [sideOpen,     setSideOpen]     = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* load */
  const load = async () => {
    setLoading(true); setErr("");
    try {
      const res = await fetchData();
      setData(res);
      setLocalChats(res.chats ?? {});
      if (!activeProj && res.projects?.length) setActiveProj(res.projects[0].name);
    } catch (e: any) { setErr(e?.message ?? "تعذّر التحميل"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [localChats, activeProj, tab]);

  /* derived */
  const projects: any[]                  = data?.projects ?? [];
  const meta: Record<string,any>         = data?.projectMeta ?? {};
  const meetings: any[]                  = data?.meetings ?? [];
  const displayName: string              = data?.profile?.display_name ?? "عميل";
  const avatar                           = displayName.charAt(0).toUpperCase();

  const cur          = activeProj ? meta[activeProj] : null;
  const tasks: any[] = cur?.tasks ?? [];
  const payments: any[] = cur?.contract?.payments ?? [];
  const contract         = cur?.contract ?? {};
  const chats: any[]     = activeProj ? (localChats[activeProj] ?? []) : [];

  const totalT  = tasks.length;
  const doneT   = tasks.filter((t:any) => t.status === "تم الانجاز").length;
  const pct     = totalT > 0 ? Math.round((doneT / totalT) * 100) : 0;

  const totalAmt  = payments.reduce((s:number,p:any) => s + Number(p.amount||0), 0);
  const paidAmt   = payments.filter((p:any)=>p.paid).reduce((s:number,p:any)=>s+Number(p.amount||0),0);
  const upcoming  = meetings.filter((m:any)=>{ try{return new Date(m.date)>new Date();}catch{return false;} });
  const unread    = upcoming.length;

  /* send chat */
  const handleSend = async () => {
    if (!chatInput.trim() || !activeProj || sending) return;
    setSending(true);
    const text = chatInput.trim();
    setChatInput("");
    try {
      const res: any = await sendMsg({ data: { projectName: activeProj, text } });
      if (res?.msg) setLocalChats(c => ({ ...c, [activeProj!]: [...(c[activeProj!]??[]), res.msg] }));
    } catch { setChatInput(text); }
    finally { setSending(false); }
  };

  /* ── loading / error ─────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-teal-300 animate-pulse" />
        </div>
        <p className="text-white/70 text-sm">جارٍ تحميل بوابتك…</p>
      </div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="font-bold text-slate-800">تعذّر تحميل البيانات</p>
        <p className="text-xs text-slate-500">{err}</p>
        <button onClick={load} className="h-11 px-8 rounded-xl bg-teal-600 text-white text-sm font-semibold">إعادة المحاولة</button>
      </div>
    </div>
  );

  /* ══════════════ MAIN LAYOUT ══════════════ */
  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── TOP HEADER ───────────────────────────── */}
      <header className="bg-[color:var(--eyenak-dark)] shadow-lg z-30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[color:var(--eyenak-teal)] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">بوابة العميل</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            {unread > 0 && (
              <button onClick={()=>setNotifOpen(true)}
                className="relative p-2 rounded-xl hover:bg-white/10 transition">
                <Bell className="w-5 h-5 text-amber-300" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              </button>
            )}
            {/* Refresh */}
            <button onClick={load} className="p-2 rounded-xl hover:bg-white/10 transition text-white/60 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
            {/* Avatar + name */}
            <div className="flex items-center gap-2.5 pr-2 border-r border-white/10">
              <span className="text-white/70 text-sm hidden sm:block">
                مرحباً، <span className="text-white font-semibold">{displayName}</span>
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow">
                {avatar}
              </div>
            </div>
            {/* Sign out */}
            <button onClick={onSignOut}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm px-2 py-1.5 rounded-xl hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── NOTIFICATION DRAWER ──────────────────── */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4"
          onClick={()=>setNotifOpen(false)}>
          <div onClick={e=>e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={()=>setNotifOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
              <h3 className="font-bold text-slate-800">الاجتماعات القادمة</h3>
            </div>
            <div className="space-y-2">
              {upcoming.map((m:any) => (
                <div key={m.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{m.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{fmtDate(m.date)}</p>
                    {m.location && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{m.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BODY ─────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* No projects */}
        {projects.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-slate-700 text-lg mb-1">لا توجد مشاريع حتى الآن</p>
            <p className="text-sm text-slate-400">سيتم ربط مشاريعك بحسابك من قِبل الفريق</p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-5 flex-1">

            {/* ── SIDEBAR: project list ─────────── */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-[color:var(--eyenak-dark)] px-4 py-3">
                  <p className="text-white/70 text-xs">مشاريعك</p>
                </div>
                <div className="p-2 space-y-1">
                  {projects.map((p:any) => {
                    const m = meta[p.name];
                    const tasks2 = m?.tasks ?? [];
                    const done2 = tasks2.filter((t:any)=>t.status==="تم الانجاز").length;
                    const pct2 = tasks2.length > 0 ? Math.round((done2/tasks2.length)*100) : 0;
                    const active = activeProj === p.name;
                    return (
                      <button key={p.id}
                        onClick={()=>{ setActiveProj(p.name); setTab("overview"); setSideOpen(false); }}
                        className={`w-full text-right px-3 py-3 rounded-xl transition flex items-center justify-between gap-2 ${
                          active ? "bg-[color:var(--eyenak-teal)] text-white shadow" : "hover:bg-slate-50 text-slate-700"
                        }`}>
                        <div className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {pct2}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${active?"text-white":"text-slate-800"}`}>{p.name}</p>
                          {m?.contract?.endDate && (
                            <p className={`text-xs mt-0.5 ${active?"text-white/70":"text-slate-400"}`}>ينتهي {fmtDate(m.contract.endDate)}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────── */}
            <div className="flex-1 min-w-0 space-y-4">

              {activeProj && (
                <>
                  {/* Project hero card */}
                  <div className="bg-gradient-to-br from-[color:var(--eyenak-dark)] to-slate-700 rounded-2xl shadow-lg p-5 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Progress ring */}
                      <div className="relative shrink-0">
                        <ProgressRing pct={pct} size={88} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">{pct}%</span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-xs mb-1">المشروع النشط</p>
                        <h1 className="text-xl font-bold leading-tight">{activeProj}</h1>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/70">
                          {contract.startDate && <span>البداية: {fmtDate(contract.startDate)}</span>}
                          {contract.endDate   && <span>الانتهاء: {fmtDate(contract.endDate)}</span>}
                          <span>{doneT}/{totalT} مهمة مكتملة</span>
                        </div>
                        {contract.services?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contract.services.map((s:string,i:number)=>(
                              <span key={i} className="px-2 py-0.5 rounded-full bg-white/15 text-white text-xs">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tab bar */}
                  <div className="bg-white rounded-2xl shadow-sm">
                    <div className="flex overflow-x-auto border-b border-slate-100">
                      {([
                        { id:"overview",  label:"نظرة عامة",   emoji:"🏠" },
                        { id:"tasks",     label:"المهام",       emoji:"✅" },
                        { id:"chat",      label:"المحادثة",     emoji:"💬" },
                        { id:"payments",  label:"الأقساط",      emoji:"💳" },
                        { id:"meetings",  label:"الاجتماعات",   emoji:"📅" },
                      ] as const).map(tb=>(
                        <button key={tb.id} onClick={()=>setTab(tb.id)}
                          className={`flex-1 min-w-max flex items-center justify-center gap-1.5 py-3.5 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                            tab===tb.id
                              ? "border-[color:var(--eyenak-teal)] text-[color:var(--eyenak-teal)]"
                              : "border-transparent text-slate-500 hover:text-slate-700"
                          }`}>
                          <span>{tb.emoji}</span>
                          <span>{tb.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* ── OVERVIEW TAB ─────────────── */}
                    {tab==="overview" && (
                      <div className="p-5 space-y-4">
                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label:"إجمالي المهام",  value: totalT,                     color:"bg-slate-800"                               },
                            { label:"مكتملة",          value: doneT,                     color:"bg-emerald-600"                             },
                            { label:"قيمة العقد",      value: totalAmt?`${totalAmt.toLocaleString()} ر.س`:"—", color:"bg-blue-600"         },
                            { label:"المسدَّد",        value: paidAmt?`${paidAmt.toLocaleString()} ر.س`:"—",  color:"bg-teal-600"          },
                          ].map((s,i)=>(
                            <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                              <p className="font-bold text-slate-800 text-lg">{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Latest tasks */}
                        {tasks.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <button onClick={()=>setTab("tasks")} className="text-xs text-[color:var(--eyenak-teal)] font-semibold flex items-center gap-1">
                                عرض الكل <ChevronLeft className="w-3 h-3"/>
                              </button>
                              <p className="text-sm font-bold text-slate-700">آخر المهام</p>
                            </div>
                            <div className="space-y-2">
                              {tasks.slice(-3).reverse().map((t:any)=>{
                                const sc = statusColor(t.status);
                                return (
                                  <div key={t.id} className={`rounded-xl ${sc.bg} px-3 py-2.5 flex items-center gap-3`}>
                                    {statusIcon(t.status)}
                                    <span className="flex-1 text-sm text-slate-800 font-medium truncate">{t.name||"(بدون اسم)"}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60 ${sc.text}`}>{t.status||"جديد"}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Next meeting */}
                        {upcoming[0] && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                              <Video className="w-5 h-5 text-amber-600"/>
                            </div>
                            <div>
                              <p className="text-xs text-amber-600 font-semibold mb-0.5">الاجتماع القادم</p>
                              <p className="font-bold text-slate-800">{upcoming[0].title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{fmtDate(upcoming[0].date)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── TASKS TAB ────────────────── */}
                    {tab==="tasks" && (
                      <div className="p-4">
                        {tasks.length===0 && (
                          <div className="text-center py-14 text-slate-400">
                            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                            <p className="text-sm">لا توجد مهام بعد</p>
                          </div>
                        )}
                        <div className="space-y-2">
                          {tasks.map((t:any)=>{
                            const sc = statusColor(t.status);
                            return (
                              <div key={t.id} className={`rounded-xl border border-transparent ${sc.bg} px-4 py-3 flex items-center gap-3`}>
                                {statusIcon(t.status)}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold ${t.status==="تم الانجاز"?"line-through text-slate-400":"text-slate-800"}`}>
                                    {t.name||"(بدون اسم)"}
                                  </p>
                                  {(t.platform||t.beneficiary) && (
                                    <p className="text-xs text-slate-400 mt-0.5">{[t.platform,t.beneficiary].filter(Boolean).join(" — ")}</p>
                                  )}
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1">
                                  {t.endDate && <span className="text-xs text-slate-400">{fmtDate(t.endDate)}</span>}
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 ${sc.text}`}>{t.status||"جديد"}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── CHAT TAB ─────────────────── */}
                    {tab==="chat" && (
                      <div className="flex flex-col" style={{height:460}}>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                          {chats.length===0 && (
                            <div className="text-center py-12 text-slate-400">
                              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                              <p className="text-sm">ابدأ المحادثة مع الفريق</p>
                            </div>
                          )}
                          {chats.map((m:any)=>{
                            const isMe = m.role==="client";
                            return (
                              <div key={m.id} className={`flex gap-2 ${isMe?"justify-start":"justify-end"}`}>
                                {!isMe && (
                                  <div className="w-8 h-8 rounded-full bg-[color:var(--eyenak-dark)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {(m.sender||"م").charAt(0)}
                                  </div>
                                )}
                                <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                  isMe ? "bg-[color:var(--eyenak-teal)] text-white rounded-tl-none"
                                       : "bg-white text-slate-800 rounded-tr-none border border-slate-100"
                                }`}>
                                  {!isMe && <p className="text-[10px] font-bold mb-0.5 text-slate-400">{m.sender}</p>}
                                  <p className="text-sm leading-relaxed">{m.text}</p>
                                  <p className={`text-[10px] mt-1 ${isMe?"text-white/60":"text-slate-300"}`}>
                                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}) : ""}
                                  </p>
                                </div>
                                {isMe && (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {avatar}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <div ref={chatEndRef}/>
                        </div>
                        <div className="border-t border-slate-100 p-3 flex gap-2 bg-white rounded-b-2xl">
                          <button onClick={handleSend} disabled={!chatInput.trim()||sending}
                            className="w-10 h-10 rounded-xl bg-[color:var(--eyenak-teal)] flex items-center justify-center text-white disabled:opacity-40 shrink-0 shadow">
                            <Send className="w-4 h-4"/>
                          </button>
                          <input
                            value={chatInput}
                            onChange={e=>setChatInput(e.target.value)}
                            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();} }}
                            placeholder="اكتب رسالتك للفريق…"
                            className="flex-1 h-10 border border-slate-200 rounded-xl px-4 text-sm text-right bg-slate-50 focus:outline-none focus:border-[color:var(--eyenak-teal)] focus:bg-white transition"
                          />
                        </div>
                      </div>
                    )}

                    {/* ── PAYMENTS TAB ─────────────── */}
                    {tab==="payments" && (
                      <div className="p-4 space-y-4">
                        {/* Summary */}
                        {payments.length > 0 && (
                          <>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-slate-50 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-500 mb-1">إجمالي العقد</p>
                                <p className="font-bold text-slate-800">{totalAmt.toLocaleString("ar-SA")} ر.س</p>
                              </div>
                              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                <p className="text-xs text-emerald-600 mb-1">المسدَّد</p>
                                <p className="font-bold text-emerald-700">{paidAmt.toLocaleString("ar-SA")} ر.س</p>
                              </div>
                              <div className="bg-amber-50 rounded-xl p-3 text-center">
                                <p className="text-xs text-amber-600 mb-1">المتبقي</p>
                                <p className="font-bold text-amber-700">{(totalAmt-paidAmt).toLocaleString("ar-SA")} ر.س</p>
                              </div>
                            </div>
                            {totalAmt > 0 && (
                              <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                  <span className="text-emerald-600 font-semibold">{Math.round((paidAmt/totalAmt)*100)}% مسدَّد</span>
                                  <span>{payments.filter((p:any)=>p.paid).length} / {payments.length} أقساط</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-l from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                                    style={{width:`${Math.round((paidAmt/totalAmt)*100)}%`}}/>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {payments.length===0 && (
                          <div className="text-center py-14 text-slate-400">
                            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                            <p className="text-sm">لا توجد أقساط لهذا المشروع بعد</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          {payments.map((p:any,i:number)=>{
                            const overdue = !p.paid && p.date && new Date(p.date)<new Date();
                            return (
                              <div key={p.id??i} className={`rounded-xl border px-4 py-3.5 flex items-center gap-4 ${
                                p.paid?"border-emerald-200 bg-emerald-50":overdue?"border-red-200 bg-red-50":"border-slate-200 bg-white"
                              }`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  p.paid?"bg-emerald-100":overdue?"bg-red-100":"bg-slate-100"
                                }`}>
                                  {p.paid ? <CheckCheck className="w-5 h-5 text-emerald-600"/>
                                    : overdue ? <AlertCircle className="w-5 h-5 text-red-500"/>
                                    : <Hourglass className="w-5 h-5 text-slate-400"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-slate-800 text-sm">القسط {i+1}</span>
                                    {p.paid && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">مسدَّد ✓</span>}
                                    {!p.paid&&overdue && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">متأخر</span>}
                                    {!p.paid&&!overdue && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">قادم</span>}
                                  </div>
                                  {p.date && <p className="text-xs text-slate-400 mt-0.5">تاريخ الاستحقاق: {fmtDate(p.date)}</p>}
                                </div>
                                <div className="text-left shrink-0">
                                  <p className={`font-bold text-base ${p.paid?"text-emerald-700":overdue?"text-red-600":"text-slate-800"}`}>
                                    {Number(p.amount||0).toLocaleString("ar-SA")}
                                  </p>
                                  <p className="text-xs text-slate-400">ر.س</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── MEETINGS TAB ─────────────── */}
                    {tab==="meetings" && (
                      <div className="p-4 space-y-3">
                        {meetings.length===0 && (
                          <div className="text-center py-14 text-slate-400">
                            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                            <p className="text-sm">لا توجد اجتماعات</p>
                          </div>
                        )}
                        {meetings.map((m:any)=>{
                          const isPast = new Date(m.date)<new Date();
                          return (
                            <div key={m.id} className={`rounded-xl border p-4 flex gap-3 items-start transition ${
                              isPast?"border-slate-200 bg-slate-50 opacity-70":"border-teal-200 bg-gradient-to-l from-white to-teal-50"
                            }`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast?"bg-slate-200":"bg-teal-100"}`}>
                                <Video className={`w-5 h-5 ${isPast?"text-slate-400":"text-teal-600"}`}/>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-bold text-slate-800">{m.title}</p>
                                  {!isPast && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">قادم</span>}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3"/> {fmtDate(m.date)}
                                </p>
                                {m.location && (
                                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3"/> {m.location}
                                  </p>
                                )}
                                {m.notes && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{m.notes}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        منصة يسير — بوابة العميل الخاصة
      </footer>
    </div>
  );
}

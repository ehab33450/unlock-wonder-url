import sys

with open("src/routes/index.tsx", "r", encoding="utf-8") as f:
    src = f.read()

def r(old, new, label):
    global src
    if old not in src:
        print("[ERROR] " + label); sys.exit(1)
    src = src.replace(old, new, 1)
    print("[OK] " + label)

r("    responsibleName: string;\n    responsiblePhone: string;\n    assignee: string;\n    services?: string[];\n  };\n  type TaskStatus",
  "    responsibleName: string;\n    responsiblePhone: string;\n    responsibleEmail?: string;\n    responsibleWhatsapp?: string;\n    assignee: string;\n    services?: string[];\n  };\n  type TaskStatus","1/8")

r("  responsibleName: string;\n  responsiblePhone: string;\n  assignee: string;\n  services?: string[];\n};\ntype DStatus",
  "  responsibleName: string;\n  responsiblePhone: string;\n  responsibleEmail?: string;\n  responsibleWhatsapp?: string;\n  assignee: string;\n  services?: string[];\n};\ntype DStatus","2/8")

r('  const [npRespPhone, setNpRespPhone] = useState("");',
  '  const [npRespPhone, setNpRespPhone] = useState("");\n  const [npRespEmail, setNpRespEmail] = useState("");\n  const [npRespWhatsapp, setNpRespWhatsapp] = useState("");',"3/8")

old4='                  </div>\n                </div>\n\n                {/* Payments */}\n                {/* Payments are configured later inside the project via "تقسيم العقد إلى أقساط" */}'
new4=('                  </div>\n                </div>\n'
'                <div className="grid grid-cols-2 gap-3 mb-4">\n'
'                  <div>\n'
'                    <label className="block text-sm text-slate-600 mb-2 text-right">البريد الإلكتروني للمسؤول</label>\n'
'                    <input\n                      type="email"\n                      value={npRespEmail}\n                      onChange={(e) => setNpRespEmail(e.target.value)}\n                      placeholder="example@email.com"\n                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"\n                    />\n'
'                  </div>\n'
'                  <div>\n'
'                    <label className="block text-sm text-slate-600 mb-2 text-right">رقم واتساب المسؤول</label>\n'
'                    <input\n                      type="tel"\n                      value={npRespWhatsapp}\n                      onChange={(e) => setNpRespWhatsapp(e.target.value)}\n                      placeholder="+9665..."\n                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"\n                    />\n'
'                  </div>\n                </div>\n\n'
'                {/* Payments */}\n                {/* Payments are configured later inside the project via "تقسيم العقد إلى أقساط" */}')
r(old4, new4, "4/8")

r("            responsibleName: npRespName,\n            responsiblePhone: npRespPhone,\n            assignee: npAssignee || (npMembers[0] ?? \"\"),",
  "            responsibleName: npRespName,\n            responsiblePhone: npRespPhone,\n            responsibleEmail: npRespEmail,\n            responsibleWhatsapp: npRespWhatsapp,\n            assignee: npAssignee || (npMembers[0] ?? \"\"),","5/8")

r('    setNpRespName("");\n    setNpRespPhone("");',
  '    setNpRespName("");\n    setNpRespPhone("");\n    setNpRespEmail("");\n    setNpRespWhatsapp("");',"6/8")

r('                  responsibleName: "",\n                  responsiblePhone: "",\n                  assignee: "",\n                },\n                tasks: [],\n              };\n            }\n          }\n          return next;',
  '                  responsibleName: "",\n                  responsiblePhone: "",\n                  responsibleEmail: "",\n                  responsibleWhatsapp: "",\n                  assignee: "",\n                },\n                tasks: [],\n              };\n            }\n          }\n          return next;',"7a/8")

r('                    responsibleName: "",\n                    responsiblePhone: "",\n                    assignee: "",\n                  },\n                  tasks: [],\n                };\n              return { ...m, [detailProject!]: updater(cur) }',
  '                    responsibleName: "",\n                    responsiblePhone: "",\n                    responsibleEmail: "",\n                    responsibleWhatsapp: "",\n                    assignee: "",\n                  },\n                  tasks: [],\n                };\n              return { ...m, [detailProject!]: updater(cur) }',"7b/8")

r('      responsibleName: "",\n      responsiblePhone: "",\n      assignee: "",\n    },\n    tasks: [],\n  };\n  const data = meta ?? fallback;',
  '      responsibleName: "",\n      responsiblePhone: "",\n      responsibleEmail: "",\n      responsibleWhatsapp: "",\n      assignee: "",\n    },\n    tasks: [],\n  };\n  const data = meta ?? fallback;',"7c/8")

old8=('{data.contract.responsiblePhone}\n'
'                    </a>\n'
'                   ) : (\n'
'                     <span className="text-sm text-slate-400">—</span>\n'
'                   )}\n'
'                 </div>\n'
'                 <div className="bg-slate-50 rounded border border-slate-200 p-3">\n'
'                   <div className="text-xs text-slate-500 mb-1">الدفعات</div>')

new8=('{data.contract.responsiblePhone}\n'
'                    </a>\n'
'                   ) : (\n'
'                     <span className="text-sm text-slate-400">—</span>\n'
'                   )}\n'
'                 </div>\n'
'                  {/* Email cell */}\n'
'                  <div className="bg-slate-50 rounded border border-slate-200 p-3">\n'
'                     <div className="text-xs text-slate-500 mb-1">البريد الإلكتروني</div>\n'
'                     {data.contract.responsibleEmail ? (\n'
'                       <a href={`mailto:${data.contract.responsibleEmail}`} className="text-sm font-semibold text-[color:var(--eyenak-teal)] hover:underline block truncate" dir="ltr">{data.contract.responsibleEmail}</a>\n'
'                     ) : !canEditAll && (<span className="text-sm text-slate-400">—</span>)}\n'
'                     {canEditAll && (\n'
'                       <input key={data.contract.responsibleEmail ?? ""} type="email" defaultValue={data.contract.responsibleEmail ?? ""} placeholder="أض٥ البريد..."\n'
'                         onBlur={(e) => { const v=e.target.value.trim(); if(v!==(data.contract.responsibleEmail??"")) onUpdate((c)=>({...c,contract:{...c.contract,responsibleEmail:v}})); }}\n'
'                         className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[color:var(--eyenak-teal)]" />\n'
'                     )}\n'
'                   </div>\n'
'                   {/* WhatsApp cell */}\n'
'                   <div className="bg-slate-50 rounded border border-slate-200 p-3">\n'
'                     <div className="text-xs text-slate-500 mb-1">واتساب العميل</div>\n'
'                     {data.contract.responsibleWhatsapp ? (\n'
'                       <div className="flex items-center gap-2 justify-end">\n'
'                         <a href={`https://wa.me/${data.contract.responsibleWhatsapp.replace(/\\D/g,"")}`} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shrink-0">إرسال واتساب</a>\n'
'                         <span className="text-sm font-semibold text-slate-800 truncate" dir="ltr">{data.contract.responsibleWhatsapp}</span>\n'
'                       </div>\n'
'                     ) : !canEditAll && (<span className="text-sm text-slate-400">—</span>)}\n'
'                     {canEditAll && (\n'
'                       <input key={data.contract.responsibleWhatsapp ?? ""} type="tel" defaultValue={data.contract.responsibleWhatsapp ?? ""} placeholder="+9665..."\n'
'                         onBlur={(e) => { const v=e.target.value.trim(); if(v!==(data.contract.responsibleWhatsapp??"")) onUpdate((c)=>({...c,contract:{...c.contract,responsibleWhatsapp:v}})); }}\n'
'                         className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[color:var(--eyenak-teal)]" />\n'
'                     )}\n'
'                   </div>\n'
'                   <div className="bg-slate-50 rounded border border-slate-200 p-3">\n'
'                     <div className="text-xs text-slate-500 mb-1">الدفعةت�]���B�����]����B���]�[��ܘ�ܛ�]\��[�^����ȋ[���[��H�]�N�H\������ܚ]Jܘ�B��[�
�ۙHH�B
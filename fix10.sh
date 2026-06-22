#!/usr/bin/env bash
set -e
python3 - <<'PYEOF'
import sys

with open("src/routes/index.tsx", "r", encoding="utf-8") as f:
    src = f.read()

orig = src

def replace_once(old, new, label):
    global src
    count = src.count(old)
    if count == 0:
        print(f"[ERROR] pattern not found: {label}", file=sys.stderr)
        sys.exit(1)
    src = src.replace(old, new, 1)
    print(f"[OK] {label}")

replace_once(
    "    responsibleName: string;\n    responsiblePhone: string;\n    assignee: string;\n    services?: string[];\n  };\n  type TaskStatus",
    "    responsibleName: string;\n    responsiblePhone: string;\n    responsibleEmail?: string;\n    responsibleWhatsapp?: string;\n    assignee: string;\n    services?: string[];\n  };\n  type TaskStatus",
    "ContractInfo type"
)
replace_once(
    "  responsibleName: string;\n  responsiblePhone: string;\n  assignee: string;\n  services?: string[];\n};\ntype DStatus",
    "  responsibleName: string;\n  responsiblePhone: string;\n  responsibleEmail?: string;\n  responsibleWhatsapp?: string;\n  assignee: string;\n  services?: string[];\n};\ntype DStatus",
    "DContract type"
)
replace_once(
    '  const [npRespPhone, setNpRespPhone] = useState("");',
    '  const [npRespPhone, setNpRespPhone] = useState("");\n  const [npRespEmail, setNpRespEmail] = useState("");\n  const [npRespWhatsapp, setNpRespWhatsapp] = useState("");',
    "state vars"
)
replace_once(
    '                  </div>\n                </div>\n\n                {/* Payments */}\n                {/* Payments are configured later inside the project via "\u062a\u0642\u0633\u064a\u0645 \u0627\u0644\u0639\u0642\u062f \u0625\u0644\u0649 \u0623\u0642\u0633\u0627\u0637" */}',
    '                  </div>\n                </div>\n                <div className="grid grid-cols-2 gap-3 mb-4">\n                  <div>\n                    <label className="block text-sm text-slate-600 mb-2 text-right">\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0644\u0644\u0645\u0633\u0624\u0648\u0644</label>\n                    <input\n                      type="email"\n                      value={npRespEmail}\n                      onChange={(e) => setNpRespEmail(e.target.value)}\n                      placeholder="example@email.com"\n                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"\n                    />\n                  </div>\n                  <div>\n                    <label className="block text-sm text-slate-600 mb-2 text-right">\u0631\u0642\u0645 \u0648\u0627\u062a\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0624\u0648\u0644</label>\n                    <input\n                      type="tel"\n                      value={npRespWhatsapp}\n                      onChange={(e) => setNpRespWhatsapp(e.target.value)}\n                      placeholder="+9665..."\n                      className="w-full h-11 border border-slate-300 rounded px-3 text-right focus:outline-none focus:border-[color:var(--eyenak-teal)]"\n                    />\n                  </div>\n                </div>\n\n                {/* Payments */}\n                {/* Payments are configured later inside the project via "\u062a\u0642\u0633\u064a\u0645 \u0627\u0644\u0639\u0642\u062f \u0625\u0644\u0649 \u0623\u0642\u0633\u0627\u0637" */}',
    "new-project form fields"
)
replace_once(
    "            responsibleName: npRespName,\n            responsiblePhone: npRespPhone,\n            assignee: npAssignee || (npMembers[0] ?? \"\"),",
    "            responsibleName: npRespName,\n            responsiblePhone: npRespPhone,\n            responsibleEmail: npRespEmail,\n            responsibleWhatsapp: npRespWhatsapp,\n            assignee: npAssignee || (npMembers[0] ?? \"\"),",
    "project creation"
)
replace_once(
    '    setNpRespName("");\n    setNpRespPhone("");',
    '    setNpRespName("");\n    setNpRespPhone("");\n    setNpRespEmail("");\n    setNpRespWhatsapp("");',
    "form reset"
)
replace_once(
    '                  responsibleName: "",\n                  responsiblePhone: "",\n                  assignee: "",\n                },\n                tasks: [],\n              };\n            }\n          }\n          return next;',
    '                  responsibleName: "",\n                  responsiblePhone: "",\n                  responsibleEmail: "",\n                  responsibleWhatsapp: "",\n                  assignee: "",\n                },\n                tasks: [],\n              };\n            }\n          }\n          return next;',
    "default init #1"
)
replace_once(
    '                    responsibleName: "",\n                    responsiblePhone: "",\n                    assignee: "",\n                  },\n                  tasks: [],\n                };\n              return { ...m, [detailProject!]: updater(cur) }',
    '                    responsibleName: "",\n                    responsiblePhone: "",\n                    responsibleEmail: "",\n                    responsibleWhatsapp: "",\n                    assignee: "",\n                  },\n                  tasks: [],\n                };\n              return { ...m, [detailProject!]: updater(cur) }',
    "default init #2"
)
replace_once(
    '      responsibleName: "",\n      responsiblePhone: "",\n      assignee: "",\n    },\n    tasks: [],\n  };\n  const data = meta ?? fallback;',
    '      responsibleName: "",\n      responsiblePhone: "",\n      responsibleEmail: "",\n      responsibleWhatsapp: "",\n      assignee: "",\n    },\n    tasks: [],\n  };\n  const data = meta ?? fallback;',
    "default init #3"
)
replace_once(
    '                <div className="bg-slate-50 rounded border border-slate-200 p-3">\n                  <div className="text-xs text-slate-500 mb-1">\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644</div>\n                  {data.contract.responsiblePhone ? (\n                    <a\n                      href={`tel:${data.contract.responsiblePhone}`}\n                      className="text-sm font-semibold text-[color:var(--eyenak-teal)] hover:underline"\n                      dir="ltr"\n                    >\n                      {data.contract.responsiblePhone}\n                    </a>\n                  ) : (\n                    <span className="text-sm text-slate-400">\u2014</span>\n                  )}\n                </div>\n                <div className="bg-slate-50 rounded border border-slate-200 p-3">\n                  <div className="text-xs text-slate-500 mb-1">\u0627\u0644\u062f\u0641\u0639\u0627\u062a</div>',
    '                <div className="bg-slate-50 rounded border border-slate-200 p-3">\n                  <div className="text-xs text-slate-500 mb-1">\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644</div>\n                  {data.contract.responsiblePhone ? (\n                    <a\n                      href={`tel:${data.contract.responsiblePhone}`}\n                      className="text-sm font-semibold text-[color:var(--eyenak-teal)] hover:underline"\n                      dir="ltr"\n                    >\n                      {data.contract.responsiblePhone}\n                    </a>\n                  ) : (\n                    <span className="text-sm text-slate-400">\u2014</span>\n                  )}\n                </div>\n                {/* Email cell */}\n                <div className="bg-slate-50 rounded border border-slate-200 p-3">\n                  <div className="text-xs text-slate-500 mb-1">\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a</div>\n                  {data.contract.responsibleEmail ? (\n                    <a\n                      href={`mailto:${data.contract.responsibleEmail}`}\n                      className="text-sm font-semibold text-[color:var(--eyenak-teal)] hover:underline block truncate"\n                      dir="ltr"\n                    >\n                      {data.contract.responsibleEmail}\n                    </a>\n                  ) : !canEditAll && (\n                    <span className="text-sm text-slate-400">\u2014</span>\n                  )}\n                  {canEditAll && (\n                    <input\n                      key={data.contract.responsibleEmail ?? ""}\n                      type="email"\n                      defaultValue={data.contract.responsibleEmail ?? ""}\n                      placeholder="\u0623\u0636\u0641 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a..."\n                      onBlur={(e) => {\n                        const v = e.target.value.trim();\n                        if (v !== (data.contract.responsibleEmail ?? ""))\n                          onUpdate((c) => ({ ...c, contract: { ...c.contract, responsibleEmail: v } }));\n                      }}\n                      className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[color:var(--eyenak-teal)]"\n                    />\n                  )}\n                </div>\n                {/* WhatsApp cell */}\n                <div className="bg-slate-50 rounded border border-slate-200 p-3">\n                  <div className="text-xs text-slate-500 mb-1">\u0648\u0627\u062a\u0633\u0627\u0628 \u0627\u0644\u0639\u0645\u064a\u0644</div>\n                  {data.contract.responsibleWhatsapp ? (\n                    <div className="flex items-center gap-2 justify-end">\n                      <a\n                        href={`https://wa.me/${data.contract.responsibleWhatsapp.replace(/\\D/g, "")}`}\n                        target="_blank"\n                        rel="noreferrer"\n                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shrink-0"\n                      >\n                        \ud83d\udcf2 \u0625\u0631\u0633\u0627\u0644\n                      </a>\n                      <span className="text-sm font-semibold text-slate-800 truncate" dir="ltr">\n                        {data.contract.responsibleWhatsapp}\n                      </span>\n                    </div>\n                  ) : !canEditAll && (\n                    <span className="text-sm text-slate-400">\u2014</span>\n                  )}\n                  {canEditAll && (\n                    <input\n                      key={data.contract.responsibleWhatsapp ?? ""}\n                      type="tel"\n                      defaultValue={data.contract.responsibleWhatsapp ?? ""}\n                      placeholder="+9665..."\n                      onBlur={(e) => {\n                        const v = e.target.value.trim();\n                        if (v !== (data.contract.responsibleWhatsapp ?? ""))\n                          onUpdate((c) => ({ ...c, contract: { ...c.contract, responsibleWhatsapp: v } }));\n                      }}\n                      className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[color:var(--eyenak-teal)]"\n                    />\n                  )}\n                </div>\n                <div className="bg-slate-50 rounded border border-slate-200 p-3">\n                  <div className="text-xs text-slate-500 mb-1">\u0627\u0644\u062f\u0641\u0639\u0627\u062a</div>',
    "email+whatsapp cells"
)

with open("src/routes/index.tsx", "w", encoding="utf-8") as f:
    f.write(src)
print(f"\n✅ Done — {src.count(chr(10)) - orig.count(chr(10))} lines added")
PYEOF
echo "fix10.sh complete."

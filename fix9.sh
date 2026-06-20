#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
git fetch origin main -q
git checkout -B main origin/main -q
python3 - <<'PYEOF'
p = "src/routes/index.tsx"
s = open(p, encoding="utf-8").read()
edits = [
# 1) load users on login (not only when panels open) -> real user list everywhere
('''  useEffect(() => {
    if ((adminPanelOpen || newProjectOpen) && isAdmin && auth.session) {
      refreshAdminUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPanelOpen, newProjectOpen, isAdmin, auth.session]);''',
 '''  useEffect(() => {
    if (isAdmin && auth.session) {
      refreshAdminUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPanelOpen, newProjectOpen, isAdmin, auth.session]);'''),
# 2) remove the 📊 جدول حر (Excel) toggle button from the project header
('''            {onUpdateFlexSheet && (
              <button
                onClick={() => setShowSheet((v) => !v)}
                className={`h-8 px-3 rounded-md border text-xs flex items-center gap-1 ${showSheet ? "bg-[color:var(--eyenak-teal)] text-white border-[color:var(--eyenak-teal)]" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}
              >
                <span>\U0001F4CA</span>
                <span>جدول حر (Excel)</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">{name}</h2>''',
 '''          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">{name}</h2>'''),
]
for i, (o, n) in enumerate(edits, 1):
    if o not in s:
        raise SystemExit("ERROR: edit %d not found - aborting" % i)
    s = s.replace(o, n, 1)
open(p, "w", encoding="utf-8").write(s)
print("ALL PATCHED OK")
PYEOF
git add src/routes/index.tsx
git commit -q -m "load real users on login + remove excel toggle button"
git push origin main && echo "DONE - wait ~1 min for Vercel" || echo "PUSH FAILED - copy the message and send it to me"
